import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Truck,
    MapPin,
    User,
    Menu,
    X,
    Search,
    Bell,
    ChevronDown,
    HelpCircle,
    LogOut,
    ClipboardList,
} from 'lucide-react';
import UserAvatar from '../../Components/UserAvatar';
import { useTranslation } from '../../hooks/useTranslation';

export default function DriverLayout({ children, title, subtitle }) {
    const { props, url } = usePage();
    const { t } = useTranslation();
    const user = props?.auth?.user;
    const settings = props?.settings || {};

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const notificationsRef = useRef(null);
    const userMenuRef = useRef(null);

    const navItems = [
        { label: t('driver_dashboard') || 'Driver Dashboard', href: '/dashboard/driver', icon: LayoutDashboard },
        { label: t('driver_orders_page_title'), href: '/dashboard/driver/orders', icon: ClipboardList },
        { label: t('profile'), href: '/dashboard/driver/profile', icon: User },
    ];

    useEffect(() => {
        const handler = (event) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setNotificationsOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title={title} />

            <div className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-semibold flex items-center justify-center">
                            GC
                        </div>
                        <span className="font-semibold text-slate-900">{settings?.site_name || 'Getir Clone'}</span>
                    </div>
                    <button className="lg:hidden p-2 text-slate-500" onClick={() => setSidebarOpen(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <nav className="p-4 space-y-1">
                    {navItems.map(({ label, href, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                                url === href ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{label}</span>
                        </Link>
                    ))}
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
                <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <button className="lg:hidden p-2 rounded-lg border border-slate-200" onClick={() => setSidebarOpen(true)}>
                                <Menu className="w-5 h-5 text-slate-600" />
                            </button>
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{t('driver_dashboard')}</p>
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
                                        className="w-64 pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="relative" ref={notificationsRef}>
                                <button
                                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                                    className={`p-2 rounded-lg border ${notificationsOpen ? 'border-blue-200 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
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
                                        <p className="text-xs text-slate-500">{t('driver')}</p>
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
                                                href="/dashboard/driver/profile"
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

