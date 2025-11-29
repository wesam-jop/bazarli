<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LanguageController;
use App\Http\Controllers\UserRoleController;
use App\Http\Controllers\StoreProductController;
use App\Http\Controllers\DeliveryLocationController;
use App\Http\Controllers\FavoriteProductController;
use App\Http\Controllers\StorefrontController;
use App\Http\Controllers\StoreSetupController;
use App\Http\Controllers\DriverApplicationController;
use App\Http\Controllers\DriverOrderController;
use App\Http\Controllers\StoreOrderController;
use App\Http\Controllers\Admin\StoreTypeController;
use App\Http\Controllers\Admin\DriverApplicationController as AdminDriverApplicationController;
use App\Http\Controllers\Dashboard\StoreWorkingHoursController;
use App\Http\Controllers\Dashboard\DriverWorkingHoursController;
use App\Http\Controllers\NotificationController;
use App\Models\Setting;

// Language switching
Route::get('/language/{locale}', [LanguageController::class, 'switch'])->name('language.switch');

// Storage files access (for images and files)
Route::get('/storage/{path}', function ($path) {
    // Decode URL-encoded path
    $path = urldecode($path);
    
    // Security: prevent directory traversal
    if (strpos($path, '..') !== false) {
        abort(403);
    }
    
    $filePath = storage_path('app/public/' . $path);
    
    if (!file_exists($filePath) || !is_file($filePath)) {
        abort(404);
    }
    
    // Get MIME type
    $mimeType = mime_content_type($filePath);
    if (!$mimeType) {
        $extension = pathinfo($filePath, PATHINFO_EXTENSION);
        $mimeTypes = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'ico' => 'image/x-icon',
            'svg' => 'image/svg+xml',
        ];
        $mimeType = $mimeTypes[strtolower($extension)] ?? 'application/octet-stream';
    }
    
    return response()->file($filePath, [
        'Content-Type' => $mimeType,
        'Cache-Control' => 'public, max-age=31536000',
    ]);
})->where('path', '.*')->name('storage.file');

// Static Pages
Route::get('/about', function () {
    return Inertia::render('About');
})->name('about');

Route::get('/contact', function () {
    return Inertia::render('Contact');
})->name('contact');

Route::get('/careers', function () {
    return Inertia::render('Careers');
})->name('careers');

Route::get('/help', function () {
    return Inertia::render('Help');
})->name('help');

Route::get('/terms', function () {
    $defaultSections = [
        [
            'title' => 'Eligibility & Account Responsibilities',
            'content' => 'By creating an account, you confirm that you are at least 18 years old, provide accurate information, and will keep your login credentials secure. You are fully responsible for all activity performed under your account.',
        ],
        [
            'title' => 'Orders, Payments, and Delivery',
            'content' => 'All orders placed through the platform are subject to availability and local regulations. Delivery times are estimates and may vary. Prices may change at any time, but changes will not affect confirmed orders.',
        ],
        [
            'title' => 'Prohibited Activities',
            'content' => 'You may not misuse the platform, attempt to gain unauthorized access, scrape data, or engage in any activity that disrupts our services. Violations may result in immediate suspension.',
        ],
        [
            'title' => 'Liability & Limitation',
            'content' => 'We strive to provide reliable service but cannot guarantee uninterrupted availability. Our liability is limited to the maximum extent permitted by law.',
        ],
    ];

    $sections = json_decode(Setting::get('terms_sections', json_encode($defaultSections, JSON_UNESCAPED_UNICODE)), true);
    if (!is_array($sections) || empty($sections)) {
        $sections = $defaultSections;
    }

    return Inertia::render('Terms', [
        'intro' => Setting::get('terms_intro', 'By using our platform you agree to the following terms and conditions that govern all orders, services, and interactions.'),
        'lastUpdated' => Setting::get('terms_last_updated', now()->format('F j, Y')),
        'sections' => $sections,
    ]);
})->name('terms');

Route::get('/privacy', function () {
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

    $sections = json_decode(Setting::get('privacy_sections', json_encode($defaultSections, JSON_UNESCAPED_UNICODE)), true);
    if (!is_array($sections) || empty($sections)) {
        $sections = $defaultSections;
    }

    return Inertia::render('PrivacyPolicy', [
        'intro' => Setting::get('privacy_intro', 'We explain what data we collect, how we protect it, and the choices you have over your privacy while using DeliGo.'),
        'lastUpdated' => Setting::get('privacy_last_updated', now()->format('F j, Y')),
        'sections' => $sections,
    ]);
})->name('privacy');

