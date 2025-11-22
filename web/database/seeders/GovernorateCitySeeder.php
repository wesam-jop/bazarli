<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Governorate;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GovernorateCitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // إنشاء محافظة إدلب
        $idlib = Governorate::create([
            'name_ar' => 'إدلب',
            'name_en' => 'Idlib',
            'is_active' => true,
            'display_order' => 1,
        ]);

        // إنشاء مدينة إدلب (المنطقة المركزية)
        City::create([
            'governorate_id' => $idlib->id,
            'name_ar' => 'مدينة إدلب',
            'name_en' => 'Idlib City',
            'center_latitude' => 35.9333,
            'center_longitude' => 36.6333,
            'delivery_radius' => 15, // 15 كيلومتر
            'is_active' => true,
            'display_order' => 1,
        ]);
    }
}
