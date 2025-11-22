<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Governorate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GovernorateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $governorates = Governorate::withCount(['cities', 'stores', 'users'])
            ->orderBy('display_order')
            ->orderBy('name_ar')
            ->get();

        $stats = [
            'total' => Governorate::count(),
            'active' => Governorate::where('is_active', true)->count(),
            'inactive' => Governorate::where('is_active', false)->count(),
            'total_cities' => Governorate::withCount('cities')->get()->sum('cities_count'),
            'total_stores' => Governorate::withCount('stores')->get()->sum('stores_count'),
        ];

        return Inertia::render('Admin/Governorates/Index', [
            'governorates' => $governorates,
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $nextDisplayOrder = (Governorate::max('display_order') ?? 0) + 1;

        return Inertia::render('Admin/Governorates/Create', [
            'nextDisplayOrder' => $nextDisplayOrder,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name_ar' => 'required|string|max:255|unique:governorates,name_ar',
            'name_en' => 'required|string|max:255|unique:governorates,name_en',
            'is_active' => 'boolean',
            'display_order' => 'nullable|integer|min:0',
        ]);

        Governorate::create([
            'name_ar' => $validated['name_ar'],
            'name_en' => $validated['name_en'],
            'is_active' => $validated['is_active'] ?? true,
            'display_order' => $validated['display_order'] ?? (Governorate::max('display_order') ?? 0) + 1,
        ]);

        return redirect()->route('admin.governorates.index')
            ->with('success', __('governorate_created_successfully'));
    }

    /**
     * Display the specified resource.
     */
    public function show(Governorate $governorate)
    {
        $governorate->load(['cities', 'stores', 'users']);
        
        return Inertia::render('Admin/Governorates/Show', [
            'governorate' => $governorate,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Governorate $governorate)
    {
        return Inertia::render('Admin/Governorates/Edit', [
            'governorate' => $governorate,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Governorate $governorate)
    {
        $validated = $request->validate([
            'name_ar' => 'required|string|max:255|unique:governorates,name_ar,' . $governorate->id,
            'name_en' => 'required|string|max:255|unique:governorates,name_en,' . $governorate->id,
            'is_active' => 'boolean',
            'display_order' => 'nullable|integer|min:0',
        ]);

        $governorate->update($validated);

        return redirect()->route('admin.governorates.index')
            ->with('success', __('governorate_updated_successfully'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Governorate $governorate)
    {
        // التحقق من وجود مناطق أو متاجر أو مستخدمين مرتبطين
        if ($governorate->cities()->count() > 0) {
            return back()->withErrors(['error' => __('cannot_delete_governorate_has_cities')]);
        }

        if ($governorate->stores()->count() > 0) {
            return back()->withErrors(['error' => __('cannot_delete_governorate_has_stores')]);
        }

        if ($governorate->users()->count() > 0) {
            return back()->withErrors(['error' => __('cannot_delete_governorate_has_users')]);
        }

        $governorate->delete();

        return redirect()->route('admin.governorates.index')
            ->with('success', __('governorate_deleted_successfully'));
    }

    /**
     * Toggle active status
     */
    public function toggleActive(Governorate $governorate)
    {
        $governorate->update([
            'is_active' => !$governorate->is_active,
        ]);

        return back()->with('success', __('governorate_status_updated_successfully'));
    }
}
