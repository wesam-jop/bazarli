<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderStore;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class StoreOrderController extends Controller
{
    /**
     * Get all orders for store
     * الطلبات الخاصة بالمتجر
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isStoreOwner()) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول'
            ], 403);
        }

        $store = $user->stores()->first();

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'لم يتم إنشاء متجر بعد'
            ], 404);
        }

        // الطلبات في انتظار موافقة المتجر
        $pendingOrders = OrderStore::where('store_id', $store->id)
            ->where('status', 'pending_store_approval')
            ->with(['order.user:id,name,phone', 'order.deliveryDriver:id,name,phone'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($os) => $this->formatOrderStore($os));

        // الطلبات قيد التحضير
        $preparingOrders = OrderStore::where('store_id', $store->id)
            ->where('status', 'store_preparing')
            ->with(['order.user:id,name,phone', 'order.deliveryDriver:id,name,phone'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($os) => $this->formatOrderStore($os));

        // الطلبات الجاهزة للتوصيل
        $readyOrders = OrderStore::where('store_id', $store->id)
            ->whereIn('status', ['store_approved', 'ready_for_delivery'])
            ->with(['order.user:id,name,phone', 'order.deliveryDriver:id,name,phone'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($os) => $this->formatOrderStore($os));

        // الطلبات المكتملة مؤخراً
        $completedOrders = OrderStore::where('store_id', $store->id)
            ->whereHas('order', function ($q) {
                $q->where('status', 'delivered');
            })
            ->with(['order.user:id,name,phone'])
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->map(fn ($os) => $this->formatOrderStore($os));

        return response()->json([
            'success' => true,
            'data' => [
                'pending_orders' => $pendingOrders,
                'preparing_orders' => $preparingOrders,
                'ready_orders' => $readyOrders,
                'completed_orders' => $completedOrders,
            ]
        ]);
    }

    /**
     * Get single order details
     */
    public function show(Request $request, OrderStore $orderStore): JsonResponse
    {
        $user = $request->user();
        $store = $user?->stores()->first();

        if (!$user || !$store || (int) $orderStore->store_id !== (int) $store->id) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول'
            ], 403);
        }

        $orderStore->load([
            'order.user:id,name,phone',
            'order.deliveryDriver:id,name,phone',
            'order.orderItems' => function ($q) use ($store) {
                $q->where('store_id', $store->id)->with('product:id,name,image');
            },
        ]);

        return response()->json([
            'success' => true,
            'data' => $this->formatOrderStoreDetailed($orderStore)
        ]);
    }

    /**
     * Approve order
     * موافقة المتجر على الطلب
     */
    public function approve(Request $request, OrderStore $orderStore): JsonResponse
    {
        $user = $request->user();
        $store = $user?->stores()->first();

        if (!$user || !$store || (int) $orderStore->store_id !== (int) $store->id) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول'
            ], 403);
        }

        $order = $orderStore->order;

        // التحقق من أن عامل التوصيل قبل الطلب أولاً
        if ($order->status === 'pending_driver_approval' || !$order->delivery_driver_id) {
            return response()->json([
                'success' => false,
                'message' => 'يجب أن يقبل عامل التوصيل الطلب أولاً'
            ], 400);
        }

        if (!in_array($orderStore->status, ['pending_store_approval', 'store_preparing', 'ready_for_delivery'])) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن قبول الطلب في الحالة الحالية'
            ], 400);
        }

        DB::beginTransaction();
        try {
            $orderStore->update([
                'status' => 'store_approved',
            ]);

            // تحديث حالة الطلب الرئيسية إذا كانت جميع المتاجر قبلت
            $allStoresApproved = OrderStore::where('order_id', $order->id)
                ->whereNotIn('status', ['store_approved', 'store_rejected'])
                ->count() === 0;

            if ($allStoresApproved && in_array($order->status, ['driver_accepted', 'store_preparing'])) {
                $order->update(['status' => 'store_approved']);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم قبول الطلب بنجاح'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject order
     * رفض الطلب من قبل المتجر
     */
    public function reject(Request $request, OrderStore $orderStore): JsonResponse
    {
        $user = $request->user();
        $store = $user?->stores()->first();

        if (!$user || !$store || (int) $orderStore->store_id !== (int) $store->id) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول'
            ], 403);
        }

        $order = $orderStore->order;

        if (in_array($order->status, ['driver_picked_up', 'out_for_delivery', 'on_delivery', 'delivered'])) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن رفض الطلب بعد استلامه من قبل السائق'
            ], 400);
        }

        if ($orderStore->status === 'store_rejected') {
            return response()->json([
                'success' => false,
                'message' => 'تم رفض الطلب مسبقاً'
            ], 400);
        }

        DB::beginTransaction();

        try {
            $orderStore->update([
                'status' => 'store_rejected',
            ]);

            // إذا رفض أي متجر، يتم إلغاء الطلب بالكامل
            $order->update([
                'status' => 'store_rejected',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم رفض الطلب'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Start preparing order
     * بدء تحضير الطلب
     */
    public function startPreparing(Request $request, OrderStore $orderStore): JsonResponse
    {
        $user = $request->user();
        $store = $user?->stores()->first();

        if (!$user || !$store || (int) $orderStore->store_id !== (int) $store->id) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول'
            ], 403);
        }

        $order = $orderStore->order;

        if (in_array($order->status, ['pending_driver_approval', 'driver_rejected'])) {
            return response()->json([
                'success' => false,
                'message' => 'لم يتم قبول الطلب من عامل التوصيل بعد'
            ], 400);
        }

        if (!in_array($orderStore->status, ['pending_store_approval', 'store_preparing'])) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن بدء التحضير في الحالة الحالية'
            ], 400);
        }

        $orderStore->update([
            'status' => 'store_preparing',
        ]);

        // إرسال إشعار للعميل
        $notificationService = app(NotificationService::class);
        $notificationService->notifyOrderStatusChanged($order->user_id, $order);

        return response()->json([
            'success' => true,
            'message' => 'تم بدء تحضير الطلب'
        ]);
    }

    /**
     * Finish preparing order
     * انتهاء تحضير الطلب
     */
    public function finishPreparing(Request $request, OrderStore $orderStore): JsonResponse
    {
        $user = $request->user();
        $store = $user?->stores()->first();

        if (!$user || !$store || (int) $orderStore->store_id !== (int) $store->id) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول'
            ], 403);
        }

        if ($orderStore->status !== 'store_preparing') {
            return response()->json([
                'success' => false,
                'message' => 'الطلب ليس في حالة التحضير'
            ], 400);
        }

        $orderStore->update([
            'status' => 'ready_for_delivery',
        ]);

        $order = $orderStore->order;

        // إرسال إشعار للعميل والسائق
        $notificationService = app(NotificationService::class);
        $notificationService->notifyOrderStatusChanged($order->user_id, $order);

        if ($order->delivery_driver_id) {
            $notificationService->notifyOrderStatusChanged($order->delivery_driver_id, $order);
        }

        return response()->json([
            'success' => true,
            'message' => 'الطلب جاهز للتوصيل'
        ]);
    }

    /**
     * Get store statistics
     * إحصائيات المتجر
     */
    public function statistics(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isStoreOwner()) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول'
            ], 403);
        }

        $store = $user->stores()->first();

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'لم يتم إنشاء متجر بعد'
            ], 404);
        }

        $today = now()->startOfDay();
        $thisWeek = now()->startOfWeek();
        $thisMonth = now()->startOfMonth();

        $stats = [
            'today' => [
                'orders' => Order::where('store_id', $store->id)
                    ->where('created_at', '>=', $today)
                    ->count(),
                'completed_orders' => Order::where('store_id', $store->id)
                    ->where('status', 'delivered')
                    ->where('delivered_at', '>=', $today)
                    ->count(),
                'revenue' => Order::where('store_id', $store->id)
                    ->where('status', 'delivered')
                    ->where('delivered_at', '>=', $today)
                    ->sum('subtotal'),
            ],
            'this_week' => [
                'orders' => Order::where('store_id', $store->id)
                    ->where('created_at', '>=', $thisWeek)
                    ->count(),
                'completed_orders' => Order::where('store_id', $store->id)
                    ->where('status', 'delivered')
                    ->where('delivered_at', '>=', $thisWeek)
                    ->count(),
                'revenue' => Order::where('store_id', $store->id)
                    ->where('status', 'delivered')
                    ->where('delivered_at', '>=', $thisWeek)
                    ->sum('subtotal'),
            ],
            'this_month' => [
                'orders' => Order::where('store_id', $store->id)
                    ->where('created_at', '>=', $thisMonth)
                    ->count(),
                'completed_orders' => Order::where('store_id', $store->id)
                    ->where('status', 'delivered')
                    ->where('delivered_at', '>=', $thisMonth)
                    ->count(),
                'revenue' => Order::where('store_id', $store->id)
                    ->where('status', 'delivered')
                    ->where('delivered_at', '>=', $thisMonth)
                    ->sum('subtotal'),
            ],
            'total' => [
                'orders' => Order::where('store_id', $store->id)->count(),
                'completed_orders' => Order::where('store_id', $store->id)
                    ->where('status', 'delivered')
                    ->count(),
                'revenue' => Order::where('store_id', $store->id)
                    ->where('status', 'delivered')
                    ->sum('subtotal'),
                'products' => $store->products()->count(),
                'available_products' => $store->products()->where('is_available', true)->count(),
            ],
            'pending_orders' => OrderStore::where('store_id', $store->id)
                ->where('status', 'pending_store_approval')
                ->count(),
            'preparing_orders' => OrderStore::where('store_id', $store->id)
                ->where('status', 'store_preparing')
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    private function formatOrderStore(OrderStore $orderStore): array
    {
        $order = $orderStore->order;

        return [
            'id' => $orderStore->id,
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'status' => $orderStore->status,
            'order_status' => $order->status,
            'subtotal' => (float) $orderStore->subtotal,
            'delivery_fee' => (float) $orderStore->delivery_fee,
            'customer' => $order->user ? [
                'id' => $order->user->id,
                'name' => $order->user->name,
                'phone' => $order->user->phone,
            ] : null,
            'driver' => $order->deliveryDriver ? [
                'id' => $order->deliveryDriver->id,
                'name' => $order->deliveryDriver->name,
                'phone' => $order->deliveryDriver->phone,
            ] : null,
            'delivery_address' => $order->delivery_address,
            'customer_phone' => $order->customer_phone,
            'notes' => $order->notes,
            'created_at' => $order->created_at?->toIso8601String(),
        ];
    }

    private function formatOrderStoreDetailed(OrderStore $orderStore): array
    {
        $order = $orderStore->order;
        $items = $order->orderItems->map(function ($item) {
            return [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product_name,
                'quantity' => $item->quantity,
                'price' => (float) $item->product_price,
                'total' => (float) $item->total_price,
                'product' => $item->product ? [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                    'image' => $item->product->image,
                ] : null,
            ];
        });

        return [
            'id' => $orderStore->id,
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'status' => $orderStore->status,
            'order_status' => $order->status,
            'subtotal' => (float) $orderStore->subtotal,
            'delivery_fee' => (float) $orderStore->delivery_fee,
            'items' => $items,
            'customer' => $order->user ? [
                'id' => $order->user->id,
                'name' => $order->user->name,
                'phone' => $order->user->phone,
            ] : null,
            'driver' => $order->deliveryDriver ? [
                'id' => $order->deliveryDriver->id,
                'name' => $order->deliveryDriver->name,
                'phone' => $order->deliveryDriver->phone,
            ] : null,
            'delivery_address' => $order->delivery_address,
            'delivery_latitude' => $order->delivery_latitude,
            'delivery_longitude' => $order->delivery_longitude,
            'location_notes' => $order->location_notes,
            'customer_phone' => $order->customer_phone,
            'notes' => $order->notes,
            'payment_method' => $order->payment_method,
            'payment_status' => $order->payment_status,
            'created_at' => $order->created_at?->toIso8601String(),
        ];
    }
}

