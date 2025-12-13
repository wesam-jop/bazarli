@php
    use App\Models\Setting;
    $currentLocale = session('locale', Setting::get('default_language', app()->getLocale()));
    $isRTL = $currentLocale === 'ar';
    $siteName = Setting::get('site_name', config('app.name', 'DeliGo'));
    $siteFavicon = Setting::get('site_favicon', '');
@endphp

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', $currentLocale) }}" dir="{{ $isRTL ? 'rtl' : 'ltr' }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ $siteName }}</title>
        
        @if($siteFavicon && $siteFavicon !== '')
        <link rel="icon" type="image/x-icon" href="{{ $siteFavicon }}">
        @endif
        
        <meta name="description" content="{{ Setting::get('site_description', '') }}">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
        
        <!-- Arabic Font -->
        @if($isRTL)
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        @endif

        <!-- Scripts -->
        @viteReactRefresh
        @vite(['resources/js/app.jsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased {{ $isRTL ? 'font-cairo' : '' }}" dir="{{ $isRTL ? 'rtl' : 'ltr' }}">
        @inertia
        <script type="text/javascript">
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/693d3b794f7afe19760b372d/1jcbj0lih';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
            })();
        </script>
        <script>
            (function() {
                const SUPPORTED_LOCALES = ['ar', 'en'];
                const STORAGE_KEY = 'preferred_locale';

                const getStoredLocale = () => {
                    try {
                        const stored = window.localStorage.getItem(STORAGE_KEY);
                        return SUPPORTED_LOCALES.includes(stored) ? stored : null;
                    } catch (error) {
                        console.warn('Unable to read preferred locale from storage', error);
                        return null;
                    }
                };

                const persistLocale = (locale) => {
                    if (!SUPPORTED_LOCALES.includes(locale)) {
                        return;
                    }

                    try {
                        window.localStorage.setItem(STORAGE_KEY, locale);
                    } catch (error) {
                        console.warn('Unable to persist preferred locale', error);
                    }
                };

                const resolveLocale = () => {
                    const inertiaLocale = window?.Inertia?.page?.props?.locale || window?.page?.props?.locale;
                    return getStoredLocale() || inertiaLocale || document.documentElement.getAttribute('lang') || '{{ $currentLocale }}';
                };

                const applyDirection = (locale) => {
                    const resolved = SUPPORTED_LOCALES.includes(locale) ? locale : 'ar';
                    const isRTL = resolved === 'ar';

                    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
                    document.documentElement.setAttribute('lang', resolved);

                    if (document.body) {
                        document.body.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
                        document.body.classList.toggle('font-cairo', isRTL);
                        document.body.classList.toggle('font-sans', !isRTL);
                        document.body.classList.toggle('rtl', isRTL);
                        document.body.classList.toggle('ltr', !isRTL);
                    }
                };

                const syncDirection = () => {
                    const locale = resolveLocale();
                    applyDirection(locale);
                    persistLocale(locale);
                };

                // Apply immediately using stored locale (prevents flicker before React initializes)
                const storedLocale = getStoredLocale();
                if (storedLocale && storedLocale !== document.documentElement.getAttribute('lang')) {
                    applyDirection(storedLocale);
                }

                document.addEventListener('DOMContentLoaded', function() {
                    syncDirection();

                    window.addEventListener('popstate', syncDirection);

                    if (window.Inertia && typeof window.Inertia.on === 'function') {
                        window.Inertia.on('navigate', function() {
                            requestAnimationFrame(syncDirection);
                        });
                    }
                });
            })();
        </script>
    </body>
</html>
