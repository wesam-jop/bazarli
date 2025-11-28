import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CustomerLayout from '../Dashboard/CustomerLayout';
import { useTranslation } from '../../hooks/useTranslation';
import { useGeneralSettings } from '../../hooks/useGeneralSettings';
import { Package } from 'lucide-react';

export default function OrdersIndex({ orders }) {
    const { t, locale } = useTranslation();
    const { formatCurrency, formatDateTime } = useGeneralSettings();
    const hasOrders = orders?.data && orders.data.length > 0;

    const statusStyles = {
        pending: {
            badge: 'bg-warning-100 text-warning-700 border border-warning-200',
            label: t('pending'),
        },
        confirmed: {
            badge: 'bg-info-100 text-info-700 border border-info-200',
            label: t('confirmed'),
        },
        preparing: {
            badge: 'bg-primary-100 text-primary-700 border border-primary-200',
            label: t('preparing'),
        },
        on_delivery: {
            badge: 'bg-primary-100 text-primary-700 border border-primary-200',
            label: t('out_for_delivery'),
        },
        delivered: {
            badge: 'bg-success-100 text-success-700 border border-success-200',
            label: t('delivered'),
        },
        cancelled: {
            badge: 'bg-error-100 text-error-700 border border-error-200',
            label: t('cancelled'),
        },
    };

    const handleCancelOrder = (orderId) => {
        if (confirm(t('confirm_cancel_order'))) {
            router.post(
                `/orders/${orderId}/cancel`,
                {},
                {
                    preserveState: true,
                }
            );
        }
    };

    const renderPagination = () => {
        if (!(orders && Array.isArray(orders.links) && orders.links.length > 3)) {
            return null;
        }

        return (
            <div className="mt-10 flex justify-center">
                <nav className="flex flex-wrap gap-2">
                    {orders.links.map((link, index) => (
                        <Link
                            key={index}
                            href={link.url || '#'}
                            className={`px-4 py-2 text-sm font-medium rounded-xl border transition-colors ${
                                link.active
                                    ? 'bg-purple-600 text-white border-purple-600 shadow'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </nav>
            </div>
        );
    };

    return (
        <CustomerLayout
            title={t('my_orders') || t('orders')}
            subtitle={t('orders_page_subtitle') || 'Track every delivery from one place.'}
        >
            <Head title={t('my_orders') || 'Orders'} />

            <div className="space-y-6">
                {hasOrders ? (
                    <div className="space-y-6">
                        {orders.data.map((order) => {
                            const status = statusStyles[order.status] || statusStyles.pending;
                            return (
                                <div
                                    key={order.id}
                                    className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                                >
                                    <div className="p-6 space-y-6">
                                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-1">
                                                    {t('order_number') || 'Order number'}
                                                </p>
                                                <h3 className="text-2xl font-bold text-slate-900">
                                                    #{order.order_number}
                                                </h3>
                                                <p className="text-sm text-slate-500 mt-1">
                                                    {formatDateTime(order.created_at)}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span
                                                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${status.badge}`}
                                                >
                                                    <span className="w-2 h-2 rounded-full bg-current opacity-80" />
                                                    {status.label}
                                                </span>
                                                {order.status === 'pending' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCancelOrder(order.id)}
                                                        className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                                                    >
                                                        {t('cancel_order_button') || 'Cancel order'}
                                                    </button>
                                                )}
                                                <Link
                                                    href={`/orders/${order.id}`}
                                                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                                >
                                                    {t('view_details') || 'View details'}
                                                </Link>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                                    {t('store') || 'Store'}
                                                </p>
                                                <p className="mt-2 text-base font-semibold text-slate-900">
                                                    {order.store?.name || t('no_store_info')}
                                                </p>
                                            </div>
                                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                                    {t('delivery_address') || 'Delivery address'}
                                                </p>
                                                <p className="mt-2 text-sm font-medium text-slate-900">
                                                    {order.delivery_address}
                                                </p>
                                            </div>
                                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                                    {t('estimated_delivery') || 'ETA'}
                                                </p>
                                                <p className="mt-2 text-lg font-semibold text-purple-600">
                                                    {order.estimated_delivery_time
                                                        ? `${order.estimated_delivery_time} ${t('minutes') || 'min'}`
                                                        : t('not_specified')}
                                                </p>
                                            </div>
                                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                                    {t('total_spent')}
                                                </p>
                                                <p className="mt-2 text-2xl font-bold text-slate-900">
                                                    {formatCurrency(order.total_amount)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-slate-100 p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {t('order_items') || 'Order items'}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {t('items_count_label', { count: order.order_items?.length }) ||
                                                            `${order.order_items?.length || 0} items`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="divide-y divide-slate-100">
                                                {order.order_items?.map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex flex-wrap items-center justify-between py-3 gap-2"
                                                    >
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
                            );
                        })}

                        {renderPagination()}
                    </div>
                ) : (
                    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-white shadow flex items-center justify-center text-3xl">
                            <Package className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-2xl font-semibold text-slate-900">
                            {t('orders_empty_title') || t('no_orders_text') || 'No orders yet'}
                        </h3>
                        <p className="text-sm text-slate-500 max-w-lg mx-auto">
                            {t('orders_empty_description') || 'Start shopping to see your deliveries here.'}
                        </p>
                        <Link
                            href="/products"
                            className="inline-flex items-center justify-center rounded-2xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg"
                        >
                            {t('start_shopping_cta')}
                        </Link>
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
