<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderStore;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

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
            ->whereHas('orderStores.store', function ($query) use ($driver) {
                // البحث عن طلبات من متاجر في نفس المنطقة
                if ($driver->city_id) {
                    $query->where('city_id', $driver->city_id);
                } elseif ($driver->governorate_id) {
                    // إذا لم يكن له منطقة محددة، ابحث في نفس المحافظة
                    $query->where('governorate_id', $driver->governorate_id);
                }
            })
            ->with([
                'orderStores.store:id,name,address,city_id,governorate_id',
                'user:id,name,phone',
                'orderItems.store:id,name'
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
     * بعد الموافقة، ينتقل الطلب إلى المتجر للتحضير
     */
    public function accept(Request $request, Order $order)
    {
        $driver = $request->user();

        if (!$driver || !$driver->isDriver()) {
            abort(403);
        }

        if ($order->status !== 'pending_driver_approval' || $order->delivery_driver_id !== null) {
            return back()->with('error', __('order_not_available_for_approval'));
        }

        // قبول الطلب ونقله تلقائياً للمتاجر للتحضير
        DB::beginTransaction();
        try {
            $order->update([
                'delivery_driver_id' => $driver->id,
                'status' => 'driver_accepted', // تم قبول الديلفري
            ]);

            // الآن بعد موافقة الديلفري، نقلل المخزون من المنتجات
            $order->load('orderItems');
            foreach ($order->orderItems as $item) {
                $product = Product::find($item->product_id);
                if ($product) {
                    // التحقق من أن المخزون كافي
                    if ($product->stock_quantity < $item->quantity) {
                        DB::rollBack();
                        return back()->with('error', __('insufficient_stock_for_product', ['product' => $item->product_name]));
                    }
                    $product->decrement('stock_quantity', $item->quantity);
                }
            }

            // تحديث order_stores لإرسالها للمتاجر
            // الآن فقط بعد موافقة الديلفري، يتم إرسال الطلب للمتاجر
            // الحالة تبقى pending_store_approval حتى يبدأ المتجر بالتحضير

            DB::commit();
            return back()->with('success', __('order_accepted_successfully'));
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', __('error_accepting_order'));
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

        if ($order->status !== 'store_approved') {
            return back()->with('error', __('store_must_approve_first'));
        }

        $order->update([
            'status' => 'driver_picked_up',
        ]);

        return back()->with('success', __('order_picked_up_successfully'));
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

        return back()->with('success', __('order_delivered_successfully'));
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
}

