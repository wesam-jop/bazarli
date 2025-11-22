<?php

namespace Database\Seeders;

use App\Models\Store;
use App\Models\User;
use App\Models\Governorate;
use App\Models\City;
use App\Models\StoreType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class StoreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
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

        // الحصول على أنواع المتاجر
        $groceryType = StoreType::where('key', 'grocery')->first();
        $pharmacyType = StoreType::where('key', 'pharmacy')->first();
        $restaurantType = StoreType::where('key', 'restaurant')->first();

        // الحصول على أصحاب المتاجر
        $storeOwners = User::where('user_type', 'store_owner')->get();

        if ($storeOwners->isEmpty()) {
            $this->command->warn('⚠️  يجب تشغيل UserSeeder أولاً!');
            return;
        }

        // بيانات المتاجر
        $storesData = [
            [
                'name' => 'بقالة المدينة',
                'code' => 'STORE-001',
                'store_type' => $groceryType?->key ?? 'grocery',
                'owner' => $storeOwners->first(),
                'address' => 'شارع الرئيسي، مدينة إدلب',
                'latitude' => 35.9333,
                'longitude' => 36.6333,
                'phone' => '963222222222',
                'email' => 'store1@bazarli.com',
                'opening_time' => '08:00',
                'closing_time' => '22:00',
                'delivery_radius' => 10,
                'delivery_fee' => 2.5,
                'estimated_delivery_time' => 15,
            ],
            [
                'name' => 'صيدلية النور',
                'code' => 'STORE-002',
                'store_type' => $pharmacyType?->key ?? 'pharmacy',
                'owner' => $storeOwners->skip(1)->first() ?? $storeOwners->first(),
                'address' => 'شارع الصحة، مدينة إدلب',
                'latitude' => 35.9400,
                'longitude' => 36.6400,
                'phone' => '963333333333',
                'email' => 'store2@bazarli.com',
                'opening_time' => '09:00',
                'closing_time' => '21:00',
                'delivery_radius' => 8,
                'delivery_fee' => 3.0,
                'estimated_delivery_time' => 20,
            ],
            [
                'name' => 'مطعم الشام',
                'code' => 'STORE-003',
                'store_type' => $restaurantType?->key ?? 'restaurant',
                'owner' => $storeOwners->skip(2)->first() ?? $storeOwners->first(),
                'address' => 'شارع المطاعم، مدينة إدلب',
                'latitude' => 35.9300,
                'longitude' => 36.6300,
                'phone' => '963444444444',
                'email' => 'store3@bazarli.com',
                'opening_time' => '10:00',
                'closing_time' => '23:00',
                'delivery_radius' => 12,
                'delivery_fee' => 4.0,
                'estimated_delivery_time' => 25,
            ],
        ];

        foreach ($storesData as $storeData) {
            $owner = $storeData['owner'];
            unset($storeData['owner']);

            Store::updateOrCreate(
                ['code' => $storeData['code']],
                array_merge($storeData, [
                    'owner_id' => $owner->id,
                    'governorate_id' => $idlibGovernorate->id,
                    'city_id' => $idlibCity->id,
                    'is_active' => true,
                ])
            );
        }

        $this->command->info('✅ تم إنشاء ' . count($storesData) . ' متجر');
    }
}

