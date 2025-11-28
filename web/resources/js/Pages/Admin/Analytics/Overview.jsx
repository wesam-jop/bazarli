import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../Layout';
import { useTranslation } from '../../../hooks/useTranslation';
import { 
    BarChart3, 
    Users, 
    ShoppingCart, 
    Package, 
    Store, 
    DollarSign,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle,
    XCircle,
    Truck,
    Activity,
    Calendar,
    Download,
    RefreshCw,
    Eye,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

export default function AnalyticsOverview({ 
    stats, 
    dailyOrders, 
    monthlyRevenue, 
    ordersByStatus, 
    topProducts, 
    topStores, 
    userGrowth,
    recentOrders 
}) {
    const { t } = useTranslation();
    const [timeRange, setTimeRange] = useState('30d');

    const formatCurrency = (amount) => {
        return parseFloat(amount || 0).toFixed(2);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ar-SA', {
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-warning-100 text-warning-700 border-warning-200',
            confirmed: 'bg-info-100 text-info-700 border-info-200',
            preparing: 'bg-primary-100 text-primary-700 border-primary-200',
            on_delivery: 'bg-primary-100 text-primary-700 border-primary-200',
            delivered: 'bg-success-100 text-success-700 border-success-200',
            cancelled: 'bg-error-100 text-error-700 border-error-200',
        };
        return colors[status] || colors.pending;
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: t('pending') || 'Pending',
            confirmed: t('confirmed') || 'Confirmed',
            preparing: t('preparing') || 'Preparing',
            on_delivery: t('on_delivery') || 'On Delivery',
            delivered: t('delivered') || 'Delivered',
            cancelled: t('cancelled') || 'Cancelled',
        };
        return labels[status] || status;
    };

    return (
        <AdminLayout title={t('general_statistics') || 'General Statistics'}>
            <Head title={t('general_statistics') || 'General Statistics'} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">{t('general_statistics') || 'General Statistics'}</h2>
                        <p className="text-slate-600 mt-2">{t('comprehensive_analytics_overview') || 'Comprehensive analytics and performance overview'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="7d">{t('last_7_days') || 'Last 7 Days'}</option>
                            <option value="30d">{t('last_30_days') || 'Last 30 Days'}</option>
                            <option value="90d">{t('last_90_days') || 'Last 90 Days'}</option>
                            <option value="12m">{t('last_12_months') || 'Last 12 Months'}</option>
                        </select>
                        <button className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm">
                            <Download className="w-4 h-4" />
                            <span className="font-medium">{t('export') || 'Export'}</span>
                        </button>
                        <button className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm">
                            <RefreshCw className="w-4 h-4" />
                            <span className="font-medium">{t('refresh') || 'Refresh'}</span>
                        </button>
                    </div>
                </div>

                {/* Main Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6 hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-700">{t('total_revenue') || 'Total Revenue'}</p>
                                <p className="text-3xl font-bold text-blue-900 mt-2">
                                    {formatCurrency(stats?.total_revenue)}
                                </p>
                                <div className="flex items-center gap-1 mt-2">
                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                    <span className="text-xs text-green-600 font-medium">+12.5%</span>
                                    <span className="text-xs text-slate-500">{t('vs_last_month') || 'vs last month'}</span>
                                </div>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <DollarSign className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-6 hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-700">{t('total_orders') || 'Total Orders'}</p>
                                <p className="text-3xl font-bold text-green-900 mt-2">{stats?.total_orders || 0}</p>
                                <div className="flex items-center gap-1 mt-2">
                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                    <span className="text-xs text-green-600 font-medium">+8.2%</span>
                                    <span className="text-xs text-slate-500">{t('vs_last_month') || 'vs last month'}</span>
                                </div>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <ShoppingCart className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm border border-purple-200 p-6 hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-700">{t('total_users') || 'Total Users'}</p>
                                <p className="text-3xl font-bold text-purple-900 mt-2">{stats?.total_users || 0}</p>
                                <div className="flex items-center gap-1 mt-2">
                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                    <span className="text-xs text-green-600 font-medium">+5.1%</span>
                                    <span className="text-xs text-slate-500">{t('vs_last_month') || 'vs last month'}</span>
                                </div>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Users className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm border border-orange-200 p-6 hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-700">{t('average_order_value') || 'Avg Order Value'}</p>
                                <p className="text-3xl font-bold text-orange-900 mt-2">
                                    {formatCurrency(stats?.average_order_value)}
                                </p>
                                <div className="flex items-center gap-1 mt-2">
                                    <TrendingDown className="w-4 h-4 text-red-600" />
                                    <span className="text-xs text-red-600 font-medium">-2.3%</span>
                                    <span className="text-xs text-slate-500">{t('vs_last_month') || 'vs last month'}</span>
                                </div>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <BarChart3 className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">{t('total_stores') || 'Total Stores'}</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.total_stores || 0}</p>
                                <p className="text-xs text-slate-500 mt-1">{stats?.active_stores || 0} {t('active') || 'active'}</p>
                            </div>
                            <Store className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">{t('total_products') || 'Total Products'}</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.total_products || 0}</p>
                                <p className="text-xs text-slate-500 mt-1">{stats?.total_categories || 0} {t('categories') || 'categories'}</p>
                            </div>
                            <Package className="w-8 h-8 text-purple-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">{t('delivered_orders') || 'Delivered Orders'}</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.delivered_orders || 0}</p>
                                <p className="text-xs text-slate-500 mt-1">{stats?.pending_orders || 0} {t('pending') || 'pending'}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">{t('total_customers') || 'Total Customers'}</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.total_customers || 0}</p>
                                <p className="text-xs text-slate-500 mt-1">{stats?.total_store_owners || 0} {t('store_owners') || 'store owners'}</p>
                            </div>
                            <Users className="w-8 h-8 text-indigo-600" />
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Daily Orders Chart */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{t('daily_orders') || 'Daily Orders'}</h3>
                                <p className="text-sm text-slate-500">{t('last_30_days') || 'Last 30 days'}</p>
                            </div>
                        </div>
                        <div className="h-64 flex items-end justify-between gap-2">
                            {dailyOrders && dailyOrders.length > 0 ? (
                                dailyOrders.map((day, index) => {
                                    const maxCount = Math.max(...dailyOrders.map(d => d.count || 0));
                                    const height = maxCount > 0 ? ((day.count || 0) / maxCount) * 100 : 0;
                                    return (
                                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                            <div className="w-full bg-slate-100 rounded-t-lg relative group cursor-pointer" style={{ height: `${height}%` }}>
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                    {day.count || 0} {t('orders') || 'orders'}
                                                </div>
                                            </div>
                                            <span className="text-xs text-slate-500 transform -rotate-45 origin-top-left whitespace-nowrap">
                                                {formatDate(day.date)}
                                            </span>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <p>{t('no_data_available') || 'No data available'}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Orders by Status */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{t('orders_by_status') || 'Orders by Status'}</h3>
                                <p className="text-sm text-slate-500">{t('distribution') || 'Order status distribution'}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {ordersByStatus && ordersByStatus.length > 0 ? (
                                ordersByStatus.map((item, index) => {
                                    const total = ordersByStatus.reduce((sum, i) => sum + (i.count || 0), 0);
                                    const percentage = total > 0 ? ((item.count || 0) / total) * 100 : 0;
                                    return (
                                        <div key={index} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border ${getStatusColor(item.status)}`}>
                                                    {getStatusLabel(item.status)}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-slate-900">{item.count || 0}</span>
                                                    <span className="text-xs text-slate-500">({percentage.toFixed(1)}%)</span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-500 ${
                                                        item.status === 'delivered' ? 'bg-green-500' :
                                                        item.status === 'pending' ? 'bg-yellow-500' :
                                                        item.status === 'cancelled' ? 'bg-red-500' :
                                                        'bg-blue-500'
                                                    }`}
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center text-slate-400 py-8">
                                    <p>{t('no_data_available') || 'No data available'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Top Products and Stores */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Products */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{t('top_products') || 'Top Products'}</h3>
                                <p className="text-sm text-slate-500">{t('by_sales') || 'By sales count'}</p>
                            </div>
                            <Link
                                href="/admin/products"
                                className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1"
                            >
                                {t('view_all') || 'View All'}
                                <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {topProducts && topProducts.length > 0 ? (
                                topProducts.map((product, index) => (
                                    <div key={product.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                                            {index + 1}
                                        </div>
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                                        ) : (
                                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                                                <Package className="w-6 h-6 text-slate-400" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
                                            {product.category && (
                                                <p className="text-xs text-slate-500">{product.category.name}</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-slate-900">{product.sales_count || 0}</p>
                                            <p className="text-xs text-slate-500">{t('sales') || 'sales'}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-slate-400 py-8">
                                    <p>{t('no_products_found') || 'No products found'}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Top Stores */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{t('top_stores') || 'Top Stores'}</h3>
                                <p className="text-sm text-slate-500">{t('by_revenue') || 'By revenue'}</p>
                            </div>
                            <Link
                                href="/admin/stores"
                                className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1"
                            >
                                {t('view_all') || 'View All'}
                                <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {topStores && topStores.length > 0 ? (
                                topStores.map((store, index) => (
                                    <div key={store.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
                                            {index + 1}
                                        </div>
                                        {store.logo_path ? (
                                            <img src={store.logo_path} alt={store.name} className="w-12 h-12 rounded-lg object-cover" />
                                        ) : (
                                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                                                <Store className="w-6 h-6 text-slate-400" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 truncate">{store.name}</p>
                                            {store.owner && (
                                                <p className="text-xs text-slate-500">{store.owner.name}</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-slate-900">{formatCurrency(store.total_revenue || 0)}</p>
                                            <p className="text-xs text-slate-500">{store.delivered_orders_count || 0} {t('orders') || 'orders'}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-slate-400 py-8">
                                    <p>{t('no_stores_found') || 'No stores found'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">{t('recent_orders') || 'Recent Orders'}</h3>
                            <p className="text-sm text-slate-500">{t('latest_activity') || 'Latest order activity'}</p>
                        </div>
                        <Link
                            href="/admin/orders"
                            className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1"
                        >
                            {t('view_all') || 'View All'}
                            <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">{t('order') || 'Order'}</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">{t('customer') || 'Customer'}</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">{t('store') || 'Store'}</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">{t('amount') || 'Amount'}</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">{t('status') || 'Status'}</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">{t('date') || 'Date'}</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">{t('actions') || 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentOrders && recentOrders.length > 0 ? (
                                    recentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <span className="text-sm font-semibold text-slate-900">{order.order_number || `#${order.id}`}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-slate-700">{order.user?.name || '-'}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-slate-700">{order.store?.name || '-'}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm font-bold text-slate-900">{formatCurrency(order.total_amount)}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(order.status)}`}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-slate-600">
                                                    {new Date(order.created_at).toLocaleDateString('ar-SA', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                    className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                                            {t('no_orders_found') || 'No orders found'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

