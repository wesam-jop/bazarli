<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Setting;
use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use App\Models\Category;
use App\Models\Store;
use App\Models\Area;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'total_users' => User::count(),
            'total_orders' => Order::count(),
            'total_products' => Product::count(),
            'total_categories' => Category::count(),
            'total_stores' => Store::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'completed_orders' => Order::where('status', 'completed')->count(),
            'total_revenue' => Order::where('status', 'completed')->sum('total_amount'),
            'verified_users' => User::where('is_verified', true)->count(),
            'unverified_users' => User::where('is_verified', false)->count(),
            'admin_users' => User::where('user_type', 'admin')->count(),
            'customer_users' => User::where('user_type', 'customer')->count(),
            'store_owner_users' => User::where('user_type', 'store_owner')->count(),
            'driver_users' => User::where('user_type', 'driver')->count(),
        ];

        $recent_orders = Order::with(['user', 'orderItems.product'])
            ->latest()
            ->limit(10)
            ->get();

        $top_products = Product::with('category')
            ->orderBy('sales_count', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recent_orders' => $recent_orders,
            'top_products' => $top_products,
        ]);
    }

    public function settings()
    {
        // Redirect to general settings (merged pages)
        return redirect()->route('admin.settings.general');
    }

    public function uploadFile(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'type' => 'required|in:image,file',
        ]);

        $file = $request->file('file');
        $type = $request->type;
        
        $path = $type === 'image' ? 'images' : 'files';
        
        // Sanitize filename
        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $nameWithoutExtension = pathinfo($originalName, PATHINFO_FILENAME);
        $sanitizedName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $nameWithoutExtension);
        $filename = time() . '_' . $sanitizedName . '.' . $extension;
        
        // Store file using Storage facade
        $storedPath = $file->storeAs('public/' . $path, $filename);
        
        // Get public URL
        $url = asset('storage/' . $path . '/' . $filename);
        
        return response()->json([
            'success' => true,
            'url' => $url,
            'filename' => $filename,
            'path' => $storedPath,
        ]);
    }

    public function generalSettings()
    {
        $settings = Setting::where('group', 'general')
            ->orderBy('label')
            ->get();

        // Get or create default general settings
        $defaultSettings = [
            'site_name' => 'Getir Clone',
            'site_description' => 'Fast grocery delivery in 10 minutes',
            'site_logo' => '',
            'site_favicon' => '',
            'default_language' => 'ar',
            'default_currency' => 'SYP',
            'timezone' => 'Asia/Damascus',
            'date_format' => 'Y-m-d',
            'time_format' => 'H:i',
            'maintenance_mode' => '0',
            'maintenance_message' => 'We are currently under maintenance. Please check back later.',
            'default_estimated_delivery_time' => '15',
            'platform_commission_percentage' => '10',
        ];

        $settingsData = [];
        foreach ($defaultSettings as $key => $defaultValue) {
            $setting = $settings->firstWhere('key', $key);
            $settingsData[$key] = $setting ? $setting->value : $defaultValue;
        }

        return Inertia::render('Admin/Settings/General', [
            'settings' => $settingsData,
        ]);
    }

    public function updateGeneralSettings(Request $request)
    {
        $request->validate([
            'site_name' => 'required|string|max:255',
            'site_description' => 'nullable|string|max:500',
            'site_logo' => 'nullable|string',
            'site_favicon' => 'nullable|string',
            'default_language' => 'required|in:ar,en',
            'default_currency' => 'required|string|max:10',
            'timezone' => 'required|string|max:50',
            'date_format' => 'required|string|max:20',
            'time_format' => 'required|string|max:20',
            'maintenance_mode' => 'nullable|boolean',
            'maintenance_message' => 'nullable|string|max:500',
            'default_estimated_delivery_time' => 'nullable|integer|min:1|max:240',
            'platform_commission_percentage' => 'nullable|numeric|min:0|max:100',
        ]);

        foreach ($request->except(['_token']) as $key => $value) {
            // Convert boolean to string for maintenance_mode
            if ($key === 'maintenance_mode') {
                $value = $value ? '1' : '0';
            }
            
            Setting::set(
                $key,
                $value,
                in_array($key, ['site_logo', 'site_favicon']) ? 'image' : 'text',
                'general',
                ucfirst(str_replace('_', ' ', $key))
            );
        }

        // Clear all settings cache to ensure changes are reflected immediately
        Setting::clearCache();

        return redirect()->back()->with('success', 'General settings updated successfully!');
    }

    public function appDownloadSettings()
    {
        $settings = Setting::where('group', 'app_downloads')
            ->orderBy('label')
            ->get();

        $defaultSettings = [
            'app_download_ios_url' => 'https://apps.apple.com/app/getir/id123456789',
            'app_download_android_url' => 'https://play.google.com/store/apps/details?id=com.getir',
            'app_download_direct_file_url' => '',
            'app_download_downloads_count' => '100K+',
            'app_download_rating' => '4.8',
            'app_download_reviews_count' => '12K+',
        ];

        $settingsData = [];
        foreach ($defaultSettings as $key => $defaultValue) {
            $setting = $settings->firstWhere('key', $key);
            $settingsData[$key] = $setting ? $setting->value : $defaultValue;
        }

        return Inertia::render('Admin/Settings/AppDownloads', [
            'settings' => $settingsData,
        ]);
    }

    public function updateAppDownloadSettings(Request $request)
    {
        $request->validate([
            'app_download_ios_url' => 'nullable|url|max:255',
            'app_download_android_url' => 'nullable|url|max:255',
            'app_download_direct_file_url' => 'nullable|string|max:500',
            'app_download_downloads_count' => 'nullable|string|max:50',
            'app_download_rating' => 'nullable|numeric|min:0|max:5',
            'app_download_reviews_count' => 'nullable|string|max:50',
        ]);

        foreach ($request->except(['_token']) as $key => $value) {
            Setting::set(
                $key,
                $value,
                $key === 'app_download_direct_file_url' ? 'file' : 'text',
                'app_downloads',
                ucfirst(str_replace('_', ' ', $key)),
                null,
                true
            );
        }

        Setting::clearCache();

        return redirect()->back()->with('success', 'App download settings updated successfully!');
    }

    /**
     * Increment download count
     */
    public function incrementDownloadCount()
    {
        $currentCount = Setting::get('app_download_downloads_count', '100K+');
        
        // Parse the current count string to a number
        $number = $this->parseCountString($currentCount);
        
        // Increment by 1
        $number++;
        
        // Format back to string
        $formattedCount = $this->formatCount($number);
        
        // Update the setting
        Setting::set(
            'app_download_downloads_count',
            $formattedCount,
            'text',
            'app_downloads',
            'App Download Downloads Count',
            null,
            true
        );
        
        Setting::clearCache();
        
        // Return JSON response with updated count for Inertia
        return response()->json([
            'success' => true,
            'count' => $formattedCount,
            'downloadSettings' => [
                'app_download_ios_url' => Setting::get('app_download_ios_url', 'https://apps.apple.com/app/getir/id123456789'),
                'app_download_android_url' => Setting::get('app_download_android_url', 'https://play.google.com/store/apps/details?id=com.getir'),
                'app_download_direct_file_url' => Setting::get('app_download_direct_file_url', ''),
                'app_download_downloads_count' => $formattedCount,
                'app_download_rating' => Setting::get('app_download_rating', '4.8'),
                'app_download_reviews_count' => Setting::get('app_download_reviews_count', '12K+'),
            ]
        ]);
    }

    /**
     * Parse count string to number (e.g., "100K+" -> 100000)
     */
    private function parseCountString($countString)
    {
        // Remove any non-numeric characters except K, M, B
        $countString = trim($countString);
        
        // Extract number and suffix
        if (preg_match('/([\d.]+)([KMB]?)\+?/i', $countString, $matches)) {
            $number = (float) $matches[1];
            $suffix = strtoupper($matches[2] ?? '');
            
            switch ($suffix) {
                case 'K':
                    return (int) ($number * 1000);
                case 'M':
                    return (int) ($number * 1000000);
                case 'B':
                    return (int) ($number * 1000000000);
                default:
                    return (int) $number;
            }
        }
        
        // If no match, try to extract just the number
        $number = (int) preg_replace('/[^0-9]/', '', $countString);
        return $number > 0 ? $number : 100000; // Default to 100K if parsing fails
    }

    /**
     * Format number to count string (e.g., 100000 -> "100K+")
     */
    private function formatCount($number)
    {
        if ($number >= 1000000000) {
            return round($number / 1000000000, 1) . 'B+';
        } elseif ($number >= 1000000) {
            return round($number / 1000000, 1) . 'M+';
        } elseif ($number >= 1000) {
            return round($number / 1000, 1) . 'K+';
        } else {
            return $number . '+';
        }
    }

    public function termsSettings()
    {
        $settings = Setting::where('group', 'terms')->get();
        $defaultSections = [
            [
                'title' => 'Eligibility & Account Responsibilities',
                'content' => 'By creating an account, you confirm that you are at least 18 years old, provide accurate information, and will keep your login credentials secure.',
            ],
            [
                'title' => 'Orders, Payments, and Delivery',
                'content' => 'All orders placed through the platform are subject to availability and local regulations. Delivery times are estimates and may vary.',
            ],
        ];

        $settingsData = [
            'terms_intro' => $settings->firstWhere('key', 'terms_intro')->value ?? 'By using our platform you agree to the following terms and conditions that govern all orders, services, and interactions.',
            'terms_last_updated' => $settings->firstWhere('key', 'terms_last_updated')->value ?? now()->format('Y-m-d'),
            'terms_sections' => $settings->firstWhere('key', 'terms_sections')->value ?? json_encode($defaultSections, JSON_UNESCAPED_UNICODE),
        ];

        return Inertia::render('Admin/Settings/Terms', [
            'settings' => $settingsData,
        ]);
    }

    public function updateTermsSettings(Request $request)
    {
        $request->validate([
            'terms_intro' => 'nullable|string',
            'terms_last_updated' => 'nullable|date',
            'terms_sections' => 'required|string',
        ]);

        Setting::set('terms_intro', $request->terms_intro, 'text', 'terms', 'Terms Intro', null, true);
        Setting::set('terms_last_updated', $request->terms_last_updated, 'text', 'terms', 'Terms Last Updated', null, true);
        Setting::set('terms_sections', $request->terms_sections, 'json', 'terms', 'Terms Sections', null, true);

        Setting::clearCache();

        return redirect()->back()->with('success', 'Terms content updated successfully!');
    }

    public function privacySettings()
    {
        $defaultSections = [
            [
                'title' => 'Data We Collect',
                'content' => 'We collect the information you provide during registration, ordering, and customer support. This includes contact details, delivery addresses, payment preferences, and device information used to improve security and personalize your experience.',
            ],
            [
                'title' => 'How We Use Your Data',
                'content' => 'Your data allows us to process orders, ensure on-time delivery, tailor product recommendations, and communicate updates. Aggregated, anonymized metrics help us improve availability, logistics, and promotions.',
            ],
            [
                'title' => 'Sharing & Third Parties',
                'content' => 'We only share personal data with trusted partners who help us operate the platform (payment processors, delivery partners, analytics). Each partner is contractually obligated to protect your data and use it solely for the intended service.',
            ],
            [
                'title' => 'Your Choices & Rights',
                'content' => 'You can update your profile data, request a copy of your information, or ask us to delete it by contacting support. Location permissions, marketing notifications, and localization preferences can be managed inside the app.',
            ],
        ];

        $sectionsJson = Setting::get('privacy_sections', json_encode($defaultSections, JSON_UNESCAPED_UNICODE));

        return Inertia::render('Admin/Settings/Privacy', [
            'settings' => [
                'privacy_intro' => Setting::get('privacy_intro', 'We explain what data we collect, how we protect it, and the choices you have over your privacy while using Getir Clone.'),
                'privacy_last_updated' => Setting::get('privacy_last_updated', now()->toDateString()),
                'privacy_sections' => $sectionsJson,
            ],
        ]);
    }

    public function updatePrivacySettings(Request $request)
    {
        $request->validate([
            'privacy_intro' => 'nullable|string',
            'privacy_last_updated' => 'nullable|date',
            'privacy_sections' => 'required|string',
        ]);

        Setting::set('privacy_intro', $request->privacy_intro, 'text', 'privacy', 'Privacy Intro', null, true);
        Setting::set('privacy_last_updated', $request->privacy_last_updated, 'text', 'privacy', 'Privacy Last Updated', null, true);
        Setting::set('privacy_sections', $request->privacy_sections, 'json', 'privacy', 'Privacy Sections', null, true);

        Setting::clearCache();

        return redirect()->back()->with('success', 'Privacy policy updated successfully!');
    }

    public function paymentSettings()
    {
        $settings = Setting::where('group', 'payments')
            ->orderBy('label')
            ->get();

        // Get or create default payment settings
        $defaultSettings = [
            'enable_cash_payment' => '1',
            'enable_card_payment' => '0',
            'enable_wallet_payment' => '0',
            'default_payment_method' => 'cash',
            'payment_gateway' => 'none', // none, stripe, paypal, etc.
            'stripe_public_key' => '',
            'stripe_secret_key' => '',
            'stripe_webhook_secret' => '',
            'paypal_client_id' => '',
            'paypal_secret' => '',
            'paypal_mode' => 'sandbox', // sandbox, live
            'processing_fee_percentage' => '0',
            'processing_fee_fixed' => '0',
            'minimum_order_amount' => '0',
            'maximum_order_amount' => '10000',
            'enable_refunds' => '1',
            'refund_days_limit' => '7',
            'auto_refund_on_cancel' => '0',
            'enable_payment_notifications' => '1',
            'payment_timeout_minutes' => '15',
        ];

        $settingsData = [];
        foreach ($defaultSettings as $key => $defaultValue) {
            $setting = $settings->firstWhere('key', $key);
            $settingsData[$key] = $setting ? $setting->value : $defaultValue;
        }

        return Inertia::render('Admin/Settings/Payments', [
            'settings' => $settingsData,
        ]);
    }

    public function updatePaymentSettings(Request $request)
    {
        $request->validate([
            'enable_cash_payment' => 'nullable|boolean',
            'enable_card_payment' => 'nullable|boolean',
            'enable_wallet_payment' => 'nullable|boolean',
            'default_payment_method' => 'required|in:cash,card,wallet',
            'payment_gateway' => 'nullable|in:none,stripe,paypal',
            'stripe_public_key' => 'nullable|string|max:255',
            'stripe_secret_key' => 'nullable|string|max:255',
            'stripe_webhook_secret' => 'nullable|string|max:255',
            'paypal_client_id' => 'nullable|string|max:255',
            'paypal_secret' => 'nullable|string|max:255',
            'paypal_mode' => 'nullable|in:sandbox,live',
            'processing_fee_percentage' => 'nullable|numeric|min:0|max:100',
            'processing_fee_fixed' => 'nullable|numeric|min:0',
            'minimum_order_amount' => 'nullable|numeric|min:0',
            'maximum_order_amount' => 'nullable|numeric|min:0',
            'enable_refunds' => 'nullable|boolean',
            'refund_days_limit' => 'nullable|integer|min:1|max:365',
            'auto_refund_on_cancel' => 'nullable|boolean',
            'enable_payment_notifications' => 'nullable|boolean',
            'payment_timeout_minutes' => 'nullable|integer|min:1|max:60',
        ]);

        foreach ($request->except(['_token']) as $key => $value) {
            // Convert boolean values to string
            if (in_array($key, [
                'enable_cash_payment', 
                'enable_card_payment', 
                'enable_wallet_payment',
                'enable_refunds',
                'auto_refund_on_cancel',
                'enable_payment_notifications'
            ])) {
                $value = $value ? '1' : '0';
            }
            
            Setting::set(
                $key,
                $value,
                in_array($key, ['stripe_secret_key', 'stripe_webhook_secret', 'paypal_secret']) ? 'password' : 'text',
                'payments',
                ucfirst(str_replace('_', ' ', $key))
            );
        }

        // Clear all settings cache
        Setting::clearCache();

        return redirect()->back()->with('success', 'Payment settings updated successfully!');
    }

    public function areaSettings()
    {
        $areas = Area::ordered()->get();

        return Inertia::render('Admin/Settings/Areas', [
            'areas' => $areas,
        ]);
    }

    public function storeArea(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'description_en' => 'nullable|string|max:1000',
            'city' => 'nullable|string|max:255',
            'city_en' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:500',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'delivery_radius' => 'nullable|integer|min:1|max:100',
            'delivery_fee' => 'nullable|numeric|min:0',
            'estimated_delivery_time' => 'nullable|integer|min:1|max:300',
            'display_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        Area::create($request->all());

        return redirect()->back()->with('success', 'Area created successfully!');
    }

    public function updateArea(Request $request, $id)
    {
        $area = Area::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'description_en' => 'nullable|string|max:1000',
            'city' => 'nullable|string|max:255',
            'city_en' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:500',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'delivery_radius' => 'nullable|integer|min:1|max:100',
            'delivery_fee' => 'nullable|numeric|min:0',
            'estimated_delivery_time' => 'nullable|integer|min:1|max:300',
            'display_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $area->update($request->all());

        return redirect()->back()->with('success', 'Area updated successfully!');
    }

    public function deleteArea($id)
    {
        $area = Area::findOrFail($id);
        $area->delete();

        return redirect()->back()->with('success', 'Area deleted successfully!');
    }

    public function backups()
    {
        $backupsPath = storage_path('app/backups');
        
        // Ensure backups directory exists
        if (!File::exists($backupsPath)) {
            File::makeDirectory($backupsPath, 0755, true);
        }

        // Get all backup files
        $backups = [];
        if (File::exists($backupsPath)) {
            $files = File::files($backupsPath);
            foreach ($files as $file) {
                $backups[] = [
                    'name' => $file->getFilename(),
                    'path' => $file->getPathname(),
                    'size' => $file->getSize(),
                    'created_at' => date('Y-m-d H:i:s', $file->getMTime()),
                ];
            }
        }

        // Sort by creation date (newest first)
        usort($backups, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });

        // Get disk space info
        $diskTotal = disk_total_space(storage_path('app'));
        $diskFree = disk_free_space(storage_path('app'));
        $diskUsed = $diskTotal - $diskFree;

        return Inertia::render('Admin/Backups', [
            'backups' => $backups,
            'disk_total' => $diskTotal,
            'disk_free' => $diskFree,
            'disk_used' => $diskUsed,
        ]);
    }

    public function createBackup(Request $request)
    {
        $type = $request->input('type', 'database'); // database, files, full
        
        $backupsPath = storage_path('app/backups');
        if (!File::exists($backupsPath)) {
            File::makeDirectory($backupsPath, 0755, true);
        }

        $timestamp = date('Y-m-d_H-i-s');
        $filename = "backup_{$type}_{$timestamp}";
        
        try {
            if ($type === 'database' || $type === 'full') {
                // Backup database
                $dbConnection = config('database.default');
                $dbConfig = config("database.connections.{$dbConnection}");
                
                if ($dbConnection === 'sqlite') {
                    $dbPath = $dbConfig['database'];
                    if (File::exists($dbPath)) {
                        $dbBackupPath = "{$backupsPath}/{$filename}.sqlite";
                        File::copy($dbPath, $dbBackupPath);
                    }
                } else {
                    // MySQL/MariaDB backup
                    $dbName = $dbConfig['database'];
                    $dbUser = $dbConfig['username'];
                    $dbPass = $dbConfig['password'];
                    $dbHost = $dbConfig['host'];
                    $dbPort = $dbConfig['port'] ?? 3306;
                    
                    $sqlFile = "{$backupsPath}/{$filename}.sql";
                    
                    // Use mysqldump if available
                    $command = "mysqldump -h {$dbHost} -P {$dbPort} -u {$dbUser}";
                    if ($dbPass) {
                        $command .= " -p{$dbPass}";
                    }
                    $command .= " {$dbName} > {$sqlFile}";
                    
                    exec($command, $output, $returnVar);
                    
                    if ($returnVar !== 0 && !File::exists($sqlFile)) {
                        // Fallback: Export using Laravel
                        $this->exportDatabaseToFile($sqlFile);
                    }
                }
            }
            
            if ($type === 'files' || $type === 'full') {
                // Backup storage files
                $storagePath = storage_path('app/public');
                $filesBackupPath = "{$backupsPath}/{$filename}_files.zip";
                
                if (File::exists($storagePath)) {
                    $this->createZipArchive($storagePath, $filesBackupPath);
                }
            }
            
            return redirect()->back()->with('success', 'Backup created successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to create backup: ' . $e->getMessage());
        }
    }

    private function exportDatabaseToFile($filePath)
    {
        $tables = DB::select('SHOW TABLES');
        $dbName = DB::getDatabaseName();
        $tableKey = "Tables_in_{$dbName}";
        
        $sql = "-- Database Backup\n";
        $sql .= "-- Generated: " . date('Y-m-d H:i:s') . "\n\n";
        $sql .= "SET SQL_MODE = \"NO_AUTO_VALUE_ON_ZERO\";\n";
        $sql .= "SET time_zone = \"+00:00\";\n\n";
        
        foreach ($tables as $table) {
            $tableName = $table->$tableKey;
            
            // Drop table
            $sql .= "DROP TABLE IF EXISTS `{$tableName}`;\n";
            
            // Create table
            $createTable = DB::select("SHOW CREATE TABLE `{$tableName}`");
            $sql .= $createTable[0]->{'Create Table'} . ";\n\n";
            
            // Insert data
            $rows = DB::table($tableName)->get();
            if ($rows->count() > 0) {
                $sql .= "INSERT INTO `{$tableName}` VALUES\n";
                $values = [];
                foreach ($rows as $row) {
                    $rowData = [];
                    foreach ((array)$row as $value) {
                        if ($value === null) {
                            $rowData[] = 'NULL';
                        } else {
                            $rowData[] = "'" . addslashes($value) . "'";
                        }
                    }
                    $values[] = "(" . implode(",", $rowData) . ")";
                }
                $sql .= implode(",\n", $values) . ";\n\n";
            }
        }
        
        File::put($filePath, $sql);
    }

    private function createZipArchive($sourcePath, $destinationPath)
    {
        $zip = new \ZipArchive();
        if ($zip->open($destinationPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) === TRUE) {
            $files = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($sourcePath),
                \RecursiveIteratorIterator::LEAVES_ONLY
            );
            
            foreach ($files as $file) {
                if (!$file->isDir()) {
                    $filePath = $file->getRealPath();
                    $relativePath = substr($filePath, strlen($sourcePath) + 1);
                    $zip->addFile($filePath, $relativePath);
                }
            }
            
            $zip->close();
        }
    }

    public function downloadBackup($filename)
    {
        $backupsPath = storage_path('app/backups');
        $filePath = "{$backupsPath}/{$filename}";
        
        if (!File::exists($filePath)) {
            abort(404, 'Backup file not found');
        }
        
        // Security: Prevent directory traversal
        $filename = basename($filename);
        $filePath = "{$backupsPath}/{$filename}";
        
        if (!File::exists($filePath)) {
            abort(404, 'Backup file not found');
        }
        
        return response()->download($filePath);
    }

    public function deleteBackup($filename)
    {
        $backupsPath = storage_path('app/backups');
        
        // Security: Prevent directory traversal
        $filename = basename($filename);
        $filePath = "{$backupsPath}/{$filename}";
        
        if (!File::exists($filePath)) {
            return redirect()->back()->with('error', 'Backup file not found');
        }
        
        File::delete($filePath);
        
        return redirect()->back()->with('success', 'Backup deleted successfully!');
    }

    public function restoreBackup(Request $request, $filename)
    {
        $backupsPath = storage_path('app/backups');
        
        // Security: Prevent directory traversal
        $filename = basename($filename);
        $filePath = "{$backupsPath}/{$filename}";
        
        if (!File::exists($filePath)) {
            return redirect()->back()->with('error', 'Backup file not found');
        }
        
        try {
            // Check file type
            if (Str::endsWith($filename, '.sqlite')) {
                // Restore SQLite database
                $dbConnection = config('database.default');
                $dbConfig = config("database.connections.{$dbConnection}");
                
                if ($dbConnection === 'sqlite') {
                    $dbPath = $dbConfig['database'];
                    // Backup current database first
                    $currentBackup = "{$dbPath}.backup." . date('Y-m-d_H-i-s');
                    if (File::exists($dbPath)) {
                        File::copy($dbPath, $currentBackup);
                    }
                    // Restore
                    File::copy($filePath, $dbPath);
                }
            } elseif (Str::endsWith($filename, '.sql')) {
                // Restore MySQL database
                $dbConnection = config('database.default');
                $dbConfig = config("database.connections.{$dbConnection}");
                
                if (in_array($dbConnection, ['mysql', 'mariadb'])) {
                    $dbName = $dbConfig['database'];
                    $dbUser = $dbConfig['username'];
                    $dbPass = $dbConfig['password'];
                    $dbHost = $dbConfig['host'];
                    $dbPort = $dbConfig['port'] ?? 3306;
                    
                    $command = "mysql -h {$dbHost} -P {$dbPort} -u {$dbUser}";
                    if ($dbPass) {
                        $command .= " -p{$dbPass}";
                    }
                    $command .= " {$dbName} < {$filePath}";
                    
                    exec($command, $output, $returnVar);
                    
                    if ($returnVar !== 0) {
                        // Fallback: Import using Laravel
                        $sql = File::get($filePath);
                        DB::unprepared($sql);
                    }
                }
            }
            
            return redirect()->back()->with('success', 'Backup restored successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to restore backup: ' . $e->getMessage());
        }
    }

    public function logs(Request $request)
    {
        $logsPath = storage_path('logs');
        $logFile = $request->input('file', 'laravel.log');
        
        // Security: Prevent directory traversal
        $logFile = basename($logFile);
        $filePath = "{$logsPath}/{$logFile}";
        
        // Get all log files
        $logFiles = [];
        if (File::exists($logsPath)) {
            $files = File::files($logsPath);
            foreach ($files as $file) {
                if ($file->getExtension() === 'log') {
                    $logFiles[] = [
                        'name' => $file->getFilename(),
                        'size' => $file->getSize(),
                        'modified' => date('Y-m-d H:i:s', $file->getMTime()),
                    ];
                }
            }
        }
        
        // Sort by modification date (newest first)
        usort($logFiles, function($a, $b) {
            return strtotime($b['modified']) - strtotime($a['modified']);
        });

        // Read log file
        $logs = [];
        $level = $request->input('level', 'all'); // all, error, warning, info, debug
        $search = $request->input('search', '');
        $limit = $request->input('limit', 100);
        
        if (File::exists($filePath)) {
            $content = File::get($filePath);
            
            // Parse Laravel log format
            // Format: [YYYY-MM-DD HH:MM:SS] local.LEVEL: message
            // Handle both single line and multi-line log entries
            $lines = explode("\n", $content);
            $currentEntry = null;
            
            foreach ($lines as $line) {
                // Check if this line starts a new log entry
                if (preg_match('/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] (\w+)\.(\w+):\s*(.*)$/', $line, $match)) {
                    // Save previous entry if exists
                    if ($currentEntry !== null) {
                        $logEntry = [
                            'timestamp' => $currentEntry['timestamp'],
                            'environment' => $currentEntry['environment'],
                            'level' => strtolower($currentEntry['level']),
                            'message' => trim($currentEntry['message']),
                        ];
                        
                        // Filter by level
                        if ($level === 'all' || $logEntry['level'] === $level) {
                            // Filter by search term
                            if (!$search || stripos($logEntry['message'], $search) !== false) {
                                $logs[] = $logEntry;
                            }
                        }
                    }
                    
                    // Start new entry
                    $currentEntry = [
                        'timestamp' => $match[1],
                        'environment' => $match[2],
                        'level' => $match[3],
                        'message' => $match[4],
                    ];
                } elseif ($currentEntry !== null) {
                    // Continue current entry (multi-line message)
                    $currentEntry['message'] .= "\n" . $line;
                }
            }
            
            // Save last entry
            if ($currentEntry !== null) {
                $logEntry = [
                    'timestamp' => $currentEntry['timestamp'],
                    'environment' => $currentEntry['environment'],
                    'level' => strtolower($currentEntry['level']),
                    'message' => trim($currentEntry['message']),
                ];
                
                // Filter by level
                if ($level === 'all' || $logEntry['level'] === $level) {
                    // Filter by search term
                    if (!$search || stripos($logEntry['message'], $search) !== false) {
                        $logs[] = $logEntry;
                    }
                }
            }
            
            // Reverse to show newest first
            $logs = array_reverse($logs);
            
            // Limit results
            $logs = array_slice($logs, 0, (int)$limit);
        }
        
        // Get log statistics
        $stats = [
            'total_entries' => count($logs),
            'error_count' => count(array_filter($logs, fn($log) => $log['level'] === 'error')),
            'warning_count' => count(array_filter($logs, fn($log) => $log['level'] === 'warning')),
            'info_count' => count(array_filter($logs, fn($log) => $log['level'] === 'info')),
            'debug_count' => count(array_filter($logs, fn($log) => $log['level'] === 'debug')),
        ];
        
        return Inertia::render('Admin/Logs', [
            'logs' => $logs,
            'logFiles' => $logFiles,
            'currentFile' => $logFile,
            'level' => $level,
            'search' => $search,
            'limit' => $limit,
            'stats' => $stats,
        ]);
    }

    public function clearLogs(Request $request)
    {
        $logFile = $request->input('file', 'laravel.log');
        
        // Security: Prevent directory traversal
        $logFile = basename($logFile);
        $logsPath = storage_path('logs');
        $filePath = "{$logsPath}/{$logFile}";
        
        if (File::exists($filePath)) {
            File::put($filePath, '');
            return redirect()->back()->with('success', 'Log file cleared successfully!');
        }
        
        return redirect()->back()->with('error', 'Log file not found!');
    }

    public function deleteLogFile($filename)
    {
        // Security: Prevent directory traversal
        $filename = basename($filename);
        $logsPath = storage_path('logs');
        $filePath = "{$logsPath}/{$filename}";
        
        if (File::exists($filePath)) {
            File::delete($filePath);
            return redirect()->back()->with('success', 'Log file deleted successfully!');
        }
        
        return redirect()->back()->with('error', 'Log file not found!');
    }

    public function downloadLog($filename)
    {
        // Security: Prevent directory traversal
        $filename = basename($filename);
        $logsPath = storage_path('logs');
        $filePath = "{$logsPath}/{$filename}";
        
        if (!File::exists($filePath)) {
            abort(404, 'Log file not found');
        }
        
        return response()->download($filePath);
    }

    public function help()
    {
        return Inertia::render('Admin/Help');
    }

    public function profile()
    {
        $user = auth()->user();
        
        // Get user statistics
        $stats = [
            'total_orders' => Order::where('user_id', $user->id)->count(),
            'completed_orders' => Order::where('user_id', $user->id)->where('status', 'delivered')->count(),
            'total_stores' => $user->isStoreOwner() ? Store::where('owner_id', $user->id)->count() : 0,
            'active_stores' => $user->isStoreOwner() ? Store::where('owner_id', $user->id)->where('is_active', true)->count() : 0,
        ];
        
        return Inertia::render('Admin/Profile', [
            'user' => $user,
            'stats' => $stats,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = auth()->user();
        
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|unique:users,phone,' . $user->id,
            'address' => 'nullable|string|max:500',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240', // 10MB max
        ]);

        // Clean phone number
        $cleanedPhone = preg_replace('/\D/', '', $request->phone);

        $updateData = [
            'name' => $request->name,
            'phone' => $cleanedPhone,
            'address' => $request->address,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
        ];

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }
            
            // Store new avatar
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $updateData['avatar'] = $avatarPath;
        }

        $user->update($updateData);

        return redirect()->back()->with('success', 'Profile updated successfully!');
    }
}
