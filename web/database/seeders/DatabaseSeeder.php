<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // تشغيل جميع الـ Seeders بالترتيب الصحيح
        $this->call([
            // 1. الأساسيات
            GovernorateCitySeeder::class, // المناطق والمحافظات (يجب أن يكون أولاً)
            SettingSeeder::class,        // الإعدادات
            StoreTypeSeeder::class,      // أنواع المتاجر
            
            // 2. المستخدمين والصلاحيات
            UserSeeder::class,           // المستخدمين (admin, customers, drivers, store owners)
            AdminAccessSeeder::class,    // صلاحيات Admin (يجب أن يكون بعد UserSeeder)
            
            // 3. المتاجر والمنتجات
            CategorySeeder::class,       // الفئات
            StoreSeeder::class,          // المتاجر (يعتمد على UserSeeder)
            ProductSeeder::class,        // المنتجات (يعتمد على StoreSeeder و CategorySeeder)
            
            // 4. البيانات الإضافية
            DeliveryLocationSeeder::class, // مواقع التوصيل (يعتمد على UserSeeder)
        ]);
    }
}
