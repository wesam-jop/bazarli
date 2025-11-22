<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserRoleController extends Controller
{
    public function upgrade(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'target_role' => ['required', Rule::in(['store_owner', 'driver'])],
        ]);

        if (!$user) {
            abort(401);
        }

        if ($user->isAdmin()) {
            return back()->with('error', __('admin_cannot_change_role'));
        }

        if ($user->user_type === $validated['target_role']) {
            $message = $validated['target_role'] === 'store_owner'
                ? __('already_store_owner')
                : __('already_driver');

            return back()->with('success', $message);
        }

        if ($validated['target_role'] === 'driver' && !$user->isCustomer()) {
            return back()->with('error', __('only_customers_can_upgrade'));
        }

        if ($validated['target_role'] === 'store_owner') {
            return redirect()->route('dashboard.store.setup')->with('success', __('store_setup_redirect_message'));
        }

        return redirect()->route('dashboard.driver.apply')->with('success', __('driver_application_redirect_message'));
    }
}


