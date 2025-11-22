<?php

namespace Database\Seeders;

use App\Models\DeliveryLocation;
use App\Models\User;
use App\Models\City;
use App\Models\Governorate;
use Illuminate\Database\Seeder;

class DeliveryLocationSeeder extends Seeder
{
    public function run(): void
    {
        // الحصول على محافظة إدلب ومدينة إدلب
        $idlibGovernorate = Governorate::where('name_ar', 'إدلب')->first();
        $idlibCity = null;
        if ($idlibGovernorate) {
            $idlibCity = City::where('governorate_id', $idlibGovernorate->id)
                ->where('name_ar', 'مدينة إدلب')
                ->first();
        }

        if (!$idlibGovernorate || !$idlibCity) {
            $this->command->warn('⚠️  يجب تشغيل GovernorateCitySeeder أولاً!');
            return;
        }

        // الحصول على العملاء في نفس المنطقة
        $customers = User::where('user_type', 'customer')
            ->where('governorate_id', $idlibGovernorate->id)
            ->where('city_id', $idlibCity->id)
            ->take(5)
            ->get();

        if ($customers->isEmpty()) {
            $this->command->warn('⚠️  يجب تشغيل UserSeeder أولاً!');
            return;
        }

        // إحداثيات مدينة إدلب
        $defaultLat = $idlibCity->center_latitude ?? 35.9333;
        $defaultLng = $idlibCity->center_longitude ?? 36.6333;

        $defaultLocations = [
            [
                'label' => 'المنزل',
                'address' => 'مدينة إدلب، شارع الرئيسي',
                'latitude' => $defaultLat + 0.001,
                'longitude' => $defaultLng + 0.001,
                'notes' => 'الباب البني، الطابق الثالث',
            ],
            [
                'label' => 'مكان العمل',
                'address' => 'مدينة إدلب، ساحة المدينة',
                'latitude' => $defaultLat + 0.002,
                'longitude' => $defaultLng + 0.002,
                'notes' => 'استقبال الطابق الأرضي',
            ],
            [
                'label' => 'بيت العائلة',
                'address' => 'مدينة إدلب، حي الشمال',
                'latitude' => $defaultLat - 0.001,
                'longitude' => $defaultLng - 0.001,
                'notes' => '',
            ],
            [
                'label' => 'المزرعة',
                'address' => 'مدينة إدلب، المنطقة الشرقية',
                'latitude' => $defaultLat + 0.003,
                'longitude' => $defaultLng + 0.003,
                'notes' => 'باب خشبي أخضر',
            ],
        ];

        foreach ($customers as $index => $customer) {
            foreach ($defaultLocations as $key => $location) {
                DeliveryLocation::updateOrCreate(
                    [
                        'user_id' => $customer->id,
                        'label' => $location['label'],
                    ],
                    [
                        'address' => $location['address'],
                        'latitude' => $location['latitude'] + ($index * 0.0005) + rand(-10, 10) / 10000,
                        'longitude' => $location['longitude'] + ($index * 0.0005) + rand(-10, 10) / 10000,
                        'notes' => $location['notes'],
                        'is_default' => $key === 0,
                    ]
                );
            }
        }
    }
}

