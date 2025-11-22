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

// Public routes
Route::prefix('v1')->group(function () {
    // Authentication routes
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/verify-phone', [AuthController::class, 'verifyPhone']);
    Route::post('/resend-verification', [AuthController::class, 'resendVerification']);
    
    // Public product and category routes
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{id}', [CategoryController::class, 'show']);
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{id}', [ProductController::class, 'show']);
    Route::get('/stores', [StoreController::class, 'index']);
    Route::get('/stores/{id}', [StoreController::class, 'show']);
    
    // Location routes
    Route::get('/governorates', function () {
        $governorates = \App\Models\Governorate::active()
            ->orderBy('display_order')
            ->get()
            ->map(fn ($gov) => [
                'id' => $gov->id,
                'name' => app()->getLocale() === 'ar' ? $gov->name_ar : $gov->name_en,
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
                'name' => app()->getLocale() === 'ar' ? $city->name_ar : $city->name_en,
                'governorate_id' => $city->governorate_id,
            ]);
        
        return response()->json([
            'success' => true,
            'data' => $cities
        ]);
    });
});

// Protected routes
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    // User routes
    Route::get('/user', function (Request $request) {
        return response()->json([
            'success' => true,
            'data' => $request->user()
        ]);
    });
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Cart routes
    Route::get('/cart', [CartController::class, 'index'])->name('api.cart.index');
    Route::post('/cart/add', [CartController::class, 'add'])->name('api.cart.add');
    Route::put('/cart/update', [CartController::class, 'update'])->name('api.cart.update');
    Route::delete('/cart/remove/{product}', [CartController::class, 'remove'])->name('api.cart.remove');
    Route::delete('/cart/clear', [CartController::class, 'clear'])->name('api.cart.clear');
    
    // Favorite routes
    Route::get('/favorites', [FavoriteProductController::class, 'index'])->name('api.favorites.index');
    Route::post('/favorites', [FavoriteProductController::class, 'store'])->name('api.favorites.store');
    Route::delete('/favorites/{product}', [FavoriteProductController::class, 'destroy'])->name('api.favorites.destroy');
    
    // Delivery locations routes
    Route::get('/delivery-locations', [DeliveryLocationController::class, 'index'])->name('api.delivery-locations.index');
    Route::post('/delivery-locations', [DeliveryLocationController::class, 'store'])->name('api.delivery-locations.store');
    Route::put('/delivery-locations/{deliveryLocation}', [DeliveryLocationController::class, 'update'])->name('api.delivery-locations.update');
    Route::delete('/delivery-locations/{deliveryLocation}', [DeliveryLocationController::class, 'destroy'])->name('api.delivery-locations.destroy');
    Route::post('/delivery-locations/{deliveryLocation}/default', [DeliveryLocationController::class, 'setDefault'])->name('api.delivery-locations.default');
    
    // Order routes
    Route::get('/user/orders', [OrderController::class, 'userOrders'])->name('api.user.orders');
    Route::apiResource('orders', OrderController::class)->names('api.orders');
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel'])->name('api.orders.cancel');
    Route::get('/orders/{order}/track', [OrderController::class, 'track'])->name('api.orders.track');
});

// Admin routes (you can add admin middleware later)
Route::prefix('v1/admin')->middleware('auth:sanctum')->group(function () {
    Route::apiResource('categories', CategoryController::class)
        ->except(['index', 'show'])
        ->names('api.categories');
    Route::apiResource('products', ProductController::class)
        ->except(['index', 'show'])
        ->names('api.products');
    Route::apiResource('stores', StoreController::class)
        ->except(['index', 'show'])
        ->names('api.stores');
});
