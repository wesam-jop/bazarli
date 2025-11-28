<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderStore;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Services\NotificationService;

class DriverOrderController extends Controller
{
    public function index(Request $request)
    {
        $driver = $request->user();

        if (!$driver || !$driver->isDriver()) {
            abort(403);
        }

        // الطلبات في انتظار موافقة عامل التوصيل - فقط من نفس المنطقة
        $pendingApprovalOrders = Order::query()
            ->where('status', 'pending_driver_approval')
            ->whereNull('delivery_driver_id')
            ->where(function ($query) use ($driver) {
                // البحث عن طلبات في نفس المنطقة
                if ($driver->area_id) {
                    $query->where('area_id', $driver->area_id);
                } elseif ($driver->governorate_id) {
                    // إذا لم يكن له منطقة محددة، ابحث في نفس المحافظة
                    $query->whereHas('user', function ($q) use ($driver) {
                        $q->where('governorate_id', $driver->governorate_id);
                    });
                }
            })
            ->with([
                'orderStores.store:id,name,address',
                'user:id,name,phone',
                'orderItems.product:id,name'
            ])
            ->orderBy('created_at')
            ->get()
            ->map(fn (Order $order) => $this->formatOrder($order));

        // الطلبات التي قبلها عامل التوصيل وانتقلت للمتجر
        $acceptedOrders = Order::query()
            ->where('delivery_driver_id', $driver->id)
            ->whereIn('status', ['driver_accepted', 'store_preparing', 'ready_for_delivery', 'pending_store_approval', 'store_approved'])
            ->with(['store:id,name,address', 'user:id,name,phone'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Order $order) => $this->formatOrder($order));

        // الطلبات في الطريق
        $activeOrders = Order::query()
            ->where('delivery_driver_id', $driver->id)
            ->whereIn('status', ['driver_picked_up', 'out_for_delivery', 'on_delivery'])
            ->with(['store:id,name,address', 'user:id,name,phone'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Order $order) => $this->formatOrder($order));

        $recentCompleted = Order::query()
            ->where('delivery_driver_id', $driver->id)
            ->where('status', 'delivered')
            ->orderByDesc('delivered_at')
            ->limit(5)
            ->with(['store:id,name,address', 'user:id,name,phone'])
            ->get()
            ->map(fn (Order $order) => $this->formatOrder($order));

        return Inertia::render('Dashboard/DriverOrders', [
            'pendingApprovalOrders' => $pendingApprovalOrders,
            'acceptedOrders' => $acceptedOrders,
            'activeOrders' => $activeOrders,
            'recentCompletedOrders' => $recentCompleted,
        ]);
    }