// Service Pages
Route::get('/services/grocery-delivery', function () {
    $categories = \App\Models\Category::active()->orderBy('sort_order')->get();
    $products = \App\Models\Product::with('category')
        ->available()
        ->orderBy('sort_order')
        ->paginate(20);
    
    return Inertia::render('Services/GroceryDelivery', [
        'products' => $products,
        'categories' => $categories,
    ]);
})->name('services.grocery');

Route::get('/services/food-delivery', function () {
    $categories = \App\Models\Category::active()->orderBy('sort_order')->get();
    $products = \App\Models\Product::with('category')
        ->available()
        ->orderBy('sort_order')
        ->paginate(20);
    
    return Inertia::render('Services/FoodDelivery', [
        'products' => $products,
        'categories' => $categories,
    ]);
})->name('services.food');

Route::get('/services/pharmacy', function () {
    $categories = \App\Models\Category::active()->orderBy('sort_order')->get();
    $products = \App\Models\Product::with('category')
        ->available()
        ->orderBy('sort_order')
        ->paginate(20);
    
    return Inertia::render('Services/Pharmacy', [
        'products' => $products,
        'categories' => $categories,
    ]);
})->name('services.pharmacy');

Route::get('/stores', [StorefrontController::class, 'index'])->name('stores.index');
Route::get('/stores/{store}', [StorefrontController::class, 'show'])->name('stores.show');

Route::get('/services/pet-supplies', function () {
    $categories = \App\Models\Category::active()->orderBy('sort_order')->get();
    $products = \App\Models\Product::with('category')
        ->available()
        ->orderBy('sort_order')
        ->paginate(20);
    
    return Inertia::render('Services/PetSupplies', [
        'products' => $products,
        'categories' => $categories,
    ]);
})->name('services.pet');

// Auth Routes
Route::get('/login', function () {
    return Inertia::render('Auth/Login');
})->name('login')->middleware('guest');

Route::get('/register', function () {
    $governorates = \App\Models\Governorate::active()
        ->orderBy('display_order')
        ->get()
        ->map(fn ($gov) => [
            'id' => $gov->id,
            'name' => app()->getLocale() === 'ar' ? $gov->name_ar : $gov->name_en,
        ]);

    $areas = \App\Models\Area::active()
        ->ordered()
        ->get()
        ->map(fn ($area) => [
            'id' => $area->id,
            'name' => app()->getLocale() === 'ar' ? $area->name : ($area->name_en ?? $area->name),
            'city' => app()->getLocale() === 'ar' ? $area->city : ($area->city_en ?? $area->city),
        ]);

    return Inertia::render('Auth/Register', [
        'governorates' => $governorates,
        'areas' => $areas,
    ]);
})->name('register')->middleware('guest');

Route::get('/verify-phone', function () {
    return Inertia::render('Auth/VerifyPhone', [
        'phone' => request('phone'),
        'userType' => request('user_type', 'customer'),
        'action' => request('action', 'register')
    ]);
})->name('verify.phone');

// Auth Actions
Route::post('/login', [App\Http\Controllers\Auth\AuthController::class, 'login'])->name('login.post');
Route::post('/register', [App\Http\Controllers\Auth\AuthController::class, 'register'])->name('register.post');
Route::post('/verify-phone', [App\Http\Controllers\Auth\AuthController::class, 'verifyPhone'])->name('verify.phone.post');
Route::post('/resend-verification', [App\Http\Controllers\Auth\AuthController::class, 'resendVerification'])->name('resend.verification');
Route::post('/logout', [App\Http\Controllers\Auth\AuthController::class, 'logout'])->name('logout');


