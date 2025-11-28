import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '../Dashboard/CustomerLayout';
import { useTranslation } from '../../hooks/useTranslation';
import { useGeneralSettings } from '../../hooks/useGeneralSettings';
import { Package, MapPin, Store as StoreIcon, Phone, Truck, ArrowLeft } from 'lucide-react';

const statusColors = {
    pending: {
        badge: 'bg-warning-100 text-warning-800 border border-warning-200',
        labelKey: 'pending',
    },
    confirmed: {
        badge: 'bg-info-100 text-info-800 border border-info-200',
        labelKey: 'confirmed',
    },
    preparing: {
        badge: 'bg-primary-100 text-primary-800 border border-primary-200',
        labelKey: 'preparing',
    },
    on_delivery: {
        badge: 'bg-primary-100 text-primary-800 border border-primary-200',
        labelKey: 'out_for_delivery',
    },
    delivered: {
        badge: 'bg-success-100 text-success-800 border border-success-200',
        labelKey: 'delivered',
    },
    cancelled: {
        badge: 'bg-error-100 text-error-800 border border-error-200',
        labelKey: 'cancelled',
    },
};

export default function OrderShow({ order }) {
    const { t, locale } = useTranslation();
    const { formatCurrency, formatDateTime } = useGeneralSettings();
    const status = statusColors[order.status] || statusColors.pending;

    return (
        <CustomerLayout
            title={`${t('order_number') || 'Order #'} ${order.order_number}`}
            subtitle={t('view_details') || 'View details'}
        >
            <Head title={`${t('order_number') || 'Order #'} ${order.order_number}`} />

            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href="/orders"
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t('back_to_orders') || 'Back to orders'}
                    </Link>
                    <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${status.badge}`}>
                        <span className="w-2 h-2 rounded-full bg-current opacity-80" />
                        {t(status.labelKey)}
                    </span>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-slate-100 px-6 py-5 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-1">
                                {t('order_number') || 'Order number'}
                            </p>
                            <h1 className="text-2xl font-bold text-slate-900">
                                #{order.order_number}
                            </h1>
                            <p className="text-sm text-slate-500">
                                {formatDateTime(order.created_at)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500">{t('total_spent') || 'Total amount'}</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {formatCurrency(order.total_amount)}
                            </p>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2">
                                <div className="flex items-center gap-2 text-slate-500 text-xs uppercase">
                                    <StoreIcon className="w-4 h-4" />
                                    {t('store') || 'Store'}
                                </div>
                                <p className="text-base font-semibold text-slate-900">
                                    {order.store?.name || t('no_store_info')}
                                </p>
                                {order.store?.phone && (
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <Phone className="w-3.5 h-3.5" />
                                        {order.store.phone}
                                    </p>
                                )}
                            </div>
                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2">
                                <div className="flex items-center gap-2 text-slate-500 text-xs uppercase">
                                    <MapPin className="w-4 h-4" />
                                    {t('delivery_address') || 'Delivery address'}
                                </div>
                                <p className="text-sm font-medium text-slate-900">{order.delivery_address}</p>
                                <p className="text-xs text-slate-500">
                                    {Number(order.delivery_latitude).toFixed(4)}, {Number(order.delivery_longitude).toFixed(4)}
                                </p>
                            </div>
                        </div>

                        {order.delivery_driver && (
                            <div className="rounded-2xl border border-slate-100 bg-white shadow-inner p-4 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {order.delivery_driver.name}
                                    </p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <Phone className="w-3.5 h-3.5" />
                                        {order.delivery_driver.phone}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="rounded-2xl border border-slate-100 p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {t('order_items') || 'Order items'}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {t('items_count_label', { count: order.order_items?.length }) ||
                                            `${order.order_items?.length || 0} items`}
                                    </p>
                                </div>
                                <div className="text-right text-sm font-semibold text-slate-700">
                                    {t('total')}
                                </div>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {order.order_items?.map((item, index) => (
                                    <div key={index} className="flex flex-wrap items-center justify-between py-3 gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-xl">
                                                {item.product?.icon || <Package className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {item.product_name}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {t('quantity')}: {item.quantity}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-900">
                                            {formatCurrency(item.total_price)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}