    /**
     * قبول الطلب من قبل عامل التوصيل
     * بعد الموافقة، ينتقل الطلب إلى المتاجر للتحضير
     * ضمان أن عامل توصيل واحد فقط يمكنه قبول الطلب
     */
    public function accept(Request $request, Order $order)
    {
        $driver = $request->user();

        if (!$driver || !$driver->isDriver()) {
            abort(403);
        }

        // التحقق من حالة الطلب مع lock للقاعدة لضمان أن عامل توصيل واحد فقط يقبل
        DB::beginTransaction();
        try {
            // Lock الطلب للتأكد من أن عامل توصيل واحد فقط يمكنه قبوله
            $order = Order::lockForUpdate()->findOrFail($order->id);

            if ($order->status !== 'pending_driver_approval' || $order->delivery_driver_id !== null) {
                DB::rollBack();
                return back()->with('error', 'الطلب غير متاح للقبول أو تم قبوله من قبل عامل توصيل آخر');
            }

            // تحديث الطلب بقبول عامل التوصيل
            $order->update([
                'delivery_driver_id' => $driver->id,
                'status' => 'driver_accepted', // تم قبول عامل التوصيل
            ]);

            // بعد موافقة عامل التوصيل، نقلل المخزون من المنتجات
            $order->load('orderItems');
            foreach ($order->orderItems as $item) {
                $product = Product::lockForUpdate()->find($item->product_id);
                // Product validation removed - no stock system
            }

            // تحديث order_stores لإرسالها للمتاجر
            // الآن فقط بعد موافقة عامل التوصيل، يتم إرسال الطلب للمتاجر
            // كل متجر سيرى طلباته فقط في pending_store_approval
            OrderStore::where('order_id', $order->id)
                ->update(['status' => 'pending_store_approval']);

            DB::commit();

            // إرسال إشعار للعميل
            $notificationService = app(NotificationService::class);
            $notificationService->notifyOrderStatusChanged($order->user_id, $order);

            // إرسال إشعار لأصحاب المتاجر
            $order->load('orderStores.store');
            foreach ($order->orderStores as $orderStore) {
                if ($orderStore->store && $orderStore->store->owner_id) {
                    $notificationService->notifyStoreNewOrder($orderStore->store->owner_id, $order);
                }
            }

            return back()->with('success', 'تم قبول الطلب بنجاح. تم إرساله للمتاجر للتحضير.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'حدث خطأ أثناء قبول الطلب: ' . $e->getMessage());
        }
    }

    /**
     * رفض الطلب من قبل عامل التوصيل
     */
    public function reject(Request $request, Order $order)
    {
        $driver = $request->user();

        if (!$driver || !$driver->isDriver()) {
            abort(403);
        }

        if ($order->status !== 'pending_driver_approval') {
            return back()->with('error', __('cannot_reject_order'));
        }

        $order->update([
            'status' => 'driver_rejected',
        ]);

        return back()->with('success', __('order_rejected_successfully'));
    }

    /**
     * أخذ الطلب من المتجر (بعد موافقة صاحب المتجر)
     */
    public function pickUp(Request $request, Order $order)
    {
        $driver = $request->user();

        if (!$driver || !$driver->isDriver()) {
            abort(403);
        }

        if ((int) $order->delivery_driver_id !== (int) $driver->id) {
            return back()->with('error', __('order_not_assigned_to_you'));
        }

        // التحقق من أن جميع المتاجر قبلت الطلب
        $allStoresApproved = OrderStore::where('order_id', $order->id)
            ->where('status', '!=', 'store_approved')
            ->where('status', '!=', 'store_preparing')
            ->where('status', '!=', 'ready_for_delivery')
            ->count() === 0;

        if (!$allStoresApproved) {
            // التحقق من حالة المتاجر
            $storesStatus = OrderStore::where('order_id', $order->id)
                ->with('store:id,name')
                ->get()
                ->map(fn ($os) => $os->store->name . ': ' . $os->status)
                ->implode(', ');
            
            return back()->with('error', 'يجب أن تقبل جميع المتاجر الطلب أولاً. الحالة الحالية: ' . $storesStatus);
        }

        // التحقق من أن على الأقل متجر واحد جاهز
        $readyStores = OrderStore::where('order_id', $order->id)
            ->whereIn('status', ['store_approved', 'store_preparing', 'ready_for_delivery'])
            ->count();

        if ($readyStores === 0) {
            return back()->with('error', 'لا يوجد متاجر جاهزة بعد. يرجى الانتظار حتى تقبل المتاجر الطلب.');
        }

        // تحديث حالة الطلب - جاهز لأخذ الطلب من المتاجر
        $order->update([
            'status' => 'driver_picked_up',
        ]);

        return back()->with('success', 'تم أخذ الطلب من المتاجر بنجاح');
    }

    /**
     * الطريقة القديمة - تم استبدالها بـ accept
     */
    public function claim(Request $request, Order $order)
    {
        return $this->accept($request, $order);
    }

    /**
     * إكمال التوصيل وتسليم الطلب للعميل
     */
    public function complete(Request $request, Order $order)
    {
        $driver = $request->user();

        if (!$driver || !$driver->isDriver()) {
            abort(403);
        }

        if ((int) $order->delivery_driver_id !== (int) $driver->id) {
            return back()->with('error', __('order_not_assigned_to_you'));
        }

        // يمكن إنهاء الطلب إذا كان في حالة store_approved أو ready_for_delivery أو في الطريق
        if (!in_array($order->status, ['store_approved', 'ready_for_delivery', 'driver_picked_up', 'out_for_delivery', 'on_delivery'])) {
            return back()->with('error', __('cannot_complete_order_current_status'));
        }

        $order->update([
            'status' => 'delivered',
            'delivered_at' => now(),
        ]);

        // إرسال إشعار للعميل
        $notificationService = app(NotificationService::class);
        $notificationService->notifyOrderStatusChanged($order->user_id, $order);

        return back()->with('success', __('order_delivered_successfully'));
    }

    public function show(Request $request, Order $order)
    {
        $driver = $request->user();

        if (!$driver || !$driver->isDriver()) {
            abort(403);
        }

        // التحقق من أن الطلب مرتبط بهذا السائق
        if ($order->delivery_driver_id && (int) $order->delivery_driver_id !== (int) $driver->id) {
            // السماح بعرض الطلبات في انتظار الموافقة أيضاً
            if ($order->status !== 'pending_driver_approval') {
                abort(403, 'ليس لديك صلاحية للوصول إلى هذا الطلب');
            }
        }

        // تحميل جميع البيانات المطلوبة
        $order->load([
            'orderStores.store:id,name,address,latitude,longitude,phone',
            'orderItems.store:id,name',
            'orderItems.product:id,name,image',
            'user:id,name,phone',
            'store:id,name,address',
        ]);

        $formattedOrder = $this->formatOrderDetailed($order);

        return Inertia::render('Dashboard/DriverOrderShow', [
            'order' => $formattedOrder,
        ]);
    }

    private function formatOrder(Order $order): array
    {
        // تحميل order_stores و order_items
        $order->load(['orderStores.store', 'orderItems.store', 'orderItems.product']);
        
        // تجميع المنتجات حسب المتجر
        $storesData = [];
        foreach ($order->orderStores as $orderStore) {
            $storeItems = $order->orderItems->where('store_id', $orderStore->store_id);
            $storesData[] = [
                'id' => $orderStore->store_id,
                'name' => $orderStore->store->name,
                'address' => $orderStore->store->address,
                'status' => $orderStore->status,
                'subtotal' => $orderStore->subtotal,
                'delivery_fee' => $orderStore->delivery_fee,
                'items' => $storeItems->map(function ($item) {
                    return [
                        'product_name' => $item->product_name,
                        'quantity' => $item->quantity,
                        'price' => $item->product_price,
                        'total' => $item->total_price,
                    ];
                }),
            ];
        }
        
        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'status' => $order->status,
            'store' => $order->store ? [
                'name' => $order->store->name,
                'address' => $order->store->address,
            ] : null,
            'stores' => $storesData, // تفاصيل جميع المتاجر
            'stores_count' => count($storesData), // عدد المتاجر
            'customer' => $order->user ? [
                'name' => $order->user->name,
                'phone' => $order->user->phone,
            ] : null,
            'delivery_address' => $order->delivery_address,
            'delivery_latitude' => $order->delivery_latitude,
            'delivery_longitude' => $order->delivery_longitude,
            'customer_phone' => $order->customer_phone,
            'total_amount' => $order->total_amount,
            'created_at' => $order->created_at?->toIso8601String(),
            'delivered_at' => $order->delivered_at?->toIso8601String(),
        ];
    }

