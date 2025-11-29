<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\StoreController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\FavoriteProductController;
use App\Http\Controllers\Api\DeliveryLocationController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\DriverOrderController;
use App\Http\Controllers\Api\DriverApplicationController;
use App\Http\Controllers\Api\StoreOrderController;
use App\Http\Controllers\Api\StoreManagementController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\UserRoleController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// =============================================================================
// PUBLIC ROUTES (No Authentication Required)
// =============================================================================
Route::prefix('v1')->group(function () {
    
    // -------------------------------------------------------------------------
    // Authentication Routes
    // -------------------------------------------------------------------------
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/verify-phone', [AuthController::class, 'verifyPhone']);
    Route::post('/resend-verification', [AuthController::class, 'resendVerification']);
    
    // -------------------------------------------------------------------------
    // Home & App Settings
    // -------------------------------------------------------------------------
    Route::get('/home', [HomeController::class, 'index']);
    Route::get('/search', [HomeController::class, 'search']);
    Route::get('/nearby-stores', [HomeController::class, 'nearbyStores']);
    Route::get('/settings', [HomeController::class, 'settings']);
    
    // -------------------------------------------------------------------------
    // Categories
    // -------------------------------------------------------------------------
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{id}', [CategoryController::class, 'show']);
    
    // -------------------------------------------------------------------------
    // Products
    // -------------------------------------------------------------------------
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{id}', [ProductController::class, 'show']);
    
    // -------------------------------------------------------------------------
    // Stores
    // -------------------------------------------------------------------------
    Route::get('/stores', [StoreController::class, 'index']);
    Route::get('/stores/{id}', [StoreController::class, 'show']);
    Route::get('/stores/{id}/products', [StoreController::class, 'products']);
    
    // -------------------------------------------------------------------------
    // Location Data (Governorates, Cities, Areas)
    // -------------------------------------------------------------------------
    Route::get('/governorates', function () {
        $governorates = \App\Models\Governorate::active()
            ->orderBy('display_order')
            ->get()
            ->map(fn ($gov) => [
                'id' => $gov->id,
                'name_ar' => $gov->name_ar,
                'name_en' => $gov->name_en,
            ]);
        
        return response()->json([
            'success' => true,
            'data' => $governorates
        ]);
    });
    
    Route::get('/cities', function (Request $request) {
        $query = \App\Models\City::active()->orderBy('display_order');
        
        if ($governorateId = $request->get('governorate_id')) {
            $query->where('governorate_id', $governorateId);
        }
        
        $cities = $query->get()
            ->map(fn ($city) => [
                'id' => $city->id,
                'name_ar' => $city->name_ar,
                'name_en' => $city->name_en,
                'governorate_id' => $city->governorate_id,
            ]);
        
        return response()->json([
            'success' => true,
            'data' => $cities
        ]);
    });
    
    Route::get('/areas', function (Request $request) {
        $query = \App\Models\Area::active()->ordered();
        
        if ($governorateId = $request->get('governorate_id')) {
            $cities = \App\Models\City::where('governorate_id', $governorateId)
                ->active()
                ->get();
            
            if ($cities->count() > 0) {
                $cityNamesAr = $cities->pluck('name_ar')->filter()->map(fn($name) => trim($name))->unique()->filter()->toArray();
                $cityNamesEn = $cities->pluck('name_en')->filter()->map(fn($name) => trim($name))->unique()->filter()->toArray();
                $allCityNames = array_unique(array_merge($cityNamesAr, $cityNamesEn));
                
                if (count($allCityNames) > 0) {
                    $query->where(function ($q) use ($allCityNames) {
                        $first = true;
                        foreach ($allCityNames as $cityName) {
                            if (empty(trim($cityName))) continue;
                            
                            if ($first) {
                                $q->where(function ($subQ) use ($cityName) {
                                    $subQ->where('city', '=', $cityName)
                                         ->orWhere('city', 'like', '%' . $cityName . '%')
                                         ->orWhere('city_en', '=', $cityName)
                                         ->orWhere('city_en', 'like', '%' . $cityName . '%');
                                });
                                $first = false;
                            } else {
                                $q->orWhere(function ($subQ) use ($cityName) {
                                    $subQ->where('city', '=', $cityName)
                                         ->orWhere('city', 'like', '%' . $cityName . '%')
                                         ->orWhere('city_en', '=', $cityName)
                                         ->orWhere('city_en', 'like', '%' . $cityName . '%');
                                });
                            }
                        }
                    });
                } else {
                    $query->whereRaw('1 = 0');
                }
            } else {
                $query->whereRaw('1 = 0');
            }
        }
        
        $areas = $query->get()
            ->map(fn ($area) => [
                'id' => $area->id,
                'name' => $area->name,
                'name_en' => $area->name_en,
                'city' => $area->city,
                'city_en' => $area->city_en,
                'latitude' => $area->latitude,
                'longitude' => $area->longitude,
            ]);
        
        return response()->json([
            'success' => true,
            'data' => $areas
        ]);
    });
    
    // -------------------------------------------------------------------------
    // Terms & Privacy
    // -------------------------------------------------------------------------
    Route::get('/terms', function (Request $request) {
        $locale = $request->header('Accept-Language', 'en');
        app()->setLocale($locale);
        
        $defaultSections = [
            [
                'title' => $locale === 'ar' ? 'الأهلية ومسؤوليات الحساب' : 'Eligibility & Account Responsibilities',
                'content' => $locale === 'ar' 
                    ? 'بإنشاء حساب، تؤكد أنك تبلغ من العمر 18 عاماً على الأقل، وتقدم معلومات دقيقة، وستحافظ على أمان بيانات تسجيل الدخول الخاصة بك.'
                    : 'By creating an account, you confirm that you are at least 18 years old, provide accurate information, and will keep your login credentials secure.',
            ],
            [
                'title' => $locale === 'ar' ? 'الطلبات والمدفوعات والتوصيل' : 'Orders, Payments, and Delivery',
                'content' => $locale === 'ar'
                    ? 'جميع الطلبات المقدمة من خلال المنصة تخضع للتوفر واللوائح المحلية.'
                    : 'All orders placed through the platform are subject to availability and local regulations.',
            ],
        ];

        $sections = json_decode(\App\Models\Setting::get('terms_sections', json_encode($defaultSections, JSON_UNESCAPED_UNICODE)), true);
        if (!is_array($sections) || empty($sections)) {
            $sections = $defaultSections;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'intro' => \App\Models\Setting::get('terms_intro', $locale === 'ar' 
                    ? 'باستخدام منصتنا، أنت توافق على الشروط والأحكام التالية.'
                    : 'By using our platform you agree to the following terms and conditions.'),
                'lastUpdated' => \App\Models\Setting::get('terms_last_updated', now()->format('F j, Y')),
                'sections' => $sections,
            ]
        ]);
    });
    
    Route::get('/privacy', function (Request $request) {
        $locale = $request->header('Accept-Language', 'en');
        app()->setLocale($locale);
        
        $defaultSections = [
            [
                'title' => $locale === 'ar' ? 'البيانات التي نجمعها' : 'Data We Collect',
                'content' => $locale === 'ar'
                    ? 'نجمع المعلومات التي تقدمها أثناء التسجيل والطلب ودعم العملاء.'
                    : 'We collect the information you provide during registration, ordering, and customer support.',
            ],
            [
                'title' => $locale === 'ar' ? 'كيف نستخدم بياناتك' : 'How We Use Your Data',
                'content' => $locale === 'ar'
                    ? 'تسمح لنا بياناتك بمعالجة الطلبات وضمان التوصيل في الوقت المحدد.'
                    : 'Your data allows us to process orders, ensure on-time delivery.',
            ],
        ];

        $sections = json_decode(\App\Models\Setting::get('privacy_sections', json_encode($defaultSections, JSON_UNESCAPED_UNICODE)), true);
        if (!is_array($sections) || empty($sections)) {
            $sections = $defaultSections;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'intro' => \App\Models\Setting::get('privacy_intro', $locale === 'ar'
                    ? 'نوضح ما هي البيانات التي نجمعها وكيف نحميها.'
                    : 'We explain what data we collect and how we protect it.'),
                'lastUpdated' => \App\Models\Setting::get('privacy_last_updated', now()->format('F j, Y')),
                'sections' => $sections,
            ]
        ]);
    });
});

