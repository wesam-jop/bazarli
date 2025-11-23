import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    User,
    Menu,
    X,
    Search,
    Bell,
    ChevronDown,
    LogOut,
    HelpCircle,
    Settings,
    Heart,
    MapPin,
    ClipboardList,
} from 'lucide-react';
import UserAvatar from '../../Components/UserAvatar';
import { useTranslation } from '../../hooks/useTranslation';

export default function StoreLayout({ children, title, subtitle }) {
    const { props, url } = usePage();
    const user = props?.auth?.user;
    const { t } = useTranslation();
    const settings = props?.settings || {};

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const notificationsRef = useRef(null);
    const userMenuRef = useRef(null);

    const navItems = [
        { label: t('store_dashboard'), href: '/dashboard/store', icon: LayoutDashboard },
        { label: t('store_nav_products'), href: '/dashboard/store/products/manage', icon: Package },
        { label: t('store_nav_orders'), href: '/dashboard/store/orders', icon: ShoppingBag },
        { label: t('store_nav_customer_orders'), href: '/dashboard/store/my-orders', icon: ClipboardList },
        { label: t('favorite_products_title'), href: '/dashboard/store/favorites', icon: Heart },
        { label: t('delivery_locations_title'), href: '/dashboard/store/locations', icon: MapPin },
        { label: t('profile'), href: '/dashboard/store/profile', icon: Settings },
    ];

    useEffect(() => {
        const handleClick = (event) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setNotificationsOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title={title} />

            <div className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-semibold flex items-center justify-center">GC</div>
                        <span className="font-semibold text-slate-900">{settings?.site_name || 'Getir Clone'}</span>
                    </div>
                    <button className="lg:hidden p-2 text-slate-500 hover:text-slate-700" onClick={() => setSidebarOpen(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="p-4 space-y-1">
                    {navItems.map(({ label, href, icon: Icon }) => {
                        const isActive = url === href || url.startsWith(`${href}?`) || url.startsWith(`${href}/`);
                        return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                                isActive ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{label}</span>
                        </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto border-t border-slate-200 p-4 space-y-3">
                    <div className="flex items-center gap-3">
                        <UserAvatar user={user} size={44} />
                        <div>
                            <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                            <p className="text-xs text-slate-500">{user?.phone}</p>
                        </div>
                    </div>
                    <Link
                        href="/logout"
                        method="post"
                        className="inline-flex items-center gap-2 w-full rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200"
                    >
                        <LogOut className="w-4 h-4" />
                        {t('logout')}
                    </Link>
                </div>
            </div>

   	         <div className="lg:pl-64 min-h-screen">
                <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm py-5">
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <button
                                className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-600"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{t('store_dashboard')}</p>
                                <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
                                {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden md:block">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder={t('search')}
                                        className="w-64 pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="relative" ref={notificationsRef}>
                                <button
                                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                                    className={`p-2 rounded-lg border ${notificationsOpen ? 'border-purple-200 bg-purple-50 text-purple-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <Bell className="w-5 h-5" />
                                </button>
                                {notificationsOpen && (
                                    <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg">
                                        <div className="px-4 py-3 border-b border-slate-100">
                                            <h3 className="text-sm font-semibold text-slate-900">{t('notifications')}</h3>
                                        </div>
                                        <div className="p-4 text-center text-sm text-slate-500">
                                            {t('no_notifications') || 'No notifications yet'}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-1 hover:bg-slate-50"
                                >
                                    <UserAvatar user={user} size={36} />
                                    <div className="hidden md:block text-left">
                                        <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                                        <p className="text-xs text-slate-500">{t('store_owner')}</p>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-lg">
                                        <div className="px-4 py-3 border-b border-slate-100">
                                            <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                                            <p className="text-xs text-slate-500">{user?.phone}</p>
                                        </div>
                                        <div className="p-2 space-y-1">
                                            <Link
                                                href="/dashboard/store/profile"
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
                                            <Link
                                                href="/dashboard/store/setup"
                                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <Settings className="w-4 h-4" />
                                                {t('store_setup_title')}
                                            </Link>
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
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