// Admin Routes
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [App\Http\Controllers\Admin\AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/settings', [App\Http\Controllers\Admin\AdminController::class, 'settings'])->name('settings');
    Route::get('/settings/general', [App\Http\Controllers\Admin\AdminController::class, 'generalSettings'])->name('settings.general');
    Route::post('/settings/general', [App\Http\Controllers\Admin\AdminController::class, 'updateGeneralSettings'])->name('settings.general.update');
    Route::get('/settings/app-downloads', [App\Http\Controllers\Admin\AdminController::class, 'appDownloadSettings'])->name('settings.app-downloads');
    Route::post('/settings/app-downloads', [App\Http\Controllers\Admin\AdminController::class, 'updateAppDownloadSettings'])->name('settings.app-downloads.update');
    Route::get('/settings/terms', [App\Http\Controllers\Admin\AdminController::class, 'termsSettings'])->name('settings.terms');
    Route::post('/settings/terms', [App\Http\Controllers\Admin\AdminController::class, 'updateTermsSettings'])->name('settings.terms.update');
    Route::get('/settings/privacy', [App\Http\Controllers\Admin\AdminController::class, 'privacySettings'])->name('settings.privacy');
    Route::post('/settings/privacy', [App\Http\Controllers\Admin\AdminController::class, 'updatePrivacySettings'])->name('settings.privacy.update');
    Route::get('/settings/store-types', [StoreTypeController::class, 'index'])->name('settings.store-types');
    Route::post('/settings/store-types', [StoreTypeController::class, 'store'])->name('settings.store-types.store');
    Route::put('/settings/store-types/{storeType}', [StoreTypeController::class, 'update'])->name('settings.store-types.update');
    Route::delete('/settings/store-types/{storeType}', [StoreTypeController::class, 'destroy'])->name('settings.store-types.destroy');
    Route::get('/drivers/applications', [AdminDriverApplicationController::class, 'index'])->name('drivers.applications.index');
    Route::get('/drivers/applications/{driverApplication}', [AdminDriverApplicationController::class, 'show'])->name('drivers.applications.show');
    Route::post('/drivers/applications/{driverApplication}/approve', [AdminDriverApplicationController::class, 'approve'])->name('drivers.applications.approve');
    Route::post('/drivers/applications/{driverApplication}/reject', [AdminDriverApplicationController::class, 'reject'])->name('drivers.applications.reject');
    Route::get('/settings/payments', [App\Http\Controllers\Admin\AdminController::class, 'paymentSettings'])->name('settings.payments');
    Route::post('/settings/payments', [App\Http\Controllers\Admin\AdminController::class, 'updatePaymentSettings'])->name('settings.payments.update');
    Route::get('/settings/areas', [App\Http\Controllers\Admin\AdminController::class, 'areaSettings'])->name('settings.areas');
    Route::post('/settings/areas', [App\Http\Controllers\Admin\AdminController::class, 'storeArea'])->name('settings.areas.store');
    Route::put('/settings/areas/{id}', [App\Http\Controllers\Admin\AdminController::class, 'updateArea'])->name('settings.areas.update');
    Route::delete('/settings/areas/{id}', [App\Http\Controllers\Admin\AdminController::class, 'deleteArea'])->name('settings.areas.delete');
    Route::get('/backups', [App\Http\Controllers\Admin\AdminController::class, 'backups'])->name('backups');
    Route::post('/backups/create', [App\Http\Controllers\Admin\AdminController::class, 'createBackup'])->name('backups.create');
    Route::get('/backups/download/{filename}', [App\Http\Controllers\Admin\AdminController::class, 'downloadBackup'])->name('backups.download');
    Route::delete('/backups/{filename}', [App\Http\Controllers\Admin\AdminController::class, 'deleteBackup'])->name('backups.delete');
    Route::post('/backups/restore/{filename}', [App\Http\Controllers\Admin\AdminController::class, 'restoreBackup'])->name('backups.restore');
    Route::get('/logs', [App\Http\Controllers\Admin\AdminController::class, 'logs'])->name('logs');
    Route::post('/logs/clear', [App\Http\Controllers\Admin\AdminController::class, 'clearLogs'])->name('logs.clear');
    Route::delete('/logs/{filename}', [App\Http\Controllers\Admin\AdminController::class, 'deleteLogFile'])->name('logs.delete');
    Route::get('/logs/download/{filename}', [App\Http\Controllers\Admin\AdminController::class, 'downloadLog'])->name('logs.download');
    Route::get('/help', [App\Http\Controllers\Admin\AdminController::class, 'help'])->name('help');
    Route::get('/profile', [App\Http\Controllers\Admin\AdminController::class, 'profile'])->name('profile');
    Route::post('/profile', [App\Http\Controllers\Admin\AdminController::class, 'updateProfile'])->name('profile.update');
    Route::post('/upload-file', [App\Http\Controllers\Admin\AdminController::class, 'uploadFile'])->name('upload.file');
    
    // Users Management
    Route::get('/users', [App\Http\Controllers\Admin\UserController::class, 'index'])->name('users.index');
    Route::get('/users/customers', [App\Http\Controllers\Admin\UserController::class, 'customers'])->name('users.customers');
    Route::get('/users/store-owners', [App\Http\Controllers\Admin\UserController::class, 'storeOwners'])->name('users.store-owners');
    Route::get('/users/drivers', [App\Http\Controllers\Admin\UserController::class, 'drivers'])->name('users.drivers');
    Route::get('/users/create', [App\Http\Controllers\Admin\UserController::class, 'create'])->name('users.create');
    Route::post('/users', [App\Http\Controllers\Admin\UserController::class, 'store'])->name('users.store');
    Route::get('/users/{user}', [App\Http\Controllers\Admin\UserController::class, 'show'])->name('users.show');
    Route::get('/users/{user}/edit', [App\Http\Controllers\Admin\UserController::class, 'edit'])->name('users.edit');
    Route::put('/users/{user}', [App\Http\Controllers\Admin\UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [App\Http\Controllers\Admin\UserController::class, 'destroy'])->name('users.destroy');
    
    // Admin Access Management
    Route::get('/admin-access', [App\Http\Controllers\Admin\AdminAccessController::class, 'index'])->name('admin-access.index');
    Route::get('/admin-access/create', [App\Http\Controllers\Admin\AdminAccessController::class, 'create'])->name('admin-access.create');
    Route::post('/admin-access', [App\Http\Controllers\Admin\AdminAccessController::class, 'store'])->name('admin-access.store');
    Route::get('/admin-access/{adminAccess}', [App\Http\Controllers\Admin\AdminAccessController::class, 'show'])->name('admin-access.show');
    Route::get('/admin-access/{adminAccess}/edit', [App\Http\Controllers\Admin\AdminAccessController::class, 'edit'])->name('admin-access.edit');
    Route::put('/admin-access/{adminAccess}', [App\Http\Controllers\Admin\AdminAccessController::class, 'update'])->name('admin-access.update');
    Route::delete('/admin-access/{adminAccess}', [App\Http\Controllers\Admin\AdminAccessController::class, 'destroy'])->name('admin-access.destroy');
    Route::post('/admin-access/{adminAccess}/toggle-active', [App\Http\Controllers\Admin\AdminAccessController::class, 'toggleActive'])->name('admin-access.toggle-active');
    
    // Orders Management
    Route::get('/orders', [App\Http\Controllers\Admin\OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [App\Http\Controllers\Admin\OrderController::class, 'show'])->name('orders.show');
    Route::put('/orders/{order}/status', [App\Http\Controllers\Admin\OrderController::class, 'updateStatus'])->name('orders.update-status');
    
    // Stores Management
    Route::get('/stores', [App\Http\Controllers\Admin\StoreController::class, 'index'])->name('stores.index');
    Route::get('/stores/{store}', [App\Http\Controllers\Admin\StoreController::class, 'show'])->name('stores.show');
    Route::post('/stores/{store}/toggle-active', [App\Http\Controllers\Admin\StoreController::class, 'toggleActive'])->name('stores.toggle-active');
    
    // Products Management
    Route::get('/products', [App\Http\Controllers\Admin\ProductController::class, 'index'])->name('products.index');
    Route::get('/products/{product}', [App\Http\Controllers\Admin\ProductController::class, 'show'])->name('products.show');
    Route::post('/products/{product}/toggle-available', [App\Http\Controllers\Admin\ProductController::class, 'toggleAvailable'])->name('products.toggle-available');
    Route::post('/products/{product}/toggle-featured', [App\Http\Controllers\Admin\ProductController::class, 'toggleFeatured'])->name('products.toggle-featured');
    
    // Categories Management
    Route::get('/categories', [App\Http\Controllers\Admin\CategoryController::class, 'index'])->name('categories.index');
    Route::get('/categories/create', [App\Http\Controllers\Admin\CategoryController::class, 'create'])->name('categories.create');
    Route::post('/categories', [App\Http\Controllers\Admin\CategoryController::class, 'store'])->name('categories.store');
    Route::get('/categories/{category}/edit', [App\Http\Controllers\Admin\CategoryController::class, 'edit'])->name('categories.edit');
    Route::put('/categories/{category}', [App\Http\Controllers\Admin\CategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{category}', [App\Http\Controllers\Admin\CategoryController::class, 'destroy'])->name('categories.destroy');
    Route::post('/categories/{category}/toggle-active', [App\Http\Controllers\Admin\CategoryController::class, 'toggleActive'])->name('categories.toggle-active');
    
    // Governorates Management
    Route::get('/governorates', [App\Http\Controllers\Admin\GovernorateController::class, 'index'])->name('governorates.index');
    Route::get('/governorates/create', [App\Http\Controllers\Admin\GovernorateController::class, 'create'])->name('governorates.create');
    Route::post('/governorates', [App\Http\Controllers\Admin\GovernorateController::class, 'store'])->name('governorates.store');
    Route::get('/governorates/{governorate}', [App\Http\Controllers\Admin\GovernorateController::class, 'show'])->name('governorates.show');
    Route::get('/governorates/{governorate}/edit', [App\Http\Controllers\Admin\GovernorateController::class, 'edit'])->name('governorates.edit');
    Route::put('/governorates/{governorate}', [App\Http\Controllers\Admin\GovernorateController::class, 'update'])->name('governorates.update');
    Route::delete('/governorates/{governorate}', [App\Http\Controllers\Admin\GovernorateController::class, 'destroy'])->name('governorates.destroy');
    Route::post('/governorates/{governorate}/toggle-active', [App\Http\Controllers\Admin\GovernorateController::class, 'toggleActive'])->name('governorates.toggle-active');
    
    // Cities Management
    Route::get('/cities', [App\Http\Controllers\Admin\CityController::class, 'index'])->name('cities.index');
    Route::get('/cities/create', [App\Http\Controllers\Admin\CityController::class, 'create'])->name('cities.create');
    Route::post('/cities', [App\Http\Controllers\Admin\CityController::class, 'store'])->name('cities.store');
    Route::get('/cities/{city}', [App\Http\Controllers\Admin\CityController::class, 'show'])->name('cities.show');
    Route::get('/cities/{city}/edit', [App\Http\Controllers\Admin\CityController::class, 'edit'])->name('cities.edit');
    Route::put('/cities/{city}', [App\Http\Controllers\Admin\CityController::class, 'update'])->name('cities.update');
    Route::delete('/cities/{city}', [App\Http\Controllers\Admin\CityController::class, 'destroy'])->name('cities.destroy');
    Route::post('/cities/{city}/toggle-active', [App\Http\Controllers\Admin\CityController::class, 'toggleActive'])->name('cities.toggle-active');
    
    // Inventory Management - Removed (no stock system)
    
    // Analytics
    Route::get('/analytics/overview', [App\Http\Controllers\Admin\AnalyticsController::class, 'overview'])->name('analytics.overview');
    Route::get('/analytics/sales', [App\Http\Controllers\Admin\AnalyticsController::class, 'sales'])->name('analytics.sales');
    Route::get('/analytics/customers', [App\Http\Controllers\Admin\AnalyticsController::class, 'customers'])->name('analytics.customers');
    Route::get('/analytics/delivery', [App\Http\Controllers\Admin\AnalyticsController::class, 'delivery'])->name('analytics.delivery');

    // Reports
    Route::get('/reports/financial', [App\Http\Controllers\Admin\FinancialReportController::class, 'financial'])->name('reports.financial');
});

// Download App
Route::get('/download-app', function () {
    return Inertia::render('DownloadApp');
})->name('download.app');

Route::post('/download-app/increment', [App\Http\Controllers\Admin\AdminController::class, 'incrementDownloadCount'])->name('download.increment');

Route::get('/', function () {
    $categories = \App\Models\Category::active()->orderBy('sort_order')->limit(6)->get();

    $featuredProducts = \App\Models\Product::with([
        'category',
        'store' => function($q) {
            $q->with(['governorate:id,name_ar,name_en', 'city:id,name_ar,name_en']);
        }
    ])
        ->available()
        ->orderBy('sales_count', 'desc')
        ->limit(4)
        ->get();

    $featuredStores = \App\Models\Store::active()
        ->withCount(['orders', 'products'])
        ->orderByDesc('orders_count')
        ->limit(4)
        ->get();

    return Inertia::render('Home', [
        'categories' => $categories,
        'featuredProducts' => $featuredProducts,
        'featuredStores' => $featuredStores,
    ]);
});


// صفحات المنتجات
Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');

// صفحات الفئات
Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
Route::get('/categories/{category}', [CategoryController::class, 'show'])->name('categories.show');

Route::middleware('auth')->group(function () {
    // صفحات السلة
    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
    Route::post('/cart/add', [CartController::class, 'add'])->name('cart.add');
    Route::put('/cart/update', [CartController::class, 'update'])->name('cart.update');
    Route::delete('/cart/remove/{product}', [CartController::class, 'remove'])->name('cart.remove');
    Route::delete('/cart/clear', [CartController::class, 'clear'])->name('cart.clear');

    // صفحات الطلبات
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');

    // المنتجات المفضلة
    Route::post('/favorites', [FavoriteProductController::class, 'store'])->name('favorites.store');
    Route::delete('/favorites/{product}', [FavoriteProductController::class, 'destroy'])->name('favorites.destroy');

    // مواقع التوصيل
    Route::get('/dashboard/customer/locations', [DeliveryLocationController::class, 'index'])->name('dashboard.customer.locations');
    Route::post('/dashboard/customer/locations', [DeliveryLocationController::class, 'store'])->name('dashboard.customer.locations.store');
    Route::put('/dashboard/customer/locations/{deliveryLocation}', [DeliveryLocationController::class, 'update'])->name('dashboard.customer.locations.update');
    Route::delete('/dashboard/customer/locations/{deliveryLocation}', [DeliveryLocationController::class, 'destroy'])->name('dashboard.customer.locations.destroy');
    Route::post('/dashboard/customer/locations/{deliveryLocation}/default', [DeliveryLocationController::class, 'setDefault'])->name('dashboard.customer.locations.default');
});


// صفحات الداشبورد
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        $user = auth()->user();
        
        // Redirect to appropriate dashboard based on user type
        switch ($user->user_type) {
            case 'admin':
                return redirect()->route('admin.dashboard');
            case 'store_owner':
                return redirect('/dashboard/store');
            case 'driver':
                return redirect('/dashboard/driver');
            case 'customer':
            default:
                return redirect('/dashboard/customer');
        }
    })->name('dashboard');
    
    Route::get('/dashboard/customer', [DashboardController::class, 'customer'])->name('dashboard.customer');
    Route::get('/dashboard/customer/favorites', [DashboardController::class, 'customerFavorites'])->name('dashboard.customer.favorites');
    Route::get('/dashboard/customer/profile', [DashboardController::class, 'editCustomerProfile'])->name('dashboard.customer.profile');
    Route::post('/dashboard/customer/profile', [DashboardController::class, 'updateCustomerProfile'])->name('dashboard.customer.profile.update');
    Route::get('/dashboard/store', [DashboardController::class, 'store'])->name('dashboard.store');
    Route::get('/dashboard/store/orders', [DashboardController::class, 'storeOrders'])->name('dashboard.store.orders');
    Route::get('/dashboard/store/orders/{order}', [DashboardController::class, 'storeOrderShow'])->name('dashboard.store.orders.show');
    Route::get('/dashboard/store/products/manage', [DashboardController::class, 'storeProducts'])->name('dashboard.store.products');
    Route::get('/dashboard/store/my-orders', [DashboardController::class, 'storeMyOrders'])->name('dashboard.store.my-orders');
    Route::get('/dashboard/store/favorites', [DashboardController::class, 'storeFavorites'])->name('dashboard.store.favorites');
    Route::get('/dashboard/store/locations', [DeliveryLocationController::class, 'storeIndex'])->name('dashboard.store.locations');
    Route::get('/dashboard/store/working-hours', [StoreWorkingHoursController::class, 'index'])->name('dashboard.store.working-hours');
    Route::put('/dashboard/store/working-hours', [StoreWorkingHoursController::class, 'update'])->name('dashboard.store.working-hours.update');
    Route::get('/dashboard/store/profile', [DashboardController::class, 'editStoreProfile'])->name('dashboard.store.profile');
    Route::post('/dashboard/store/profile', [DashboardController::class, 'updateStoreProfile'])->name('dashboard.store.profile.update');
    Route::get('/dashboard/admin', [DashboardController::class, 'admin'])->name('dashboard.admin');
    Route::get('/dashboard/driver', [DashboardController::class, 'driver'])->name('dashboard.driver');
    Route::get('/dashboard/driver/apply', [DriverApplicationController::class, 'create'])->name('dashboard.driver.apply');
    Route::post('/dashboard/driver/apply', [DriverApplicationController::class, 'store'])->name('dashboard.driver.apply.store');
    Route::get('/dashboard/driver/orders', [DriverOrderController::class, 'index'])->name('dashboard.driver.orders');
    Route::get('/dashboard/driver/orders/{order}', [DriverOrderController::class, 'show'])->name('dashboard.driver.orders.show');
    Route::post('/dashboard/driver/orders/{order}/accept', [DriverOrderController::class, 'accept'])->name('dashboard.driver.orders.accept');
    Route::post('/dashboard/driver/orders/{order}/reject', [DriverOrderController::class, 'reject'])->name('dashboard.driver.orders.reject');
    Route::post('/dashboard/driver/orders/{order}/claim', [DriverOrderController::class, 'claim'])->name('dashboard.driver.orders.claim');
    Route::post('/dashboard/driver/orders/{order}/complete', [DriverOrderController::class, 'complete'])->name('dashboard.driver.orders.complete');
    Route::get('/dashboard/driver/working-hours', [DriverWorkingHoursController::class, 'index'])->name('dashboard.driver.working-hours');
    Route::put('/dashboard/driver/working-hours', [DriverWorkingHoursController::class, 'update'])->name('dashboard.driver.working-hours.update');
    Route::get('/dashboard/driver/profile', [DashboardController::class, 'editDriverProfile'])->name('dashboard.driver.profile');
    Route::post('/dashboard/driver/profile', [DashboardController::class, 'updateDriverProfile'])->name('dashboard.driver.profile.update');
    Route::post('/dashboard/upgrade-role', [UserRoleController::class, 'upgrade'])->name('dashboard.upgrade-role');
    Route::get('/dashboard/store/setup', [StoreSetupController::class, 'create'])->name('dashboard.store.setup');
    Route::post('/dashboard/store/setup', [StoreSetupController::class, 'store'])->name('dashboard.store.setup.store');
    Route::post('/dashboard/store/products', [StoreProductController::class, 'store'])->name('dashboard.store.products.store');
    Route::put('/dashboard/store/products/{product}', [StoreProductController::class, 'update'])->name('dashboard.store.products.update');
    Route::delete('/dashboard/store/products/{product}', [StoreProductController::class, 'destroy'])->name('dashboard.store.products.destroy');
    Route::post('/store-orders/{orderStore}/start-preparing', [StoreOrderController::class, 'startPreparing'])->name('store-orders.start-preparing');
    Route::post('/store-orders/{orderStore}/finish-preparing', [StoreOrderController::class, 'finishPreparing'])->name('store-orders.finish-preparing');
    Route::post('/store-orders/{orderStore}/approve', [StoreOrderController::class, 'approve'])->name('store-orders.approve');
    Route::post('/store-orders/{orderStore}/reject', [StoreOrderController::class, 'reject'])->name('store-orders.reject');
    
    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
    Route::get('/notifications/unread-count', [NotificationController::class, 'getUnreadCount'])->name('notifications.unread-count');
    Route::get('/notifications/recent', [NotificationController::class, 'getRecent'])->name('notifications.recent');
    
    // Push Notifications
    Route::post('/notifications/subscribe', [NotificationController::class, 'subscribe'])->name('notifications.subscribe');
    Route::post('/notifications/unsubscribe', [NotificationController::class, 'unsubscribe'])->name('notifications.unsubscribe');
});
