<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Setting;
use App\Models\Store;
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
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'store_id' => 'required|exists:stores,id',
            'delivery_address' => 'required|string|max:500',
            'delivery_latitude' => 'required|numeric',
            'delivery_longitude' => 'required|numeric',
            'customer_phone' => 'required|string|max:20',
            'payment_method' => 'required|in:cash,card,wallet',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:500',
        ]);

        $store = Store::findOrFail($request->store_id);
        
        if (!$store->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'المتجر غير متاح حالياً'
            ], 400);
        }

        $defaultEta = (int) Setting::get('default_estimated_delivery_time', 15);
        $estimatedDeliveryTime = $store->estimated_delivery_time ?? $defaultEta;

        DB::beginTransaction();
        
        try {
            $subtotal = 0;
            $orderItems = [];

            // Validate items and calculate subtotal
            foreach ($request->items as $item) {
                $product = Product::findOrFail($item['product_id']);
                
                if (!$product->is_available) {
                    throw new \Exception('المنتج ' . $product->name . ' غير متوفر');
                }

                if ($item['quantity'] > $product->stock_quantity) {
                    throw new \Exception('الكمية المطلوبة من ' . $product->name . ' غير متوفرة');
                }

                $itemTotal = $product->price * $item['quantity'];
                $subtotal += $itemTotal;

                $orderItems[] = [
                    'product' => $product,
                    'quantity' => $item['quantity'],
                    'price' => $product->price,
                    'total' => $itemTotal,
                ];
            }

            // Create order
            $order = Order::create([
                'user_id' => Auth::id(),
                'store_id' => $store->id,
                'status' => 'pending',
                'subtotal' => $subtotal,
                'delivery_fee' => $store->delivery_fee ?? 0,
                'tax_amount' => 0,
                'discount_amount' => 0,
                'total_amount' => $subtotal + ($store->delivery_fee ?? 0),
                'payment_status' => 'pending',
                'payment_method' => $request->payment_method,
                'delivery_address' => $request->delivery_address,
                'delivery_latitude' => $request->delivery_latitude,
                'delivery_longitude' => $request->delivery_longitude,
                'customer_phone' => $request->customer_phone,
                'notes' => $request->notes,
                'estimated_delivery_time' => $estimatedDeliveryTime,
            ]);

            // Create order items
            foreach ($orderItems as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product']->id,
                    'product_name' => $item['product']->name,
                    'product_price' => $item['price'],
                    'quantity' => $item['quantity'],
                    'total_price' => $item['total'],
                ]);

                // Decrease stock
                $item['product']->decrement('stock_quantity', $item['quantity']);
            }

            DB::commit();

            $order->load(['store', 'orderItems.product']);

            return response()->json([
                'success' => true,
                'data' => $order,
                'message' => 'تم إنشاء الطلب بنجاح'
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
            // Return products to stock
            foreach ($order->orderItems as $item) {
                $product = Product::find($item->product_id);
                if ($product) {
                    $product->increment('stock_quantity', $item->quantity);
                }
            }

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
