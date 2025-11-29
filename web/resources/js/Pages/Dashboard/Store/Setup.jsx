import React, { useState } from 'react';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import Layout from '../../Layout';
import { useTranslation } from '../../../hooks/useTranslation';
import { Upload, MapPin, Store, Navigation, ChevronDown, ArrowRight, ArrowLeft } from 'lucide-react';
import StoreLocationPicker from '../../../Components/StoreLocationPicker';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

export default function StoreSetup() {
    const { props } = usePage();
    const storeTypes = props.storeTypes || [];
    const userPhone = props.userPhone || '';
    const governorates = props.governorates || [];
    const initialCities = props.cities || [];
    const userGovernorateId = props.userGovernorateId || '';
    const userCityId = props.userCityId || '';
    const { t, locale } = useTranslation();
    const isRTL = locale === 'ar';

    const [locationStatus, setLocationStatus] = useState(null);
    const [isPhoneValid, setIsPhoneValid] = useState(userPhone ? true : false);
    const [availableCities, setAvailableCities] = useState(initialCities);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        store_type: storeTypes[0]?.value || 'grocery',
        address: '',
        latitude: '',
        longitude: '',
        phone: userPhone,
        governorate_id: userGovernorateId,
        city_id: userCityId,
        logo: null,
    });

    // Fetch cities when governorate changes
    React.useEffect(() => {
        if (data.governorate_id) {
            fetch(`/api/v1/cities?governorate_id=${data.governorate_id}`)
                .then(res => res.json())
                .then(result => {
                    if (result.success) {
                        setAvailableCities(result.data || []);
                    }
                })
                .catch(err => console.error('Error fetching cities:', err));
        } else {
            setAvailableCities([]);
        }
    }, [data.governorate_id]);

    const handlePhoneChange = (value, country) => {
        setData('phone', value);
        const phoneWithoutCode = value.replace(/\D/g, '');
        const isValid = phoneWithoutCode && phoneWithoutCode.length >= 9;
        setIsPhoneValid(isValid);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/dashboard/store/setup', {
            forceFormData: true,
        });
    };

    const [logoPreview, setLogoPreview] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setData('logo', file);
        if (file) {
            setLogoPreview(URL.createObjectURL(file));
        } else {
            setLogoPreview(null);
        }
    };

    const handleMapChange = ({ latitude, longitude }) => {
        setData('latitude', latitude);
        setData('longitude', longitude);
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus({ type: 'error', message: t('store_map_geolocate_unsupported') });
            return;
        }

        setLocationStatus({ type: 'loading', message: t('store_map_geolocate_loading') });

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const lat = latitude.toFixed(6);
                const lng = longitude.toFixed(6);
                setData('latitude', lat);
                setData('longitude', lng);
                setLocationStatus({ type: 'success', message: t('store_map_geolocate_success') });
            },
            () => {
                setLocationStatus({ type: 'error', message: t('store_map_geolocate_denied') });
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    return (
        <Layout>
            <Head title={t('store_setup_title')} />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30 py-8 sm:py-12 px-4 sm:px-6 lg:px-8" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
                            <Store className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{t('store_setup_title')}</h1>
                            <p className="text-slate-500 text-sm sm:text-base mt-2">{t('store_setup_subtitle')}</p>
                        </div>
                    </div>

                    {/* Form Card */}
                    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        {/* Store Info Section */}
                        <div className="p-5 sm:p-6 lg:p-8 space-y-5 border-b border-slate-100">
                            <h2 className="text-lg font-semibold text-slate-900 text-start">{t('store_info_section')}</h2>
                            
                            {/* Store Name */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-800 mb-2 text-start">
                                    {t('store_name_label')} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none">
                                        <Store className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder={t('store_name_placeholder')}
                                        className="w-full ps-12 pe-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all"
                                    />
                                </div>
                                {errors.name && <p className="mt-1.5 text-sm text-red-500 text-start">{errors.name}</p>}
                            </div>

                            {/* Store Type */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-800 mb-2 text-start">
                                    {t('store_type_label')} <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {storeTypes.length > 0 ? storeTypes.map((type) => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => setData('store_type', type.value)}
                                            className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                                                data.store_type === type.value
                                                    ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                                                    : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:border-primary-200 hover:bg-primary-50/50'
                                            }`}
                                        >
                                            <span className="flex items-center justify-center gap-2">
                                                {type.icon && <span>{type.icon}</span>}
                                                <span>{type.label}</span>
                                            </span>
                                        </button>
                                    )) : (
                                        <p className="text-sm text-rose-600 col-span-full text-start">
                                            {t('store_types_empty') || 'Store types are not configured yet. Please contact support.'}
                                        </p>
                                    )}
                                </div>
                                {errors.store_type && <p className="mt-1.5 text-sm text-red-500 text-start">{errors.store_type}</p>}
                            </div>

                            {/* Store Phone */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-800 mb-2 text-start">
                                    {t('store_phone_label')} <span className="text-red-500">*</span>
                                </label>
                                <div dir="ltr" className="relative phone-input-ltr" style={{ direction: 'ltr', textAlign: 'left' }}>
                                    <PhoneInput
                                        country={'sy'}
                                        value={data.phone}
                                        onChange={handlePhoneChange}
                                        inputClass="!w-full !py-3 !pr-4 !pl-14 !rounded-xl !border !border-slate-200 !focus:outline-none !focus:ring-2 !focus:ring-primary-500/20 !focus:border-primary-500 !text-sm !bg-slate-50/50 focus:!bg-white !text-slate-900 !transition-all !text-left"
                                        buttonClass="!rounded-l-xl !bg-slate-100 !border-slate-200 !border-r-0"
                                        containerClass="!w-full"
                                        containerStyle={{ direction: 'ltr', flexDirection: 'row' }}
                                        placeholder={t('phone_number_placeholder') || 'أدخل رقم الهاتف'}
                                        enableSearch
                                        inputProps={{
                                            maxLength: 17,
                                            style: { direction: 'ltr', textAlign: 'left' }
                                        }}
                                    />
                                </div>
                                {errors.phone && <p className="mt-1.5 text-sm text-red-500 text-start">{errors.phone}</p>}
                            </div>

                            {/* Governorate & City */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Governorate */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-800 mb-2 text-start">
                                        {t('governorate')} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none">
                                            <MapPin className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <select
                                            value={data.governorate_id}
                                            onChange={(e) => {
                                                setData('governorate_id', e.target.value);
                                                setData('city_id', '');
                                            }}
                                            className="w-full ps-12 pe-10 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white appearance-none cursor-pointer transition-all"
                                            required
                                        >
                                            <option value="">{t('select_governorate')}</option>
                                            {governorates.map((gov) => (
                                                <option key={gov.id} value={gov.id}>
                                                    {gov.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 end-0 pe-3 flex items-center pointer-events-none">
                                            <ChevronDown className="h-4 w-4 text-slate-400" />
                                        </div>
                                    </div>
                                    {errors.governorate_id && <p className="mt-1.5 text-sm text-red-500 text-start">{errors.governorate_id}</p>}
                                </div>

                                {/* City */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-800 mb-2 text-start">
                                        {t('area')} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none">
                                            <MapPin className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <select
                                            value={data.city_id}
                                            onChange={(e) => setData('city_id', e.target.value)}
                                            className="w-full ps-12 pe-10 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white appearance-none cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed transition-all"
                                            required
                                            disabled={!data.governorate_id || availableCities.length === 0}
                                        >
                                            <option value="">{t('select_area')}</option>
                                            {availableCities.map((city) => (
                                                <option key={city.id} value={city.id}>
                                                    {city.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 end-0 pe-3 flex items-center pointer-events-none">
                                            <ChevronDown className="h-4 w-4 text-slate-400" />
                                        </div>
                                    </div>
                                    {!data.governorate_id && (
                                        <p className="mt-1.5 text-xs text-slate-500 text-start">
                                            {t('select_governorate_first')}
                                        </p>
                                    )}
                                    {errors.city_id && <p className="mt-1.5 text-sm text-red-500 text-start">{errors.city_id}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Location Section */}
                        <div className="p-5 sm:p-6 lg:p-8 space-y-5 border-b border-slate-100 bg-slate-50/30">
                            <h2 className="text-lg font-semibold text-slate-900 text-start">{t('store_location_section')}</h2>
                            
                            {/* Address */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-800 mb-2 text-start">
                                    {t('store_address_label')} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute top-3 start-0 ps-4 pointer-events-none">
                                        <MapPin className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <textarea
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        rows={3}
                                        placeholder={t('store_address_placeholder')}
                                        className="w-full ps-12 pe-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none transition-all"
                                    />
                                </div>
                                {errors.address && <p className="mt-1.5 text-sm text-red-500 text-start">{errors.address}</p>}
                            </div>

                            {/* Map */}
                            <div className="space-y-3">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="text-start">
                                        <p className="text-sm font-semibold text-slate-800">{t('store_map_title')}</p>
                                        <p className="text-xs text-slate-500">{t('store_map_subtitle')}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleUseCurrentLocation}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2.5 text-sm font-semibold text-primary-700 hover:bg-primary-100 transition-all"
                                    >
                                        <Navigation className="w-4 h-4" />
                                        {t('store_map_use_location')}
                                    </button>
                                </div>
                                <div className="rounded-xl overflow-hidden border border-slate-200">
                                    <StoreLocationPicker
                                        latitude={data.latitude}
                                        longitude={data.longitude}
                                        onChange={handleMapChange}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 flex items-center gap-2 text-start">
                                    <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
                                    {t('store_location_hint')}
                                </p>
                                {locationStatus && (
                                    <p
                                        className={`text-xs font-medium text-start ${
                                            locationStatus.type === 'success'
                                                ? 'text-emerald-600'
                                                : locationStatus.type === 'loading'
                                                ? 'text-slate-500'
                                                : 'text-rose-600'
                                        }`}
                                    >
                                        {locationStatus.message}
                                    </p>
                                )}
                            </div>

                            {/* Lat/Long */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-800 mb-2 text-start">
                                        {t('store_latitude_label')}
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        dir="ltr"
                                        value={data.latitude}
                                        onChange={(e) => setData('latitude', e.target.value)}
                                        placeholder="33.5138"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-left"
                                    />
                                    {errors.latitude && <p className="mt-1.5 text-sm text-red-500 text-start">{errors.latitude}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-800 mb-2 text-start">
                                        {t('store_longitude_label')}
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        dir="ltr"
                                        value={data.longitude}
                                        onChange={(e) => setData('longitude', e.target.value)}
                                        placeholder="36.2765"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-left"
                                    />
                                    {errors.longitude && <p className="mt-1.5 text-sm text-red-500 text-start">{errors.longitude}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Logo Section */}
                        <div className="p-5 sm:p-6 lg:p-8 space-y-5 border-b border-slate-100">
                            <h2 className="text-lg font-semibold text-slate-900 text-start">{t('store_logo_section')}</h2>
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-800 mb-2 text-start">
                                    {t('store_logo_label')}
                                </label>
                                <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-8 sm:py-10 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all relative overflow-hidden">
                                    {logoPreview ? (
                                        <div className="w-full flex flex-col items-center">
                                            <img
                                                src={logoPreview}
                                                alt="Store logo preview"
                                                className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-xl shadow-sm border border-slate-200"
                                            />
                                            <span className="mt-3 text-sm font-semibold text-slate-700">
                                                {data.logo?.name}
                                            </span>
                                            <span className="text-xs text-slate-500 mt-1">{t('store_logo_hint')}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="p-3 rounded-xl bg-primary-50 text-primary-600 mb-3">
                                                <Upload className="h-6 w-6 sm:h-8 sm:w-8" />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700">
                                                {t('store_logo_placeholder')}
                                            </span>
                                            <span className="text-xs text-slate-500 mt-1">{t('store_logo_hint')}</span>
                                        </>
                                    )}
                                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </label>
                                {errors.logo && <p className="mt-1.5 text-sm text-red-500 text-start">{errors.logo}</p>}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-5 sm:p-6 lg:p-8 bg-slate-50/50">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-600/90 disabled:opacity-50 transition-all"
                                >
                                    {processing ? t('store_submit_processing') : t('store_submit_label')}
                                    {!processing && (isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />)}
                                </button>
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 hover:border-primary-200 hover:text-primary-600 hover:bg-primary-50 transition-all"
                                >
                                    {t('store_cancel')}
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
