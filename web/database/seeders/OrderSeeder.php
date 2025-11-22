<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStore;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use App\Models\City;
use App\Models\Governorate;
use App\Models\Setting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class OrderSeeder extends Seeder
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

        // الحصول على العملاء
        $customers = User::where('user_type', 'customer')
            ->where('governorate_id', $idlibGovernorate->id)
            ->where('city_id', $idlibCity->id)
            ->take(5)
            ->get();

        if ($customers->isEmpty()) {
            $this->command->warn('⚠️  يجب تشغيل UserSeeder أولاً!');
            return;
        }

        // الحصول على عمال التوصيل
        $drivers = User::where('user_type', 'driver')
            ->where('governorate_id', $idlibGovernorate->id)
            ->where('city_id', $idlibCity->id)
            ->get();

        // الحصول على المتاجر
        $stores = Store::where('governorate_id', $idlibGovernorate->id)
            ->where('city_id', $idlibCity->id)
            ->with('products')
            ->get();

        if ($stores->isEmpty()) {
            $this->command->warn('⚠️  يجب تشغيل StoreSeeder و ProductSeeder أولاً!');
            return;
        }

        $defaultEta = (int) Setting::get('default_estimated_delivery_time', 15);

        // حالات الطلبات المختلفة
        $statuses = [
            'pending_driver_approval',
            'driver_accepted',
            'store_preparing',
            'ready_for_delivery',
            'store_approved',
            'driver_picked_up',
            'out_for_delivery',
            'delivered',
        ];

        // إنشاء طلبات لكل عميل
        foreach ($customers as $customer) {
            $numOrders = rand(1, 3);
            
            for ($i = 0; $i < $numOrders; $i++) {
                $status = $statuses[array_rand($statuses)];
                
                // اختيار متجر واحد أو عدة متاجر
                $numStores = rand(1, min(2, $stores->count()));
                $selectedStores = $stores->random($numStores)->all(); // تحويل collection إلى array
                
                $this->createOrder($customer, $selectedStores, $status, $drivers, $defaultEta, $idlibCity);
            }
        }

        // إنشاء طلبات تجريبية لحالات محددة
        if ($customers->isNotEmpty() && $stores->isNotEmpty()) {
            $sampleCustomer = $customers->random();
            
            // طلب في انتظار موافقة الديلفري
            $this->createOrder($sampleCustomer, [$stores->random()], 'pending_driver_approval', $drivers, $defaultEta, $idlibCity);
            
            // طلب قبل الديلفري
            $this->createOrder($sampleCustomer, [$stores->random()], 'driver_accepted', $drivers, $defaultEta, $idlibCity);
            
            // طلب تم تسليمه
            $this->createOrder($sampleCustomer, [$stores->random()], 'delivered', $drivers, $defaultEta, $idlibCity);
        }

        $this->command->info('✅ تم إنشاء الطلبات بنجاح');
    }

    /**
     * إنشاء طلب مع المنتجات
     */
    private function createOrder($customer, $stores, string $status, $drivers, int $defaultEta, $city): ?Order
    {
        if (!is_array($stores)) {
            $stores = [$stores];
        }

        if (empty($stores)) {
            return null;
        }

        // تحويل collection إلى array إذا لزم الأمر
        if ($stores instanceof \Illuminate\Support\Collection) {
            $stores = $stores->all();
        }

        $primaryStore = $stores[0];
        
        // إحداثيات المدينة
        $defaultLat = $city->center_latitude ?? 35.9333;
        $defaultLng = $city->center_longitude ?? 36.6333;

        $driverId = null;
        $deliveredAt = null;

        // تعيين ديلفري للطلبات التي تتطلب ذلك
        if (in_array($status, ['driver_accepted', 'store_preparing', 'ready_for_delivery', 'store_approved', 'driver_picked_up', 'out_for_delivery', 'delivered']) && $drivers->isNotEmpty()) {
            $driverId = $drivers->random()->id;
            if ($status === 'delivered') {
                $deliveredAt = now()->subMinutes(rand(30, 240));
            }
        }

        DB::beginTransaction();
        try {
            // إنشاء الطلب الرئيسي
            $order = Order::create([
                'order_number' => 'ORD-' . Str::upper(Str::random(8)),
                'user_id' => $customer->id,
                'store_id' => $primaryStore->id,
                'status' => $status,
                'subtotal' => 0,
                'delivery_fee' => 0,
                'tax_amount' => 0,
                'discount_amount' => 0,
                'total_amount' => 0,
                'payment_status' => $status === 'delivered' ? 'paid' : 'pending',
                'payment_method' => 'cash',
                'delivery_address' => $city->name_ar . '، عنوان ' . rand(1, 100),
                'delivery_latitude' => $defaultLat + (rand(-50, 50) / 1000),
                'delivery_longitude' => $defaultLng + (rand(-50, 50) / 1000),
                'customer_phone' => $customer->phone ?? '963111111111',
                'notes' => null,
                'estimated_delivery_time' => $primaryStore->estimated_delivery_time ?? $defaultEta,
                'delivery_driver_id' => $driverId,
                'delivered_at' => $deliveredAt,
            ]);

            $totalSubtotal = 0;
            $totalDeliveryFee = 0;

            // إنشاء order_stores و order_items لكل متجر
            foreach ($stores as $store) {
                $products = $store->products()->inRandomOrder()->take(rand(2, 4))->get();
                
                if ($products->isEmpty()) {
                    continue;
                }

                $storeSubtotal = 0;

                // تحديد حالة order_store حسب حالة الطلب
                $orderStoreStatus = 'pending_store_approval';
                if (in_array($status, ['driver_accepted', 'store_preparing', 'ready_for_delivery', 'store_approved'])) {
                    $orderStoreStatus = match($status) {
                        'store_preparing' => 'store_preparing',
                        'ready_for_delivery' => 'ready_for_delivery',
                        'store_approved' => 'store_approved',
                        default => 'pending_store_approval',
                    };
                }

                // إنشاء order_store
                $orderStore = OrderStore::create([
                    'order_id' => $order->id,
                    'store_id' => $store->id,
                    'status' => $orderStoreStatus,
                    'subtotal' => 0,
                    'delivery_fee' => $store->delivery_fee,
                ]);

                // إضافة عناصر الطلب لهذا المتجر
                foreach ($products as $product) {
                    $quantity = rand(1, 3);
                    $lineTotal = $product->price * $quantity;
                    $storeSubtotal += $lineTotal;

                    OrderItem::create([
                        'order_id' => $order->id,
                        'store_id' => $store->id,
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'product_price' => $product->price,
                        'quantity' => $quantity,
                        'total_price' => $lineTotal,
                    ]);

                    $product->increment('sales_count', $quantity);
                }

                // تحديث order_store
                $orderStore->update([
                    'subtotal' => $storeSubtotal,
                ]);

                $totalSubtotal += $storeSubtotal;
                $totalDeliveryFee += $store->delivery_fee;
            }

            // تحديث إجمالي الطلب
            $order->update([
                'subtotal' => $totalSubtotal,
                'delivery_fee' => $totalDeliveryFee,
                'total_amount' => $totalSubtotal + $totalDeliveryFee,
            ]);

            DB::commit();
            return $order;
        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('❌ خطأ في إنشاء الطلب: ' . $e->getMessage());
            return null;
        }
    }
}

