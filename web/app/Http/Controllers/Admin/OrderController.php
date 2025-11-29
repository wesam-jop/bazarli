<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\User;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::with(['user', 'store', 'orderItems.product'])
            ->with(['deliveryDriver' => function($query) {
                $query->with('user');
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        // Calculate stats
        $stats = [
            'total' => Order::count(),
            'pending' => Order::where('status', 'pending')->count(),
            'confirmed' => Order::where('status', 'confirmed')->count(),
            'preparing' => Order::where('status', 'preparing')->count(),
            'on_delivery' => Order::where('status', 'on_delivery')->count(),
            'delivered' => Order::where('status', 'delivered')->count(),
            'cancelled' => Order::where('status', 'cancelled')->count(),
            'total_revenue' => Order::where('status', 'delivered')->sum('total_amount'),
        ];

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'stats' => $stats,
        ]);
    }

    public function show(Order $order)
    {
        // Load all relationships
        $order->load([
            'user',
            'store',
            'orderItems' => function($query) {
                $query->with([
                    'product.category',
                    'product.store',
                    'store'
                ]);
            },
            'deliveryDriver.user'
        ]);
        
        // Debug: Log order items count
        \Log::info('Order Items Count', [
            'order_id' => $order->id,
            'order_items_count' => $order->orderItems->count(),
            'order_items' => $order->orderItems->map(function($item) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product_name,
                    'quantity' => $item->quantity,
                    'product_price' => $item->product_price,
                    'total_price' => $item->total_price,
                ];
            })->toArray()
        ]);
        
        return Inertia::render('Admin/Orders/Show', [
            'order' => $order,
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,preparing,on_delivery,delivered,cancelled',
        ]);

        $order->update([
            'status' => $request->status,
        ]);

        if ($request->status === 'delivered') {
            $order->update([
                'delivered_at' => now(),
            ]);
        }

        return redirect()->back()->with('success', __('order_status_updated'));
    }
}

