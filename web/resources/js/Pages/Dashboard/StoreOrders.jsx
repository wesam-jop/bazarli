import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StoreLayout from './StoreLayout';
import { useTranslation } from '../../hooks/useTranslation';
import { useGeneralSettings } from '../../hooks/useGeneralSettings';
import { ShoppingBag, User, Calendar, DollarSign, Eye } from 'lucide-react';

export default function StoreOrders({ store, orders, stats, filters }) {
    const { t } = useTranslation();
    const { formatCurrency, formatDate, formatTime } = useGeneralSettings();

    const statusOptions = [
        { value: 'all', label: t('all') || 'All' },
        { value: 'pending', label: t('pending') },
        { value: 'confirmed', label: t('confirmed') },
        { value: 'preparing', label: t('preparing') },
        { value: 'ready', label: t('ready') },
        { value: 'on_delivery', label: t('on_delivery') },
        { value: 'delivered', label: t('delivered') },
        { value: 'cancelled', label: t('cancelled') },
    ];

    const handleStatusChange = (event) => {
        router.get(
            '/dashboard/store/orders',
            { status: event.target.value },
            { preserveState: true, replace: true }
        );
    };

    const statusBadge = (status) => {
        const map = {
            pending: 'bg-amber-100 text-amber-700',
            confirmed: 'bg-blue-100 text-blue-700',
            preparing: 'bg-indigo-100 text-indigo-700',
            ready: 'bg-slate-100 text-slate-700',
            on_delivery: 'bg-orange-100 text-orange-700',
            out_for_delivery: 'bg-orange-100 text-orange-700',
            delivered: 'bg-emerald-100 text-emerald-700',
            cancelled: 'bg-rose-100 text-rose-700',
        };
        return map[status] || 'bg-slate-100 text-slate-600';
    };

    return (
        <StoreLayout
            title={t('store_orders_page_title') || 'Store Orders'}
            subtitle={t('store_orders_page_subtitle', { store: store.name }) || ''}
        >
            <Head title={t('store_orders_page_title') || 'Store Orders'} />

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <StatCard label={t('total_orders')} value={stats.total} accent="from-purple-500 to-purple-600" />
                    <StatCard label={t('pending')} value={stats.pending} accent="from-amber-500 to-amber-600" />
                    <StatCard label={t('preparing')} value={stats.preparing} accent="from-indigo-500 to-indigo-600" />
                    <StatCard label={t('on_delivery')} value={stats.on_delivery} accent="from-orange-500 to-orange-600" />
                    <StatCard label={t('delivered')} value={stats.delivered} accent="from-emerald-500 to-emerald-600" />
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold text-slate-900">{t('store_orders_filter_label') || 'Filter orders'}</p>
                        <p className="text-xs text-slate-500">{t('store_orders_filter_hint') || 'Filter by status to focus on a specific queue.'}</p>
                    </div>
                    <select
                        value={filters?.status || 'all'}
                        onChange={handleStatusChange}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50">
                            <tr>
                                <Th>{t('order_number')}</Th>
                                <Th>{t('customer') || 'Customer'}</Th>
                                <Th>{t('status')}</Th>
                                <Th>{t('total')}</Th>
                                <Th>{t('created_at')}</Th>
                                <Th>{t('actions') || 'الإجراءات'}</Th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {orders.data.length ? (
                                orders.data.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50">
                                        <Td>
                                            <div className="flex items-center gap-2 text-slate-900 font-semibold">
                                                <ShoppingBag className="w-4 h-4 text-purple-500" />
                                                <span>{order.order_number}</span>
                                            </div>
                                        </Td>
                                        <Td>
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <User className="w-4 h-4 text-slate-400" />
                                                <span>{order.customer_name || t('guest')}</span>
                                            </div>
                                        </Td>
                                        <Td>
                                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(order.status)}`}>
                                                {t(order.status) || order.status}
                                            </span>
                                        </Td>
                                        <Td>
                                            <div className="flex items-center gap-1 text-slate-900 font-semibold">
                                                <DollarSign className="w-4 h-4 text-emerald-500" />
                                                <span>{formatCurrency(order.total_amount)}</span>
                                            </div>
                                        </Td>
                                        <Td>
                                            <div className="text-sm text-slate-500">
                                                <p>{formatDate(order.created_at)}</p>
                                                <p className="text-xs">{formatTime(order.created_at)}</p>
                                            </div>
                                        </Td>
                                        <Td>
                                            <Link
                                                href={`/dashboard/store/orders/${order.id}`}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                                {t('view_details') || 'عرض التفاصيل'}
                                            </Link>
                                        </Td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                                        {t('store_orders_empty') || 'No orders for your store yet.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {orders.links && orders.links.length > 1 && (
                    <div className="flex flex-wrap gap-2">
                        {orders.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`px-3 py-1.5 text-sm rounded-lg border ${
                                    link.active ? 'bg-purple-600 text-white border-purple-600' : 'text-slate-600 border-slate-200 hover:bg-slate-50'
                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </StoreLayout>
    );
}

function StatCard({ label, value, accent }) {
    return (
        <div className={`rounded-2xl bg-gradient-to-br ${accent} text-white shadow-sm p-4`}>
            <p className="text-xs uppercase tracking-widest">{label}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
    );
}

function Th({ children }) {
    return (
        <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {children}
        </th>
    );
}

function Td({ children }) {
    return <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{children}</td>;
}

