<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeliveryLocation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DeliveryLocationController extends Controller
{
    /**
     * Get user's delivery locations
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $locations = $user->deliveryLocations()
            ->orderByDesc('is_default')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $locations
        ]);
    }

    /**
     * Store a new delivery location
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $data = $request->validate([
            'label' => ['required', 'string', 'max:100'],
            'address' => ['required', 'string', 'max:500'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'notes' => ['nullable', 'string', 'max:255'],
            'is_default' => ['sometimes', 'boolean'],
        ]);

        $data['is_default'] = $request->boolean('is_default', false);

        $location = $user->deliveryLocations()->create($data);

        if ($data['is_default'] || !$user->deliveryLocations()->where('is_default', true)->where('id', '!=', $location->id)->exists()) {
            $this->setDefaultForUser($user, $location);
        }

        return response()->json([
            'success' => true,
            'data' => $location,
            'message' => 'تم حفظ موقع التوصيل بنجاح'
        ], 201);
    }

    /**
     * Update delivery location
     */
    public function update(Request $request, DeliveryLocation $deliveryLocation): JsonResponse
    {
        $user = $request->user();

        if (!$user || $deliveryLocation->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $data = $request->validate([
            'label' => ['sometimes', 'required', 'string', 'max:100'],
            'address' => ['sometimes', 'required', 'string', 'max:500'],
            'latitude' => ['sometimes', 'required', 'numeric', 'between:-90,90'],
            'longitude' => ['sometimes', 'required', 'numeric', 'between:-180,180'],
            'notes' => ['nullable', 'string', 'max:255'],
            'is_default' => ['sometimes', 'boolean'],
        ]);

        if ($request->has('is_default')) {
            $data['is_default'] = $request->boolean('is_default');
        }

        $deliveryLocation->update($data);

        if (isset($data['is_default']) && $data['is_default']) {
            $this->setDefaultForUser($user, $deliveryLocation);
        }

        return response()->json([
            'success' => true,
            'data' => $deliveryLocation,
            'message' => 'تم تحديث موقع التوصيل بنجاح'
        ]);
    }

    /**
     * Delete delivery location
     */
    public function destroy(DeliveryLocation $deliveryLocation): JsonResponse
    {
        $user = request()->user();

        if (!$user || $deliveryLocation->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $wasDefault = $deliveryLocation->is_default;
        $deliveryLocation->delete();

        if ($wasDefault) {
            $user->deliveryLocations()
                ->orderByDesc('created_at')
                ->first()
                ?->update(['is_default' => true]);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم حذف موقع التوصيل بنجاح'
        ]);
    }

    /**
     * Set delivery location as default
     */
    public function setDefault(DeliveryLocation $deliveryLocation): JsonResponse
    {
        $user = request()->user();

        if (!$user || $deliveryLocation->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $this->setDefaultForUser($user, $deliveryLocation);

        return response()->json([
            'success' => true,
            'message' => 'تم تعيين موقع التوصيل الافتراضي'
        ]);
    }

    private function setDefaultForUser($user, DeliveryLocation $deliveryLocation): void
    {
        $user->deliveryLocations()
            ->where('id', '!=', $deliveryLocation->id)
            ->update(['is_default' => false]);

        if (!$deliveryLocation->is_default) {
            $deliveryLocation->is_default = true;
            $deliveryLocation->save();
        }
    }
}

