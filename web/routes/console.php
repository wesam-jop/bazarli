<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('check:orders', function () {
    $ordersWithItems = \App\Models\Order::has('orderItems')->count();
    $ordersWithoutItems = \App\Models\Order::doesntHave('orderItems')->count();
    
    $this->info("Orders with items: {$ordersWithItems}");
    $this->info("Orders without items: {$ordersWithoutItems}");
    
    $order = \App\Models\Order::with('orderItems')->first();
    if ($order) {
        $this->info("First order ID: {$order->id}");
        $this->info("Order items count: " . $order->orderItems->count());
        if ($order->orderItems->count() > 0) {
            $this->info("First item: " . json_encode($order->orderItems->first()->toArray()));
        }
    }
})->purpose('Check orders and order items in database');

Artisan::command('clear:all', function () {
    $this->info('جارٍ مسح جميع أنواع الكاش...');
    
    // Clear application cache
    Artisan::call('cache:clear');
    $this->info('✓ تم مسح كاش التطبيق');
    
    // Clear configuration cache
    Artisan::call('config:clear');
    $this->info('✓ تم مسح كاش الإعدادات');
    
    // Clear route cache
    Artisan::call('route:clear');
    $this->info('✓ تم مسح كاش الـ Routes');
    
    // Clear view cache
    Artisan::call('view:clear');
    $this->info('✓ تم مسح كاش الـ Views');
    
    // Clear compiled files
    Artisan::call('clear-compiled');
    $this->info('✓ تم مسح الملفات المترجمة');
    
    // Clear settings cache (custom)
    try {
        \App\Models\Setting::clearCache();
        $this->info('✓ تم مسح كاش الإعدادات المخصصة');
    } catch (\Exception $e) {
        // Ignore if method doesn't exist
    }
    
    $this->newLine();
    $this->info('تم مسح جميع أنواع الكاش بنجاح! ✨');
})->purpose('مسح جميع أنواع الكاش (Cache, Config, Route, View)');
