<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStore;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

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

        return back()->with('success', __('order_preparation_finished'));
    }

    /**
     * موافقة صاحب المتجر على الطلب
     * بعد الموافقة، يمكن لعامل التوصيل أخذ الطلب
     */
    public function approve(Request $request, OrderStore $orderStore)
    {
        $this->ensureStoreOwner($request, $orderStore);

        // يجب أن يكون order_store جاهز للتوصيل
        if ($orderStore->status !== 'ready_for_delivery') {
            return back()->with('error', __('order_not_ready_for_approval'));
        }

        // تحديث حالة order_store
        $orderStore->update([
            'status' => 'store_approved',
        ]);

        // إذا كانت جميع order_stores موافق عليها، يمكن تحديث حالة الطلب الرئيسية
        $order = $orderStore->order;
        $allStoresApproved = OrderStore::where('order_id', $order->id)
            ->where('status', '!=', 'store_rejected')
            ->where('status', '!=', 'store_approved')
            ->count() === 0;

        if ($allStoresApproved) {
            $order->update(['status' => 'store_approved']);
        }

        return back()->with('success', __('order_approved_by_store'));
    }

    /**
     * رفض صاحب المتجر للطلب
     * عند الرفض، يتم إلغاء العملية بالكامل وإرجاع المنتجات للمخزون
     */
    public function reject(Request $request, OrderStore $orderStore)
    {
        $this->ensureStoreOwner($request, $orderStore);

        $order = $orderStore->order;

        // يمكن رفض الطلب في أي مرحلة قبل أن يأخذه عامل التوصيل
        if (in_array($order->status, ['driver_picked_up', 'out_for_delivery', 'delivered'])) {
            return back()->with('error', __('cannot_reject_order_after_pickup'));
        }

        DB::beginTransaction();

        try {
            // إرجاع المنتجات الخاصة بهذا المتجر فقط إلى المخزون
            $storeItems = $order->orderItems()->where('store_id', $orderStore->store_id)->get();
            foreach ($storeItems as $item) {
                $product = \App\Models\Product::find($item->product_id);
                if ($product) {
                    $product->increment('stock_quantity', $item->quantity);
                }
            }

            // تحديث حالة order_store
            $orderStore->update([
                'status' => 'store_rejected',
            ]);

            // إذا رفض أي متجر، يتم إلغاء الطلب بالكامل
            $order->update([
                'status' => 'store_rejected',
            ]);

            DB::commit();

            return back()->with('success', __('order_rejected_by_store'));

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', __('error_rejecting_order'));
        }
    }
}

