import React, { useState, useRef, useEffect } from 'react';
import { Link, Head, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    ShoppingBag,
    Heart,
    MapPin,
    User,
    Settings,
    Menu,
    X,
    Search,
    ChevronDown,
    LogOut,
    HelpCircle,
} from 'lucide-react';
import UserAvatar from '../../Components/UserAvatar';
import NotificationBell from '../../Components/NotificationBell';
import DeliGoLogo from '../../Components/DeliGoLogo';
import { useTranslation } from '../../hooks/useTranslation';

export default function CustomerLayout({ children, title }) {
    const { t, locale } = useTranslation();
    const isRTL = locale === 'ar';
    const { url, props } = usePage();
    const user = props?.auth?.user;
    const settings = props?.settings || {};
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    const menuItems = [
        {
            label: t('customer_dashboard'),
            href: '/dashboard/customer',
            icon: LayoutDashboard,
        },
        {
            label: t('my_orders') || t('orders'),
            href: '/orders',
            icon: ShoppingBag,
        },
        {
            label: t('favorite_products_title'),
            href: '/dashboard/customer/favorites',
            icon: Heart,
        },
        {
            label: t('delivery_locations_short') || t('delivery_locations_title') || 'عناوين التوصيل',
            href: '/dashboard/customer/locations',
            icon: MapPin,
        },
        {
            label: t('profile'),
            href: '/dashboard/customer/profile',
            icon: User,
        },
    ];

    useEffect(() => {
        const handler = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50" dir={isRTL ? 'rtl' : 'ltr'}>
            <Head title={title} />

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div 
                className={`dashboard-sidebar fixed inset-y-0 z-40 w-64 bg-white shadow-xl transition-transform duration-300 ${
                    isRTL 
                        ? `border-l border-slate-200 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0` 
                        : `border-r border-slate-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`
                }`}
            >
                <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200 bg-secondary-200">
                    <Link href="/" className="flex items-center gap-3">
                        <DeliGoLogo height={28} />
                    </Link>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-500 hover:text-slate-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="p-4 space-y-1">
                    {menuItems.map(({ label, href, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse' : ''} gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                                url === href
                                    ? 'bg-primary-50 text-primary-700 border border-primary-100'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto p-4 border-t border-slate-200">
                    <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse' : ''} gap-3`}>
                        <UserAvatar user={user} size={44} />
                        <div className="text-start">
                            <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                            <p className="text-xs text-slate-500">{user?.phone}</p>
                        </div>
                    </div>
                    <Link
                        href="/logout"
                        method="post"
                        className={`mt-4 inline-flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse' : ''} gap-2 w-full rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200`}
                    >
                        <LogOut className="w-4 h-4" />
                        {t('logout')}
                    </Link>
                </div>
            </div>

            {/* Main */}
            <div className={isRTL ? 'lg:pr-64' : 'lg:pl-64'}>
                <header className="dashboard-header sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <div className="text-start">
                                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{t('customer_dashboard')}</p>
                                <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
                            </div>
                        </div>

                        <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse' : ''} gap-4`}>
                            <div className="hidden md:block">
                                <div className="relative">
                                    <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4`} />
                                    <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4`} />
                                    <input
                                        type="text"
                                        placeholder={t('search')}
                                        className={`w-64 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-primary-500 focus:border-primary-500`}
                                    />
                                </div>
                            </div>

                            <NotificationBell 
                                unreadCount={props?.notifications?.unreadCount || 0}
                                notifications={props?.notifications?.recent || []}
                            />

                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-1 hover:bg-slate-50"
                                >
                                    <UserAvatar user={user} size={36} />
                                    <div className="hidden md:block text-start">
                                        <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                                        <p className="text-xs text-slate-500">{t('customer')}</p>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {userMenuOpen && (
                                    <div className={`dashboard-header absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-lg z-50`}>
                                        <div className="px-4 py-3 border-b border-slate-100 text-start">
                                            <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                                            <p className="text-xs text-slate-500">{user?.phone}</p>
                                        </div>
                                        <div className="p-2 space-y-1">
                                            <Link
                                                href="/dashboard/customer/profile"
                                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <User className="w-4 h-4" />
                                                {t('profile')}
                                            </Link>
                                            <Link
                                                href="/help"
                                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <HelpCircle className="w-4 h-4" />
                                                {t('help')}
                                            </Link>
                                            <button
                                                onClick={() => setUserMenuOpen(false)}
                                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100"
                                            >
                                                <Settings className="w-4 h-4" />
                                                {t('settings')}
                                            </button>
                                            <Link
                                                href="/logout"
                                                method="post"
                                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-rose-600 hover:bg-rose-50"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <LogOut className="w-4 h-4" />
                                                {t('logout')}
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>
                <main className="flex-1 bg-slate-50">
                    <div className="dashboard-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

