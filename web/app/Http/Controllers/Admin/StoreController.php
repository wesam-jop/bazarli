<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\Setting;
use App\Models\Store;
use App\Models\User;

class StoreController extends Controller
{
    public function index(Request $request)
    {
        $commissionPercentage = (float) Setting::get('platform_commission_percentage', 0);

        $stores = Store::with(['owner', 'products', 'storeType'])
            ->withCount(['orders', 'products'])
            ->withSum(['orders as delivered_orders_total' => function ($query) {
                $query->where('status', 'delivered');
            }], 'total_amount')
            ->orderBy('created_at', 'desc')
            ->get();

        $stores->each->append('store_type_label');
        $stores->each(function ($store) use ($commissionPercentage) {
            $deliveredRevenue = (float) ($store->delivered_orders_total ?? 0);
            $platformCut = round($deliveredRevenue * ($commissionPercentage / 100), 2);
            $storeNet = round($deliveredRevenue - $platformCut, 2);

            $store->setAttribute('platform_revenue', [
                'delivered_total' => $deliveredRevenue,
                'platform_cut' => $platformCut,
                'store_net' => $storeNet,
                'commission_percentage' => $commissionPercentage,
            ]);
        });

        $totalDeliveredRevenue = Order::whereHas('store')
            ->where('status', 'delivered')
            ->sum('total_amount');

        $platformCutTotal = round($totalDeliveredRevenue * ($commissionPercentage / 100), 2);
        $storeNetTotal = round($totalDeliveredRevenue - $platformCutTotal, 2);

        // Calculate stats
        $stats = [
            'total' => Store::count(),
            'active' => Store::where('is_active', true)->count(),
            'inactive' => Store::where('is_active', false)->count(),
            'total_orders' => Store::withCount('orders')->get()->sum('orders_count'),
            'total_products' => Store::withCount('products')->get()->sum('products_count'),
            'total_revenue' => $totalDeliveredRevenue,
            'platform_cut_total' => $platformCutTotal,
            'store_net_total' => $storeNetTotal,
            'commission_percentage' => $commissionPercentage,
        ];

        return Inertia::render('Admin/Stores/Index', [
            'stores' => $stores,
            'stats' => $stats,
        ]);
    }

    public function show(Store $store)
    {
        $store->load(['owner', 'products.category', 'storeType', 'orders' => function($query) {
            $query->latest()->limit(10);
        }]);
        $store->append('store_type_label');
        
        return Inertia::render('Admin/Stores/Show', [
            'store' => $store,
        ]);
    }

    public function toggleActive(Store $store)
    {
        $store->update([
            'is_active' => !$store->is_active,
        ]);

        return redirect()->back()->with('success', __('store_status_updated'));
    }
}

