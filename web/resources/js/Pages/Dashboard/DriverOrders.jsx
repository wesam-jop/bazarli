import React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import DriverLayout from './DriverLayout';
import { useTranslation } from '../../hooks/useTranslation';
import { useGeneralSettings } from '../../hooks/useGeneralSettings';
import {
    Truck,
    MapPin,
    Phone,
    DollarSign,
    Package,
    CheckCircle,
    Clock,
    ClipboardList,
} from 'lucide-react';

export default function DriverOrders({ pendingApprovalOrders = [], acceptedOrders = [], activeOrders = [], recentCompletedOrders = [] }) {
    const { t } = useTranslation();
    const { flash } = usePage().props;
    const { formatCurrency, formatDateTime } = useGeneralSettings();

    const handleComplete = (orderId) => {
        router.post(`/dashboard/driver/orders/${orderId}/complete`, {}, { preserveScroll: true });
    };

    return (
        <DriverLayout
            title={t('driver_orders_page_title') || t('driver_dashboard')}
            subtitle={t('driver_orders_page_subtitle') || t('driver_orders_page_title')}
        >
            <Head title={t('driver_orders_page_title') || 'Driver orders'} />

            <div className="space-y-6">
                {(flash?.success || flash?.error) && (
                    <div
                        className={`rounded-2xl border p-4 text-sm ${
                            flash.success
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-rose-200 bg-rose-50 text-rose-700'
                        }`}
                    >
                        {flash.success || flash.error}
                    </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <Card title={t('available_orders')} count={pendingApprovalOrders.length} icon={ClipboardList}>
                        {pendingApprovalOrders.length ? (
                            <div className="space-y-4">
                                {pendingApprovalOrders.map((order) => (
                                    <OrderCard
                                        key={order.id}
                                        order={order}
                                        formatCurrency={formatCurrency}
                                        formatDateTime={formatDateTime}
                                        t={t}
                                        primaryActionLabel={t('accept_order')}
                                        primaryActionVariant="primary"
                                        onPrimaryAction={() => router.post(`/dashboard/driver/orders/${order.id}/accept`, {}, { preserveScroll: true })}
                                        showSecondary={false}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={Package}
                                label={t('no_available_orders') || 'No orders waiting right now'}
                            />
                        )}
                    </Card>

                    <Card title={t('assigned_orders')} count={activeOrders.length} icon={Truck}>
                        {activeOrders.length ? (
                            <div className="space-y-4">
                                {activeOrders.map((order) => (
                                    <OrderCard
                                        key={order.id}
                                        order={order}
                                        formatCurrency={formatCurrency}
                                        formatDateTime={formatDateTime}
                                        t={t}
                                        badge={{
                                            label: order.status === 'out_for_delivery' ? t('out_for_delivery') : t(order.status),
                                            tone: order.status === 'out_for_delivery' ? 'warning' : 'info',
                                        }}
                                        primaryActionLabel={t('confirm_delivery')}
                                        primaryActionVariant="success"
                                        onPrimaryAction={() => handleComplete(order.id)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={Truck}
                                label={t('no_assigned_orders') || 'No assigned orders yet'}
                            />
                        )}
                    </Card>
                </div>

                {acceptedOrders.length > 0 && (
                    <Card title={t('accepted_orders') || 'الطلبات المقبولة'} count={acceptedOrders.length} icon={CheckCircle}>
                        <div className="space-y-4">
                            {acceptedOrders.map((order) => {
                                // عرض زر إنهاء الطلب فقط للطلبات الجاهزة للتسليم
                                const canComplete = ['store_approved', 'ready_for_delivery'].includes(order.status);
                                return (
                                    <OrderCard
                                        key={order.id}
                                        order={order}
                                        formatCurrency={formatCurrency}
                                        formatDateTime={formatDateTime}
                                        t={t}
                                        badge={{
                                            label: t(order.status) || order.status,
                                            tone: 'info',
                                        }}
                                        primaryActionLabel={canComplete ? (t('complete_order') || 'إنهاء الطلب') : undefined}
                                        primaryActionVariant={canComplete ? 'success' : undefined}
                                        onPrimaryAction={canComplete ? () => handleComplete(order.id) : undefined}
                                        showSecondary={true}
                                    />
                                );
                            })}
                        </div>
                    </Card>
                )}

                <Card title={t('driver_recent_deliveries')} count={recentCompletedOrders.length} icon={CheckCircle}>
                    {recentCompletedOrders.length ? (
                        <div className="space-y-3">
                            {recentCompletedOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">#{order.order_number}</p>
                                        <p className="text-xs text-slate-500">{order.store?.name}</p>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {formatCurrency(order.total_amount)}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {order.delivered_at ? formatDateTime(order.delivered_at) : '--'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState icon={CheckCircle} label={t('driver_no_completed_orders')} />
                    )}
                </Card>
            </div>
        </DriverLayout>
    );
}

function Card({ title, count, icon: Icon, children }) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                </div>
                {typeof count === 'number' && (
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-400">{count}</span>
                )}
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

function OrderCard({
    order,
    formatCurrency,
    formatDateTime,
    t,
    badge,
    primaryActionLabel,
    primaryActionVariant,
    onPrimaryAction,
    showSecondary = true,
}) {
    const badgeTone = badge?.tone || 'info';
    const badgeClass = {
        info: 'bg-blue-100 text-blue-700',
        warning: 'bg-amber-100 text-amber-700',
        success: 'bg-emerald-100 text-emerald-700',
    }[badgeTone];

    const buttonClass =
        primaryActionVariant === 'success'
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white';

    return (
        <div className="rounded-2xl border border-slate-200 p-4 hover:border-blue-200 hover:shadow-sm transition space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h4 className="text-base font-semibold text-slate-900">#{order.order_number}</h4>
                    <p className="text-sm text-slate-500">{order.store?.name}</p>
                </div>
                {badge && (
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
                        {badge.label}
                    </span>
                )}
            </div>

            <div className="space-y-2 text-sm text-slate-600">
                <InfoRow icon={MapPin} text={order.delivery_address} />
                <InfoRow icon={Phone} text={order.customer_phone} />
                <InfoRow icon={DollarSign} text={formatCurrency(order.total_amount)} />
                {order.created_at && (
                    <InfoRow icon={Clock} text={formatDateTime(order.created_at)} />
                )}
            </div>

            {(onPrimaryAction || showSecondary) && (
                <div className="flex flex-col gap-2 sm:flex-row">
                    {onPrimaryAction && primaryActionLabel && (
                        <button
                            type="button"
                            onClick={onPrimaryAction}
                            className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold shadow ${buttonClass}`}
                        >
                            {primaryActionLabel}
                        </button>
                    )}
                    {showSecondary && (
                        <button
                            type="button"
                            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                        >
                            {t('view_details')}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

function InfoRow({ icon: Icon, text }) {
    if (!text) return null;
    return (
        <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-slate-400" />
            <span>{text}</span>
        </div>
    );
}

function EmptyState({ icon: Icon, label }) {
    return (
        <div className="text-center py-10 text-slate-500">
            <Icon className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            {label}
        </div>
    );
}