    private function formatOrderDetailed(Order $order): array
    {
        // تجميع المنتجات حسب المتجر مع معلومات إضافية
        $storesData = [];
        foreach ($order->orderStores as $orderStore) {
            $storeItems = $order->orderItems->where('store_id', $orderStore->store_id);
            $storesData[] = [
                'id' => $orderStore->store_id,
                'name' => $orderStore->store->name,
                'address' => $orderStore->store->address,
                'latitude' => $orderStore->store->latitude,
                'longitude' => $orderStore->store->longitude,
                'phone' => $orderStore->store->phone,
                'status' => $orderStore->status,
                'subtotal' => $orderStore->subtotal,
                'delivery_fee' => $orderStore->delivery_fee,
                'items' => $storeItems->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'product_id' => $item->product_id,
                        'product_name' => $item->product_name,
                        'quantity' => $item->quantity,
                        'price' => $item->product_price,
                        'total' => $item->total_price,
                        'product' => $item->product ? [
                            'id' => $item->product->id,
                            'name' => $item->product->name,
                            'image' => $item->product->image,
                        ] : null,
                    ];
                }),
            ];
        }
        
        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'status' => $order->status,
            'store' => $order->store ? [
                'id' => $order->store->id,
                'name' => $order->store->name,
                'address' => $order->store->address,
            ] : null,
            'stores' => $storesData,
            'stores_count' => count($storesData),
            'customer' => $order->user ? [
                'id' => $order->user->id,
                'name' => $order->user->name,
                'phone' => $order->user->phone,
            ] : null,
            'delivery_address' => $order->delivery_address,
            'delivery_latitude' => $order->delivery_latitude,
            'delivery_longitude' => $order->delivery_longitude,
            'location_notes' => $order->location_notes,
            'customer_phone' => $order->customer_phone,
            'notes' => $order->notes,
            'subtotal' => $order->subtotal,
            'delivery_fee' => $order->delivery_fee,
            'total_amount' => $order->total_amount,
            'payment_method' => $order->payment_method,
            'payment_status' => $order->payment_status,
            'estimated_delivery_time' => $order->estimated_delivery_time,
            'created_at' => $order->created_at?->toIso8601String(),
            'delivered_at' => $order->delivered_at?->toIso8601String(),
        ];
    }
}

