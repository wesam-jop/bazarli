import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import CustomerLayout from './CustomerLayout';
import StoreLocationPicker from '../../Components/StoreLocationPicker';
import { useTranslation } from '../../hooks/useTranslation';
import { MapPin, Star, Trash2, Save, Navigation } from 'lucide-react';

const DEFAULT_COORDS = { lat: 33.5138, lng: 36.2765 };

export default function CustomerLocations({ locations = [] }) {
    const { t, locale } = useTranslation();
    const isRTL = locale === 'ar';
    const [mapPosition, setMapPosition] = useState({
        latitude: DEFAULT_COORDS.lat,
        longitude: DEFAULT_COORDS.lng,
    });
    const [geolocateStatus, setGeolocateStatus] = useState(null);

    const createForm = useForm({
        label: '',
        address: '',
        latitude: mapPosition.latitude,
        longitude: mapPosition.longitude,
        notes: '',
        is_default: locations.length === 0,
    });

    const handleMapChange = ({ latitude, longitude }) => {
        setMapPosition({ latitude, longitude });
        createForm.setData('latitude', latitude);
        createForm.setData('longitude', longitude);
        setGeolocateStatus(null);
    };

    const handleCreate = (event) => {
        event.preventDefault();
        createForm.post('/dashboard/customer/locations', {
            preserveScroll: true,
            onSuccess: () => {
                createForm.reset();
                setMapPosition({ latitude: DEFAULT_COORDS.lat, longitude: DEFAULT_COORDS.lng });
                setGeolocateStatus(null);
            },
        });
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            setGeolocateStatus({
                type: 'error',
                message: t('location_geolocate_unsupported') || 'Geolocation is not supported by your browser.',
            });
            return;
        }

        setGeolocateStatus({
            type: 'loading',
            message: t('location_geolocate_fetching') || 'Detecting your current position...',
        });

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                handleMapChange({
                    latitude: latitude.toFixed(6),
                    longitude: longitude.toFixed(6),
                });
                setGeolocateStatus({
                    type: 'success',
                    message: t('location_geolocate_success') || 'Location updated based on your current position.',
                });
            },
            () => {
                setGeolocateStatus({
                    type: 'error',
                    message: t('location_geolocate_denied') || 'Unable to retrieve your location. Please allow access or set it manually.',
                });
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleDelete = (locationId) => {
        if (!confirm(t('confirm_delete_location') || 'Delete this location?')) {
            return;
        }
        router.delete(`/dashboard/customer/locations/${locationId}`, {
            preserveScroll: true,
        });
    };

    const handleSetDefault = (locationId) => {
        router.post(`/dashboard/customer/locations/${locationId}/default`, {}, { preserveScroll: true });
    };

    return (
        <CustomerLayout
            title={t('delivery_locations_title') || 'Delivery locations'}
            subtitle={t('delivery_locations_subtitle') || 'Save multiple addresses and switch between them when ordering.'}
        >
            <Head title={t('delivery_locations_title') || 'Delivery locations'} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Locations List */}
                <div className="xl:col-span-2 space-y-4">
                    {locations.length ? (
                        locations.map((location) => (
                            <div
                                key={location.id}
                                className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 sm:p-6 hover:border-primary-200 transition"
                            >
                                {/* Header */}
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-100 text-primary-600 flex items-center justify-center shadow-inner flex-shrink-0">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div className="text-start min-w-0">
                                            <p className="text-lg font-semibold text-slate-900 truncate">{location.label}</p>
                                            <p className="text-xs text-slate-500" dir="ltr">
                                                {Number(location.latitude).toFixed(4)}, {Number(location.longitude).toFixed(4)}
                                            </p>
                                        </div>
                                    </div>
                                    {location.is_default && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 border border-primary-100 self-start sm:self-auto flex-shrink-0">
                                            <Star className="w-3.5 h-3.5" />
                                            {t('default_location_badge') || 'Default'}
                                        </span>
                                    )}
                                </div>

                                {/* Address Card */}
                                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 mb-4">
                                    <p className="text-sm font-semibold text-slate-900 mb-1 text-start">
                                        {t('delivery_address') || 'Delivery address'}
                                    </p>
                                    <p className="text-sm text-slate-600 leading-relaxed text-start">{location.address}</p>
                                    {location.notes && (
                                        <p className="text-xs text-slate-500 border-t border-dashed border-slate-200 pt-2 mt-3 text-start">
                                            {location.notes}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap items-center gap-3">
                                    {!location.is_default && (
                                        <button
                                            type="button"
                                            onClick={() => handleSetDefault(location.id)}
                                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-primary-200 hover:text-primary-700 hover:bg-primary-50 transition"
                                        >
                                            <Star className="w-4 h-4" />
                                            {t('set_as_default') || 'Set as default'}
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(location.id)}
                                        className="inline-flex items-center gap-2 rounded-xl border border-transparent px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        {t('delete_location') || 'Delete'}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center space-y-4">
                            <div className="w-16 h-16 mx-auto rounded-full bg-white shadow flex items-center justify-center">
                                <MapPin className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-lg font-semibold text-slate-900">
                                {t('no_saved_locations_hint') || 'No locations saved yet'}
                            </p>
                            <p className="text-sm text-slate-500 max-w-md mx-auto">
                                {t('delivery_locations_intro') || 'Add your frequently used addresses to speed up checkout.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Add New Location Form */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4 h-fit">
                    <h3 className="text-lg font-semibold text-slate-900 text-start">
                        {t('add_new_location') || 'Add new location'}
                    </h3>
                    
                    {/* Map Section */}
                    <div className="space-y-3">
                        <StoreLocationPicker
                            latitude={createForm.data.latitude || mapPosition.latitude}
                            longitude={createForm.data.longitude || mapPosition.longitude}
                            onChange={handleMapChange}
                            height={220}
                        />
                        <div className="flex flex-wrap items-center gap-3">
                            <p className="text-xs text-slate-500 flex-1 text-start">
                                {t('location_map_help') || 'Click on the map to move the pin to your exact address.'}
                            </p>
                            <button
                                type="button"
                                onClick={handleUseCurrentLocation}
                                className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-3 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-100 transition flex-shrink-0"
                            >
                                <Navigation className="w-3.5 h-3.5" />
                                {t('location_use_current') || 'Use current location'}
                            </button>
                        </div>
                        {geolocateStatus && (
                            <p
                                className={`text-xs font-medium text-start ${
                                    geolocateStatus.type === 'success'
                                        ? 'text-emerald-600'
                                        : geolocateStatus.type === 'loading'
                                        ? 'text-slate-600'
                                        : 'text-rose-600'
                                }`}
                            >
                                {geolocateStatus.message}
                            </p>
                        )}
                    </div>

                    {/* Form */}
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-800 mb-2 text-start">
                                {t('location_label') || 'Location name'}
                            </label>
                            <input
                                type="text"
                                value={createForm.data.label}
                                onChange={(e) => createForm.setData('label', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all"
                                placeholder={t('location_label_placeholder') || 'e.g., Home, Office'}
                            />
                            {createForm.errors.label && (
                                <p className="text-xs text-rose-600 mt-1 text-start">{createForm.errors.label}</p>
                            )}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-semibold text-slate-800 mb-2 text-start">
                                {t('location_address') || t('delivery_address')} *
                            </label>
                            <textarea
                                value={createForm.data.address}
                                onChange={(e) => createForm.setData('address', e.target.value)}
                                rows={3}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white resize-none transition-all"
                                placeholder={t('location_address_placeholder') || 'Building, street, extra directions'}
                                required
                            />
                            {createForm.errors.address && (
                                <p className="text-xs text-rose-600 mt-1 text-start">{createForm.errors.address}</p>
                            )}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-semibold text-slate-800 mb-2 text-start">
                                {t('location_notes') || t('additional_notes')}
                            </label>
                            <textarea
                                value={createForm.data.notes}
                                onChange={(e) => createForm.setData('notes', e.target.value)}
                                rows={2}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white resize-none transition-all"
                                placeholder={t('location_notes_placeholder') || 'Apartment number, access code...'}
                            />
                            {createForm.errors.notes && (
                                <p className="text-xs text-rose-600 mt-1 text-start">{createForm.errors.notes}</p>
                            )}
                        </div>
                        
                        {/* Default Checkbox */}
                        <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={createForm.data.is_default}
                                onChange={(e) => createForm.setData('is_default', e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer transition-colors"
                            />
                            <span>{t('set_as_default') || 'Set as default'}</span>
                        </label>
                        
                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={createForm.processing}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-600/90 disabled:opacity-50 transition-all"
                        >
                            <Save className="w-4 h-4" />
                            <span>{createForm.processing ? t('saving') || 'Saving...' : t('save_location') || 'Save location'}</span>
                        </button>
                    </form>
                </div>
            </div>
        </CustomerLayout>
    );
}
