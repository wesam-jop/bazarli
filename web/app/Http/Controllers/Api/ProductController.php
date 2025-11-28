<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'store'])
            ->available();

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by store
        if ($request->has('store_id')) {
            $query->where('store_id', $request->store_id);
        }

        // Filter by featured
        if ($request->has('featured') && $request->featured) {
            $query->featured();
        }

        // Filter by governorate (through store)
        if ($request->has('governorate_id')) {
            $query->whereHas('store', function ($q) use ($request) {
                $q->where('governorate_id', $request->governorate_id);
            });
        }

        // Filter by city (through store)
        if ($request->has('city_id')) {
            $query->whereHas('store', function ($q) use ($request) {
                $q->where('city_id', $request->city_id);
            });
        }

        // Search by name
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'sort_order');
        $sortOrder = $request->get('sort_order', 'asc');
        
        // Validate sort_by to prevent SQL injection
        $allowedSorts = ['sort_order', 'name', 'price', 'created_at', 'sales_count'];
        if (!in_array($sortBy, $allowedSorts)) {
            $sortBy = 'sort_order';
        }
        
        $query->orderBy($sortBy, $sortOrder);

        $perPage = min($request->get('per_page', 20), 100); // Max 100 per page
        $products = $query->paginate($perPage);

        // Format response
        $products->getCollection()->transform(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'price' => (float) $product->price,
                'discount_price' => $product->discount_price ? (float) $product->discount_price : null,
                'final_price' => (float) $product->final_price,
                'discount_percentage' => $product->discount_percentage,
                'image' => $product->image,
                'images' => $product->images ?? [],
                'unit' => $product->unit,
                'is_available' => $product->is_available,
                'is_featured' => $product->is_featured,
                'weight' => $product->weight ? (float) $product->weight : null,
                'brand' => $product->brand,
                'category' => $product->category ? [
                    'id' => $product->category->id,
                    'name' => $product->category->display_name ?? $product->category->name,
                    'slug' => $product->category->slug,
                ] : null,
                'store' => $product->store ? [
                    'id' => $product->store->id,
                    'name' => $product->store->name,
                    'governorate_id' => $product->store->governorate_id,
                    'city_id' => $product->store->city_id,
                ] : null,
                'created_at' => $product->created_at->toIso8601String(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $product = Product::with(['category', 'store.governorate', 'store.city'])
            ->findOrFail($id);

        $formatted = [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'description' => $product->description,
            'price' => (float) $product->price,
            'discount_price' => $product->discount_price ? (float) $product->discount_price : null,
            'final_price' => (float) $product->final_price,
            'discount_percentage' => $product->discount_percentage,
            'image' => $product->image,
            'images' => $product->images ?? [],
            'unit' => $product->unit,
            'stock_quantity' => $product->stock_quantity,
            'is_available' => $product->is_available,
            'is_featured' => $product->is_featured,
            'weight' => $product->weight ? (float) $product->weight : null,
            'brand' => $product->brand,
            'barcode' => $product->barcode,
            'nutritional_info' => $product->nutritional_info,
            'category' => $product->category ? [
                'id' => $product->category->id,
                'name' => $product->category->display_name ?? $product->category->name,
                'slug' => $product->category->slug,
                'description' => $product->category->display_description ?? $product->category->description,
            ] : null,
            'store' => $product->store ? [
                'id' => $product->store->id,
                'name' => $product->store->name,
                'address' => $product->store->address,
                'phone' => $product->store->phone,
                'governorate_id' => $product->store->governorate_id,
                'city_id' => $product->store->city_id,
                'governorate' => $product->store->governorate ? [
                    'id' => $product->store->governorate->id,
                    'name' => app()->getLocale() === 'ar' 
                        ? $product->store->governorate->name_ar 
                        : $product->store->governorate->name_en,
                ] : null,
                'city' => $product->store->city ? [
                    'id' => $product->store->city->id,
                    'name' => app()->getLocale() === 'ar' 
                        ? $product->store->city->name_ar 
                        : $product->store->city->name_en,
                ] : null,
            ] : null,
            'created_at' => $product->created_at->toIso8601String(),
        ];

        return response()->json([
            'success' => true,
            'data' => $formatted
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'store_id' => 'nullable|exists:stores,id',
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:products',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'image' => 'nullable|string',
            'images' => 'nullable|array',
            'unit' => 'nullable|string|max:50',
            'weight' => 'nullable|numeric|min:0',
            'brand' => 'nullable|string|max:255',
            'barcode' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
        ]);

        $product = Product::create($request->all());

        return response()->json([
            'success' => true,
            'data' => $product,
            'message' => 'تم إنشاء المنتج بنجاح'
        ], 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'category_id' => 'sometimes|required|exists:categories,id',
            'store_id' => 'nullable|exists:stores,id',
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|max:255|unique:products,slug,' . $id,
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'image' => 'nullable|string',
            'images' => 'nullable|array',
            'unit' => 'nullable|string|max:50',
            'is_available' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'weight' => 'nullable|numeric|min:0',
            'brand' => 'nullable|string|max:255',
            'barcode' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
        ]);

        $product->update($request->all());

        return response()->json([
            'success' => true,
            'data' => $product,
            'message' => 'تم تحديث المنتج بنجاح'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف المنتج بنجاح'
        ]);
    }
}
