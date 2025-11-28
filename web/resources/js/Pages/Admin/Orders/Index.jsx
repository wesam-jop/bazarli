import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../Layout';
import { useTranslation } from '../../../hooks/useTranslation';
import { useGeneralSettings } from '../../../hooks/useGeneralSettings';
import { 
    ShoppingCart, 
    Search, 
    Filter,
    Eye,
    Edit,
    CheckCircle,
    XCircle,
    Clock,
    Package,
    Calendar,
    Phone,
    MapPin,
    User,
    Store,
    Truck,
    DollarSign,
    Download,
    MoreVertical
} from 'lucide-react';

const getStatusBadge = (status, t) => {
    const statusConfig = {
        pending: { bg: 'bg-warning-50', text: 'text-warning-700', border: 'border-warning-200', icon: Clock, label: t('pending') || 'Pending' },
        confirmed: { bg: 'bg-info-50', text: 'text-info-700', border: 'border-info-200', icon: CheckCircle, label: t('confirmed') || 'Confirmed' },
        preparing: { bg: 'bg-primary-50', text: 'text-primary-700', border: 'border-primary-200', icon: Package, label: t('preparing') || 'Preparing' },
        on_delivery: { bg: 'bg-primary-50', text: 'text-primary-700', border: 'border-primary-200', icon: Truck, label: t('on_delivery') || 'On Delivery' },
        delivered: { bg: 'bg-success-50', text: 'text-success-700', border: 'border-success-200', icon: CheckCircle, label: t('delivered') || 'Delivered' },
        cancelled: { bg: 'bg-error-50', text: 'text-error-700', border: 'border-error-200', icon: XCircle, label: t('cancelled') || 'Cancelled' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm ${config.bg} ${config.text} ${config.border} border`}>
            <Icon className="w-3.5 h-3.5" />
            <span>{config.label}</span>
        </span>
    );
};

export default function Orders({ orders, stats }) {
    const { t } = useTranslation();
    const { formatCurrency, formatDate, formatTime } = useGeneralSettings();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const filteredOrders = orders?.filter(order => {
        const matchesSearch = 
            order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer_phone?.includes(searchTerm) ||
            order.delivery_address?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = 
            filterStatus === 'all' ||
            order.status === filterStatus;
        
        return matchesSearch && matchesFilter;
    }) || [];

    return (
        <AdminLayout title={t('orders')}>
            <Head title={t('orders')} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">{t('orders')}</h2>
                        <p className="text-slate-600 mt-2">{t('manage_orders') || 'Manage all customer orders'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm">
                            <Download className="w-4 h-4" />
                            <span className="font-medium">{t('export') || 'Export'}</span>
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6 hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-700">{t('total_orders') || 'Total Orders'}</p>
                                <p className="text-3xl font-bold text-blue-900 mt-2">{stats?.total || 0}</p>
                                <p className="text-xs text-blue-600 mt-1">{t('all_orders') || 'All orders'}</p>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <ShoppingCart className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-sm border border-yellow-200 p-6 hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-yellow-700">{t('pending') || 'Pending'}</p>
                                <p className="text-3xl font-bold text-yellow-900 mt-2">{stats?.pending || 0}</p>
                                <p className="text-xs text-yellow-600 mt-1">{t('awaiting') || 'Awaiting'}</p>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Clock className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6 hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-700">{t('confirmed') || 'Confirmed'}</p>
                                <p className="text-3xl font-bold text-blue-900 mt-2">{stats?.confirmed || 0}</p>
                                <p className="text-xs text-blue-600 mt-1">{t('confirmed_orders') || 'Confirmed'}</p>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <CheckCircle className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm border border-purple-200 p-6 hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-700">{t('preparing') || 'Preparing'}</p>
                                <p className="text-3xl font-bold text-purple-900 mt-2">{stats?.preparing || 0}</p>
                                <p className="text-xs text-purple-600 mt-1">{t('in_preparation') || 'In preparation'}</p>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Package className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm border border-orange-200 p-6 hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-700">{t('on_delivery') || 'On Delivery'}</p>
                                <p className="text-3xl font-bold text-orange-900 mt-2">{stats?.on_delivery || 0}</p>
                                <p className="text-xs text-orange-600 mt-1">{t('out_for_delivery') || 'Out for delivery'}</p>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Truck className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-6 hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-700">{t('delivered') || 'Delivered'}</p>
                                <p className="text-3xl font-bold text-green-900 mt-2">{stats?.delivered || 0}</p>
                                <p className="text-xs text-green-600 mt-1">{t('completed') || 'Completed'}</p>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <CheckCircle className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl shadow-sm border border-emerald-200 p-6 hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-emerald-700">{t('total_revenue') || 'Revenue'}</p>
                                <p className="text-2xl font-bold text-emerald-900 mt-2">
                                    {formatCurrency(stats?.total_revenue || 0)}
                                </p>
                                <p className="text-xs text-emerald-600 mt-1">{t('total_earnings') || 'Total earnings'}</p>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <DollarSign className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                <Search className="w-5 h-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={t('search_orders') || 'Search by order number, customer name, phone, or address...'}
                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
                                <Filter className="w-4 h-4 text-slate-500" />
                                <span className="text-sm font-medium text-slate-700">{t('filter') || 'Filter'}</span>
                            </div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm font-medium text-slate-700 min-w-[150px]"
                            >
                                <option value="all">{t('all') || 'All'}</option>
                                <option value="pending">{t('pending') || 'Pending'}</option>
                                <option value="confirmed">{t('confirmed') || 'Confirmed'}</option>
                                <option value="preparing">{t('preparing') || 'Preparing'}</option>
                                <option value="on_delivery">{t('on_delivery') || 'On Delivery'}</option>
                                <option value="delivered">{t('delivered') || 'Delivered'}</option>
                                <option value="cancelled">{t('cancelled') || 'Cancelled'}</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        {t('order_number') || 'Order #'}
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        {t('customer') || 'Customer'}
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        {t('store') || 'Store'}
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        {t('amount') || 'Amount'}
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        {t('status') || 'Status'}
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        {t('date') || 'Date'}
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        {t('actions') || 'Actions'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {filteredOrders.length > 0 ? (
                                    filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50/50 transition-all duration-150 group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                                                        <ShoppingCart className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-900">
                                                            {order.order_number || `#${order.id}`}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            {order.orderItems?.length || 0} {t('items') || 'items'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-2">
                                                    {order.user && (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                                                <User className="w-4 h-4 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-slate-900">{order.user.name}</div>
                                                                {order.customer_phone && (
                                                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                                                        <Phone className="w-3 h-3" />
                                                                        {order.customer_phone}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {order.delivery_address && (
                                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                                            <MapPin className="w-3 h-3" />
                                                            <span className="truncate max-w-xs">{order.delivery_address}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {order.store ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                                                            <Store className="w-4 h-4 text-green-600" />
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-900">{order.store.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
                                                        <DollarSign className="w-4 h-4 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-900">
                                                            {formatCurrency(order.total_amount || 0)}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            {t('total') || 'Total'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(order.status, t)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center">
                                                        <Calendar className="w-4 h-4 text-slate-600" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-slate-900">
                                                            {formatDate(order.created_at)}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            {formatTime(order.created_at)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <Link
                                                        href={`/admin/orders/${order.id}`}
                                                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 group/action"
                                                        title={t('view') || 'View'}
                                                    >
                                                        <Eye className="w-4 h-4 group-hover/action:scale-110 transition-transform" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                                    <ShoppingCart className="w-10 h-10 text-slate-400" />
                                                </div>
                                                <p className="text-slate-600 font-medium mb-1">{t('no_orders_found') || 'No orders found'}</p>
                                                <p className="text-sm text-slate-400">{t('try_different_search') || 'Try adjusting your search or filter criteria'}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Results Count */}
                {filteredOrders.length > 0 && (
                    <div className="text-center text-sm text-slate-600">
                        {t('showing_results') || 'Showing'} {filteredOrders.length} {t('of') || 'of'} {orders?.length || 0} {t('orders') || 'orders'}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

