<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\Governorate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = City::with('governorate')
            ->withCount(['stores', 'users']);

        // Filter by governorate
        if ($request->has('governorate_id') && $request->governorate_id) {
            $query->where('governorate_id', $request->governorate_id);
        }

        $cities = $query->orderBy('display_order')
            ->orderBy('name_ar')
            ->get();

        $governorates = Governorate::active()
            ->orderBy('display_order')
            ->get()
            ->map(fn ($gov) => [
                'id' => $gov->id,
                'name' => app()->getLocale() === 'ar' ? $gov->name_ar : $gov->name_en,
            ]);

        $stats = [
            'total' => City::count(),
            'active' => City::where('is_active', true)->count(),
            'inactive' => City::where('is_active', false)->count(),
            'total_stores' => City::withCount('stores')->get()->sum('stores_count'),
        ];

        return Inertia::render('Admin/Cities/Index', [
            'cities' => $cities,
            'governorates' => $governorates,
            'stats' => $stats,
            'filters' => $request->only(['governorate_id']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $governorates = Governorate::active()
            ->orderBy('display_order')
            ->get()
            ->map(fn ($gov) => [
                'id' => $gov->id,
                'name_ar' => $gov->name_ar,
                'name_en' => $gov->name_en,
            ]);

        $nextDisplayOrder = (City::max('display_order') ?? 0) + 1;

        return Inertia::render('Admin/Cities/Create', [
            'governorates' => $governorates,
            'selectedGovernorateId' => $request->get('governorate_id'),
            'nextDisplayOrder' => $nextDisplayOrder,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'governorate_id' => 'required|exists:governorates,id',
            'name_ar' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'center_latitude' => 'nullable|numeric|between:-90,90',
            'center_longitude' => 'nullable|numeric|between:-180,180',
            'delivery_radius' => 'nullable|integer|min:1|max:100',
            'is_active' => 'boolean',
            'display_order' => 'nullable|integer|min:0',
        ], [
            'governorate_id.required' => __('governorate_required'),
            'name_ar.required' => __('city_name_ar_required'),
            'name_en.required' => __('city_name_en_required'),
        ]);

        // Check for duplicate name in same governorate
        $exists = City::where('governorate_id', $validated['governorate_id'])
            ->where(function($q) use ($validated) {
                $q->where('name_ar', $validated['name_ar'])
                  ->orWhere('name_en', $validated['name_en']);
            })
            ->exists();

        if ($exists) {
            return back()->withErrors(['name_ar' => __('city_name_exists')]);
        }

        City::create([
            'governorate_id' => $validated['governorate_id'],
            'name_ar' => $validated['name_ar'],
            'name_en' => $validated['name_en'],
            'center_latitude' => $validated['center_latitude'] ?? null,
            'center_longitude' => $validated['center_longitude'] ?? null,
            'delivery_radius' => $validated['delivery_radius'] ?? 10,
            'is_active' => $validated['is_active'] ?? true,
            'display_order' => $validated['display_order'] ?? (City::max('display_order') ?? 0) + 1,
        ]);

        return redirect()->route('admin.cities.index')
            ->with('success', __('city_created_successfully'));
    }

    /**
     * Display the specified resource.
     */
    public function show(City $city)
    {
        $city->load(['governorate', 'stores', 'users']);
        
        return Inertia::render('Admin/Cities/Show', [
            'city' => $city,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(City $city)
    {
        $governorates = Governorate::active()
            ->orderBy('display_order')
            ->get()
            ->map(fn ($gov) => [
                'id' => $gov->id,
                'name_ar' => $gov->name_ar,
                'name_en' => $gov->name_en,
            ]);

        return Inertia::render('Admin/Cities/Edit', [
            'city' => $city,
            'governorates' => $governorates,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, City $city)
    {
        $validated = $request->validate([
            'governorate_id' => 'required|exists:governorates,id',
            'name_ar' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'center_latitude' => 'nullable|numeric|between:-90,90',
            'center_longitude' => 'nullable|numeric|between:-180,180',
            'delivery_radius' => 'nullable|integer|min:1|max:100',
            'is_active' => 'boolean',
            'display_order' => 'nullable|integer|min:0',
        ]);

        // Check for duplicate name in same governorate (excluding current city)
        $exists = City::where('governorate_id', $validated['governorate_id'])
            ->where('id', '!=', $city->id)
            ->where(function($q) use ($validated) {
                $q->where('name_ar', $validated['name_ar'])
                  ->orWhere('name_en', $validated['name_en']);
            })
            ->exists();

        if ($exists) {
            return back()->withErrors(['name_ar' => __('city_name_exists')]);
        }

        $city->update($validated);

        return redirect()->route('admin.cities.index')
            ->with('success', __('city_updated_successfully'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(City $city)
    {
        // التحقق من وجود متاجر أو مستخدمين مرتبطين
        if ($city->stores()->count() > 0) {
            return back()->withErrors(['error' => __('cannot_delete_city_has_stores')]);
        }

        if ($city->users()->count() > 0) {
            return back()->withErrors(['error' => __('cannot_delete_city_has_users')]);
        }

        $city->delete();

        return redirect()->route('admin.cities.index')
            ->with('success', __('city_deleted_successfully'));
    }

    /**
     * Toggle active status
     */
    public function toggleActive(City $city)
    {
        $city->update([
            'is_active' => !$city->is_active,
        ]);

        return back()->with('success', __('city_status_updated_successfully'));
    }
}
