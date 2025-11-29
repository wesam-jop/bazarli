<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\StoreType;
use App\Models\StoreWorkingHour;
use App\Models\Product;
use App\Models\Category;
use App\Models\Governorate;
use App\Models\City;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreManagementController extends Controller
{
    /**
     * Get store setup form data
     * بيانات نموذج إنشاء المتجر
     */
    public function setupForm(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول'
            ], 401);
        }

        if ($user->stores()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'لديك متجر بالفعل',
                'data' => [
                    'has_store' => true,
                    'store' => $this->formatStore($user->stores()->first())
                ]
            ], 400);
        }

        $storeTypes = StoreType::active()
            ->orderBy('display_order')
            ->get()
            ->map(fn ($type) => [
                'key' => $type->key,
                'name_ar' => $type->name_ar,
                'name_en' => $type->name_en,
                'icon' => $type->icon,
            ]);

        $governorates = Governorate::active()
            ->orderBy('display_order')
            ->get()
            ->map(fn ($gov) => [
                'id' => $gov->id,
                'name_ar' => $gov->name_ar,
                'name_en' => $gov->name_en,
            ]);

        $cities = City::active()
            ->orderBy('display_order')
            ->get()
            ->map(fn ($city) => [
                'id' => $city->id,
                'governorate_id' => $city->governorate_id,
                'name_ar' => $city->name_ar,
                'name_en' => $city->name_en,
            ]);

        return response()->json([
            'success' => true,
            'data' => [
                'has_store' => false,
                'store_types' => $storeTypes,
                'governorates' => $governorates,
                'cities' => $cities,
                'user_phone' => $user->phone,
                'user_governorate_id' => $user->governorate_id,
                'user_city_id' => $user->city_id,
            ]
        ]);
    }

    /**
     * Create store
     * إنشاء متجر جديد
     */
    public function createStore(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول'
            ], 401);
        }

        if ($user->stores()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'لديك متجر بالفعل'
            ], 400);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'store_type' => [
                'required',
                Rule::exists('store_types', 'key')->where('is_active', true),
            ],
            'address' => ['required', 'string', 'max:500'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'governorate_id' => ['required', 'exists:governorates,id'],
            'city_id' => ['required', 'exists:cities,id'],
            'phone' => ['nullable', 'string', 'max:25'],
            'logo' => ['nullable', 'image', 'max:2048'],
        ]);

        $logoPath = null;
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('store-logos', 'public');
        }

        $store = Store::create([
            'owner_id' => $user->id,
            'name' => $validated['name'],
            'code' => $this->generateStoreCode($validated['name']),
            'store_type' => $validated['store_type'],
            'logo_path' => $logoPath,
            'address' => $validated['address'],
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'governorate_id' => $validated['governorate_id'],
            'city_id' => $validated['city_id'],
            'phone' => $validated['phone'] ?? $user->phone,
            'email' => $user->email,
            'opening_time' => '08:00:00',
            'closing_time' => '23:00:00',
            'is_active' => true,
            'delivery_radius' => 5,
            'delivery_fee' => 0,
            'estimated_delivery_time' => 15,
        ]);

        // تحديث نوع المستخدم والمحافظة والمنطقة
        $user->user_type = 'store_owner';
        $user->governorate_id = $validated['governorate_id'];
        $user->city_id = $validated['city_id'];
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء المتجر بنجاح',
            'data' => $this->formatStore($store)
        ], 201);
    }

    /**
     * Get store details
     * تفاصيل المتجر
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isStoreOwner()) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول'
            ], 403);
        }

        $store = $user->stores()->first();

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'لم يتم إنشاء متجر بعد'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->formatStore($store)
        ]);
    }

    /**
     * Update store details
     * تحديث بيانات المتجر
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isStoreOwner()) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول'
            ], 403);
        }

        $store = $user->stores()->first();

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'لم يتم إنشاء متجر بعد'
            ], 404);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'store_type' => [
                'sometimes',
                'required',
                Rule::exists('store_types', 'key')->where('is_active', true),
            ],
            'address' => ['sometimes', 'required', 'string', 'max:500'],
            'latitude' => ['sometimes', 'required', 'numeric', 'between:-90,90'],
            'longitude' => ['sometimes', 'required', 'numeric', 'between:-180,180'],
            'governorate_id' => ['sometimes', 'required', 'exists:governorates,id'],
            'city_id' => ['sometimes', 'required', 'exists:cities,id'],
            'phone' => ['nullable', 'string', 'max:25'],
            'email' => ['nullable', 'email', 'max:255'],
            'opening_time' => ['nullable', 'date_format:H:i'],
            'closing_time' => ['nullable', 'date_format:H:i'],
            'delivery_radius' => ['nullable', 'numeric', 'min:0'],
            'delivery_fee' => ['nullable', 'numeric', 'min:0'],
            'estimated_delivery_time' => ['nullable', 'integer', 'min:1'],
            'logo' => ['nullable', 'image', 'max:2048'],
        ]);

        if ($request->hasFile('logo')) {
            // Delete old logo
            if ($store->logo_path && Storage::disk('public')->exists($store->logo_path)) {
                Storage::disk('public')->delete($store->logo_path);
            }
            $validated['logo_path'] = $request->file('logo')->store('store-logos', 'public');
            unset($validated['logo']);
        }

        $store->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث المتجر بنجاح',
            'data' => $this->formatStore($store->fresh())
        ]);
    }

    /**
     * Get working hours
     * ساعات العمل
     */
    public function getWorkingHours(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isStoreOwner()) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول'
            ], 403);
        }

        $store = $user->stores()->first();

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'لم يتم إنشاء متجر بعد'
            ], 404);
        }

        $daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

        $workingHours = [];
        foreach ($daysOfWeek as $day) {
            $workingHour = StoreWorkingHour::firstOrCreate(
                [
                    'store_id' => $store->id,
                    'day_of_week' => $day,
                ],
                [
                    'opening_time' => $store->opening_time,
                    'closing_time' => $store->closing_time,
                    'is_closed' => false,
                ]
            );
            $workingHours[] = [
                'day_of_week' => $workingHour->day_of_week,
                'opening_time' => $workingHour->opening_time?->format('H:i'),
                'closing_time' => $workingHour->closing_time?->format('H:i'),
                'is_closed' => $workingHour->is_closed,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $workingHours
        ]);
    }

    /**
     * Update working hours
     * تحديث ساعات العمل
     */
    public function updateWorkingHours(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isStoreOwner()) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول'
            ], 403);
        }

        $store = $user->stores()->first();

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'لم يتم إنشاء متجر بعد'
            ], 404);
        }

        $request->validate([
            'working_hours' => 'required|array|size:7',
            'working_hours.*.day_of_week' => 'required|in:sunday,monday,tuesday,wednesday,thursday,friday,saturday',
            'working_hours.*.is_closed' => 'required|boolean',
            'working_hours.*.opening_time' => 'nullable|required_if:working_hours.*.is_closed,false|date_format:H:i',
            'working_hours.*.closing_time' => 'nullable|required_if:working_hours.*.is_closed,false|date_format:H:i',
        ]);

        foreach ($request->working_hours as $workingHourData) {
            StoreWorkingHour::updateOrCreate(
                [
                    'store_id' => $store->id,
                    'day_of_week' => $workingHourData['day_of_week'],
                ],
                [
                    'opening_time' => $workingHourData['is_closed'] ? null : $workingHourData['opening_time'],
                    'closing_time' => $workingHourData['is_closed'] ? null : $workingHourData['closing_time'],
                    'is_closed' => $workingHourData['is_closed'],
                ]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث ساعات العمل بنجاح'
        ]);
    }

    /**
     * Get store products
     * منتجات المتجر
     */
    public function products(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isStoreOwner()) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول'
            ], 403);
        }

        $store = $user->stores()->first();

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'لم يتم إنشاء متجر بعد'
            ], 404);
        }

        $query = $store->products()->with('category');

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->has('available')) {
            $query->where('is_available', $request->boolean('available'));
        }

        $perPage = min($request->get('per_page', 20), 100);
        $products = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }

    /**
     * Add product to store
     * إضافة منتج للمتجر
     */
    public function addProduct(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isStoreOwner()) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول'
            ], 403);
        }

        $store = $user->stores()->first();

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'لم يتم إنشاء متجر بعد'
            ], 404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'exists:categories,id'],
            'price' => ['required', 'numeric', 'min:0'],
            'discount_price' => ['nullable', 'numeric', 'min:0'],
            'unit' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'max:4096'],
            'is_available' => ['nullable', 'boolean'],
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('product-images', 'public');
        }

        $product = Product::create([
            'store_id' => $store->id,
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name'] . '-' . Str::random(5)),
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'discount_price' => $validated['discount_price'] ?? null,
            'unit' => $validated['unit'] ?? 'piece',
            'image' => $imagePath,
            'is_available' => $request->boolean('is_available', true),
            'is_featured' => false,
            'sort_order' => 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة المنتج بنجاح',
            'data' => $product->load('category')
        ], 201);
    }

    /**
     * Update product
     * تحديث منتج
     */
    public function updateProduct(Request $request, Product $product): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isStoreOwner()) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول'
            ], 403);
        }

        $store = $user->stores()->first();

        if (!$store || $product->store_id !== $store->id) {
            return response()->json([
                'success' => false,
                'message' => 'المنتج لا يخص متجرك'
            ], 403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'category_id' => ['sometimes', 'required', 'exists:categories,id'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'discount_price' => ['nullable', 'numeric', 'min:0'],
            'unit' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'max:4096'],
            'is_available' => ['nullable', 'boolean'],
        ]);

        if ($request->hasFile('image')) {
            if ($product->getRawOriginal('image') && Storage::disk('public')->exists($product->getRawOriginal('image'))) {
                Storage::disk('public')->delete($product->getRawOriginal('image'));
            }
            $validated['image'] = $request->file('image')->store('product-images', 'public');
        }

        if ($request->has('is_available')) {
            $validated['is_available'] = $request->boolean('is_available');
        }

        $product->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث المنتج بنجاح',
            'data' => $product->fresh()->load('category')
        ]);
    }

    /**
     * Delete product
     * حذف منتج
     */
    public function deleteProduct(Request $request, Product $product): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isStoreOwner()) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول'
            ], 403);
        }

        $store = $user->stores()->first();

        if (!$store || $product->store_id !== $store->id) {
            return response()->json([
                'success' => false,
                'message' => 'المنتج لا يخص متجرك'
            ], 403);
        }

        if ($product->getRawOriginal('image') && Storage::disk('public')->exists($product->getRawOriginal('image'))) {
            Storage::disk('public')->delete($product->getRawOriginal('image'));
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف المنتج بنجاح'
        ]);
    }

    /**
     * Get categories for product creation
     * الفئات للإضافة للمنتجات
     */
    public function getCategories(): JsonResponse
    {
        $categories = Category::active()
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($cat) => [
                'id' => $cat->id,
                'name' => $cat->display_name ?? $cat->name,
                'slug' => $cat->slug,
            ]);

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    private function generateStoreCode(string $name): string
    {
        $base = Str::upper(Str::slug(Str::limit($name, 6, ''), ''));
        $base = preg_replace('/[^A-Z0-9]/', '', $base) ?: 'STORE';

        do {
            $code = $base . Str::upper(Str::random(3));
        } while (Store::where('code', $code)->exists());

        return $code;
    }

    private function formatStore(Store $store): array
    {
        return [
            'id' => $store->id,
            'name' => $store->name,
            'code' => $store->code,
            'store_type' => $store->store_type,
            'store_type_label' => $store->store_type_label,
            'logo_url' => $store->logo_path ? asset('storage/' . $store->logo_path) : null,
            'address' => $store->address,
            'latitude' => $store->latitude ? (float) $store->latitude : null,
            'longitude' => $store->longitude ? (float) $store->longitude : null,
            'phone' => $store->phone,
            'email' => $store->email,
            'opening_time' => $store->opening_time?->format('H:i'),
            'closing_time' => $store->closing_time?->format('H:i'),
            'is_active' => $store->is_active,
            'delivery_radius' => $store->delivery_radius ? (float) $store->delivery_radius : null,
            'delivery_fee' => $store->delivery_fee ? (float) $store->delivery_fee : null,
            'estimated_delivery_time' => $store->estimated_delivery_time,
            'governorate_id' => $store->governorate_id,
            'city_id' => $store->city_id,
            'products_count' => $store->products()->count(),
            'orders_count' => $store->orders()->count(),
            'created_at' => $store->created_at?->toIso8601String(),
        ];
    }
}

