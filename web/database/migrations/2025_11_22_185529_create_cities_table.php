<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('governorate_id')->constrained()->onDelete('cascade');
            $table->string('name_ar'); // اسم المنطقة/المدينة بالعربي
            $table->string('name_en'); // اسم المنطقة/المدينة بالإنجليزي
            $table->decimal('center_latitude', 10, 8)->nullable(); // خط عرض مركز المنطقة
            $table->decimal('center_longitude', 11, 8)->nullable(); // خط طول مركز المنطقة
            $table->integer('delivery_radius')->default(10); // نصف قطر التوصيل بالكيلومتر
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamps();
            
            // منع تكرار نفس اسم المنطقة في نفس المحافظة
            $table->unique(['governorate_id', 'name_ar']);
            $table->unique(['governorate_id', 'name_en']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cities');
    }
};
