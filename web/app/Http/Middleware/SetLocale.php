<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = null;
        
        // Check if locale is being changed via URL parameter (highest priority)
        if ($request->has('locale')) {
            $locale = $request->get('locale');
        }
        // Check session for stored locale
        elseif (Session::has('locale')) {
            $locale = Session::get('locale');
        }
        // Check cookie for stored locale preference
        elseif ($request->hasCookie('preferred_locale')) {
            $locale = $request->cookie('preferred_locale');
        }
        // If no stored preference, detect from browser language
        else {
            $locale = $this->detectBrowserLocale($request);
        }
        
        // Validate locale
        if (!in_array($locale, ['ar', 'en'])) {
            $locale = 'ar';
        }
        
        // Set the application locale
        App::setLocale($locale);
        
        // Store locale in session for future requests
        Session::put('locale', $locale);
        
        // Also set the locale in the request for immediate use
        $request->attributes->set('locale', $locale);
        
        return $next($request);
    }

    /**
     * Detect locale from browser's Accept-Language header
     * If browser is Arabic → Arabic, otherwise → English
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string
     */
    private function detectBrowserLocale(Request $request): string
    {
        $acceptLanguage = $request->header('Accept-Language');
        
        if (empty($acceptLanguage)) {
            return 'en'; // Default to English if no language header
        }

        // Convert to lowercase for case-insensitive matching
        $acceptLanguage = strtolower($acceptLanguage);
        
        // Check if Arabic language code exists in Accept-Language header
        // This will match 'ar', 'ar-SY', 'ar-SA', etc.
        if (preg_match('/\bar\b/', $acceptLanguage)) {
            return 'ar';
        }
        
        // If not Arabic, default to English
        return 'en';
    }
}