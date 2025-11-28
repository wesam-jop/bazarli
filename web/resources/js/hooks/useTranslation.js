import { usePage } from '@inertiajs/react';

export function useTranslation() {
    const { props } = usePage();
    const locale = props.locale || 'ar';
    const translations = props.translations || {};
    
    const t = (key, replacements = {}) => {
        // Try to get translation from backend first
        let translation = translations[key];
        
        // If not found, try to get from nested keys (e.g., 'auth.login')
        if (!translation && key.includes('.')) {
            const keys = key.split('.');
            translation = keys.reduce((obj, k) => obj?.[k], translations);
        }
        
        // Fallback to hardcoded translations if not found in backend
        if (!translation) {
            const fallbackTranslations = {
                ar: {
                    'home_meta_title': 'Getir Clone - توصيل سريع',
                    'home_meta_description': 'اطلب منتجاتك المفضلة مع توصيل فائق السرعة وتجربة تسوق سلسة باللغتين.',
                    'home': 'الرئيسية',
                    'categories': 'الفئات',
                    'products': 'المنتجات',
                    'orders': 'الطلبات',
                    'cart': 'السلة',
                    'login': 'تسجيل الدخول',
                    'logout': 'تسجيل الخروج',
                    'register': 'إنشاء حساب',
                    'welcome_title': 'ديلي غُو… كل المحلات بإيدك',
                    'welcome_subtitle': 'منصة تسوّق وتوصيل سريعة ومرنة - طلبك واصل!',
                    'start_shopping': 'ابدأ التسوق',
                    'download_app': 'حمل التطبيق',
                    'why_choose_us': 'لماذا تختار Getir Clone؟',
                    'why_choose_subtitle': 'خدمة مبنية لتقدم لك أسرع وأوثق تجربة تسوق يومية.',
                    'fast_delivery': 'توصيل في 10 دقائق',
                    'fast_delivery_desc': 'شبكة واسعة من السائقين المدربين تضمن وصول طلبك في دقائق قليلة.',
                    'quality_guaranteed': 'جودة مضمونة',
                    'quality_guaranteed_desc': 'منتجات مختارة بعناية من أفضل الموردين مع مراقبة جودة مستمرة.',
                    'wide_selection': 'اختيار واسع',
                    'wide_selection_desc': 'آلاف المنتجات من مختلف الفئات لتلبي كل احتياجاتك اليومية.',
                    'product_categories': 'فئات المنتجات',
                    'product_categories_subtitle': 'تصفح الفئات الأكثر طلباً واختر ما يناسب أسلوب حياتك.',
                    'featured_products': 'المنتجات المميزة',
                    'featured_products_subtitle': 'منتجات مختارة بعناية بناءً على تقييم العملاء وتجربة الفريق.',
                    'featured_stores': 'المتاجر المميزة',
                    'featured_stores_subtitle': 'شركاؤنا الموثوقون الذين يقدمون أفضل جودة وخدمة.',
                    'view_all_categories': 'عرض جميع الفئات',
                    'view_all_products': 'عرض جميع المنتجات',
                    'view_all_stores': 'عرض جميع المتاجر',
                    'add_to_cart': 'أضف للسلة',
                    'featured': 'مميز',
                    'search_products': 'ابحث عن منتج...',
                    'all_categories': 'جميع الفئات',
                    'sort_by': 'ترتيب حسب',
                    'default_sort': 'الترتيب الافتراضي',
                    'sort_by_name': 'الاسم',
                    'sort_by_price': 'السعر',
                    'no_products_found': 'لم يتم العثور على منتجات',
                    'my_orders': 'طلباتي',
                    'track_orders': 'تتبع جميع طلباتك',
                    'phone_number': 'رقم الهاتف',
                    'verification_code': 'رمز التحقق',
                    'customer': 'عميل',
                    'store_owner': 'صاحب متجر',
                    'admin': 'مدير',
                    'welcome_user': 'مرحباً، :name',
                    'about_us': 'من نحن',
                    'contact_us': 'اتصل بنا',
                    'help': 'المساعدة',
                    'services': 'الخدمات',
                    'grocery_delivery': 'توصيل البقالة',
                    'food_delivery': 'توصيل الطعام',
                    'pharmacy': 'الصيدلية',
                    'pet_supplies': 'مستلزمات الحيوانات',
                    'download_ios': 'حمل للـ iOS',
                    'download_android': 'حمل للـ Android',
                    'all_rights_reserved': 'جميع الحقوق محفوظة',
                    'login_page_title': 'مرحباً بعودتك',
                    'login_page_subtitle': 'سجل الدخول إلى حسابك للمتابعة',
                    'login_badge_fast': 'تسجيل سريع',
                    'login_badge_secure': 'آمن',
                    'login_badge_support': 'دعم 24/7',
                    'dont_have_account': 'ليس لديك حساب؟',
                    'sign_up_here': 'سجل من هنا',
                    'send_otp': 'إرسال رمز التحقق',
                    'sending_otp': 'جاري إرسال الرمز...',
                    'phone_number_placeholder': 'أدخل رقم هاتفك',
                },
                en: {
                    'home_meta_title': 'Getir Clone - Ultra Fast Delivery',
                    'home_meta_description': 'Order your favorite essentials with lightning-fast delivery and a bilingual experience.',
                    'home': 'Home',
                    'categories': 'Categories',
                    'products': 'Products',
                    'orders': 'Orders',
                    'cart': 'Cart',
                    'login': 'Login',
                    'logout': 'Logout',
                    'register': 'Register',
                    'welcome_title': 'DeliGo… All Stores in Your Hand',
                    'welcome_subtitle': 'Fast and flexible shopping & delivery platform - Your order is on the way!',
                    'start_shopping': 'Start Shopping',
                    'download_app': 'Download App',
                    'why_choose_us': 'Why Choose Getir Clone?',
                    'why_choose_subtitle': 'A service crafted to bring you the fastest, most reliable daily shopping experience.',
                    'fast_delivery': '10 Minute Delivery',
                    'fast_delivery_desc': 'An extensive courier network ensures your basket arrives in just minutes.',
                    'quality_guaranteed': 'Quality Guaranteed',
                    'quality_guaranteed_desc': 'Carefully sourced products from trusted partners with continuous quality checks.',
                    'wide_selection': 'Wide Selection',
                    'wide_selection_desc': 'Thousands of items across every category to cover your daily needs.',
                    'product_categories': 'Product Categories',
                    'product_categories_subtitle': 'Browse the most popular collections and find what suits your lifestyle.',
                    'featured_products': 'Featured Products',
                    'featured_products_subtitle': 'Hand-picked items inspired by customer ratings and our team’s favorites.',
                    'featured_stores': 'Featured Stores',
                    'featured_stores_subtitle': 'Our trusted partners delivering the best quality and service.',
                    'view_all_categories': 'View All Categories',
                    'view_all_products': 'View All Products',
                    'view_all_stores': 'View All Stores',
                    'add_to_cart': 'Add to Cart',
                    'featured': 'Featured',
                    'search_products': 'Search for products...',
                    'all_categories': 'All Categories',
                    'sort_by': 'Sort by',
                    'default_sort': 'Default Sort',
                    'sort_by_name': 'Name',
                    'sort_by_price': 'Price',
                    'no_products_found': 'No products found',
                    'my_orders': 'My Orders',
                    'track_orders': 'Track all your orders',
                    'phone_number': 'Phone Number',
                    'verification_code': 'Verification Code',
                    'customer': 'Customer',
                    'store_owner': 'Store Owner',
                    'admin': 'Admin',
                    'welcome_user': 'Welcome, :name',
                    'about_us': 'About Us',
                    'contact_us': 'Contact Us',
                    'help': 'Help',
                    'services': 'Services',
                    'grocery_delivery': 'Grocery Delivery',
                    'food_delivery': 'Food Delivery',
                    'pharmacy': 'Pharmacy',
                    'pet_supplies': 'Pet Supplies',
                    'download_ios': 'Download for iOS',
                    'download_android': 'Download for Android',
                    'all_rights_reserved': 'All rights reserved',
                    'login_page_title': 'Welcome Back',
                    'login_page_subtitle': 'Sign in to your account to continue',
                    'login_badge_fast': 'Fast Login',
                    'login_badge_secure': 'Secure',
                    'login_badge_support': '24/7 Support',
                    'dont_have_account': "Don't have an account?",
                    'sign_up_here': 'Sign up here',
                    'send_otp': 'Send verification code',
                    'sending_otp': 'Sending code...',
                    'phone_number_placeholder': 'Enter your phone number',
                }
            };
            translation = fallbackTranslations[locale]?.[key] || key;
        }
        
        // Replace placeholders
        Object.keys(replacements).forEach(placeholder => {
            translation = translation.replace(`:${placeholder}`, replacements[placeholder]);
        });
        
        return translation;
    };
    
    return { t, locale, translations };
}
