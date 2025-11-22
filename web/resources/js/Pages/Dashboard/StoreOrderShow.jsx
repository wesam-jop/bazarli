import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StoreLayout from './StoreLayout';
import { useTranslation } from '../../hooks/useTranslation';
import { useGeneralSettings } from '../../hooks/useGeneralSettings';
import { 
    Package, 
    MapPin, 
    User, 
    Phone, 
    Truck, 
    ArrowLeft,
    ShoppingBag,
    DollarSign,
    Calendar,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';

const statusColors = {
    pending_driver_approval: {
        badge: 'bg-amber-100 text-amber-800 border border-amber-200',
        labelKey: 'pending_driver_approval',
    },
    driver_accepted: {
        badge: 'bg-blue-100 text-blue-800 border border-blue-200',
        labelKey: 'driver_accepted',
    },
    driver_rejected: {
        badge: 'bg-rose-100 text-rose-800 border border-rose-200',
        labelKey: 'driver_rejected',
    },
    pending_store_approval: {
        badge: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
        labelKey: 'pending_store_approval',
    },
    store_approved: {
        badge: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
        labelKey: 'store_approved',
    },
    store_rejected: {
        badge: 'bg-rose-100 text-rose-800 border border-rose-200',
        labelKey: 'store_rejected',
    },
    store_preparing: {
        badge: 'bg-purple-100 text-purple-800 border border-purple-200',
        labelKey: 'store_preparing',
    },
    ready_for_delivery: {
        badge: 'bg-green-100 text-green-800 border border-green-200',
        labelKey: 'ready_for_delivery',
    },
    driver_picked_up: {
        badge: 'bg-cyan-100 text-cyan-800 border border-cyan-200',
        labelKey: 'driver_picked_up',
    },
    out_for_delivery: {
        badge: 'bg-orange-100 text-orange-800 border border-orange-200',
        labelKey: 'out_for_delivery',
    },
    delivered: {
        badge: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
        labelKey: 'delivered',
    },
    cancelled: {
        badge: 'bg-rose-100 text-rose-800 border border-rose-200',
        labelKey: 'cancelled',
    },
};

export default function StoreOrderShow({ order, store, orderStore }) {
    const { t, locale } = useTranslation();
    const { formatCurrency, formatDate, formatTime, formatDateTime } = useGeneralSettings();
    const status = statusColors[orderStore?.status || order.status] || statusColors.pending_driver_approval;

    const handleStartPreparing = () => {
        router.post(`/store-orders/${orderStore.id}/start-preparing`, {}, {
            preserveScroll: true,
        });
    };

    const handleFinishPreparing = () => {
        router.post(`/store-orders/${orderStore.id}/finish-preparing`, {}, {
            preserveScroll: true,
        });
    };

    const handleApprove = () => {
        router.post(`/store-orders/${orderStore.id}/approve`, {}, {
            preserveScroll: true,
        });
    };

    const handleReject = () => {
        if (!confirm(t('confirm_reject_order') || 'هل أنت متأكد من رفض هذا الطلب؟ سيتم إلغاء العملية وإرجاع المنتجات للمخزون.')) {
            return;
        }
        router.post(`/store-orders/${orderStore.id}/reject`, {}, {
            preserveScroll: true,
        });
    };

    return (
        <StoreLayout
            title={`${t('order_number') || 'Order #'} ${order.order_number}`}
            subtitle={t('view_order_details') || 'عرض تفاصيل الطلب'}
        >
            <Head title={`${t('order_number') || 'Order #'} ${order.order_number}`} />

            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href="/dashboard/store/orders"
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t('back_to_orders') || 'العودة إلى الطلبات'}
                    </Link>
                    <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${status.badge}`}>
                        <span className="w-2 h-2 rounded-full bg-current opacity-80" />
                        {t(status.labelKey) || order.status}
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
                            <p className="text-xs text-slate-500">{t('total') || 'المجموع'}</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {formatCurrency(order.total_amount)}
                            </p>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Customer Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2">
                                <div className="flex items-center gap-2 text-slate-500 text-xs uppercase">
                                    <User className="w-4 h-4" />
                                    {t('customer') || 'العميل'}
                                </div>
                                <p className="text-base font-semibold text-slate-900">
                                    {order.user?.name || t('guest') || 'ضيف'}
                                </p>
                                {order.user?.phone && (
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <Phone className="w-3.5 h-3.5" />
                                        {order.user.phone}
                                    </p>
                                )}
                                {order.customer_phone && (
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <Phone className="w-3.5 h-3.5" />
                                        {order.customer_phone}
                                    </p>
                                )}
                            </div>
                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2">
                                <div className="flex items-center gap-2 text-slate-500 text-xs uppercase">
                                    <MapPin className="w-4 h-4" />
                                    {t('delivery_address') || 'عنوان التوصيل'}
                                </div>
                                <p className="text-sm font-medium text-slate-900">{order.delivery_address}</p>
                                {order.delivery_latitude && order.delivery_longitude && (
                                    <p className="text-xs text-slate-500">
                                        {Number(order.delivery_latitude).toFixed(6)}, {Number(order.delivery_longitude).toFixed(6)}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Delivery Driver Information */}
                        {order.delivery_driver && (
                            <div className="rounded-2xl border border-slate-100 bg-white shadow-inner p-4 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {t('delivery_driver') || 'عامل التوصيل'}: {order.delivery_driver.name}
                                    </p>
                                    {order.delivery_driver.phone && (
                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                            <Phone className="w-3.5 h-3.5" />
                                            {order.delivery_driver.phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Order Items */}
                        <div className="rounded-2xl border border-slate-100 p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {t('order_items') || 'عناصر الطلب'}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {order.order_items?.length || 0} {t('items') || 'عنصر'}
                                    </p>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {order.order_items?.map((item, index) => (
                                    <div key={index} className="flex flex-wrap items-center justify-between py-3 gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                                <Package className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {item.product_name}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {t('quantity') || 'الكمية'}: {item.quantity} × {formatCurrency(item.product_price)}
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

                        {/* Order Summary */}
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">{t('subtotal') || 'المجموع الفرعي'}</span>
                                <span className="font-semibold text-slate-900">{formatCurrency(order.subtotal || 0)}</span>
                            </div>
                            {order.delivery_fee > 0 && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">{t('delivery_fee') || 'رسوم التوصيل'}</span>
                                    <span className="font-semibold text-slate-900">{formatCurrency(order.delivery_fee)}</span>
                                </div>
                            )}
                            <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
                                <span className="font-semibold text-slate-900">{t('total') || 'المجموع الكلي'}</span>
                                <span className="text-lg font-bold text-purple-600">{formatCurrency(order.total_amount)}</span>
                            </div>
                        </div>

                        {/* Notes */}
                        {order.notes && (
                            <div className="rounded-2xl border border-slate-100 bg-amber-50 p-4">
                                <p className="text-xs font-semibold text-amber-800 mb-1">{t('notes') || 'ملاحظات'}</p>
                                <p className="text-sm text-amber-900">{order.notes}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200">
                            {orderStore?.status === 'store_preparing' && (
                                <>
                                    <button
                                        onClick={handleFinishPreparing}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        {t('finish_preparing') || 'إنهاء التحضير'}
                                    </button>
                                </>
                            )}
                            {orderStore?.status === 'ready_for_delivery' && (
                                <>
                                    <button
                                        onClick={handleApprove}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        {t('approve_order') || 'الموافقة على الطلب'}
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        {t('reject_order') || 'رفض الطلب'}
                                    </button>
                                </>
                            )}
                            {(orderStore?.status === 'pending_store_approval' || orderStore?.status === 'store_preparing' || order.status === 'driver_accepted') && (
                                <>
                                    <button
                                        onClick={handleStartPreparing}
                                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                    >
                                        <Clock className="w-4 h-4" />
                                        {t('start_preparing') || 'بدء التحضير'}
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        {t('reject_order') || 'رفض الطلب'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
}

