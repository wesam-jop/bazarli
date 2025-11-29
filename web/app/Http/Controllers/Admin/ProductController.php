<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Category;
use App\Models\Store;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::with(['category', 'store'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Calculate stats
        $stats = [
            'total' => Product::count(),
            'available' => Product::where('is_available', true)->count(),
            'unavailable' => Product::where('is_available', false)->count(),
            'featured' => Product::where('is_featured', true)->count(),
            'total_sales' => Product::sum('sales_count'),
        ];

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'stats' => $stats,
        ]);
    }

    public function show(Product $product)
    {
        $product->load(['category', 'store', 'orderItems.order']);
        
        return Inertia::render('Admin/Products/Show', [
            'product' => $product,
        ]);
    }

    public function toggleAvailable(Product $product)
    {
        $product->update([
            'is_available' => !$product->is_available,
        ]);

        return redirect()->back()->with('success', __('product_availability_updated'));
    }

    public function toggleFeatured(Product $product)
    {
        $product->update([
            'is_featured' => !$product->is_featured,
        ]);

        return redirect()->back()->with('success', __('product_featured_updated'));
    }
}

