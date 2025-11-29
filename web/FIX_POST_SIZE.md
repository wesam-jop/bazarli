# حل مشكلة PostTooLargeException

## المشكلة
عند رفع ملفات كبيرة (أكثر من 11 ميجابايت)، يظهر خطأ `PostTooLargeException`.

## الحلول المطبقة

### 1. Middleware مخصص
تم إنشاء `IncreasePostSize` middleware لزيادة الحدود.

### 2. تحديث .htaccess
تم إضافة الإعدادات التالية إلى `public/.htaccess`:
```apache
php_value post_max_size 50M
php_value upload_max_filesize 50M
php_value max_execution_time 300
php_value max_input_time 300
php_value memory_limit 256M
```

### 3. تحديث php.ini
إذا كان لديك وصول إلى `php.ini`، أضف أو عدّل الإعدادات التالية:
```ini
post_max_size = 50M
upload_max_filesize = 50M
max_execution_time = 300
max_input_time = 300
memory_limit = 256M
max_file_uploads = 20
```

### 4. تحديث Laravel Validation
تم تحديث `max:2048` إلى `max:10240` (10MB) في `AdminController::updateProfile`.

## خطوات إضافية مطلوبة

### إذا كنت تستخدم PHP-FPM:
1. عدّل ملف `php.ini` أو `php-fpm.conf`
2. أعد تشغيل PHP-FPM:
   ```bash
   sudo systemctl restart php-fpm
   # أو
   sudo service php-fpm restart
   ```

### إذا كنت تستخدم Nginx:
أضف إلى ملف `nginx.conf` أو `site.conf`:
```nginx
client_max_body_size 50M;
```

### إذا كنت تستخدم Apache:
تأكد من أن `mod_php` مفعّل وأن `.htaccess` يعمل.

### للتحقق من الإعدادات الحالية:
قم بإنشاء ملف `phpinfo.php` في `public/`:
```php
<?php phpinfo(); ?>
```
ثم افتح `http://127.0.0.1:8000/phpinfo.php` وتحقق من:
- `post_max_size`
- `upload_max_filesize`
- `max_execution_time`
- `memory_limit`

## ملاحظات مهمة
- `post_max_size` يجب أن يكون أكبر من أو يساوي `upload_max_filesize`
- بعد تعديل `php.ini`، يجب إعادة تشغيل خادم الويب
- إذا كنت تستخدم `php artisan serve`، قد تحتاج إلى إعادة تشغيله

