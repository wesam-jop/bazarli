import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DriverLayout from './DriverLayout';
import { useTranslation } from '../../hooks/useTranslation';
import { useGeneralSettings } from '../../hooks/useGeneralSettings';
import {
    ArrowLeft,
    MapPin,
    Phone,
    DollarSign,
    Package,
    Store,
    Navigation,
    ExternalLink,
    CheckCircle,
    Clock,
    User,
    FileText,
    Truck,
} from 'lucide-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function DriverOrderShow({ order }) {
    const { t } = useTranslation();
    const { formatCurrency, formatDateTime } = useGeneralSettings();
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    useEffect(() => {
        if (!mapContainer.current || map.current || !order.delivery_latitude || !order.delivery_longitude) return;

        // Initialize map
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
            center: [order.delivery_longitude, order.delivery_latitude],
            zoom: 14,
        });

        map.current.on('load', () => {
            setMapLoaded(true);

            // Add delivery location marker
            new maplibregl.Marker({ color: '#ef4444' })
                .setLngLat([order.delivery_longitude, order.delivery_latitude])
                .setPopup(
                    new maplibregl.Popup().setHTML(`
                        <div class="p-2">
                            <p class="font-semibold text-sm">${t('delivery_location') || 'Delivery Location'}</p>
                            <p class="text-xs text-slate-600">${order.delivery_address}</p>
                        </div>
                    `)
                )
                .addTo(map.current);

            // Add store markers
            order.stores?.forEach((store, index) => {
                if (store.latitude && store.longitude) {
                    new maplibregl.Marker({ color: '#3b82f6' })
                        .setLngLat([store.longitude, store.latitude])
                        .setPopup(
                            new maplibregl.Popup().setHTML(`
                                <div class="p-2">
                                    <p class="font-semibold text-sm">${store.name}</p>
                                    <p class="text-xs text-slate-600">${store.address || ''}</p>
                                </div>
                            `)
                        )
                        .addTo(map.current);
                }
            });
        });

        return () => {
            if (map.current) {
                map.current.remove();
            }
        };
    }, [order]);

    const openGoogleMaps = () => {
        const lat = order.delivery_latitude;
        const lng = order.delivery_longitude;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        window.open(url, '_blank');
    };

    const openStoreInGoogleMaps = (store) => {
        if (store.latitude && store.longitude) {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;
            window.open(url, '_blank');
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            pending_driver_approval: { label: t('pending_driver_approval') || 'Pending Approval', color: 'bg-warning-100 text-warning-700' },
            driver_accepted: { label: t('driver_accepted') || 'Accepted', color: 'bg-info-100 text-info-700' },
            store_preparing: { label: t('store_preparing') || 'Preparing', color: 'bg-primary-100 text-primary-700' },
            ready_for_delivery: { label: t('ready_for_delivery') || 'Ready', color: 'bg-success-100 text-success-700' },
            driver_picked_up: { label: t('driver_picked_up') || 'Picked Up', color: 'bg-accent-100 text-accent-700' },
            out_for_delivery: { label: t('out_for_delivery') || 'Out for Delivery', color: 'bg-primary-100 text-primary-700' },
            delivered: { label: t('delivered') || 'Delivered', color: 'bg-success-100 text-success-700' },
        };
        return statusMap[status] || { label: status, color: 'bg-secondary-100 text-secondary-700' };
    };

    const statusBadge = getStatusBadge(order.status);

    return (
        <DriverLayout
            title={t('order_details') || 'Order Details'}
            subtitle={`#${order.order_number}`}
        >
            <Head title={`${t('order_details') || 'Order Details'} - #${order.order_number}`} />

            <div className="space-y-6">
                {/* Back Button */}
                <Link
                    href="/dashboard/driver/orders"
                    className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t('back_to_orders') || 'Back to Orders'}
                </Link>

                {/* Order Header */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">#{order.order_number}</h1>
                            <p className="text-sm text-slate-500 mt-1">
                                {formatDateTime(order.created_at)}
                            </p>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${statusBadge.color}`}>
                            {statusBadge.label}
                        </span>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">{t('customer') || 'Customer'}</p>
                                <p className="text-sm font-semibold text-slate-900">{order.customer?.name || 'N/A'}</p>
                                <a href={`tel:${order.customer_phone}`} className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                                    <Phone className="w-3 h-3" />
                                    {order.customer_phone}
                                </a>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">{t('total_amount') || 'Total Amount'}</p>
                                <p className="text-lg font-bold text-slate-900">{formatCurrency(order.total_amount)}</p>
                                <p className="text-xs text-slate-500">
                                    {t('payment_method') || 'Payment'}: {t(order.payment_method) || order.payment_method}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map Section */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-semibold text-slate-900">
                                {t('delivery_location') || 'Delivery Location'}
                            </h2>
                        </div>
                        <button
                            onClick={openGoogleMaps}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                            <Navigation className="w-4 h-4" />
                            {t('open_in_google_maps') || 'Open in Google Maps'}
                            <ExternalLink className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="relative">
                        <div ref={mapContainer} className="w-full h-96" />
                        {!mapLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                                <div className="text-center">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                    <p className="text-sm text-slate-600">{t('loading_map') || 'Loading map...'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="px-6 py-4 border-t border-slate-200">
                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-900">{order.delivery_address}</p>
                                {order.location_notes && (
                                    <p className="text-xs text-slate-500 mt-1">{order.location_notes}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stores and Products */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Store className="w-6 h-6 text-blue-600" />
                        {t('stores_and_products') || 'Stores & Products'}
                        <span className="text-sm font-normal text-slate-500">
                            ({order.stores_count} {t('stores') || 'stores'})
                        </span>
                    </h2>

                    {order.stores?.map((store, storeIndex) => (
                        <div key={store.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 bg-secondary-50 border-b border-secondary-200">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Store className="w-5 h-5 text-blue-600" />
                                            <h3 className="text-lg font-semibold text-slate-900">{store.name}</h3>
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                                                store.status === 'ready_for_delivery' ? 'bg-green-100 text-green-700' :
                                                store.status === 'store_preparing' ? 'bg-purple-100 text-purple-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                                {t(store.status) || store.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <MapPin className="w-4 h-4" />
                                            <span>{store.address}</span>
                                        </div>
                                        {store.phone && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                                                <Phone className="w-4 h-4" />
                                                <a href={`tel:${store.phone}`} className="text-blue-600 hover:underline">
                                                    {store.phone}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                    {store.latitude && store.longitude && (
                                        <button
                                            onClick={() => openStoreInGoogleMaps(store)}
                                            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                                        >
                                            <Navigation className="w-4 h-4" />
                                            {t('directions') || 'Directions'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Products from this store */}
                            <div className="p-6">
                                <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    {t('products') || 'Products'} ({store.items?.length || 0})
                                </h4>
                                <div className="space-y-3">
                                    {store.items?.map((item, itemIndex) => (
                                        <div
                                            key={item.id || itemIndex}
                                            className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
                                        >
                                            {item.product?.image && (
                                                <img
                                                    src={item.product.image}
                                                    alt={item.product_name}
                                                    className="w-16 h-16 rounded-lg object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            )}
                                            {(!item.product?.image) && (
                                                <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center">
                                                    <Package className="w-8 h-8 text-slate-400" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-slate-900">{item.product_name}</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {t('quantity') || 'Quantity'}: {item.quantity} × {formatCurrency(item.price)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-slate-900">{formatCurrency(item.total)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Store Summary */}
                                <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-sm">
                                    <div className="space-y-1">
                                        <p className="text-slate-600">
                                            {t('subtotal') || 'Subtotal'}: <span className="font-semibold text-slate-900">{formatCurrency(store.subtotal)}</span>
                                        </p>
                                        <p className="text-slate-600">
                                            {t('delivery_fee') || 'Delivery Fee'}: <span className="font-semibold text-slate-900">{formatCurrency(store.delivery_fee)}</span>
                                        </p>
                                    </div>
                                    <p className="text-lg font-bold text-blue-600">
                                        {formatCurrency(store.subtotal + store.delivery_fee)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        {t('order_summary') || 'Order Summary'}
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">{t('subtotal') || 'Subtotal'}</span>
                            <span className="font-semibold text-slate-900">{formatCurrency(order.subtotal)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">{t('delivery_fee') || 'Delivery Fee'}</span>
                            <span className="font-semibold text-slate-900">{formatCurrency(order.delivery_fee)}</span>
                        </div>
                        {order.estimated_delivery_time && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {t('estimated_delivery_time') || 'Estimated Delivery Time'}
                                </span>
                                <span className="font-semibold text-slate-900">{order.estimated_delivery_time} {t('minutes') || 'minutes'}</span>
                            </div>
                        )}
                        <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                            <span className="text-base font-semibold text-slate-900">{t('total') || 'Total'}</span>
                            <span className="text-xl font-bold text-blue-600">{formatCurrency(order.total_amount)}</span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {order.notes && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            {t('notes') || 'Notes'}
                        </h2>
                        <p className="text-sm text-slate-600">{order.notes}</p>
                    </div>
                )}

                {/* Actions */}
                {order.status === 'pending_driver_approval' && (
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.post(`/dashboard/driver/orders/${order.id}/accept`, {}, { preserveScroll: true })}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                            <CheckCircle className="w-5 h-5" />
                            {t('accept_order') || 'Accept Order'}
                        </button>
                        <button
                            onClick={() => router.post(`/dashboard/driver/orders/${order.id}/reject`, {}, { preserveScroll: true })}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                        >
                            {t('reject_order') || 'Reject Order'}
                        </button>
                    </div>
                )}

                {['ready_for_delivery', 'store_approved'].includes(order.status) && (
                    <button
                        onClick={() => router.post(`/dashboard/driver/orders/${order.id}/complete`, {}, { preserveScroll: true })}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                        <Truck className="w-5 h-5" />
                        {t('confirm_delivery') || 'Confirm Delivery'}
                    </button>
                )}
            </div>
        </DriverLayout>
    );
}

