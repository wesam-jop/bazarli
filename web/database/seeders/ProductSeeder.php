<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Store;
use App\Models\Category;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $stores = Store::all();
        if ($stores->isEmpty()) {
            $this->command->warn('⚠️  يجب تشغيل StoreSeeder أولاً!');
            return;
        }

        $categories = Category::all();
        if ($categories->isEmpty()) {
            $this->command->warn('⚠️  يجب تشغيل CategorySeeder أولاً!');
            return;
        }

        // الحصول على الفئات الرئيسية
        $groceryCategory = $categories->firstWhere('slug', 'grocery');
        $fruitsCategory = $categories->firstWhere('slug', 'fruits-vegetables');
        $dairyCategory = $categories->firstWhere('slug', 'dairy');
        $beveragesCategory = $categories->firstWhere('slug', 'beverages');
        $meatCategory = $categories->firstWhere('slug', 'meat-fish');
        $sweetsCategory = $categories->firstWhere('slug', 'sweets');
        $cleaningCategory = $categories->firstWhere('slug', 'cleaning');
        $pharmacyCategory = $categories->firstWhere('slug', 'pharmacy');

        $productsData = [];

        // منتجات البقالة (للمتجر الأول)
        $groceryStore = $stores->first();
        if ($groceryStore) {
            $productsData = array_merge($productsData, [
                // منتجات البقالة
                ['name_ar' => 'أرز بسمتي', 'name_en' => 'Basmati Rice', 'category' => $groceryCategory, 'store' => $groceryStore, 'price' => 8.5, 'unit' => 'كيلو', 'stock' => 50],
                ['name_ar' => 'زيت عباد الشمس', 'name_en' => 'Sunflower Oil', 'category' => $groceryCategory, 'store' => $groceryStore, 'price' => 12.0, 'unit' => 'لتر', 'stock' => 30],
                ['name_ar' => 'سكر أبيض', 'name_en' => 'White Sugar', 'category' => $groceryCategory, 'store' => $groceryStore, 'price' => 3.5, 'unit' => 'كيلو', 'stock' => 40],
                ['name_ar' => 'معكرونة', 'name_en' => 'Pasta', 'category' => $groceryCategory, 'store' => $groceryStore, 'price' => 2.0, 'unit' => 'علبة', 'stock' => 60],
                ['name_ar' => 'دقيق أبيض', 'name_en' => 'White Flour', 'category' => $groceryCategory, 'store' => $groceryStore, 'price' => 4.0, 'unit' => 'كيلو', 'stock' => 35],
                
                // فواكه وخضروات
                ['name_ar' => 'طماطم', 'name_en' => 'Tomatoes', 'category' => $fruitsCategory, 'store' => $groceryStore, 'price' => 3.0, 'unit' => 'كيلو', 'stock' => 25],
                ['name_ar' => 'بصل', 'name_en' => 'Onions', 'category' => $fruitsCategory, 'store' => $groceryStore, 'price' => 2.5, 'unit' => 'كيلو', 'stock' => 30],
                ['name_ar' => 'بطاطا', 'name_en' => 'Potatoes', 'category' => $fruitsCategory, 'store' => $groceryStore, 'price' => 2.0, 'unit' => 'كيلو', 'stock' => 40],
                ['name_ar' => 'تفاح', 'name_en' => 'Apples', 'category' => $fruitsCategory, 'store' => $groceryStore, 'price' => 5.0, 'unit' => 'كيلو', 'stock' => 20],
                ['name_ar' => 'موز', 'name_en' => 'Bananas', 'category' => $fruitsCategory, 'store' => $groceryStore, 'price' => 4.5, 'unit' => 'كيلو', 'stock' => 25],
                
                // منتجات الألبان
                ['name_ar' => 'حليب كامل الدسم', 'name_en' => 'Full Cream Milk', 'category' => $dairyCategory, 'store' => $groceryStore, 'price' => 6.0, 'unit' => 'لتر', 'stock' => 20],
                ['name_ar' => 'جبنة بيضاء', 'name_en' => 'White Cheese', 'category' => $dairyCategory, 'store' => $groceryStore, 'price' => 8.0, 'unit' => 'كيلو', 'stock' => 15],
                ['name_ar' => 'لبن', 'name_en' => 'Yogurt', 'category' => $dairyCategory, 'store' => $groceryStore, 'price' => 3.5, 'unit' => 'كوب', 'stock' => 30],
                ['name_ar' => 'زبدة', 'name_en' => 'Butter', 'category' => $dairyCategory, 'store' => $groceryStore, 'price' => 10.0, 'unit' => 'علبة', 'stock' => 18],
                
                // مشروبات
                ['name_ar' => 'عصير برتقال', 'name_en' => 'Orange Juice', 'category' => $beveragesCategory, 'store' => $groceryStore, 'price' => 4.0, 'unit' => 'لتر', 'stock' => 25],
                ['name_ar' => 'ماء معدني', 'name_en' => 'Mineral Water', 'category' => $beveragesCategory, 'store' => $groceryStore, 'price' => 1.5, 'unit' => 'زجاجة', 'stock' => 50],
                ['name_ar' => 'شاي', 'name_en' => 'Tea', 'category' => $beveragesCategory, 'store' => $groceryStore, 'price' => 5.0, 'unit' => 'علبة', 'stock' => 30],
                
                // لحوم
                ['name_ar' => 'لحم مفروم', 'name_en' => 'Ground Meat', 'category' => $meatCategory, 'store' => $groceryStore, 'price' => 25.0, 'unit' => 'كيلو', 'stock' => 10],
                ['name_ar' => 'دجاج', 'name_en' => 'Chicken', 'category' => $meatCategory, 'store' => $groceryStore, 'price' => 18.0, 'unit' => 'كيلو', 'stock' => 12],
                
                // منظفات
                ['name_ar' => 'صابون', 'name_en' => 'Soap', 'category' => $cleaningCategory, 'store' => $groceryStore, 'price' => 2.5, 'unit' => 'قطعة', 'stock' => 40],
                ['name_ar' => 'منظف أرضيات', 'name_en' => 'Floor Cleaner', 'category' => $cleaningCategory, 'store' => $groceryStore, 'price' => 6.0, 'unit' => 'زجاجة', 'stock' => 20],
            ]);
        }

        // منتجات الصيدلية (للمتجر الثاني)
        $pharmacyStore = $stores->skip(1)->first();
        if ($pharmacyStore && $pharmacyCategory) {
            $productsData = array_merge($productsData, [
                ['name_ar' => 'باراسيتامول', 'name_en' => 'Paracetamol', 'category' => $pharmacyCategory, 'store' => $pharmacyStore, 'price' => 3.0, 'unit' => 'علبة', 'stock' => 30],
                ['name_ar' => 'إيبوبروفين', 'name_en' => 'Ibuprofen', 'category' => $pharmacyCategory, 'store' => $pharmacyStore, 'price' => 4.5, 'unit' => 'علبة', 'stock' => 25],
                ['name_ar' => 'ضمادات', 'name_en' => 'Bandages', 'category' => $pharmacyCategory, 'store' => $pharmacyStore, 'price' => 2.0, 'unit' => 'علبة', 'stock' => 40],
                ['name_ar' => 'معجون أسنان', 'name_en' => 'Toothpaste', 'category' => $pharmacyCategory, 'store' => $pharmacyStore, 'price' => 5.0, 'unit' => 'أنبوب', 'stock' => 30],
                ['name_ar' => 'شامبو', 'name_en' => 'Shampoo', 'category' => $pharmacyCategory, 'store' => $pharmacyStore, 'price' => 8.0, 'unit' => 'زجاجة', 'stock' => 20],
            ]);
        }

        // منتجات المطعم (للمتجر الثالث)
        $restaurantStore = $stores->skip(2)->first();
        if ($restaurantStore && $sweetsCategory) {
            $productsData = array_merge($productsData, [
                ['name_ar' => 'بيتزا', 'name_en' => 'Pizza', 'category' => $sweetsCategory, 'store' => $restaurantStore, 'price' => 15.0, 'unit' => 'قطعة', 'stock' => 20],
                ['name_ar' => 'برجر', 'name_en' => 'Burger', 'category' => $sweetsCategory, 'store' => $restaurantStore, 'price' => 12.0, 'unit' => 'قطعة', 'stock' => 25],
                ['name_ar' => 'شاورما', 'name_en' => 'Shawarma', 'category' => $sweetsCategory, 'store' => $restaurantStore, 'price' => 10.0, 'unit' => 'قطعة', 'stock' => 30],
                ['name_ar' => 'كباب', 'name_en' => 'Kebab', 'category' => $sweetsCategory, 'store' => $restaurantStore, 'price' => 18.0, 'unit' => 'طبق', 'stock' => 15],
            ]);
        }

        // إنشاء المنتجات
        foreach ($productsData as $productData) {
            if (!$productData['category'] || !$productData['store']) {
                continue;
            }

            Product::updateOrCreate(
                [
                    'store_id' => $productData['store']->id,
                    'name' => $productData['name_ar'],
                ],
                [
                    'category_id' => $productData['category']->id,
                    'name' => $productData['name_ar'],
                    'slug' => \Illuminate\Support\Str::slug($productData['name_en']),
                    'description' => 'وصف ' . $productData['name_ar'],
                    'price' => $productData['price'],
                    'unit' => $productData['unit'],
                    'is_available' => true,
                    'is_featured' => false,
                ]
            );
        }

        $this->command->info('✅ تم إنشاء ' . count($productsData) . ' منتج');
    }
}

