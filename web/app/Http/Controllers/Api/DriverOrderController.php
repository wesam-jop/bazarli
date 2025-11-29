<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderStore;
use App\Models\Product;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DriverOrderController extends Controller
{
    /**
     * Get all orders for driver
     * الطلبات المتاحة والمقبولة والنشطة والمكتملة
     */
    public function index(Request $request): JsonResponse
    {
        $driver = $request->user();

        if (!$driver || !$driver->isDriver()) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول'
            ], 403);
        }

        // الطلبات في انتظار موافقة عامل التوصيل - فقط من نفس المنطقة
        $pendingApprovalOrders = Order::query()
            ->where('status', 'pending_driver_approval')
            ->whereNull('delivery_driver_id')
            ->where(function ($query) use ($driver) {
                if ($driver->area_id) {
                    $query->where('area_id', $driver->area_id);
                } elseif ($driver->governorate_id) {
                    $query->whereHas('user', function ($q) use ($driver) {
                        $q->where('governorate_id', $driver->governorate_id);
                    });
                }
            })
            ->with([
                'orderStores.store:id,name,address,latitude,longitude,phone',
                'user:id,name,phone',
                'orderItems.product:id,name,image'
            ])
            ->orderBy('created_at')
            ->get()
            ->map(fn (Order $order) => $this->formatOrder($order));

        // الطلبات التي قبلها عامل التوصيل وانتقلت للمتجر
        $acceptedOrders = Order::query()
            ->where('delivery_driver_id', $driver->id)
            ->whereIn('status', ['driver_accepted', 'store_preparing', 'ready_for_delivery', 'pending_store_approval', 'store_approved'])
            ->with(['store:id,name,address', 'user:id,name,phone', 'orderStores.store:id,name,address'])
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

        // الطلبات المكتملة مؤخراً
        $recentCompleted = Order::query()
            ->where('delivery_driver_id', $driver->id)
            ->where('status', 'delivered')
            ->orderByDesc('delivered_at')
            ->limit(10)
            ->with(['store:id,name,address', 'user:id,name,phone'])
            ->get()
            ->map(fn (Order $order) => $this->formatOrder($order));

        return response()->json([
            'success' => true,
            'data' => [
                'pending_approval_orders' => $pendingApprovalOrders,
                'accepted_orders' => $acceptedOrders,
                'active_orders' => $activeOrders,
                'recent_completed_orders' => $recentCompleted,
            ]
        ]);
    }

    /**
     * Get single order details
     */
    public function show(Request $request, Order $order): JsonResponse
    {
        $driver = $request->user();

        if (!$driver || !$driver->isDriver()) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول'
            ], 403);
        }

        // التحقق من أن الطلب مرتبط بهذا السائق أو في انتظار الموافقة
        if ($order->delivery_driver_id && (int) $order->delivery_driver_id !== (int) $driver->id) {
            if ($order->status !== 'pending_driver_approval') {
                return response()->json([
                    'success' => false,
                    'message' => 'ليس لديك صلاحية للوصول إلى هذا الطلب'
                ], 403);
            }
        }

        $order->load([
            'orderStores.store:id,name,address,latitude,longitude,phone',
            'orderItems.store:id,name',
            'orderItems.product:id,name,image',
            'user:id,name,phone',
            'store:id,name,address',
        ]);

        return response()->json([
            'success' => true,
            'data' => $this->formatOrderDetailed($order)
        ]);
    }

    /**
     * Accept order by driver
     * قبول الطلب من قبل عامل التوصيل
     */
    public function accept(Request $request, Order $order): JsonResponse
    {
        $driver = $request->user();

        if (!$driver || !$driver->isDriver()) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول'
            ], 403);
        }

        DB::beginTransaction();
        try {
            $order = Order::lockForUpdate()->findOrFail($order->id);

            if ($order->status !== 'pending_driver_approval' || $order->delivery_driver_id !== null) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'الطلب غير متاح أو تم أخذه من قبل سائق آخر'
                ], 400);
            }

            $order->update([
                'delivery_driver_id' => $driver->id,
                'status' => 'driver_accepted',
            ]);

            // تحديث order_stores لإرسالها للمتاجر
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

            return response()->json([
                'success' => true,
                'message' => 'تم قبول الطلب بنجاح',
                'data' => $this->formatOrder($order->fresh())
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء قبول الطلب: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject order by driver
     * رفض الطلب من قبل عامل التوصيل
     */
    public function reject(Request $request, Order $order): JsonResponse
    {
        $driver = $request->user();

        if (!$driver || !$driver->isDriver()) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول'
            ], 403);
        }

        if ($order->status !== 'pending_driver_approval') {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن رفض هذا الطلب'
            ], 400);
        }

        $order->update([
            'status' => 'driver_rejected',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم رفض الطلب'
        ]);
    }

    /**
     * Pick up order from store
     * أخذ الطلب من المتجر
     */
    public function pickUp(Request $request, Order $order): JsonResponse
    {
        $driver = $request->user();

        if (!$driver || !$driver->isDriver()) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول'
            ], 403);
        }

        if ((int) $order->delivery_driver_id !== (int) $driver->id) {
            return response()->json([
                'success' => false,
                'message' => 'هذا الطلب غير مخصص لك'
            ], 403);
        }

        // التحقق من أن جميع المتاجر قبلت الطلب
        $allStoresApproved = OrderStore::where('order_id', $order->id)
            ->whereNotIn('status', ['store_approved', 'store_preparing', 'ready_for_delivery'])
            ->count() === 0;

        if (!$allStoresApproved) {
            return response()->json([
                'success' => false,
                'message' => 'لم تقبل جميع المتاجر الطلب بعد'
            ], 400);
        }

        $order->update([
            'status' => 'driver_picked_up',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم استلام الطلب من المتاجر',
            'data' => $this->formatOrder($order->fresh())
        ]);
    }

    /**
     * Start delivery
     * بدء التوصيل
     */
    public function startDelivery(Request $request, Order $order): JsonResponse
    {
        $driver = $request->user();

        if (!$driver || !$driver->isDriver()) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول'
            ], 403);
        }

        if ((int) $order->delivery_driver_id !== (int) $driver->id) {
            return response()->json([
                'success' => false,
                'message' => 'هذا الطلب غير مخصص لك'
            ], 403);
        }

        if (!in_array($order->status, ['driver_picked_up', 'store_approved', 'ready_for_delivery'])) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن بدء التوصيل في الحالة الحالية'
            ], 400);
        }

        $order->update([
            'status' => 'out_for_delivery',
        ]);

        // إرسال إشعار للعميل
        $notificationService = app(NotificationService::class);
        $notificationService->notifyOrderStatusChanged($order->user_id, $order);

        return response()->json([
            'success' => true,
            'message' => 'تم بدء التوصيل',
            'data' => $this->formatOrder($order->fresh())
        ]);
    }

    /**
     * Complete delivery
     * إكمال التوصيل وتسليم الطلب للعميل
     */
    public function complete(Request $request, Order $order): JsonResponse
    {
        $driver = $request->user();

        if (!$driver || !$driver->isDriver()) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول'
            ], 403);
        }

        if ((int) $order->delivery_driver_id !== (int) $driver->id) {
            return response()->json([
                'success' => false,
                'message' => 'هذا الطلب غير مخصص لك'
            ], 403);
        }

        if (!in_array($order->status, ['store_approved', 'ready_for_delivery', 'driver_picked_up', 'out_for_delivery', 'on_delivery'])) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن إتمام التوصيل في الحالة الحالية'
            ], 400);
        }

        $order->update([
            'status' => 'delivered',
            'delivered_at' => now(),
            'payment_status' => 'paid',
        ]);

        // إرسال إشعار للعميل
        $notificationService = app(NotificationService::class);
        $notificationService->notifyOrderStatusChanged($order->user_id, $order);

        return response()->json([
            'success' => true,
            'message' => 'تم تسليم الطلب بنجاح',
            'data' => $this->formatOrder($order->fresh())
        ]);
    }

    /**
     * Update driver location
     * تحديث موقع السائق
     */
    public function updateLocation(Request $request): JsonResponse
    {
        $driver = $request->user();

        if (!$driver || !$driver->isDriver()) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول'
            ], 403);
        }

        $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        $driver->update([
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'location_updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الموقع'
        ]);
    }

    /**
     * Get driver statistics
     * إحصائيات السائق
     */
    public function statistics(Request $request): JsonResponse
    {
        $driver = $request->user();

        if (!$driver || !$driver->isDriver()) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول'
            ], 403);
        }

        $today = now()->startOfDay();
        $thisWeek = now()->startOfWeek();
        $thisMonth = now()->startOfMonth();

        $stats = [
            'today' => [
                'completed_orders' => Order::where('delivery_driver_id', $driver->id)
                    ->where('status', 'delivered')
                    ->where('delivered_at', '>=', $today)
                    ->count(),
                'earnings' => Order::where('delivery_driver_id', $driver->id)
                    ->where('status', 'delivered')
                    ->where('delivered_at', '>=', $today)
                    ->sum('delivery_fee'),
            ],
            'this_week' => [
                'completed_orders' => Order::where('delivery_driver_id', $driver->id)
                    ->where('status', 'delivered')
                    ->where('delivered_at', '>=', $thisWeek)
                    ->count(),
                'earnings' => Order::where('delivery_driver_id', $driver->id)
                    ->where('status', 'delivered')
                    ->where('delivered_at', '>=', $thisWeek)
                    ->sum('delivery_fee'),
            ],
            'this_month' => [
                'completed_orders' => Order::where('delivery_driver_id', $driver->id)
                    ->where('status', 'delivered')
                    ->where('delivered_at', '>=', $thisMonth)
                    ->count(),
                'earnings' => Order::where('delivery_driver_id', $driver->id)
                    ->where('status', 'delivered')
                    ->where('delivered_at', '>=', $thisMonth)
                    ->sum('delivery_fee'),
            ],
            'total' => [
                'completed_orders' => Order::where('delivery_driver_id', $driver->id)
                    ->where('status', 'delivered')
                    ->count(),
                'earnings' => Order::where('delivery_driver_id', $driver->id)
                    ->where('status', 'delivered')
                    ->sum('delivery_fee'),
            ],
            'active_orders' => Order::where('delivery_driver_id', $driver->id)
                ->whereNotIn('status', ['delivered', 'cancelled', 'driver_rejected', 'store_rejected'])
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    private function formatOrder(Order $order): array
    {
        $order->load(['orderStores.store', 'orderItems.store', 'orderItems.product']);

        $storesData = [];
        foreach ($order->orderStores as $orderStore) {
            $storeItems = $order->orderItems->where('store_id', $orderStore->store_id);
            $storesData[] = [
                'id' => $orderStore->store_id,
                'name' => $orderStore->store->name ?? null,
                'address' => $orderStore->store->address ?? null,
                'latitude' => $orderStore->store->latitude ?? null,
                'longitude' => $orderStore->store->longitude ?? null,
                'phone' => $orderStore->store->phone ?? null,
                'status' => $orderStore->status,
                'subtotal' => (float) $orderStore->subtotal,
                'delivery_fee' => (float) $orderStore->delivery_fee,
                'items' => $storeItems->map(function ($item) {
                    return [
                        'product_name' => $item->product_name,
                        'quantity' => $item->quantity,
                        'price' => (float) $item->product_price,
                        'total' => (float) $item->total_price,
                    ];
                })->values(),
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
            'customer_phone' => $order->customer_phone,
            'location_notes' => $order->location_notes,
            'notes' => $order->notes,
            'subtotal' => (float) $order->subtotal,
            'delivery_fee' => (float) $order->delivery_fee,
            'total_amount' => (float) $order->total_amount,
            'payment_method' => $order->payment_method,
            'payment_status' => $order->payment_status,
            'estimated_delivery_time' => $order->estimated_delivery_time,
            'created_at' => $order->created_at?->toIso8601String(),
            'delivered_at' => $order->delivered_at?->toIso8601String(),
        ];
    }

    private function formatOrderDetailed(Order $order): array
    {
        $storesData = [];
        foreach ($order->orderStores as $orderStore) {
            $storeItems = $order->orderItems->where('store_id', $orderStore->store_id);
            $storesData[] = [
                'id' => $orderStore->store_id,
                'name' => $orderStore->store->name ?? null,
                'address' => $orderStore->store->address ?? null,
                'latitude' => $orderStore->store->latitude ?? null,
                'longitude' => $orderStore->store->longitude ?? null,
                'phone' => $orderStore->store->phone ?? null,
                'status' => $orderStore->status,
                'subtotal' => (float) $orderStore->subtotal,
                'delivery_fee' => (float) $orderStore->delivery_fee,
                'items' => $storeItems->map(function ($item) {
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
                })->values(),
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
            'subtotal' => (float) $order->subtotal,
            'delivery_fee' => (float) $order->delivery_fee,
            'total_amount' => (float) $order->total_amount,
            'payment_method' => $order->payment_method,
            'payment_status' => $order->payment_status,
            'estimated_delivery_time' => $order->estimated_delivery_time,
            'created_at' => $order->created_at?->toIso8601String(),
            'delivered_at' => $order->delivered_at?->toIso8601String(),
        ];
    }
}

