<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class StoreController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Store::active()->withCount(['orders', 'products']);

        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $stores = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $stores
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $store = Store::with(['owner', 'products', 'storeType'])
            ->withCount(['orders', 'products'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $store
        ]);
    }
}
