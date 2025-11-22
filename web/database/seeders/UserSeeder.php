<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Governorate;
use App\Models\City;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
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

        // 1. إنشاء مستخدم Admin
        $admin = User::updateOrCreate(
            ['email' => 'admin@bazarli.com'],
            [
                'name' => 'مدير النظام',
                'password' => Hash::make('password'),
                'phone' => '963111111111',
                'user_type' => 'admin',
                'is_verified' => true,
                'governorate_id' => $idlibGovernorate->id,
                'city_id' => $idlibCity->id,
            ]
        );

        // إنشاء AdminAccess للـ admin مباشرة
        \App\Models\AdminAccess::updateOrCreate(
            ['user_id' => $admin->id],
            [
                'phone' => $admin->phone,
                'is_active' => true,
                'notes' => 'حساب الإدمن الافتراضي - تم إنشاؤه تلقائياً',
            ]
        );

        $this->command->info('✅ تم إنشاء مستخدم Admin مع الصلاحيات');

        // 2. إنشاء أصحاب متاجر
        $storeOwners = [
            [
                'name' => 'صاحب متجر البقالة',
                'email' => 'store1@bazarli.com',
                'phone' => '963222222222',
            ],
            [
                'name' => 'صاحب متجر الصيدلية',
                'email' => 'store2@bazarli.com',
                'phone' => '963333333333',
            ],
            [
                'name' => 'صاحب متجر المطعم',
                'email' => 'store3@bazarli.com',
                'phone' => '963444444444',
            ],
        ];

        foreach ($storeOwners as $index => $ownerData) {
            $storeOwner = User::updateOrCreate(
                ['email' => $ownerData['email']],
                [
                    'name' => $ownerData['name'],
                    'password' => Hash::make('password'),
                    'phone' => $ownerData['phone'],
                    'user_type' => 'store_owner',
                    'is_verified' => true,
                    'governorate_id' => $idlibGovernorate->id,
                    'city_id' => $idlibCity->id,
                ]
            );
        }

        $this->command->info('✅ تم إنشاء ' . count($storeOwners) . ' صاحب متجر');

        // 3. إنشاء عمال توصيل
        $drivers = [
            [
                'name' => 'عامل التوصيل 1',
                'email' => 'driver1@bazarli.com',
                'phone' => '963555555555',
            ],
            [
                'name' => 'عامل التوصيل 2',
                'email' => 'driver2@bazarli.com',
                'phone' => '963666666666',
            ],
            [
                'name' => 'عامل التوصيل 3',
                'email' => 'driver3@bazarli.com',
                'phone' => '963777777777',
            ],
        ];

        foreach ($drivers as $driverData) {
            $driver = User::updateOrCreate(
                ['email' => $driverData['email']],
                [
                    'name' => $driverData['name'],
                    'password' => Hash::make('password'),
                    'phone' => $driverData['phone'],
                    'user_type' => 'driver',
                    'is_verified' => true,
                    'governorate_id' => $idlibGovernorate->id,
                    'city_id' => $idlibCity->id,
                ]
            );
        }

        $this->command->info('✅ تم إنشاء ' . count($drivers) . ' عامل توصيل');

        // 4. إنشاء عملاء
        $customers = [
            [
                'name' => 'عميل 1',
                'email' => 'customer1@bazarli.com',
                'phone' => '963888888888',
            ],
            [
                'name' => 'عميل 2',
                'email' => 'customer2@bazarli.com',
                'phone' => '963999999999',
            ],
            [
                'name' => 'عميل 3',
                'email' => 'customer3@bazarli.com',
                'phone' => '963101010101',
            ],
            [
                'name' => 'عميل 4',
                'email' => 'customer4@bazarli.com',
                'phone' => '963202020202',
            ],
            [
                'name' => 'عميل 5',
                'email' => 'customer5@bazarli.com',
                'phone' => '963303030303',
            ],
        ];

        foreach ($customers as $customerData) {
            $customer = User::updateOrCreate(
                ['email' => $customerData['email']],
                [
                    'name' => $customerData['name'],
                    'password' => Hash::make('password'),
                    'phone' => $customerData['phone'],
                    'user_type' => 'customer',
                    'is_verified' => true,
                    'governorate_id' => $idlibGovernorate->id,
                    'city_id' => $idlibCity->id,
                ]
            );
        }

        $this->command->info('✅ تم إنشاء ' . count($customers) . ' عميل');
    }
}

