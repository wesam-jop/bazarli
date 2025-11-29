<?php

namespace App\Http\Controllers;

use App\Models\Store;
use App\Models\StoreType;
use App\Models\Governorate;
use App\Models\City;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class StoreSetupController extends Controller
{
    public function create(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            abort(401);
        }

        if ($user->stores()->exists()) {
            return redirect()->route('dashboard.store')->with('success', __('app.store_setup_already_completed'));
        }

        $storeTypes = StoreType::active()
            ->orderBy('display_order')
            ->get()
            ->map(fn ($type) => [
                'value' => $type->key,
                'label' => app()->getLocale() === 'ar' ? $type->name_ar : $type->name_en,
                'icon' => $type->icon,
            ]);

        // جلب المحافظات والمناطق
        $governorates = Governorate::active()
            ->orderBy('display_order')
            ->get()
            ->map(fn ($gov) => [
                'id' => $gov->id,
                'name' => app()->getLocale() === 'ar' ? $gov->name_ar : $gov->name_en,
            ]);

        $cities = [];
        if ($user->governorate_id) {
            $cities = City::active()
                ->where('governorate_id', $user->governorate_id)
                ->orderBy('display_order')
                ->get()
                ->map(fn ($city) => [
                    'id' => $city->id,
                    'name' => app()->getLocale() === 'ar' ? $city->name_ar : $city->name_en,
                ]);
        }

        return Inertia::render('Dashboard/Store/Setup', [
            'storeTypes' => $storeTypes,
            'governorates' => $governorates,
            'cities' => $cities,
            'userPhone' => $user->phone,
            'userGovernorateId' => $user->governorate_id,
            'userCityId' => $user->city_id,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            abort(401);
        }

        if ($user->stores()->exists()) {
            return redirect()->route('dashboard.store')->with('success', __('app.store_setup_already_completed'));
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

        return redirect()->route('dashboard.store')->with('success', __('app.store_setup_success'));
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
}


