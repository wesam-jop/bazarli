<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class UserRoleController extends Controller
{
    /**
     * Get user role info
     * معلومات دور المستخدم
     */
    public function info(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول'
            ], 401);
        }

        $data = [
            'current_role' => $user->user_type,
            'can_upgrade_to_store_owner' => $user->isCustomer() || $user->isDriver(),
            'can_upgrade_to_driver' => $user->isCustomer(),
            'has_store' => $user->stores()->exists(),
            'has_driver_application' => $user->driverApplication !== null,
            'driver_application_status' => $user->driverApplication?->status,
        ];

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Request role upgrade
     * طلب ترقية الدور
     */
    public function upgrade(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول'
            ], 401);
        }

        $validated = $request->validate([
            'target_role' => ['required', Rule::in(['store_owner', 'driver'])],
        ]);

        if ($user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن للمسؤول تغيير دوره'
            ], 400);
        }

        if ($user->user_type === $validated['target_role']) {
            return response()->json([
                'success' => false,
                'message' => $validated['target_role'] === 'store_owner'
                    ? 'أنت بالفعل صاحب متجر'
                    : 'أنت بالفعل سائق'
            ], 400);
        }

        if ($validated['target_role'] === 'driver' && !$user->isCustomer()) {
            return response()->json([
                'success' => false,
                'message' => 'يمكن فقط للعملاء التقدم ليكونوا سائقين'
            ], 400);
        }

        // For store_owner, they need to create a store
        if ($validated['target_role'] === 'store_owner') {
            if ($user->stores()->exists()) {
                return response()->json([
                    'success' => true,
                    'message' => 'لديك متجر بالفعل',
                    'data' => [
                        'action' => 'has_store',
                        'store' => $user->stores()->first()
                    ]
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'يرجى إنشاء متجرك',
                'data' => [
                    'action' => 'create_store',
                    'endpoint' => '/api/v1/store/setup'
                ]
            ]);
        }

        // For driver, they need to submit an application
        if ($user->driverApplication) {
            return response()->json([
                'success' => true,
                'message' => 'لديك طلب تسجيل كسائق بالفعل',
                'data' => [
                    'action' => 'has_application',
                    'status' => $user->driverApplication->status
                ]
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'يرجى تقديم طلب التسجيل كسائق',
            'data' => [
                'action' => 'apply_driver',
                'endpoint' => '/api/v1/driver/apply'
            ]
        ]);
    }
}

