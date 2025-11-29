<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\App;
use App\Models\Setting;
use App\Models\Notification;
use App\Services\NotificationService;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $cart = $request->session()->get('cart', []);
        $cartCount = array_sum($cart);
        
        // Determine locale from session, cookie, or default app locale
        $locale = $request->session()->get('locale')
            ?? $request->cookie('preferred_locale')
            ?? App::getLocale();
        
        if (!in_array($locale, ['ar', 'en'])) {
            $locale = 'ar';
        }

        // Get general settings
        $settings = $this->getGeneralSettings();
        
        // If no persisted locale, fall back to default setting
        if (
            !$request->session()->has('locale') &&
            !$request->cookie('preferred_locale') &&
            isset($settings['default_language'])
        ) {
            $locale = $settings['default_language'];
        }

        // Keep session + application locale in sync
        if ($request->session()->get('locale') !== $locale) {
            $request->session()->put('locale', $locale);
        }

        App::setLocale($locale);

        return [
            ...parent::share($request),
            'cartCount' => $cartCount,
            'locale' => $locale,
            'translations' => $this->getTranslations($locale),
            'settings' => $settings,
            'downloadSettings' => $this->getAppDownloadSettings(),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'phone' => $request->user()->phone,
                    'user_type' => $request->user()->user_type,
                    'is_verified' => $request->user()->is_verified,
                    'avatar' => $request->user()->avatar,
                    'address' => $request->user()->address,
                ] : null,
                'favorite_product_ids' => $request->user()
                    ? $request->user()->favoriteProducts()->pluck('products.id')->toArray()
                    : [],
            ],
            'notifications' => $request->user() ? [
                'unreadCount' => Notification::where('user_id', $request->user()->id)
                    ->where('is_read', false)
                    ->count(),
                'recent' => Notification::where('user_id', $request->user()->id)
                    ->orderBy('created_at', 'desc')
                    ->limit(10)
                    ->get()
                    ->map(fn($n) => [
                        'id' => $n->id,
                        'type' => $n->type,
                        'title' => $n->title,
                        'message' => $n->message,
                        'is_read' => $n->is_read,
                        'action_url' => $n->action_url,
                        'icon' => $n->icon,
                        'created_at' => $n->created_at->toISOString(),
                    ]),
            ] : [
                'unreadCount' => 0,
                'recent' => [],
            ],
            'vapidPublicKey' => config('services.webpush.vapid_public_key'),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }

    /**
     * Get translations for the current locale
     */
    private function getTranslations(string $locale): array
    {
        $translations = [];
        
        // Load app translations
        if (file_exists(resource_path("lang/{$locale}/app.php"))) {
            $translations = array_merge($translations, require resource_path("lang/{$locale}/app.php"));
        }
        
        // Load auth translations
        if (file_exists(resource_path("lang/{$locale}/auth.php"))) {
            $translations = array_merge($translations, require resource_path("lang/{$locale}/auth.php"));
        }
        
        // Load validation translations
        if (file_exists(resource_path("lang/{$locale}/validation.php"))) {
            $translations = array_merge($translations, require resource_path("lang/{$locale}/validation.php"));
        }
        
        return $translations;
    }

    /**
     * Get general settings from database
     */
    private function getGeneralSettings(): array
    {
        return [
            'site_name' => Setting::get('site_name', 'DeliGo'),
            'site_description' => Setting::get('site_description', 'Fast grocery delivery in 10 minutes'),
            'site_logo' => Setting::get('site_logo', ''),
            'site_favicon' => Setting::get('site_favicon', ''),
            'default_language' => Setting::get('default_language', 'ar'),
            'default_currency' => Setting::get('default_currency', 'SYP'),
            'timezone' => Setting::get('timezone', 'Asia/Damascus'),
            'date_format' => Setting::get('date_format', 'Y-m-d'),
            'time_format' => Setting::get('time_format', 'H:i'),
            'maintenance_mode' => Setting::get('maintenance_mode', '0') === '1' || Setting::get('maintenance_mode', '0') === true,
            'maintenance_message' => Setting::get('maintenance_message', 'We are currently under maintenance. Please check back later.'),
            'default_estimated_delivery_time' => Setting::get('default_estimated_delivery_time', 15),
        ];
    }

    /**
     * Get app download settings shared with frontend
     */
    private function getAppDownloadSettings(): array
    {
        return [
            'app_download_ios_url' => Setting::get('app_download_ios_url', 'https://apps.apple.com/app/getir/id123456789'),
            'app_download_android_url' => Setting::get('app_download_android_url', 'https://play.google.com/store/apps/details?id=com.getir'),
            'app_download_direct_file_url' => Setting::get('app_download_direct_file_url', ''),
            'app_download_downloads_count' => Setting::get('app_download_downloads_count', '100K+'),
            'app_download_rating' => Setting::get('app_download_rating', '4.8'),
            'app_download_reviews_count' => Setting::get('app_download_reviews_count', '12K+'),
        ];
    }
}
