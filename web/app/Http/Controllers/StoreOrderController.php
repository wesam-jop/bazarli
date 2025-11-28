<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStore;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Services\NotificationService;

class StoreOrderController extends Controller
{
    private function ensureStoreOwner(Request $request, OrderStore $orderStore): void
    {
        $user = Auth::user();
        if (!$user->isStoreOwner()) {
            abort(403);
        }
        $store = $user->stores()->first();
        if (!$store || (int) $orderStore->store_id !== (int) $store->id) {
            abort(403, __('no_access_to_order'));
        }
    }

    /**
     * بدء تحضير الطلب
     * يتم استدعاؤها عندما يبدأ المتجر بتحضير الطلب
     */
    public function startPreparing(Request $request, OrderStore $orderStore)
    {
        $this->ensureStoreOwner($request, $orderStore);

        // التحقق من أن الطلب الرئيسي تم قبوله من الديلفري
        $order = $orderStore->order;
        if (in_array($order->status, ['pending_driver_approval', 'driver_rejected'])) {
            return back()->with('error', __('order_not_accepted_by_driver_yet'));
        }

        // يجب أن يكون order_store في حالة pending_store_approval أو store_preparing
        if (!in_array($orderStore->status, ['pending_store_approval', 'store_preparing'])) {
            return back()->with('error', __('order_cannot_start_preparing'));
        }

        // تحديث حالة order_store فقط
        $orderStore->update([
            'status' => 'store_preparing',
        ]);

        // إرسال إشعار للعميل
        $notificationService = app(NotificationService::class);
        $notificationService->notifyOrderStatusChanged($order->user_id, $order);

        return back()->with('success', __('order_preparation_started'));
    }

    /**
     * انتهاء تحضير الطلب
     * بعد انتهاء التحضير، ينتقل الطلب إلى حالة ready_for_delivery
     */
    public function finishPreparing(Request $request, OrderStore $orderStore)
    {
        $this->ensureStoreOwner($request, $orderStore);

        if ($orderStore->status !== 'store_preparing') {
            return back()->with('error', __('order_not_in_preparation'));
        }

        // تحديث حالة order_store فقط
        $orderStore->update([
            'status' => 'ready_for_delivery',
        ]);

        // إرسال إشعار للعميل والسائق
        $notificationService = app(NotificationService::class);
        $notificationService->notifyOrderStatusChanged($order->user_id, $order);
        
        if ($order->delivery_driver_id) {
            $notificationService->notifyOrderStatusChanged($order->delivery_driver_id, $order);
        }

        return back()->with('success', __('order_preparation_finished'));
    }

    /**
     * موافقة صاحب المتجر على الطلب
     * المتجر يمكنه قبول الطلب مباشرة عند وصوله (من pending_store_approval)
     * بعد الموافقة، يمكن للمتجر بدء التحضير
     */
    public function approve(Request $request, OrderStore $orderStore)
    {
        $this->ensureStoreOwner($request, $orderStore);

        $order = $orderStore->order;

        // التحقق من أن عامل التوصيل قبل الطلب أولاً
        if ($order->status === 'pending_driver_approval' || !$order->delivery_driver_id) {
            return back()->with('error', 'يجب أن يقبل عامل التوصيل الطلب أولاً قبل أن تتمكن من قبوله');
        }

        // يمكن قبول الطلب من حالة pending_store_approval أو store_preparing أو ready_for_delivery
        if (!in_array($orderStore->status, ['pending_store_approval', 'store_preparing', 'ready_for_delivery'])) {
            return back()->with('error', 'لا يمكن قبول الطلب في الحالة الحالية: ' . $orderStore->status);
        }

        DB::beginTransaction();
        try {
            // تحديث حالة order_store
            $orderStore->update([
                'status' => 'store_approved',
            ]);

            // تحديث حالة الطلب الرئيسية إذا كانت جميع المتاجر قبلت
            $allStoresApproved = OrderStore::where('order_id', $order->id)
                ->where('status', '!=', 'store_approved')
                ->where('status', '!=', 'store_rejected')
                ->count() === 0;

            if ($allStoresApproved && in_array($order->status, ['driver_accepted', 'store_preparing'])) {
                $order->update(['status' => 'store_approved']);
            }

            DB::commit();
            return back()->with('success', 'تم قبول الطلب بنجاح. يمكنك الآن بدء التحضير.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'حدث خطأ أثناء قبول الطلب: ' . $e->getMessage());
        }
    }

    /**
     * رفض صاحب المتجر للطلب
     * يمكن رفض الطلب في أي مرحلة قبل أن يأخذه عامل التوصيل
     * عند الرفض، يتم إرجاع المنتجات الخاصة بهذا المتجر للمخزون
     */
    public function reject(Request $request, OrderStore $orderStore)
    {
        $this->ensureStoreOwner($request, $orderStore);

        $order = $orderStore->order;

        // يمكن رفض الطلب في أي مرحلة قبل أن يأخذه عامل التوصيل
        if (in_array($order->status, ['driver_picked_up', 'out_for_delivery', 'on_delivery', 'delivered'])) {
            return back()->with('error', 'لا يمكن رفض الطلب بعد أن أخذ عامل التوصيل الطلب');
        }

        // لا يمكن رفض طلب تم رفضه مسبقاً
        if ($orderStore->status === 'store_rejected') {
            return back()->with('error', 'تم رفض هذا الطلب مسبقاً');
        }

        DB::beginTransaction();

        try {
            // إرجاع المنتجات الخاصة بهذا المتجر فقط إلى المخزون
            $storeItems = $order->orderItems()
                ->where('store_id', $orderStore->store_id)
                ->get();
                
            // Stock system removed

            // تحديث حالة order_store
            $orderStore->update([
                'status' => 'store_rejected',
            ]);

            // إذا رفض أي متجر، يتم إلغاء الطلب بالكامل
            // لأن الطلب متعدد المتاجر ولا يمكن إكماله بدون جميع المتاجر
            $order->update([
                'status' => 'store_rejected',
            ]);

            // Stock system removed

            DB::commit();

            return back()->with('success', 'تم رفض الطلب وإرجاع المنتجات للمخزون');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'حدث خطأ أثناء رفض الطلب: ' . $e->getMessage());
        }
    }
}

