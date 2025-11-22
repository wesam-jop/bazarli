<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    /**
     * Get user's cart
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $cart = $request->session()->get('cart', []);
        $cartItems = [];
        $total = 0;

        foreach ($cart as $productId => $quantity) {
            $product = Product::with('category')->find($productId);
            if ($product && $product->is_available) {
                $itemTotal = $product->price * $quantity;
                $cartItems[] = [
                    'product' => $product,
                    'quantity' => $quantity,
                    'subtotal' => $itemTotal,
                ];
                $total += $itemTotal;
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'items' => $cartItems,
                'total' => $total,
            ]
        ]);
    }

    /**
     * Add product to cart
     */
    public function add(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $product = Product::findOrFail($request->product_id);
        
        if (!$product->is_available) {
            return response()->json([
                'success' => false,
                'message' => 'المنتج غير متوفر حالياً'
            ], 400);
        }

        $cart = $request->session()->get('cart', []);
        $currentQuantity = $cart[$product->id] ?? 0;
        $newQuantity = $currentQuantity + $request->quantity;

        if ($newQuantity > $product->stock_quantity) {
            return response()->json([
                'success' => false,
                'message' => 'الكمية المطلوبة غير متوفرة في المخزون'
            ], 400);
        }

        $cart[$product->id] = $newQuantity;
        $request->session()->put('cart', $cart);

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة المنتج إلى السلة بنجاح',
            'data' => ['cart' => $cart]
        ]);
    }

    /**
     * Update cart item
     */
    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:0',
        ]);

        $product = Product::findOrFail($request->product_id);
        $cart = $request->session()->get('cart', []);

        if ($request->quantity == 0) {
            unset($cart[$product->id]);
        } else {
            if ($request->quantity > $product->stock_quantity) {
                return response()->json([
                    'success' => false,
                    'message' => 'الكمية المطلوبة غير متوفرة في المخزون'
                ], 400);
            }
            $cart[$product->id] = $request->quantity;
        }

        $request->session()->put('cart', $cart);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث السلة بنجاح',
            'data' => ['cart' => $cart]
        ]);
    }

    /**
     * Remove product from cart
     */
    public function remove(Request $request, $productId): JsonResponse
    {
        $cart = $request->session()->get('cart', []);
        unset($cart[$productId]);
        $request->session()->put('cart', $cart);

        return response()->json([
            'success' => true,
            'message' => 'تم حذف المنتج من السلة',
            'data' => ['cart' => $cart]
        ]);
    }

    /**
     * Clear cart
     */
    public function clear(Request $request): JsonResponse
    {
        $request->session()->forget('cart');
        
        return response()->json([
            'success' => true,
            'message' => 'تم مسح السلة بنجاح'
        ]);
    }
}

