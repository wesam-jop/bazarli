<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    /**
     * Get user's cart
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $cartItems = Cart::where('user_id', $user->id)
            ->with('product.category')
            ->get();

        $items = [];
        $total = 0;

        foreach ($cartItems as $item) {
            $product = $item->product;
            
            if (!$product || !$product->is_available) {
                // Remove unavailable products
                $item->delete();
                continue;
            }

            $itemTotal = $product->price * $item->quantity;
            $total += $itemTotal;

            $items[] = [
                'id' => $item->id,
                'product' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => (float) $product->price,
                    'discount_price' => $product->discount_price ? (float) $product->discount_price : null,
                    'final_price' => (float) $product->final_price,
                    'image' => $product->image,
                    'unit' => $product->unit,
                    'category' => $product->category ? [
                        'id' => $product->category->id,
                        'name' => $product->category->display_name ?? $product->category->name,
                    ] : null,
                ],
                'quantity' => $item->quantity,
                'subtotal' => (float) $itemTotal,
                'created_at' => $item->created_at->toIso8601String(),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'items' => $items,
                'total' => (float) $total,
                'items_count' => count($items),
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

        $user = $request->user();
        $product = Product::findOrFail($request->product_id);
        
        if (!$product->is_available) {
            return response()->json([
                'success' => false,
                'message' => 'المنتج غير متوفر حالياً'
            ], 400);
        }

        // Check if item already exists in cart
        $cartItem = Cart::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->first();

        $newQuantity = ($cartItem ? $cartItem->quantity : 0) + $request->quantity;

        if ($cartItem) {
            $cartItem->update(['quantity' => $newQuantity]);
        } else {
            Cart::create([
                'user_id' => $user->id,
                'product_id' => $product->id,
                'quantity' => $request->quantity,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة المنتج إلى السلة بنجاح',
            'data' => [
                'product_id' => $product->id,
                'quantity' => $newQuantity,
            ]
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

        $user = $request->user();
        $product = Product::findOrFail($request->product_id);
        
        $cartItem = Cart::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->first();

        if (!$cartItem) {
            return response()->json([
                'success' => false,
                'message' => 'المنتج غير موجود في السلة'
            ], 404);
        }

        if ($request->quantity == 0) {
            $cartItem->delete();
            return response()->json([
                'success' => true,
                'message' => 'تم حذف المنتج من السلة',
            ]);
        }


        $cartItem->update(['quantity' => $request->quantity]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث السلة بنجاح',
            'data' => [
                'product_id' => $product->id,
                'quantity' => $request->quantity,
            ]
        ]);
    }

    /**
     * Remove product from cart
     */
    public function remove(Request $request, $productId): JsonResponse
    {
        $user = $request->user();
        
        $cartItem = Cart::where('user_id', $user->id)
            ->where('product_id', $productId)
            ->first();

        if (!$cartItem) {
            return response()->json([
                'success' => false,
                'message' => 'المنتج غير موجود في السلة'
            ], 404);
        }

        $cartItem->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف المنتج من السلة',
        ]);
    }

    /**
     * Clear cart
     */
    public function clear(Request $request): JsonResponse
    {
        $user = $request->user();
        
        Cart::where('user_id', $user->id)->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'تم مسح السلة بنجاح'
        ]);
    }

    /**
     * Get cart count
     */
    public function count(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $count = Cart::where('user_id', $user->id)->sum('quantity');
        
        return response()->json([
            'success' => true,
            'data' => [
                'count' => (int) $count,
            ]
        ]);
    }
}