// =============================================================================
// PROTECTED ROUTES (Authentication Required)
// =============================================================================
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    
    // -------------------------------------------------------------------------
    // User Authentication
    // -------------------------------------------------------------------------
    Route::get('/user', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // -------------------------------------------------------------------------
    // User Profile
    // -------------------------------------------------------------------------
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/change-password', [ProfileController::class, 'changePassword']);
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar']);
    
    // -------------------------------------------------------------------------
    // User Role Management
    // -------------------------------------------------------------------------
    Route::get('/role', [UserRoleController::class, 'info']);
    Route::post('/role/upgrade', [UserRoleController::class, 'upgrade']);
    
    // -------------------------------------------------------------------------
    // Cart
    // -------------------------------------------------------------------------
    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'index']);
        Route::get('/count', [CartController::class, 'count']);
        Route::post('/add', [CartController::class, 'add']);
        Route::put('/update', [CartController::class, 'update']);
        Route::delete('/remove/{product}', [CartController::class, 'remove']);
        Route::delete('/clear', [CartController::class, 'clear']);
    });
    
    // -------------------------------------------------------------------------
    // Favorites
    // -------------------------------------------------------------------------
    Route::prefix('favorites')->group(function () {
        Route::get('/', [FavoriteProductController::class, 'index']);
        Route::post('/', [FavoriteProductController::class, 'store']);
        Route::delete('/{product}', [FavoriteProductController::class, 'destroy']);
    });
    
    // -------------------------------------------------------------------------
    // Delivery Locations
    // -------------------------------------------------------------------------
    Route::prefix('delivery-locations')->group(function () {
        Route::get('/', [DeliveryLocationController::class, 'index']);
        Route::post('/', [DeliveryLocationController::class, 'store']);
        Route::put('/{deliveryLocation}', [DeliveryLocationController::class, 'update']);
        Route::delete('/{deliveryLocation}', [DeliveryLocationController::class, 'destroy']);
        Route::post('/{deliveryLocation}/default', [DeliveryLocationController::class, 'setDefault']);
    });
    
    // -------------------------------------------------------------------------
    // Orders (Customer)
    // -------------------------------------------------------------------------
    Route::prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::get('/my-orders', [OrderController::class, 'userOrders']);
        Route::post('/', [OrderController::class, 'store']);
        Route::get('/{order}', [OrderController::class, 'show']);
        Route::post('/{order}/cancel', [OrderController::class, 'cancel']);
        Route::get('/{order}/track', [OrderController::class, 'track']);
    });
    
    // -------------------------------------------------------------------------
    // Dashboard Statistics
    // -------------------------------------------------------------------------
    Route::prefix('dashboard')->group(function () {
        Route::get('/customer', [DashboardController::class, 'customerStats']);
        Route::get('/store', [DashboardController::class, 'storeStats']);
        Route::get('/admin', [DashboardController::class, 'adminStats']);
    });
    
    // -------------------------------------------------------------------------
    // Notifications
    // -------------------------------------------------------------------------
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/unread-count', [NotificationController::class, 'getUnreadCount']);
        Route::get('/{id}', [NotificationController::class, 'show']);
        Route::post('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
        Route::post('/subscribe', [NotificationController::class, 'subscribe']);
        Route::post('/unsubscribe', [NotificationController::class, 'unsubscribe']);
    });
    
    // =========================================================================
    // DRIVER ROUTES
    // =========================================================================
    Route::prefix('driver')->group(function () {
        
        // Driver Application
        Route::get('/apply', [DriverApplicationController::class, 'create']);
        Route::post('/apply', [DriverApplicationController::class, 'store']);
        Route::get('/application-status', [DriverApplicationController::class, 'status']);
        
        // Driver Orders
        Route::get('/orders', [DriverOrderController::class, 'index']);
        Route::get('/orders/{order}', [DriverOrderController::class, 'show']);
        Route::post('/orders/{order}/accept', [DriverOrderController::class, 'accept']);
        Route::post('/orders/{order}/reject', [DriverOrderController::class, 'reject']);
        Route::post('/orders/{order}/pick-up', [DriverOrderController::class, 'pickUp']);
        Route::post('/orders/{order}/start-delivery', [DriverOrderController::class, 'startDelivery']);
        Route::post('/orders/{order}/complete', [DriverOrderController::class, 'complete']);
        
        // Driver Location & Stats
        Route::post('/location', [DriverOrderController::class, 'updateLocation']);
        Route::get('/statistics', [DriverOrderController::class, 'statistics']);
    });
    
    // =========================================================================
    // STORE OWNER ROUTES
    // =========================================================================
    Route::prefix('store')->group(function () {
        
        // Store Setup & Management
        Route::get('/setup', [StoreManagementController::class, 'setupForm']);
        Route::post('/setup', [StoreManagementController::class, 'createStore']);
        Route::get('/details', [StoreManagementController::class, 'show']);
        Route::put('/details', [StoreManagementController::class, 'update']);
        
        // Working Hours
        Route::get('/working-hours', [StoreManagementController::class, 'getWorkingHours']);
        Route::put('/working-hours', [StoreManagementController::class, 'updateWorkingHours']);
        
        // Store Products
        Route::get('/products', [StoreManagementController::class, 'products']);
        Route::post('/products', [StoreManagementController::class, 'addProduct']);
        Route::put('/products/{product}', [StoreManagementController::class, 'updateProduct']);
        Route::delete('/products/{product}', [StoreManagementController::class, 'deleteProduct']);
        Route::get('/categories', [StoreManagementController::class, 'getCategories']);
        
        // Store Orders
        Route::get('/orders', [StoreOrderController::class, 'index']);
        Route::get('/orders/{orderStore}', [StoreOrderController::class, 'show']);
        Route::post('/orders/{orderStore}/approve', [StoreOrderController::class, 'approve']);
        Route::post('/orders/{orderStore}/reject', [StoreOrderController::class, 'reject']);
        Route::post('/orders/{orderStore}/start-preparing', [StoreOrderController::class, 'startPreparing']);
        Route::post('/orders/{orderStore}/finish-preparing', [StoreOrderController::class, 'finishPreparing']);
        
        // Store Statistics
        Route::get('/statistics', [StoreOrderController::class, 'statistics']);
    });
});

// =============================================================================
// ADMIN ROUTES
// =============================================================================
Route::prefix('v1/admin')->middleware('auth:sanctum')->group(function () {
    Route::apiResource('categories', CategoryController::class)
        ->except(['index', 'show'])
        ->names('api.admin.categories');
    Route::apiResource('products', ProductController::class)
        ->except(['index', 'show'])
        ->names('api.admin.products');
    Route::apiResource('stores', StoreController::class)
        ->except(['index', 'show'])
        ->names('api.admin.stores');
});
