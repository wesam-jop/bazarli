<?php

namespace App\Http\Controllers;

use App\Models\DriverApplication;
use App\Models\Governorate;
use App\Models\City;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DriverApplicationController extends Controller
{
    public function create(Request $request)
    {
        $user = $request->user();

        if (!$user || (!$user->isCustomer() && !$user->isDriver())) {
            abort(403);
        }

        if ($user->isDriver()) {
            return redirect()->route('dashboard.driver')->with('success', __('you_are_already_driver'));
        }

        $application = $user->driverApplication;

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

        return Inertia::render('Dashboard/DriverApplication', [
            'application' => $application ? $this->formatApplication($application) : null,
            'governorates' => $governorates,
            'cities' => $cities,
            'profile' => [
                'name' => $user->name,
                'phone' => $user->phone,
                'address' => $user->address,
                'governorate_id' => $user->governorate_id,
                'city_id' => $user->city_id,
                'birth_date' => $application?->birth_date?->toDateString(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user || !$user->isCustomer()) {
            abort(403);
        }

        $application = $user->driverApplication;

        $imageRule = ['image', 'max:4096'];
        $requiredImageRule = ['required', ...$imageRule];
        $optionalImageRule = ['nullable', ...$imageRule];

        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:25'],
            'address' => ['required', 'string', 'max:500'],
            'birth_date' => ['required', 'date', 'before:today'],
            'governorate_id' => ['required', 'exists:governorates,id'],
            'city_id' => ['required', 'exists:cities,id'],
            'vehicle_type' => ['nullable', 'string', 'max:100'],
            'personal_photo' => $application ? $optionalImageRule : $requiredImageRule,
            'vehicle_photo' => $application ? $optionalImageRule : $requiredImageRule,
            'id_photo' => $application ? $optionalImageRule : $requiredImageRule,
        ]);

        $data = [
            'full_name' => $validated['full_name'],
            'phone' => preg_replace('/\D/', '', $validated['phone']),
            'address' => $validated['address'],
            'birth_date' => $validated['birth_date'],
            'vehicle_type' => $validated['vehicle_type'] ?? null,
            'status' => 'pending',
            'reviewed_by' => null,
            'reviewed_at' => null,
            'notes' => null,
        ];

        $paths = $this->storeUploadedFiles($request, $application);
        $data = array_merge($data, $paths);

        if ($application) {
            $application->update($data);
        } else {
            $user->driverApplication()->create($data);
        }

        // Sync basic user data including governorate and city
        $user->update([
            'name' => $validated['full_name'],
            'phone' => preg_replace('/\D/', '', $validated['phone']),
            'address' => $validated['address'],
            'governorate_id' => $validated['governorate_id'],
            'city_id' => $validated['city_id'],
        ]);

        return redirect()->route('dashboard.driver.apply')->with('success', __('driver_application_submitted'));
    }

    private function storeUploadedFiles(Request $request, ?DriverApplication $application): array
    {
        $paths = [];
        $disk = 'public';
        $directory = 'driver-applications';

        $files = [
            'personal_photo' => 'personal_photo_path',
            'vehicle_photo' => 'vehicle_photo_path',
            'id_photo' => 'id_photo_path',
        ];

        foreach ($files as $input => $column) {
            if ($request->hasFile($input)) {
                if ($application && $application->{$column} && Storage::disk($disk)->exists($application->{$column})) {
                    Storage::disk($disk)->delete($application->{$column});
                }
                $paths[$column] = $request->file($input)->store($directory, $disk);
            }
        }

        return $paths;
    }

    private function formatApplication(DriverApplication $application): array
    {
        return [
            'id' => $application->id,
            'status' => $application->status,
            'full_name' => $application->full_name,
            'phone' => $application->phone,
            'address' => $application->address,
            'birth_date' => $application->birth_date?->toDateString(),
            'vehicle_type' => $application->vehicle_type,
            'vehicle_photo_url' => $application->vehicle_photo_url,
            'personal_photo_url' => $application->personal_photo_url,
            'id_photo_url' => $application->id_photo_url,
            'notes' => $application->notes,
            'submitted_at' => $application->created_at?->toIso8601String(),
            'reviewed_at' => $application->reviewed_at?->toIso8601String(),
            'reviewer' => $application->reviewer ? [
                'id' => $application->reviewer->id,
                'name' => $application->reviewer->name,
            ] : null,
        ];
    }
}

