<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStore;
use App\Models\Product;
use App\Models\Setting;
use App\Models\Store;
use App\Models\User;
use App\Models\Area;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    /**
     * Get user's orders
     */
    public function userOrders(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $orders = Order::with(['store', 'orderItems.product'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $ordersQuery = Order::with(['store', 'orderItems.product'])
            ->orderBy('created_at', 'desc');

        if (!$user->isAdmin()) {
            $ordersQuery->where('user_id', $user->id);
        }

        $orders = $ordersQuery->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Store a newly created resource in storage.
     * يدعم الطلبات من متاجر متعددة
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        // التحقق من أن المستخدم لديه محافظة ومنطقة
        if (!$user->governorate_id || !$user->area_id) {
            return response()->json([
                'success' => false,
                'message' => 'يجب تحديد المحافظة والمنطقة في ملفك الشخصي أولاً'
            ], 400);
        }

        $request->validate([
            'stores' => 'required|array|min:1',
            'stores.*.store_id' => 'required|exists:stores,id',
            'stores.*.items' => 'required|array|min:1',
            'stores.*.items.*.product_id' => 'required|exists:products,id',
            'stores.*.items.*.quantity' => 'required|integer|min:1',
            'delivery_address' => 'required|string|max:500',
            'delivery_latitude' => 'required|numeric',
            'delivery_longitude' => 'required|numeric',
            'customer_phone' => 'required|string|max:20',
            'payment_method' => 'required|in:cash,card,wallet',
            'location_notes' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:500',
        ]);

        // التحقق من وجود عامل توصيل متاح في المنطقة
        // نتحقق من Users مع user_type = 'driver' في نفس المنطقة
        $availableDriver = User::where('user_type', 'driver')
            ->where('area_id', $user->area_id)
            ->where('is_verified', true)
            ->first();
        
        // يمكن أيضاً التحقق من DeliveryDriver model إذا كان مستخدماً
        if (!$availableDriver) {
            $availableDriver = \App\Models\DeliveryDriver::available()
                ->inArea($user->area_id)
                ->first();
        }

        if (!$availableDriver) {
            return response()->json([
                'success' => false,
                'message' => 'عذراً، لا يوجد عامل توصيل متاح في منطقتك حالياً. لا يمكننا قبول الطلب.'
            ], 400);
        }

        $defaultEta = (int) Setting::get('default_estimated_delivery_time', 15);
        $totalSubtotal = 0;
        $totalDeliveryFee = 0;
        $storesData = [];

        DB::beginTransaction();
        
        try {
            // التحقق من صحة المتاجر والمنتجات
            foreach ($request->stores as $storeData) {
                $store = Store::findOrFail($storeData['store_id']);
                
                if (!$store->is_active) {
                    throw new \Exception('المتجر ' . $store->name . ' غير متاح حالياً');
                }

                $storeSubtotal = 0;
                $storeItems = [];

                // التحقق من المنتجات
                foreach ($storeData['items'] as $item) {
                    $product = Product::findOrFail($item['product_id']);
                    
                    // التأكد من أن المنتج يخص هذا المتجر
                    if ($product->store_id != $store->id) {
                        throw new \Exception('المنتج ' . $product->name . ' لا يخص المتجر ' . $store->name);
                    }
                    
                    if (!$product->is_available) {
                        throw new \Exception('المنتج ' . $product->name . ' غير متوفر');
                    }

                    // Stock system removed

                    $itemTotal = $product->price * $item['quantity'];
                    $storeSubtotal += $itemTotal;

                    $storeItems[] = [
                        'product' => $product,
                        'quantity' => $item['quantity'],
                        'price' => $product->price,
                        'total' => $itemTotal,
                    ];
                }

                $storeDeliveryFee = $store->delivery_fee ?? 0;
                $totalSubtotal += $storeSubtotal;
                $totalDeliveryFee += $storeDeliveryFee;

                $storesData[] = [
                    'store' => $store,
                    'items' => $storeItems,
                    'subtotal' => $storeSubtotal,
                    'delivery_fee' => $storeDeliveryFee,
                ];
            }

            // إنشاء الطلب الرئيسي
            $order = Order::create([
                'user_id' => $user->id,
                'store_id' => $storesData[0]['store']->id, // المتجر الأول كمرجع
                'status' => 'pending_driver_approval', // في انتظار موافقة عامل التوصيل
                'subtotal' => $totalSubtotal,
                'delivery_fee' => $totalDeliveryFee,
                'tax_amount' => 0,
                'discount_amount' => 0,
                'total_amount' => $totalSubtotal + $totalDeliveryFee,
                'payment_status' => 'pending',
                'payment_method' => $request->payment_method,
                'delivery_address' => $request->delivery_address,
                'delivery_latitude' => $request->delivery_latitude,
                'delivery_longitude' => $request->delivery_longitude,
                'area_id' => $user->area_id,
                'customer_phone' => $request->customer_phone,
                'notes' => $request->notes,
                'location_notes' => $request->location_notes,
                'estimated_delivery_time' => $defaultEta,
            ]);

            // إنشاء order_stores و order_items لكل متجر
            foreach ($storesData as $storeDataItem) {
                // إنشاء OrderStore
                OrderStore::create([
                    'order_id' => $order->id,
                    'store_id' => $storeDataItem['store']->id,
                    'status' => 'pending_store_approval', // في انتظار موافقة المتجر
                    'subtotal' => $storeDataItem['subtotal'],
                    'delivery_fee' => $storeDataItem['delivery_fee'],
                ]);

                // إنشاء OrderItems
                foreach ($storeDataItem['items'] as $item) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'store_id' => $storeDataItem['store']->id,
                        'product_id' => $item['product']->id,
                        'product_name' => $item['product']->name,
                        'product_price' => $item['price'],
                        'quantity' => $item['quantity'],
                        'total_price' => $item['total'],
                    ]);
                    // لا ننقص المخزون الآن - سيتم ذلك عند موافقة عامل التوصيل
                }
            }

            DB::commit();

            $order->load(['stores', 'orderItems.product', 'orderStores.store']);

            return response()->json([
                'success' => true,
                'data' => $order,
                'message' => 'تم إنشاء الطلب بنجاح وهو في انتظار موافقة عامل التوصيل'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $user = Auth::user();
        $order = Order::with(['store', 'orderItems.product', 'deliveryDriver'])
            ->findOrFail($id);

        if (!$user->isAdmin() && (int) $order->user_id !== (int) $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'ليس لديك صلاحية للوصول إلى هذا الطلب'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    /**
     * Cancel order
     */
    public function cancel(Order $order): JsonResponse
    {
        $user = Auth::user();

        if (!$user->isAdmin() && (int) $order->user_id !== (int) $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'ليس لديك صلاحية لإلغاء هذا الطلب'
            ], 403);
        }

        if (!$order->canBeCancelled()) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن إلغاء هذا الطلب'
            ], 400);
        }

        DB::beginTransaction();
        
        try {
            // Stock system removed

            $order->update(['status' => 'cancelled']);
            
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم إلغاء الطلب بنجاح',
                'data' => $order
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء إلغاء الطلب'
            ], 400);
        }
    }

    /**
     * Track order
     */
    public function track(Order $order): JsonResponse
    {
        $user = Auth::user();

        if (!$user->isAdmin() && (int) $order->user_id !== (int) $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'ليس لديك صلاحية لتتبع هذا الطلب'
            ], 403);
        }

        $order->load(['store', 'orderItems.product', 'deliveryDriver']);

        return response()->json([
            'success' => true,
            'data' => [
                'order' => $order,
                'status' => $order->status,
                'estimated_delivery_time' => $order->estimated_delivery_time,
                'delivery_driver' => $order->deliveryDriver,
            ]
        ]);
    }
}
