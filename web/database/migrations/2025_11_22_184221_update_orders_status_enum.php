<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // تحديث enum status لإضافة الحالات الجديدة
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM(
            'pending',
            'pending_driver_approval',
            'driver_accepted',
            'driver_rejected',
            'store_preparing',
            'ready_for_delivery',
            'pending_store_approval',
            'store_approved',
            'store_rejected',
            'driver_picked_up',
            'out_for_delivery',
            'delivered',
            'cancelled',
            'confirmed',
            'preparing',
            'ready',
            'on_delivery'
        ) DEFAULT 'pending_driver_approval'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // إرجاع enum إلى الحالات القديمة
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM(
            'pending',
            'confirmed',
            'preparing',
            'ready',
            'out_for_delivery',
            'delivered',
            'cancelled'
        ) DEFAULT 'pending'");
    }
};
