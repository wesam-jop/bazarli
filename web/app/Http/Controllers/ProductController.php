<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Category;
use App\Models\Governorate;
use App\Models\City;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with([
            'category',
            'store' => function($q) {
                $q->with(['governorate:id,name_ar,name_en', 'city:id,name_ar,name_en']);
            }
        ])->available();

        // البحث
        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
        }

        // التصفية حسب الفئة
        if ($request->has('category') && $request->category) {
            $query->where('category_id', $request->category);
        }

        // فلترة حسب المحافظة (من خلال المتجر)
        if ($governorateId = $request->get('governorate_id')) {
            $query->whereHas('store', function($q) use ($governorateId) {
                $q->where('governorate_id', $governorateId);
            });
        }

        // فلترة حسب المنطقة (من خلال المتجر)
        if ($cityId = $request->get('city_id')) {
            $query->whereHas('store', function($q) use ($cityId) {
                $q->where('city_id', $cityId);
            });
        }

        // الترتيب
        $sortBy = $request->get('sort', 'sort_order');
        $sortDirection = $request->get('direction', 'asc');
        
        if ($sortBy === 'price') {
            $query->orderBy('price', $sortDirection);
        } elseif ($sortBy === 'name') {
            $query->orderBy('name', $sortDirection);
        } else {
            $query->orderBy('sort_order', 'asc');
        }

        $products = $query->paginate(20)->withQueryString();

        $categories = Category::active()->orderBy('sort_order')->get();

        // جلب المحافظات والمناطق للفلترة
        $governorates = Governorate::active()
            ->orderBy('display_order')
            ->get()
            ->map(fn ($gov) => [
                'id' => $gov->id,
                'name' => app()->getLocale() === 'ar' ? $gov->name_ar : $gov->name_en,
            ]);

        $cities = [];
        if ($governorateId = $request->get('governorate_id')) {
            $cities = City::active()
                ->where('governorate_id', $governorateId)
                ->orderBy('display_order')
                ->get()
                ->map(fn ($city) => [
                    'id' => $city->id,
                    'name' => app()->getLocale() === 'ar' ? $city->name_ar : $city->name_en,
                ]);
        }

        return Inertia::render('Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'governorates' => $governorates,
            'cities' => $cities,
            'filters' => $request->only(['search', 'category', 'sort', 'direction', 'governorate_id', 'city_id']),
        ]);
    }

    public function show(Product $product)
    {
        $product->load([
            'category',
            'store' => function($q) {
                $q->with(['governorate:id,name_ar,name_en', 'city:id,name_ar,name_en']);
            }
        ]);
        
        // خوارزمية محسنة للمنتجات المشابهة
        $relatedProducts = $this->getRelatedProducts($product);

        return Inertia::render('Products/Show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
        ]);
    }

    /**
     * خوارزمية محسنة للحصول على المنتجات المشابهة
     */
    private function getRelatedProducts(Product $product)
    {
        $storeRelation = [
            'store' => function($q) {
                $q->with(['governorate:id,name_ar,name_en', 'city:id,name_ar,name_en']);
            }
        ];

        // 1. منتجات من نفس الفئة (الأولوية الأولى)
        $sameCategoryProducts = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->with($storeRelation)
            ->available()
            ->inRandomOrder()
            ->limit(2)
            ->get();

        // 2. منتجات مميزة من فئات أخرى (الأولوية الثانية)
        $featuredProducts = Product::where('category_id', '!=', $product->category_id)
            ->where('is_featured', true)
            ->with($storeRelation)
            ->available()
            ->inRandomOrder()
            ->limit(1)
            ->get();

        // 3. منتجات عشوائية من فئات أخرى (الأولوية الثالثة)
        $randomProducts = Product::where('category_id', '!=', $product->category_id)
            ->where('is_featured', false)
            ->with($storeRelation)
            ->available()
            ->inRandomOrder()
            ->limit(1)
            ->get();

        // دمج النتائج مع الحفاظ على الترتيب
        $relatedProducts = $sameCategoryProducts
            ->concat($featuredProducts)
            ->concat($randomProducts)
            ->take(4);

        return $relatedProducts;
    }
}
