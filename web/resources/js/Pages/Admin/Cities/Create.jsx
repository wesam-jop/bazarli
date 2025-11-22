import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '../Layout';
import { useTranslation } from '../../../hooks/useTranslation';
import StoreLocationPicker from '../../../Components/StoreLocationPicker';
import { ArrowLeft, Save, MapPin, Navigation, LocateFixed } from 'lucide-react';

const DEFAULT_COORDS = { lat: 35.9333, lng: 36.6333 }; // Idlib City default

export default function CreateCity({ governorates, selectedGovernorateId, nextDisplayOrder }) {
    const { t } = useTranslation();
    const [geolocateStatus, setGeolocateStatus] = useState(null);
    
    const { data, setData, post, processing, errors } = useForm({
        governorate_id: selectedGovernorateId || '',
        name_ar: '',
        name_en: '',
        center_latitude: DEFAULT_COORDS.lat.toString(),
        center_longitude: DEFAULT_COORDS.lng.toString(),
        delivery_radius: 10,
        is_active: true,
        display_order: nextDisplayOrder || 0,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/cities');
    };

    const handleMapChange = ({ latitude, longitude }) => {
        setData('center_latitude', latitude);
        setData('center_longitude', longitude);
        setGeolocateStatus(null);
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
                setData('center_latitude', latitude.toFixed(8));
                setData('center_longitude', longitude.toFixed(8));
                setGeolocateStatus({
                    type: 'success',
                    message: t('location_geolocate_success') || 'Location updated successfully.',
                });
            },
            (error) => {
                setGeolocateStatus({
                    type: 'error',
                    message: t('location_geolocate_denied') || 'Unable to retrieve your location. Please allow access or set it manually.',
                });
            }
        );
    };

    return (
        <AdminLayout title={t('add_city')}>
            <Head title={t('add_city')} />
            
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/cities"
                        className="p-2 hover:bg-slate-100 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">{t('add_city')}</h2>
                        <p className="text-slate-600 mt-1">{t('add_new_city') || 'أضف منطقة جديدة إلى محافظة'}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Governorate */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                {t('city_governorate')} <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={data.governorate_id}
                                onChange={(e) => setData('governorate_id', e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="">{t('select_governorate')}</option>
                                {governorates?.map((gov) => (
                                    <option key={gov.id} value={gov.id}>
                                        {gov.name_ar} - {gov.name_en}
                                    </option>
                                ))}
                            </select>
                            {errors.governorate_id && (
                                <p className="mt-1 text-sm text-rose-600">{errors.governorate_id}</p>
                            )}
                        </div>

                        {/* Name Arabic */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                {t('city_name_ar')} <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name_ar}
                                onChange={(e) => setData('name_ar', e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="مثال: مدينة إدلب"
                            />
                            {errors.name_ar && (
                                <p className="mt-1 text-sm text-rose-600">{errors.name_ar}</p>
                            )}
                        </div>

                        {/* Name English */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                {t('city_name_en')} <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name_en}
                                onChange={(e) => setData('name_en', e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Example: Idlib City"
                            />
                            {errors.name_en && (
                                <p className="mt-1 text-sm text-rose-600">{errors.name_en}</p>
                            )}
                        </div>

                        {/* Map Section */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                <Navigation className="w-4 h-4 text-purple-600" />
                                {t('location') || 'الموقع على الخريطة'}
                            </label>
                            <div className="space-y-3">
                                <div className="relative rounded-lg overflow-hidden border border-slate-300">
                                    <StoreLocationPicker
                                        latitude={data.center_latitude}
                                        longitude={data.center_longitude}
                                        onChange={handleMapChange}
                                        height={400}
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={handleUseCurrentLocation}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        <LocateFixed className="w-4 h-4" />
                                        {t('location_use_current') || 'استخدام موقعي الحالي'}
                                    </button>
                                    {geolocateStatus && (
                                        <div className={`text-sm ${
                                            geolocateStatus.type === 'error' ? 'text-rose-600' :
                                            geolocateStatus.type === 'success' ? 'text-emerald-600' :
                                            'text-blue-600'
                                        }`}>
                                            {geolocateStatus.message}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Center Latitude */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                {t('city_center_latitude')} {t('or_use_map') || '(أو حدد من الخريطة)'}
                            </label>
                            <input
                                type="number"
                                step="0.00000001"
                                value={data.center_latitude}
                                onChange={(e) => setData('center_latitude', e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="35.9333"
                            />
                            {errors.center_latitude && (
                                <p className="mt-1 text-sm text-rose-600">{errors.center_latitude}</p>
                            )}
                        </div>

                        {/* Center Longitude */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                {t('city_center_longitude')} {t('or_use_map') || '(أو حدد من الخريطة)'}
                            </label>
                            <input
                                type="number"
                                step="0.00000001"
                                value={data.center_longitude}
                                onChange={(e) => setData('center_longitude', e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="36.6333"
                            />
                            {errors.center_longitude && (
                                <p className="mt-1 text-sm text-rose-600">{errors.center_longitude}</p>
                            )}
                        </div>

                        {/* Delivery Radius */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                {t('city_delivery_radius')}
                            </label>
                            <input
                                type="number"
                                value={data.delivery_radius}
                                onChange={(e) => setData('delivery_radius', parseInt(e.target.value) || 10)}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                min="1"
                                max="100"
                            />
                            {errors.delivery_radius && (
                                <p className="mt-1 text-sm text-rose-600">{errors.delivery_radius}</p>
                            )}
                        </div>

                        {/* Display Order */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                {t('display_order') || 'ترتيب العرض'}
                            </label>
                            <input
                                type="number"
                                value={data.display_order}
                                onChange={(e) => setData('display_order', parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                min="0"
                            />
                            {errors.display_order && (
                                <p className="mt-1 text-sm text-rose-600">{errors.display_order}</p>
                            )}
                        </div>

                        {/* Is Active */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                {t('status')}
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="w-5 h-5 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                                />
                                <span className="text-sm text-slate-700">{t('active')}</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span className="font-semibold">{t('save') || 'حفظ'}</span>
                        </button>
                        <Link
                            href="/admin/cities"
                            className="px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                        >
                            {t('cancel') || 'إلغاء'}
                        </Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

