import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useTranslation } from '../../hooks/useTranslation';
import { useGeneralSettings } from '../../hooks/useGeneralSettings';
import StoreLayout from './StoreLayout';
import {
    Store as StoreIcon,
    ShoppingBag,
    Clock,
    Receipt,
    DollarSign,
    Package,
    Layers,
    Settings,
    Plus,
    Upload,
    ChevronDown,
} from 'lucide-react';

export default function StoreDashboard({
    store,
    stats,
    recentOrders,
    topProducts,
    dailySales,
    productCategories,
    storeProducts,
    productUnits,
}) {
    const { flash } = usePage().props;
    const { t, locale } = useTranslation();
    const isRTL = locale === 'ar';
    const { formatCurrency, formatDate } = useGeneralSettings();

    const productForm = useForm({
        name: '',
        category_id: productCategories[0]?.id || '',
        price: '',
        unit: 'piece',
        description: '',
        image: null,
    });

    const handleProductSubmit = (e) => {
        e.preventDefault();
        productForm.post('/dashboard/store/products', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                productForm.reset('name', 'price', 'unit', 'description', 'image');
            },
        });
    };

    const handleProductImageChange = (event) => {
        productForm.setData('image', event.target.files[0]);
    };

    const statCards = [
        {
            label: t('store_stats_orders'),
            value: stats.total_orders,
            icon: ShoppingBag,
            accent: 'from-primary-500/20 to-primary-500/5 text-primary-700',
            iconBg: 'bg-primary-100 text-primary-600',
        },
        {
            label: t('store_stats_pending'),
            value: stats.pending_orders,
            icon: Clock,
            accent: 'from-amber-500/20 to-amber-500/5 text-amber-700',
            iconBg: 'bg-amber-100 text-amber-600',
        },
        {
            label: t('store_stats_preparing'),
            value: stats.preparing_orders,
            icon: Receipt,
            accent: 'from-blue-500/20 to-blue-500/5 text-blue-700',
            iconBg: 'bg-blue-100 text-blue-600',
        },
        {
            label: t('store_stats_revenue'),
            value: formatCurrency(stats.total_revenue),
            icon: DollarSign,
            accent: 'from-emerald-500/20 to-emerald-500/5 text-emerald-700',
            iconBg: 'bg-emerald-100 text-emerald-600',
        },
    ];

    const quickActions = [
        {
            label: t('store_orders_page_title'),
            href: '/dashboard/store/orders',
            icon: ShoppingBag,
            accent: 'from-blue-500/20 to-blue-500/5 text-blue-700',
        },
        {
            label: t('store_products_section_title'),
            href: '/dashboard/store/products/manage',
            icon: Package,
            accent: 'from-emerald-500/20 to-emerald-500/5 text-emerald-700',
        },
        {
            label: t('categories'),
            href: '/categories',
            icon: Layers,
            accent: 'from-primary-500/20 to-primary-500/5 text-primary-700',
        },
        {
            label: t('store_setup_title'),
            href: '/dashboard/store/setup',
            icon: Settings,
            accent: 'from-amber-500/20 to-amber-500/5 text-amber-700',
        },
    ];

    const orderStatusClasses = {
        pending: 'bg-amber-100 text-amber-800',
        preparing: 'bg-indigo-100 text-indigo-800',
        delivered: 'bg-emerald-100 text-emerald-800',
    };

    const orderStatusLabel = (status) => {
        switch (status) {
            case 'pending':
                return t('pending');
            case 'preparing':
                return t('preparing');
            case 'delivered':
                return t('delivered');
            default:
                return status;
        }
    };

    return (
        <StoreLayout title={store.name} subtitle={t('store_dashboard_overview')}>
            <>
                <Head title={t('store_dashboard')} />

                <div className="space-y-8">
                    {/* Flash Messages */}
                    {(flash?.success || flash?.error) && (
                        <div
                            className={`rounded-xl border p-4 text-sm text-start ${
                                flash.success
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                    : 'border-rose-200 bg-rose-50 text-rose-700'
                            }`}
                        >
                            {flash.success || flash.error}
                        </div>
                    )}

                    {/* Store Header */}
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="text-start">
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{t('store_dashboard')}</p>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{store.name}</h1>
                            <p className="text-sm text-slate-500">{store.address}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <span
                                className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${
                                    store.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                }`}
                            >
                                {store.is_active ? t('store_status_active') : t('store_status_inactive')}
                            </span>
                            <Link
                                href="/dashboard/store/profile"
                                className="inline-flex items-center rounded-xl border border-primary-200 bg-white px-4 py-2 text-sm font-semibold text-primary-600 shadow-sm hover:bg-primary-50 transition-all"
                            >
                                {t('profile')}
                            </Link>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {statCards.map(({ label, value, icon: Icon, accent, iconBg }) => (
                            <div key={label} className={`rounded-xl border border-slate-200 bg-gradient-to-br ${accent} p-4 shadow-sm`}>
                                <div className="flex items-center justify-between">
                                    <div className="text-start">
                                        <p className="text-xs uppercase tracking-widest text-slate-500">{label}</p>
                                        <p className="mt-3 text-2xl sm:text-3xl font-semibold text-slate-900">{value}</p>
                                    </div>
                                    <div className={`rounded-xl ${iconBg} shadow-sm p-3`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add Product & Products List */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* Add Product Form */}
                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
                            <div className="text-start">
                                <h3 className="text-lg font-semibold text-slate-900">{t('store_products_section_title')}</h3>
                                <p className="text-sm text-slate-500">{t('store_products_section_subtitle')}</p>
                            </div>
                            <form className="space-y-4" onSubmit={handleProductSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2 text-start">
                                            {t('store_product_name_label')}
                                        </label>
                                        <input
                                            type="text"
                                            value={productForm.data.name}
                                            onChange={(e) => productForm.setData('name', e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all"
                                        />
                                        {productForm.errors.name && (
                                            <p className="mt-1 text-xs text-rose-600 text-start">{productForm.errors.name}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2 text-start">
                                            {t('store_product_category_label')}
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={productForm.data.category_id}
                                                onChange={(e) => productForm.setData('category_id', e.target.value)}
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 pe-10 text-sm text-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white appearance-none cursor-pointer transition-all"
                                            >
                                                {productCategories.map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute inset-y-0 end-0 pe-3 flex items-center pointer-events-none">
                                                <ChevronDown className="h-4 w-4 text-slate-400" />
                                            </div>
                                        </div>
                                        {productForm.errors.category_id && (
                                            <p className="mt-1 text-xs text-rose-600 text-start">{productForm.errors.category_id}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2 text-start">
                                            {t('store_product_price_label')}
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            dir="ltr"
                                            value={productForm.data.price}
                                            onChange={(e) => productForm.setData('price', e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white text-left transition-all"
                                        />
                                        {productForm.errors.price && (
                                            <p className="mt-1 text-xs text-rose-600 text-start">{productForm.errors.price}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2 text-start">
                                            {t('store_product_unit_label')}
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={productForm.data.unit}
                                                onChange={(e) => productForm.setData('unit', e.target.value)}
                                                className="w-full px-4 py-3 pe-10 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white appearance-none cursor-pointer transition-all"
                                            >
                                                {productUnits?.map((unit) => (
                                                    <option key={unit.value} value={unit.value}>
                                                        {unit.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute inset-y-0 end-0 pe-3 flex items-center pointer-events-none">
                                                <ChevronDown className="h-4 w-4 text-slate-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 text-start">
                                        {t('store_product_description_label')}
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={productForm.data.description}
                                        onChange={(e) => productForm.setData('description', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white resize-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 text-start">
                                        {t('store_product_image_label')}
                                    </label>
                                    <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all">
                                        <div className="p-3 rounded-xl bg-primary-50 text-primary-600 mb-3">
                                            <Upload className="h-6 w-6" />
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700">
                                            {productForm.data.image ? productForm.data.image.name : t('store_logo_placeholder')}
                                        </span>
                                        <span className="text-xs text-slate-500 mt-1">{t('store_logo_hint')}</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleProductImageChange} />
                                    </label>
                                    {productForm.errors.image && (
                                        <p className="mt-1 text-xs text-rose-600 text-start">{productForm.errors.image}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={productForm.processing}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 hover:bg-primary-600/90 disabled:opacity-50 transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                    {productForm.processing ? t('store_submit_processing') : t('store_product_submit')}
                                </button>
                            </form>
                        </div>

                        {/* Products List */}
                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-slate-900 text-start">{t('store_products_list_title')}</h3>
                                <Link
                                    href="/dashboard/store/products/manage"
                                    className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                                >
                                    {t('store_view_products_cta')}
                                </Link>
                            </div>
                            {storeProducts.length > 0 ? (
                                <div className="space-y-3">
                                    {storeProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 hover:bg-slate-100/50 transition-colors"
                                        >
                                            {/* Product Image */}
                                            {product.image ? (
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-12 h-12 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 flex-shrink-0">
                                                    <Package className="w-5 h-5 text-slate-400" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0 text-start">
                                                <p className="font-semibold text-slate-900 truncate">{product.name}</p>
                                                <p className="text-xs text-slate-500">{product.category?.name}</p>
                                            </div>
                                            <div className="text-end flex-shrink-0">
                                                <p className="text-sm font-semibold text-primary-600" dir="ltr">
                                                    {formatCurrency(product.price)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 text-center py-6">{t('store_products_list_empty')}</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Orders & Top Products */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Orders */}
                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-6 py-5">
                                <h3 className="text-lg font-semibold text-slate-900 text-start">{t('store_recent_orders_title')}</h3>
                            </div>
                            <div className="p-6">
                                {recentOrders.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentOrders.map((order) => (
                                            <div
                                                key={order.id}
                                                className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4"
                                            >
                                                <div className="text-start">
                                                    <p className="font-semibold text-slate-900">#{order.order_number}</p>
                                                    <p className="text-sm text-slate-500">{order.user?.name}</p>
                                                    <p className="text-xs text-slate-400">
                                                        {formatDate(order.created_at)}
                                                    </p>
                                                </div>
                                                <div className="text-end">
                                                    <p className="font-bold text-primary-600" dir="ltr">
                                                        {formatCurrency(order.total_amount)}
                                                    </p>
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                                            orderStatusClasses[order.status] || 'bg-slate-100 text-slate-700'
                                                        }`}
                                                    >
                                                        {orderStatusLabel(order.status)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 text-center py-6">{t('store_recent_orders_empty')}</p>
                                )}
                            </div>
                        </div>

                        {/* Top Products */}
                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-6 py-5">
                                <h3 className="text-lg font-semibold text-slate-900 text-start">{t('store_top_products_title')}</h3>
                            </div>
                            <div className="p-6">
                                {topProducts.length > 0 ? (
                                    <div className="space-y-4">
                                        {topProducts.map((product, index) => (
                                            <div
                                                key={product.id}
                                                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">
                                                        {index + 1}
                                                    </span>
                                                    <div className="text-start">
                                                        <p className="font-semibold text-slate-900">{product.name}</p>
                                                        <p className="text-xs text-slate-500">{product.category?.name}</p>
                                                    </div>
                                                </div>
                                                <div className="text-end">
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {product.order_count} {t('orders')}
                                                    </p>
                                                    <p className="text-xs text-slate-500" dir="ltr">
                                                        {formatCurrency(product.price)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 text-center py-6">{t('store_top_products_empty')}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Daily Sales */}
                    {dailySales.length > 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-slate-900 text-start">{t('store_daily_sales_title')}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {dailySales.map((sale, index) => (
                                    <div key={index} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-center">
                                        <p className="text-lg font-semibold text-primary-600" dir="ltr">
                                            {formatCurrency(sale.total_amount)}
                                        </p>
                                        <p className="text-xs text-slate-500 mb-2">
                                            {sale.orders_count} {t('orders')}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {formatDate(sale.date)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4 text-start">{t('store_quick_actions_title')}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {quickActions.map(({ label, href, icon: Icon, accent }) => (
                                <Link
                                    key={label}
                                    href={href}
                                    className={`flex items-center gap-3 rounded-xl border border-slate-100 bg-gradient-to-br ${accent} p-4 text-slate-900 hover:shadow-md transition-all`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="font-semibold text-sm">{label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </>
        </StoreLayout>
    );
}
