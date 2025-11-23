import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../Layout';
import { useTranslation } from '../../../hooks/useTranslation';
import { useGeneralSettings } from '../../../hooks/useGeneralSettings';
import { 
    ShoppingCart, 
    ArrowLeft,
    Clock,
    CheckCircle,
    XCircle,
    Package,
    Calendar,
    Phone,
    MapPin,
    User,
    Store,
    Truck,
    DollarSign,
    Edit,
    Save,
    X
} from 'lucide-react';

const getStatusBadge = (status, t) => {
    const statusConfig = {
        pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: Clock, label: t('pending') || 'Pending' },
        confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: CheckCircle, label: t('confirmed') || 'Confirmed' },
        preparing: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: Package, label: t('preparing') || 'Preparing' },
        on_delivery: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: Truck, label: t('on_delivery') || 'On Delivery' },
        delivered: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle, label: t('delivered') || 'Delivered' },
        cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle, label: t('cancelled') || 'Cancelled' },
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

export default function OrderShow({ order }) {
    const { t } = useTranslation();
    const { formatCurrency, formatDate, formatTime, formatDateTime } = useGeneralSettings();
    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(order.status);
    const [isUpdating, setIsUpdating] = useState(false);

    // Debug: Log order data
    React.useEffect(() => {
        console.log('Order Data:', order);
        console.log('Order Items:', order.orderItems);
        console.log('Order Items Count:', order.orderItems?.length || 0);
        if (order.orderItems && order.orderItems.length > 0) {
            console.log('First Order Item:', order.orderItems[0]);
        }
    }, [order]);

    const statusOptions = [
        { value: 'pending', label: t('pending') || 'Pending' },
        { value: 'confirmed', label: t('confirmed') || 'Confirmed' },
        { value: 'preparing', label: t('preparing') || 'Preparing' },
        { value: 'on_delivery', label: t('on_delivery') || 'On Delivery' },
        { value: 'delivered', label: t('delivered') || 'Delivered' },
        { value: 'cancelled', label: t('cancelled') || 'Cancelled' },
    ];

    const handleUpdateStatus = () => {
        setIsUpdating(true);
        router.put(`/admin/orders/${order.id}/status`, {
            status: selectedStatus
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditingStatus(false);
                setIsUpdating(false);
            },
            onError: () => {
                setIsUpdating(false);
            }
        });
    };

    const handleCancelEdit = () => {
        setSelectedStatus(order.status);
        setIsEditingStatus(false);
    };

    return (
        <AdminLayout title={t('order_details') || 'Order Details'}>
            <Head title={`${t('order')} #${order.order_number || order.id}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/orders"
                            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900">
                                {t('order')} #{order.order_number || order.id}
                            </h2>
                            <p className="text-slate-600 mt-1">
                                {formatDateTime(order.created_at)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {isEditingStatus ? (
                            <>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="px-4 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm font-medium text-slate-700"
                                    disabled={isUpdating}
                                >
                                    {statusOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleUpdateStatus}
                                    disabled={isUpdating}
                                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{t('save') || 'Save'}</span>
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    disabled={isUpdating}
                                    className="flex items-center gap-2 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-all disabled:opacity-50"
                                >
                                    <X className="w-4 h-4" />
                                    <span>{t('cancel') || 'Cancel'}</span>
                                </button>
                            </>
                        ) : (
                            <>
                                {getStatusBadge(order.status, t)}
                                <button
                                    onClick={() => setIsEditingStatus(true)}
                                    className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-all"
                                >
                                    <Edit className="w-4 h-4" />
                                    <span>{t('change_status') || 'Change Status'}</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Order Summary Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                <DollarSign className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-600">{t('total_amount') || 'Total Amount'}</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">
                                    {formatCurrency(order.total_amount || 0)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Package className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-600">{t('items') || 'Items'}</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">
                                    {order.orderItems?.length || 0}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Calendar className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-600">{t('order_date') || 'Order Date'}</p>
                                <p className="text-lg font-bold text-slate-900 mt-1">
                                    {formatDate(order.created_at)}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {formatTime(order.created_at)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Customer Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-600" />
                            {t('customer_information') || 'Customer Information'}
                        </h3>
                        <div className="space-y-4">
                            {order.user && (
                                <div>
                                    <p className="text-sm font-medium text-slate-600">{t('name') || 'Name'}</p>
                                    <p className="text-base font-semibold text-slate-900 mt-1">{order.user.name}</p>
                                </div>
                            )}
                            {order.customer_phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">{t('phone') || 'Phone'}</p>
                                        <p className="text-base font-semibold text-slate-900 mt-1">{order.customer_phone}</p>
                                    </div>
                                </div>
                            )}
                            {order.delivery_address && (
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-600">{t('delivery_address') || 'Delivery Address'}</p>
                                        <p className="text-base font-semibold text-slate-900 mt-1">{order.delivery_address}</p>
                                        {order.delivery_latitude && order.delivery_longitude && (
                                            <p className="text-xs text-slate-500 mt-1">
                                                {Number(order.delivery_latitude).toFixed(4)}, {Number(order.delivery_longitude).toFixed(4)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Store & Delivery Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Store className="w-5 h-5 text-green-600" />
                            {t('store_delivery') || 'Store & Delivery'}
                        </h3>
                        <div className="space-y-4">
                            {order.store && (
                                <div>
                                    <p className="text-sm font-medium text-slate-600">{t('store') || 'Store'}</p>
                                    <p className="text-base font-semibold text-slate-900 mt-1">{order.store.name}</p>
                                    {order.store.phone && (
                                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                                            <Phone className="w-3.5 h-3.5" />
                                            {order.store.phone}
                                        </p>
                                    )}
                                </div>
                            )}
                            {order.deliveryDriver && (
                                <div className="flex items-start gap-2">
                                    <Truck className="w-4 h-4 text-slate-400 mt-1" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-600">{t('delivery_driver') || 'Delivery Driver'}</p>
                                        <p className="text-base font-semibold text-slate-900 mt-1">
                                            {order.deliveryDriver.user?.name || order.deliveryDriver.name || t('not_assigned') || 'Not Assigned'}
                                        </p>
                                        {order.deliveryDriver.user?.phone && (
                                            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                                                <Phone className="w-3.5 h-3.5" />
                                                {order.deliveryDriver.user.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                            {order.delivered_at && (
                                <div>
                                    <p className="text-sm font-medium text-slate-600">{t('delivered_at') || 'Delivered At'}</p>
                                    <p className="text-base font-semibold text-slate-900 mt-1">
                                        {formatDateTime(order.delivered_at)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-purple-600" />
                            {t('order_items') || 'Order Items'}
                        </h3>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg">
                                <Package className="w-4 h-4" />
                                <span className="font-semibold">
                                    {order.orderItems?.length || 0} {t('items') || 'items'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                                <DollarSign className="w-4 h-4" />
                                <span className="font-semibold">
                                    {formatCurrency(order.total_amount || 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        {t('product') || 'Product'}
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        {t('quantity') || 'Quantity'}
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        {t('unit_price') || 'Unit Price'}
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        {t('total') || 'Total'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {order.orderItems && Array.isArray(order.orderItems) && order.orderItems.length > 0 ? (
                                    order.orderItems.map((item, index) => (
                                        <tr key={index} className="hover:bg-slate-50/50 transition-all">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    {item.product?.image ? (
                                                        <img 
                                                            src={item.product.image} 
                                                            alt={item.product_name}
                                                            className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                                                        />
                                                    ) : (
                                                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 border border-purple-200 flex items-center justify-center">
                                                            <Package className="w-8 h-8 text-purple-600" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-slate-900 mb-1">
                                                            {item.product_name || item.product?.name || `Product #${item.product_id}`}
                                                        </p>
                                                        {item.product?.category && (
                                                            <p className="text-xs text-slate-500 mb-1">
                                                                {item.product.category.name}
                                                            </p>
                                                        )}
                                                        {item.product?.description && (
                                                            <p className="text-xs text-slate-400 line-clamp-1">
                                                                {item.product.description}
                                                            </p>
                                                        )}
                                                        {item.product?.barcode && (
                                                            <p className="text-xs text-slate-400 mt-1">
                                                                {t('barcode') || 'Barcode'}: {item.product.barcode}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg font-bold text-sm shadow-md">
                                                        {item.quantity || 0}
                                                    </span>
                                                    <span className="text-xs text-slate-500">{t('quantity') || 'Qty'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {formatCurrency(item.product_price || item.unit_price || 0)}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1">{t('per_unit') || 'per unit'}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-right">
                                                    <p className="text-base font-bold text-slate-900">
                                                        {formatCurrency(item.total_price || 0)}
                                                    </p>
                                                    {item.quantity && item.product_price && (
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            {item.quantity} × {formatCurrency(item.product_price)}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                                    <Package className="w-8 h-8 text-slate-400" />
                                                </div>
                                                <p className="text-slate-600 font-medium">{t('no_items') || 'No items found'}</p>
                                                <p className="text-sm text-slate-400 mt-1">{t('no_order_items') || 'This order has no items'}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot className="bg-gradient-to-r from-slate-50 to-slate-100 border-t-2 border-slate-300">
                                <tr>
                                    <td colSpan="2" className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <Package className="w-4 h-4 text-slate-500" />
                                            <p className="text-sm font-medium text-slate-700">
                                                {t('total_items') || 'Total Items'}: {order.orderItems?.length || 0}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <p className="text-sm font-semibold text-slate-700">{t('order_total') || 'Order Total'}</p>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-slate-900">
                                                {formatCurrency(order.total_amount || 0)}
                                            </p>
                                            {order.subtotal && order.total_amount && order.subtotal !== order.total_amount && (
                                                <p className="text-xs text-slate-500 mt-1 line-through">
                                                    {formatCurrency(order.subtotal)}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

