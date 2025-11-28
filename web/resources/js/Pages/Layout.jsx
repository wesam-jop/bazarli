import React, { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import LanguageSwitcher from '../Components/LanguageSwitcher';
import { useTranslation } from '../hooks/useTranslation';
import { applyDirection, persistLocalePreference } from '../utils/locale';
import { 
    Home, 
    Package, 
    ShoppingBag, 
    ShoppingCart, 
    User, 
    LogOut, 
    LogIn,
    Store,
    Truck,
    Heart,
    Phone,
    Download,
    Apple,
    Smartphone,
    Menu,
    X
} from 'lucide-react';
import UserAvatar from '../Components/UserAvatar';
import NotificationPermissionPrompt from '../Components/NotificationPermissionPrompt';
import DeliGoLogo from '../Components/DeliGoLogo';

export default function Layout({ children }) {
    const { props, url } = usePage();
    const { t, locale } = useTranslation();
    const isRTL = locale === 'ar';
    const cartCount = props.cartCount || 0;
    const user = props?.auth?.user;
    const settings = props?.settings || {};
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // مزامنة الاتجاه وتخزين اللغة المفضلة
    useEffect(() => {
        applyDirection(locale);
        persistLocalePreference(locale);
    }, [locale]);

    // إغلاق القائمة عند تغيير الصفحة
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [url]);

    const navLinks = [
        {
            href: '/',
            label: t('home'),
            icon: Home
        },
        {
            href: '/products',
            label: t('products'),
            icon: Package
        },
        {
            href: '/stores',
            label: t('stores_page_title'),
            icon: Store
        },
        {
            href: '/orders',
            label: t('orders'),
            icon: ShoppingBag
        }
    ];

    const renderNavLinks = (variant = 'desktop') => (
        navLinks.map(({ href, label, icon: Icon }) => (
            <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors ${isRTL ? 'flex-row-reverse text-right' : ''} ${
                    variant === 'mobile' ? 'py-2' : ''
                }`}
            >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
            </Link>
        ))
    );

    const renderAuthSection = (variant = 'desktop') => {
        if (user) {
            return (
                <div className={`flex ${variant === 'mobile' ? 'flex-col gap-3' : 'items-center gap-3'} ${isRTL && variant !== 'mobile' ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                        <UserAvatar user={user} size={36} className="flex-shrink-0" />
                        <span className="text-sm text-gray-700 font-medium">{user.name}</span>
                    </div>
                    <Link
                        href={user.user_type === 'admin' ? '/admin/dashboard' : 
                              user.user_type === 'store_owner' ? '/dashboard/store' :
                              user.user_type === 'driver' ? '/dashboard/driver' : '/dashboard/customer'}
                        className={`flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                        <User className="w-4 h-4" />
                        <span>{t('dashboard')}</span>
                    </Link>
                    <Link
                        href="/logout"
                        method="post"
                        className={`flex items-center justify-center gap-2 bg-secondary-300 text-primary-800 px-4 py-2 rounded-lg hover:bg-secondary-400 transition-colors text-sm font-medium ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                        <LogOut className="w-4 h-4" />
                        <span>{t('logout')}</span>
                    </Link>
                </div>
            );
        }

        return (
            <Link
                href="/login"
                className={`flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium ${variant === 'mobile' ? 'w-full' : ''} ${isRTL ? 'flex-row-reverse' : ''}`}
            >
                <LogIn className="w-4 h-4" />
                <span>{t('login')}</span>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="bg-secondary-200 shadow-sm border-b border-secondary-300 sticky top-0 z-40" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className={`flex justify-between items-center py-4 gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <button
                                type="button"
                                className="md:hidden inline-flex items-center justify-center rounded-md border border-secondary-200 p-2 text-primary-800 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                onClick={() => setMobileMenuOpen((prev) => !prev)}
                                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                                aria-expanded={mobileMenuOpen}
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                            <Link href="/" className="flex items-center gap-2">
                                <DeliGoLogo height={32} />
                            </Link>
                        </div>
                        
                        <nav className={`hidden md:flex items-center gap-6 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                            {renderNavLinks()}
                        </nav>
                        
                        <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className="hidden md:block">
                                <LanguageSwitcher currentLocale={locale} />
                            </div>
                            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors">
                                <ShoppingCart className="w-6 h-6" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                            <div className={`hidden md:flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                {renderAuthSection()}
                            </div>
                        </div>
                    </div>
                    {mobileMenuOpen && (
                        <div className="md:hidden border-t border-secondary-200 pt-4 pb-6 space-y-6">
                            <nav className="block">
                                {renderNavLinks('mobile')}
                            </nav>
                            <LanguageSwitcher currentLocale={locale} />
                            {renderAuthSection('mobile')}
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main>
                {children}
            </main>

            {/* Notification Permission Prompt - Only show for authenticated users */}
            {user && props?.vapidPublicKey && (
                <NotificationPermissionPrompt 
                    vapidPublicKey={props.vapidPublicKey}
                />
            )}

            {/* Footer */}
            <footer className="bg-primary-600 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">{settings?.site_name || 'DeliGo'}</h3>
                            <p className="text-primary-100">
                                {settings?.site_description || t('footer_description')}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">{t('quick_links')}</h4>
                            <ul className="space-y-2 text-primary-100">
                                <li><Link href="/about" className="hover:text-white transition-colors">{t('about_us')}</Link></li>
                                <li><Link href="/contact" className="hover:text-white transition-colors">{t('contact_us')}</Link></li>
                                <li><Link href="/careers" className="hover:text-white transition-colors">{t('careers')}</Link></li>
                                <li><Link href="/help" className="hover:text-white transition-colors">{t('help')}</Link></li>
                                <li><Link href="/terms" className="hover:text-white transition-colors">{t('terms_of_service')}</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">{t('services')}</h4>
                            <ul className="space-y-2 text-primary-100">
                                {/* <li><Link href="/services/grocery-delivery" className="flex items-center space-x-2 hover:text-white transition-colors"><Store className="w-4 h-4" /><span>{t('grocery_delivery')}</span></Link></li>
                                <li><Link href="/services/food-delivery" className="flex items-center space-x-2 hover:text-white transition-colors"><Truck className="w-4 h-4" /><span>{t('food_delivery')}</span></Link></li>
                                <li><Link href="/services/pharmacy" className="flex items-center space-x-2 hover:text-white transition-colors"><Heart className="w-4 h-4" /><span>{t('pharmacy')}</span></Link></li>
                                <li><Link href="/services/pet-supplies" className="flex items-center space-x-2 hover:text-white transition-colors"><Package className="w-4 h-4" /><span>{t('pet_supplies')}</span></Link></li> */}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">{t('download_app')}</h4>
                            <Link href="/download-app" className="flex items-center justify-center space-x-2 w-full bg-white text-primary-600 py-3 px-4 rounded-lg hover:bg-secondary-100 transition-colors">
                                <Smartphone className="w-5 h-5" />
                                <span>{t('download_app')}</span>
                            </Link>
                        </div>
                    </div>
                    <div className="border-t border-primary-500 mt-8 pt-8 text-center text-primary-100">
                        <p>&copy; 2025 {settings?.site_name || 'DeliGo'}. {t('all_rights_reserved')}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
