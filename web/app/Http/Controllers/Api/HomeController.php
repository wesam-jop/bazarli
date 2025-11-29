<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class HomeController extends Controller
{
    /**
     * Get home page data
     * بيانات الصفحة الرئيسية
     */
    public function index(Request $request): JsonResponse
    {
        // الفئات
        $categories = Category::active()
            ->orderBy('sort_order')
            ->limit(10)
            ->get()
            ->map(fn ($cat) => [
                'id' => $cat->id,
                'name' => $cat->display_name ?? $cat->name,
                'slug' => $cat->slug,
                'image' => $cat->image,
                'icon' => $cat->icon,
                'products_count' => $cat->products()->available()->count(),
            ]);

        // المنتجات المميزة (الأكثر مبيعاً)
        $featuredProducts = Product::with([
            'category',
            'store' => function ($q) {
                $q->with(['governorate:id,name_ar,name_en', 'city:id,name_ar,name_en']);
            }
        ])
            ->available()
            ->orderBy('sales_count', 'desc')
            ->limit(8)
            ->get()
            ->map(fn ($product) => $this->formatProduct($product));

        // المتاجر المميزة (الأكثر طلبات)
        $featuredStores = Store::active()
            ->with(['governorate', 'city', 'storeType'])
            ->withCount(['orders', 'products'])
            ->orderByDesc('orders_count')
            ->limit(8)
            ->get()
            ->map(fn ($store) => $this->formatStore($store));

        // أحدث المنتجات
        $newProducts = Product::with(['category', 'store'])
            ->available()
            ->orderByDesc('created_at')
            ->limit(8)
            ->get()
            ->map(fn ($product) => $this->formatProduct($product));

        // المنتجات بخصومات
        $discountedProducts = Product::with(['category', 'store'])
            ->available()
            ->whereNotNull('discount_price')
            ->where('discount_price', '>', 0)
            ->orderByDesc('created_at')
            ->limit(8)
            ->get()
            ->map(fn ($product) => $this->formatProduct($product));

        return response()->json([
            'success' => true,
            'data' => [
                'categories' => $categories,
                'featured_products' => $featuredProducts,
                'featured_stores' => $featuredStores,
                'new_products' => $newProducts,
                'discounted_products' => $discountedProducts,
            ]
        ]);
    }

    /**
     * Search products and stores
     * البحث في المنتجات والمتاجر
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'query' => 'required|string|min:2|max:100',
        ]);

        $searchQuery = $request->query('query');

        // البحث في المنتجات
        $products = Product::with(['category', 'store'])
            ->available()
            ->where(function ($q) use ($searchQuery) {
                $q->where('name', 'like', '%' . $searchQuery . '%')
                    ->orWhere('description', 'like', '%' . $searchQuery . '%');
            })
            ->orderByDesc('sales_count')
            ->limit(20)
            ->get()
            ->map(fn ($product) => $this->formatProduct($product));

        // البحث في المتاجر
        $stores = Store::active()
            ->with(['governorate', 'city'])
            ->where(function ($q) use ($searchQuery) {
                $q->where('name', 'like', '%' . $searchQuery . '%')
                    ->orWhere('address', 'like', '%' . $searchQuery . '%');
            })
            ->withCount(['orders', 'products'])
            ->limit(10)
            ->get()
            ->map(fn ($store) => $this->formatStore($store));

        // البحث في الفئات
        $categories = Category::active()
            ->where(function ($q) use ($searchQuery) {
                $q->where('name', 'like', '%' . $searchQuery . '%')
                    ->orWhere('name_ar', 'like', '%' . $searchQuery . '%')
                    ->orWhere('name_en', 'like', '%' . $searchQuery . '%');
            })
            ->limit(5)
            ->get()
            ->map(fn ($cat) => [
                'id' => $cat->id,
                'name' => $cat->display_name ?? $cat->name,
                'slug' => $cat->slug,
                'image' => $cat->image,
            ]);

        return response()->json([
            'success' => true,
            'data' => [
                'products' => $products,
                'stores' => $stores,
                'categories' => $categories,
            ]
        ]);
    }

    /**
     * Get nearby stores
     * المتاجر القريبة
     */
    public function nearbyStores(Request $request): JsonResponse
    {
        $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius' => 'nullable|numeric|min:1|max:50',
        ]);

        $latitude = $request->latitude;
        $longitude = $request->longitude;
        $radius = $request->get('radius', 10); // Default 10km

        $stores = Store::active()
            ->with(['governorate', 'city', 'storeType'])
            ->withCount(['orders', 'products'])
            ->get()
            ->filter(function ($store) use ($latitude, $longitude, $radius) {
                if (!$store->latitude || !$store->longitude) {
                    return false;
                }
                $distance = $this->calculateDistance(
                    $latitude,
                    $longitude,
                    $store->latitude,
                    $store->longitude
                );
                $store->distance = round($distance, 2);
                return $distance <= $radius;
            })
            ->sortBy('distance')
            ->take(20)
            ->values()
            ->map(function ($store) {
                $formatted = $this->formatStore($store);
                $formatted['distance'] = $store->distance;
                return $formatted;
            });

        return response()->json([
            'success' => true,
            'data' => $stores
        ]);
    }

    /**
     * Get app settings
     * إعدادات التطبيق
     */
    public function settings(): JsonResponse
    {
        $settings = [
            'app_name' => \App\Models\Setting::get('site_name', config('app.name', 'DeliGo')),
            'app_description' => \App\Models\Setting::get('site_description', 'Fast delivery in 10 minutes'),
            'app_logo' => \App\Models\Setting::get('site_logo', ''),
            'app_favicon' => \App\Models\Setting::get('site_favicon', ''),
            'app_version' => '1.0.0',
            'default_language' => \App\Models\Setting::get('default_language', 'ar'),
            'default_currency' => \App\Models\Setting::get('default_currency', 'SYP'),
            'currency_symbol' => 'ل.س',
            'min_order_amount' => (float) \App\Models\Setting::get('min_order_amount', 0),
            'default_delivery_fee' => (float) \App\Models\Setting::get('default_delivery_fee', 0),
            'default_estimated_delivery_time' => (int) \App\Models\Setting::get('default_estimated_delivery_time', 15),
            'platform_commission_percentage' => (float) \App\Models\Setting::get('platform_commission_percentage', 10),
            'maintenance_mode' => (bool) \App\Models\Setting::get('maintenance_mode', false),
            'maintenance_message' => \App\Models\Setting::get('maintenance_message', ''),
            'payment_methods' => [
                ['key' => 'cash', 'name_ar' => 'الدفع نقداً', 'name_en' => 'Cash on Delivery', 'enabled' => true],
                ['key' => 'card', 'name_ar' => 'البطاقة', 'name_en' => 'Card', 'enabled' => (bool) \App\Models\Setting::get('card_payment_enabled', false)],
                ['key' => 'wallet', 'name_ar' => 'المحفظة', 'name_en' => 'Wallet', 'enabled' => (bool) \App\Models\Setting::get('wallet_payment_enabled', false)],
            ],
            'support_phone' => \App\Models\Setting::get('support_phone', ''),
            'support_email' => \App\Models\Setting::get('support_email', ''),
        ];

        return response()->json([
            'success' => true,
            'data' => $settings
        ]);
    }

    private function formatProduct(Product $product): array
    {
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
            'unit' => $product->unit,
            'is_available' => $product->is_available,
            'is_featured' => $product->is_featured,
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
        ];
    }

    private function formatStore(Store $store): array
    {
        return [
            'id' => $store->id,
            'name' => $store->name,
            'store_type' => $store->store_type,
            'store_type_label' => $store->store_type_label,
            'logo_url' => $store->logo_path ? asset('storage/' . $store->logo_path) : null,
            'address' => $store->address,
            'latitude' => $store->latitude ? (float) $store->latitude : null,
            'longitude' => $store->longitude ? (float) $store->longitude : null,
            'phone' => $store->phone,
            'opening_time' => $store->opening_time?->format('H:i'),
            'closing_time' => $store->closing_time?->format('H:i'),
            'delivery_fee' => $store->delivery_fee ? (float) $store->delivery_fee : null,
            'estimated_delivery_time' => $store->estimated_delivery_time,
            'governorate' => $store->governorate ? [
                'id' => $store->governorate->id,
                'name_ar' => $store->governorate->name_ar,
                'name_en' => $store->governorate->name_en,
            ] : null,
            'city' => $store->city ? [
                'id' => $store->city->id,
                'name_ar' => $store->city->name_ar,
                'name_en' => $store->city->name_en,
            ] : null,
            'orders_count' => $store->orders_count ?? 0,
            'products_count' => $store->products_count ?? 0,
        ];
    }

    private function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371; // km

        $latDiff = deg2rad($lat2 - $lat1);
        $lonDiff = deg2rad($lon2 - $lon1);

        $a = sin($latDiff / 2) * sin($latDiff / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($lonDiff / 2) * sin($lonDiff / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
}

