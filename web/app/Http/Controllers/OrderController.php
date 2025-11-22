<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStore;
use App\Models\Product;
use App\Models\Setting;
use App\Models\Store;
use App\Models\City;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        if (!$user->isAdmin() && !$user->isCustomer()) {
            if ($user->isStoreOwner()) {
                return redirect()->route('dashboard.store.orders');
            }
            abort(403);
        }

        $ordersQuery = Order::with(['store', 'orderItems.product'])
            ->orderBy('created_at', 'desc');

        if (!$user->isAdmin()) {
            $ordersQuery->where('user_id', $user->id);
        }

        $orders = $ordersQuery->paginate(10);

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'delivery_address' => 'required|string|max:500',
            'delivery_latitude' => 'required|numeric',
            'delivery_longitude' => 'required|numeric',
            'customer_phone' => 'required|string|max:20',
            'notes' => 'nullable|string|max:500',
        ]);

        $cart = $request->session()->get('cart', []);
        
        if (empty($cart)) {
            return back()->with('error', __('cart_is_empty'));
        }

        // التحقق من أن موقع العميل ضمن منطقة محددة
        $customerCity = $this->findCityByLocation($request->delivery_latitude, $request->delivery_longitude);
        
        if (!$customerCity) {
            return back()->with('error', __('location_outside_delivery_area'));
        }

        // تجميع المنتجات حسب المتجر
        $productsByStore = [];
        $allStores = [];
        
        foreach ($cart as $productId => $quantity) {
            $product = Product::with('store')->find($productId);
            
            if (!$product || !$product->is_available || $quantity > $product->stock_quantity) {
                continue;
            }
            
            $storeId = $product->store_id;
            if (!isset($productsByStore[$storeId])) {
                $productsByStore[$storeId] = [];
                $allStores[$storeId] = $product->store;
            }
            
            $productsByStore[$storeId][] = [
                'product' => $product,
                'quantity' => $quantity,
            ];
        }
        
        if (empty($productsByStore)) {
            return back()->with('error', __('no_valid_products_in_cart'));
        }

        // التحقق من أن جميع المتاجر في نفس المنطقة أو المحافظة
        $validStores = [];
        foreach ($allStores as $storeId => $store) {
            if ($store->isWithinDeliveryRadius($request->delivery_latitude, $request->delivery_longitude)) {
                $validStores[$storeId] = $store;
            } elseif ($store->governorate_id === $customerCity->governorate_id) {
                $validStores[$storeId] = $store;
            }
        }
        
        if (empty($validStores)) {
            return back()->with('error', __('no_stores_available_in_area'));
        }

        $defaultEta = (int) Setting::get('default_estimated_delivery_time', 15);
        
        // استخدام أول متجر كمتجر رئيسي (للتوافق مع النظام القديم)
        $primaryStore = reset($validStores);
        $estimatedDeliveryTime = $primaryStore->estimated_delivery_time ?? $defaultEta;

        DB::beginTransaction();
        
        try {
            // إنشاء الطلب بحالة pending_driver_approval
            // الطلب سيذهب أولاً لعامل التوصيل للموافقة عليه
            // فقط بعد الموافقة، سيتم إرسال الطلب للمتاجر
            $order = Order::create([
                'user_id' => Auth::id(),
                'store_id' => $primaryStore->id, // متجر رئيسي للتوافق
                'status' => 'pending_driver_approval',
                'subtotal' => 0,
                'delivery_fee' => 0, // سيتم حسابها من order_stores
                'tax_amount' => 0,
                'discount_amount' => 0,
                'total_amount' => 0,
                'payment_status' => 'pending',
                'payment_method' => 'cash',
                'delivery_address' => $request->delivery_address,
                'delivery_latitude' => $request->delivery_latitude,
                'delivery_longitude' => $request->delivery_longitude,
                'customer_phone' => $request->customer_phone,
                'notes' => $request->notes,
                'estimated_delivery_time' => $estimatedDeliveryTime,
            ]);

            $totalSubtotal = 0;
            $totalDeliveryFee = 0;

            // إنشاء order_stores و order_items لكل متجر
            foreach ($validStores as $storeId => $store) {
                $storeSubtotal = 0;
                
                // إنشاء order_store (لكن بحالة pending_store_approval - لن يتم إرسالها للمتجر إلا بعد موافقة الديلفري)
                $orderStore = OrderStore::create([
                    'order_id' => $order->id,
                    'store_id' => $storeId,
                    'status' => 'pending_store_approval', // لن يتم إرسالها للمتجر إلا بعد موافقة الديلفري
                    'subtotal' => 0,
                    'delivery_fee' => $store->delivery_fee,
                ]);

                // إضافة عناصر الطلب لهذا المتجر
                foreach ($productsByStore[$storeId] as $item) {
                    $product = $item['product'];
                    $quantity = $item['quantity'];
                    $itemTotal = $product->price * $quantity;
                    $storeSubtotal += $itemTotal;

                    OrderItem::create([
                        'order_id' => $order->id,
                        'store_id' => $storeId,
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'product_price' => $product->price,
                        'quantity' => $quantity,
                        'total_price' => $itemTotal,
                    ]);

                    // لا نقلل المخزون الآن - سيتم تقليله بعد موافقة الديلفري
                    // المخزون سيتم تقليله في DriverOrderController عند قبول الطلب
                }

                // تحديث order_store
                $orderStore->update([
                    'subtotal' => $storeSubtotal,
                ]);

                $totalSubtotal += $storeSubtotal;
                $totalDeliveryFee += $store->delivery_fee;
            }

            // تحديث إجمالي الطلب
            $order->update([
                'subtotal' => $totalSubtotal,
                'delivery_fee' => $totalDeliveryFee,
                'total_amount' => $totalSubtotal + $totalDeliveryFee,
            ]);

            // مسح السلة
            $request->session()->forget('cart');

            DB::commit();

            return redirect()->route('orders.show', $order)
                ->with('success', __('order_created_successfully'));

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', __('error_creating_order') . ': ' . $e->getMessage());
        }
    }

    public function show(Order $order)
    {
        $this->ensureAuthorized($order);

        $order->load(['store', 'orderItems.product', 'deliveryDriver']);
        
        return Inertia::render('Orders/Show', [
            'order' => $order,
        ]);
    }

    public function cancel(Order $order)
    {
        $this->ensureAuthorized($order);

        if (!$order->canBeCancelled()) {
            return back()->with('error', __('cannot_cancel_order'));
        }

        DB::beginTransaction();
        
        try {
            // إرجاع المنتجات إلى المخزون
            foreach ($order->orderItems as $item) {
                $product = Product::find($item->product_id);
                if ($product) {
                    $product->increment('stock_quantity', $item->quantity);
                }
            }

            $order->update(['status' => 'cancelled']);
            
            DB::commit();

            return back()->with('success', __('order_cancelled_successfully'));

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', __('error_cancelling_order'));
        }
    }

    /**
     * العثور على المنطقة حسب الموقع الجغرافي
     */
    private function findCityByLocation($latitude, $longitude)
    {
        return City::active()
            ->whereNotNull('center_latitude')
            ->whereNotNull('center_longitude')
            ->get()
            ->first(function ($city) use ($latitude, $longitude) {
                return $city->isLocationWithinRadius($latitude, $longitude);
            });
    }

    /**
     * العثور على أقرب متجر (للتوافق مع الكود القديم)
     */
    private function findNearestStore($latitude, $longitude)
    {
        return Store::active()
            ->get()
            ->filter(function ($store) use ($latitude, $longitude) {
                return $store->isWithinDeliveryRadius($latitude, $longitude);
            })
            ->sortBy(function ($store) use ($latitude, $longitude) {
                return $store->calculateDistance($latitude, $longitude);
            })
            ->first();
    }

    private function ensureAuthorized(Order $order): void
    {
        $user = Auth::user();

        if (!$user || (!$user->isAdmin() && (int) $order->user_id !== (int) $user->id)) {
            abort(403, __('no_access_to_order'));
        }
    }
}
