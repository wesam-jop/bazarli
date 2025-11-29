import React from 'react';
import { Link, useForm, router } from '@inertiajs/react';
import { Store, Truck, ShoppingBag, ShoppingCart, Grid3X3, Package, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useGeneralSettings } from '../../hooks/useGeneralSettings';
import CustomerLayout from './CustomerLayout';

export default function CustomerDashboard({ stats, recentOrders, favoriteProducts, driverApplication }) {
    const { t, locale } = useTranslation();
    const isRTL = locale === 'ar';
    const { formatCurrency, formatDate } = useGeneralSettings();
    const upgradeForm = useForm({ target_role: '' });

    const statCards = [
        {
            label: t('total_orders'),
            value: stats.total_orders,
            icon: ShoppingBag,
            description: t('track_orders'),
            accent: 'from-primary-500/15 via-primary-500/5 to-white text-primary-600',
        },
        {
            label: t('pending_orders'),
            value: stats.pending_orders,
            icon: ClockIcon,
            description: t('pending'),
            accent: 'from-amber-400/20 via-amber-400/5 to-white text-amber-600',
        },
        {
            label: t('delivered_orders'),
            value: stats.delivered_orders,
            icon: CheckIcon,
            description: t('delivered'),
            accent: 'from-emerald-400/20 via-emerald-400/5 to-white text-emerald-600',
        },
        {
            label: t('total_spent'),
            value: formatCurrency(stats.total_spent),
            icon: WalletIcon,
            description: t('total_spent'),
            accent: 'from-accent-500/20 via-accent-500/5 to-white text-accent-600',
        },
    ];

    const quickActions = [
        { href: '/products', label: t('quick_actions_shop'), icon: Package },
        { href: '/orders', label: t('quick_actions_orders'), icon: ShoppingBag },
        { href: '/cart', label: t('quick_actions_cart'), icon: ShoppingCart },
        { href: '/categories', label: t('quick_actions_categories'), icon: Grid3X3 },
    ];

    const driverStatusMeta = driverApplication
        ? {
              pending: {
                  badge: 'bg-amber-100 text-amber-700',
                  hint: t('driver_application_status_pending_desc'),
                  cta: t('driver_application_view_cta'),
              },
              rejected: {
                  badge: 'bg-rose-100 text-rose-700',
                  hint: driverApplication.notes || t('driver_application_status_rejected_desc'),
                  cta: t('driver_application_resubmit_cta'),
              },
              approved: {
                  badge: 'bg-emerald-100 text-emerald-700',
                  hint: t('driver_application_status_approved_desc'),
                  cta: t('go_to_driver_dashboard'),
              },
          }[driverApplication.status] || null
        : null;

    const statusClasses = {
        pending: 'bg-amber-100 text-amber-800',
        delivered: 'bg-emerald-100 text-emerald-800',
        preparing: 'bg-accent-100 text-accent-800',
    };

    const handleUpgrade = (role) => {
        if (role === 'driver') {
            router.get('/dashboard/driver/apply');
            return;
        }

        upgradeForm.setData('target_role', role);
        upgradeForm.post('/dashboard/upgrade-role', { preserveScroll: true });
    };

    // Unified Button Styles - Using Primary (Orange) Color
    const primaryButtonClass = "inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-600/90 disabled:opacity-50 transition-all";
    const secondaryButtonClass = "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:border-primary-200 hover:text-primary-600 hover:bg-primary-50 transition-all";
    const accentButtonClass = "inline-flex items-center justify-center gap-2 rounded-xl bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-accent-600/90 disabled:opacity-50 transition-all";

    return (
        <CustomerLayout title={t('customer_dashboard')}>
            <div className="space-y-8">
                {/* Welcome Section */}
                <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur shadow-sm p-6 space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="text-start">
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{t('customer_dashboard')}</p>
                            <h1 className="text-2xl font-bold text-slate-900">{t('dashboard_welcome')}</h1>
                            <p className="text-sm text-slate-500">{t('my_orders')}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href="/dashboard/customer/profile"
                                className={secondaryButtonClass}
                            >
                                {t('profile')}
                            </Link>
                        </div>
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {statCards.map(({ label, value, description, icon: Icon, accent }) => (
                            <div
                                key={label}
                                className={`rounded-2xl border border-slate-200 bg-gradient-to-br ${accent} p-4 shadow-sm`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="text-start">
                                        <p className="text-xs uppercase tracking-widest text-slate-500">{label}</p>
                                        <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
                                        <p className="text-xs text-slate-500 mt-1">{description}</p>
                                    </div>
                                    <div className="rounded-2xl bg-white shadow p-3">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Orders & Favorites */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Orders */}
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900">{t('recent_orders')}</h3>
                            <Link
                                href="/orders"
                                className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                            >
                                {t('view_all')}
                            </Link>
                        </div>
                        <div className="p-5 space-y-4">
                            {recentOrders.length ? (
                                recentOrders.map((order) => (
                                    <div key={order.id} className="rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-primary-200 transition-colors">
                                        <div className="text-start">
                                            <p className="font-semibold text-slate-900">#{order.order_number}</p>
                                            <p className="text-sm text-slate-500">{order.store?.name}</p>
                                            <p className="text-xs text-slate-400">{formatDate(order.created_at)}</p>
                                        </div>
                                        <div className="text-end">
                                            <p className="text-sm font-semibold text-primary-600">{formatCurrency(order.total_amount)}</p>
                                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusClasses[order.status] || 'bg-slate-100 text-slate-600'}`}>
                                                {t(order.status) || order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-sm text-slate-500 py-8">
                                    {t('no_recent_orders')}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Favorites */}
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900">{t('favorite_products_title')}</h3>
                            {favoriteProducts.length > 0 && (
                                <Link
                                    href="/dashboard/customer/favorites"
                                    className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                                >
                                    {t('view_all')}
                                </Link>
                            )}
                        </div>
                        <div className="p-5">
                            {favoriteProducts.length ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {favoriteProducts.map((product) => (
                                        <Link key={product.id} href={`/products/${product.id}`} className="rounded-xl border border-slate-200 p-4 hover:border-primary-200 hover:bg-primary-50/50 transition text-start">
                                            <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                                            <p className="text-xs text-slate-500">{formatCurrency(product.price)}</p>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-sm text-slate-500 py-8">
                                    {t('no_favorites')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900">{t('quick_actions')}</h3>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{t('quick_actions')}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickActions.map(({ href, label, icon: Icon }) => (
                            <Link
                                key={label}
                                href={href}
                                className="rounded-xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50 px-4 py-4 shadow-sm hover:border-primary-200 hover:shadow-md transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="rounded-xl bg-primary-50 text-primary-600 p-2.5 group-hover:bg-primary-100 transition-colors">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="text-start flex-1">
                                        <p className="text-sm font-semibold text-slate-900">{label}</p>
                                        <p className="text-xs text-slate-500">{t('click_to_open') || ''}</p>
                                    </div>
                                    <ArrowRight className={`w-4 h-4 text-slate-400 group-hover:text-primary-600 transition-colors ${isRTL ? 'rotate-180' : ''}`} />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Upgrade Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Store Upgrade */}
                    <div className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-5 sm:p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-white text-primary-600 shadow-sm">
                                <Store className="w-6 h-6" />
                            </div>
                            <div className="text-start flex-1">
                                <p className="text-base font-semibold text-slate-900">{t('register_upgrade_store_title')}</p>
                                <p className="text-sm text-slate-600">{t('dashboard_upgrade_store_desc')}</p>
                            </div>
                        </div>
                        <Link 
                            href="/dashboard/store/setup" 
                            className={`${primaryButtonClass} mt-auto`}
                        >
                            {t('upgrade_store_cta')}
                            <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                        </Link>
                    </div>

                    {/* Driver Upgrade */}
                    <div className="rounded-2xl border border-accent-100 bg-gradient-to-br from-accent-50 to-white p-5 sm:p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-white text-accent-600 shadow-sm">
                                <Truck className="w-6 h-6" />
                            </div>
                            <div className="text-start flex-1">
                                <p className="text-base font-semibold text-slate-900">{t('register_upgrade_driver_title')}</p>
                                <p className="text-sm text-slate-600">{t('dashboard_upgrade_driver_desc')}</p>
                                {driverStatusMeta && (
                                    <span className={`inline-flex items-center mt-2 rounded-full px-3 py-1 text-xs font-semibold ${driverStatusMeta.badge}`}>
                                        {t(driverApplication.status)}
                                    </span>
                                )}
                            </div>
                        </div>
                        {driverStatusMeta && (
                            <p className="text-xs text-slate-500 border border-dashed border-accent-200 rounded-xl bg-white/60 px-3 py-2 text-start">
                                {driverStatusMeta.hint}
                            </p>
                        )}
                        <button
                            type="button"
                            onClick={() => handleUpgrade('driver')}
                            disabled={upgradeForm.processing}
                            className={`${accentButtonClass} mt-auto`}
                        >
                            {driverStatusMeta?.cta || t('upgrade_driver_cta')}
                            <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}

function ClockIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l2.5 2.5" />
            <circle cx="12" cy="12" r="9" />
        </svg>
    );
}

function CheckIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    );
}

function WalletIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18v10H3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 12h4" />
        </svg>
    );
}
