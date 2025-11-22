<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\AdminAccess;
use App\Models\User;

class AdminAccessSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * هذا السيدر يضمن أن جميع المستخدمين من نوع admin لديهم صلاحيات AdminAccess
     * يجب تشغيله بعد UserSeeder
     */
    public function run(): void
    {
        // الحصول على جميع المستخدمين من نوع admin
        $adminUsers = User::where('user_type', 'admin')->get();
        
        if ($adminUsers->isEmpty()) {
            $this->command->warn('⚠️  لا يوجد مستخدمين من نوع admin. يجب تشغيل UserSeeder أولاً!');
            return;
        }

        $created = 0;
        $skipped = 0;

        foreach ($adminUsers as $adminUser) {
            // التحقق من وجود AdminAccess لهذا المستخدم
            $existingAccess = AdminAccess::where('user_id', $adminUser->id)
                ->orWhere('phone', $adminUser->phone)
                ->first();

            if ($existingAccess) {
                // تحديث AdminAccess الموجود لربطه بالمستخدم الصحيح
                if ($existingAccess->user_id !== $adminUser->id) {
                    $existingAccess->update(['user_id' => $adminUser->id]);
                }
                $skipped++;
                continue;
            }

            // إنشاء AdminAccess جديد
            AdminAccess::create([
                'user_id' => $adminUser->id,
                'phone' => $adminUser->phone,
                'is_active' => true,
                'notes' => 'تم إنشاؤه تلقائياً من AdminAccessSeeder',
            ]);
            $created++;
        }

        if ($created > 0) {
            $this->command->info("✅ تم إنشاء صلاحيات لـ {$created} مستخدم admin");
        }
        if ($skipped > 0) {
            $this->command->info("ℹ️  تم تخطي {$skipped} مستخدم admin (لديهم صلاحيات بالفعل)");
        }
    }
}
