<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Store;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::with(['category', 'store'])
            ->orderBy('stock_quantity', 'asc')
            ->orderBy('name', 'asc')
            ->get();

        // Calculate stats
        $stats = [
            'total_products' => Product::count(),
            'total_stock' => Product::sum('stock_quantity'),
            'in_stock' => Product::where('stock_quantity', '>', 10)->count(),
            'low_stock' => Product::where('stock_quantity', '>', 0)->where('stock_quantity', '<=', 10)->count(),
            'out_of_stock' => Product::where('stock_quantity', '<=', 0)->count(),
            'total_value' => Product::sum(DB::raw('COALESCE(price, 0) * COALESCE(stock_quantity, 0)')),
            'low_stock_value' => Product::where('stock_quantity', '>', 0)
                ->where('stock_quantity', '<=', 10)
                ->sum(DB::raw('COALESCE(price, 0) * COALESCE(stock_quantity, 0)')),
        ];

        return Inertia::render('Admin/Inventory/Index', [
            'products' => $products,
            'stats' => $stats,
        ]);
    }

    public function updateStock(Request $request, Product $product)
    {
        $request->validate([
            'stock_quantity' => 'required|integer|min:0',
        ]);

        $product->update([
            'stock_quantity' => $request->stock_quantity,
        ]);

        return redirect()->back()->with('success', __('stock_quantity_updated'));
    }
}

