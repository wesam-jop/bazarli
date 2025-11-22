<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FavoriteProductController extends Controller
{
    /**
     * Add product to favorites
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => ['required', 'exists:products,id'],
        ]);

        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $user->favoriteProducts()->syncWithoutDetaching([
            $request->integer('product_id'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة المنتج للمفضلة'
        ]);
    }

    /**
     * Remove product from favorites
     */
    public function destroy(Request $request, Product $product): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $user->favoriteProducts()->detach($product->id);

        return response()->json([
            'success' => true,
            'message' => 'تم إزالة المنتج من المفضلة'
        ]);
    }

    /**
     * Get user's favorite products
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $favorites = $user->favoriteProducts()->with('category')->get();

        return response()->json([
            'success' => true,
            'data' => $favorites
        ]);
    }
}

