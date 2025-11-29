<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AdminAccess;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;

class AdminAccessController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $adminAccesses = AdminAccess::with('user')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return Inertia::render('Admin/AdminAccess/Index', [
            'adminAccesses' => $adminAccesses,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $users = User::where('user_type', 'admin')
            ->whereDoesntHave('adminAccess')
            ->get();
        
        return Inertia::render('Admin/AdminAccess/Create', [
            'users' => $users,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|string|unique:admin_accesses,phone',
            'user_id' => 'nullable|exists:users,id',
            'is_active' => 'boolean',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator->errors());
        }

        $adminAccess = AdminAccess::create([
            'phone' => $request->phone,
            'user_id' => $request->user_id,
            'is_active' => $request->is_active ?? true,
            'notes' => $request->notes,
        ]);

        return redirect()->route('admin.admin-access.index')
            ->with('success', __('admin_access_added'));
    }

    /**
     * Display the specified resource.
     */
    public function show(AdminAccess $adminAccess)
    {
        $adminAccess->load('user');
        
        return Inertia::render('Admin/AdminAccess/Show', [
            'adminAccess' => $adminAccess,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AdminAccess $adminAccess)
    {
        $users = User::where('user_type', 'admin')->get();
        
        return Inertia::render('Admin/AdminAccess/Edit', [
            'adminAccess' => $adminAccess,
            'users' => $users,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AdminAccess $adminAccess)
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|string|unique:admin_accesses,phone,' . $adminAccess->id,
            'user_id' => 'nullable|exists:users,id',
            'is_active' => 'boolean',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator->errors());
        }

        $adminAccess->update([
            'phone' => $request->phone,
            'user_id' => $request->user_id,
            'is_active' => $request->is_active ?? true,
            'notes' => $request->notes,
        ]);

        return redirect()->route('admin.admin-access.index')
            ->with('success', __('admin_access_updated'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AdminAccess $adminAccess)
    {
        $adminAccess->delete();

        return redirect()->route('admin.admin-access.index')
            ->with('success', __('admin_access_deleted'));
    }

    /**
     * Toggle active status
     */
    public function toggleActive(AdminAccess $adminAccess)
    {
        $adminAccess->update([
            'is_active' => !$adminAccess->is_active,
        ]);

        return redirect()->back()
            ->with('success', __('admin_access_status_updated'));
    }
}
