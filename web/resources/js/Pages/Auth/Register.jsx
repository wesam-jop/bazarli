import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowRight, ArrowLeft, User, Store, Truck, MapPin, ChevronDown } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Layout from '../Layout';
import { useTranslation } from '../../hooks/useTranslation';
import DeliGoLogo from '../../Components/DeliGoLogo';

export default function Register({ governorates = [], areas: initialAreas = [] }) {
    const [isPhoneValid, setIsPhoneValid] = useState(false);
    const { t, locale } = useTranslation();
    const { props } = usePage();
    const isRTL = locale === 'ar';
    
    // Get governorates from props if available
    const safeGovernorates = governorates || props?.governorates || [];
    
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        phone: '',
        governorate_id: '',
        city_id: '',
        agree_terms: false
    });
    
    // State for cities (areas) filtered by selected governorate
    const [availableAreas, setAvailableAreas] = useState([]);
    
    // Fetch cities when governorate changes
    useEffect(() => {
        if (data.governorate_id) {
            fetch(`/api/v1/cities?governorate_id=${data.governorate_id}`)
                .then(res => res.json())
                .then(result => {
                    if (result.success) {
                        setAvailableAreas(result.data || []);
                    }
                })
                .catch(err => console.error('Error fetching cities:', err));
        } else {
            setAvailableAreas([]);
            setData('city_id', '');
        }
    }, [data.governorate_id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/register');
    };

    const handlePhoneChange = (value, country) => {
        setData('phone', value);
        const phoneWithoutCode = value.replace(/\D/g, '');
        const isValid = phoneWithoutCode && phoneWithoutCode.length >= 9;
        setIsPhoneValid(isValid);
    };
    
    useEffect(() => {
        if (data.phone) {
            const phoneWithoutCode = data.phone.replace(/\D/g, '');
            const isValid = phoneWithoutCode && phoneWithoutCode.length >= 9;
            setIsPhoneValid(isValid);
        }
    }, [data.phone]);

    const badges = [
        t('register_badge_fast'),
        t('register_badge_secure'),
        t('register_badge_support'),
    ];

    return (
        <Layout>
            <div 
                className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30 py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden" 
                dir={isRTL ? 'rtl' : 'ltr'}
            >
                <Head title={t('register_page_title')} />
                
                {/* Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -end-40 w-80 sm:w-96 h-80 sm:h-96 bg-primary-500/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-40 -start-40 w-80 sm:w-96 h-80 sm:h-96 bg-secondary-400/15 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-4xl bg-gradient-to-r from-primary-100/20 via-transparent to-secondary-100/20 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 max-w-lg mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-8 sm:mb-10">
                        {/* Logo with Site Name */}
                        <div className="flex justify-center mb-6 ">
                            <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xl shadow-primary-500/10 border border-slate-100 bg-secondary-200">
                                <DeliGoLogo height={48} className="sm:hidden" />
                                <DeliGoLogo height={56} className="hidden sm:flex" />
                            </div>
                        </div>
                        
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2 sm:mb-3">
                            {t('register_page_title')}
                        </h1>
                        <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-md mx-auto leading-relaxed px-2">
                            {t('register_page_subtitle')}
                        </p>
                        
                        {/* Badges */}
                        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-4 sm:mt-6">
                            {badges.map((badge) => (
                                <span
                                    key={badge}
                                    className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white border border-slate-200 text-slate-700 shadow-sm"
                                >
                                    {badge}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Main Card */}
                    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        {/* Info Banner */}
                        <div className="bg-gradient-to-r from-primary-50 via-primary-50/80 to-secondary-50 p-4 sm:p-6 border-b border-slate-100">
                            <p className="text-slate-800 font-medium text-sm sm:text-base mb-4 text-center sm:text-start">
                                {t('register_info_banner')}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                {/* Store Owner Card */}
                                <div className="flex items-start gap-3 rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow" style={{ flexDirection: 'row' }}>
                                    <div className="p-2.5 sm:p-3 rounded-xl bg-primary-100 text-primary-600 flex-shrink-0">
                                        <Store className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1 text-start">
                                        <p className="font-semibold text-slate-900 text-sm sm:text-base">
                                            {t('register_upgrade_store_title')}
                                        </p>
                                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5 line-clamp-2">
                                            {t('register_upgrade_store_desc')}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Driver Card */}
                                <div className="flex items-start gap-3 rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow" style={{ flexDirection: 'row' }}>
                                    <div className="p-2.5 sm:p-3 rounded-xl bg-accent-100 text-accent-600 flex-shrink-0">
                                        <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1 text-start">
                                        <p className="font-semibold text-slate-900 text-sm sm:text-base">
                                            {t('register_upgrade_driver_title')}
                                        </p>
                                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5 line-clamp-2">
                                            {t('register_upgrade_driver_desc')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <form className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
                            {/* Name Field */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-800 mb-2">
                                    {t('full_name')}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full ps-11 pe-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-slate-50/50 focus:bg-white text-sm sm:text-base"
                                        placeholder={t('full_name_placeholder')}
                                        disabled={processing}
                                    />
                                </div>
                                {errors.name && (
                                    <p className="mt-1.5 text-sm text-red-500">{errors.name}</p>
                                )}
                            </div>

                            {/* Phone Field - Always LTR */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-800 mb-2 text-start">
                                    {t('phone_number')}
                                </label>
                                <div dir="ltr" className="relative phone-input-ltr" style={{ direction: 'ltr', textAlign: 'left' }}>
                                    <PhoneInput
                                        country={'sy'}
                                        value={data.phone}
                                        onChange={handlePhoneChange}
                                        inputClass="!w-full !py-3 sm:!py-3.5 !pr-4 !pl-14 !rounded-xl sm:!rounded-2xl !border !border-slate-200 !focus:outline-none !focus:ring-2 !focus:ring-primary-500/20 !focus:border-primary-500 !text-sm sm:!text-base !bg-slate-50/50 focus:!bg-white !text-slate-900 !transition-all !text-left"
                                        buttonClass="!rounded-l-xl sm:!rounded-l-2xl !bg-slate-100 !border-slate-200 !border-r-0"
                                        containerClass="!w-full"
                                        containerStyle={{ direction: 'ltr', flexDirection: 'row' }}
                                        placeholder={t('phone_number_placeholder')}
                                        enableSearch
                                        inputProps={{
                                            maxLength: 17,
                                            style: { direction: 'ltr', textAlign: 'left' }
                                        }}
                                    />
                                </div>  
                                {errors.phone && (
                                    <p className="mt-1.5 text-sm text-red-500 text-start">{errors.phone}</p>
                                )}
                            </div>

                            {/* Location Fields - Side by Side on Desktop */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Governorate Field */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                                        {t('governorate') || 'المحافظة'} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none">
                                            <MapPin className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <select
                                            value={data.governorate_id}
                                            onChange={(e) => {
                                                const govId = e.target.value;
                                                setData('governorate_id', govId);
                                                setData('city_id', '');
                                                setAvailableAreas([]);
                                            }}
                                            className="w-full ps-11 pe-9 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-slate-50/50 focus:bg-white appearance-none cursor-pointer text-sm sm:text-base"
                                            required
                                            disabled={processing}
                                        >
                                            <option value="">{t('select_governorate') || 'اختر المحافظة'}</option>
                                            {safeGovernorates.map((gov) => (
                                                <option key={gov.id} value={gov.id}>
                                                    {gov.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 end-0 pe-3 flex items-center pointer-events-none">
                                            <ChevronDown className="h-4 w-4 text-slate-400" />
                                        </div>
                                    </div>
                                    {errors.governorate_id && (
                                        <p className="mt-1.5 text-sm text-red-500">{errors.governorate_id}</p>
                                    )}
                                </div>

                                {/* Area Field */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                                        {t('area') || 'المنطقة'} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none">
                                            <MapPin className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <select
                                            value={data.city_id}
                                            onChange={(e) => setData('city_id', e.target.value)}
                                            className="w-full ps-11 pe-9 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-slate-50/50 focus:bg-white appearance-none cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400 text-sm sm:text-base"
                                            required
                                            disabled={processing || !data.governorate_id || availableAreas.length === 0}
                                        >
                                            <option value="">{t('select_area') || 'اختر المنطقة'}</option>
                                            {availableAreas.map((area) => (
                                                <option key={area.id} value={area.id}>
                                                    {area.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 end-0 pe-3 flex items-center pointer-events-none">
                                            <ChevronDown className="h-4 w-4 text-slate-400" />
                                        </div>
                                    </div>
                                    {!data.governorate_id && (
                                        <p className="mt-1.5 text-xs text-slate-500">
                                            {t('select_governorate_first') || 'يرجى اختيار المحافظة أولاً'}
                                        </p>
                                    )}
                                    {data.governorate_id && availableAreas.length === 0 && (
                                        <p className="mt-1.5 text-xs text-amber-600">
                                            {t('no_areas_available') || 'لا توجد مناطق متاحة'}
                                        </p>
                                    )}
                                    {errors.city_id && (
                                        <p className="mt-1.5 text-sm text-red-500">{errors.city_id}</p>
                                    )}
                                </div>
                            </div>

                            {/* Terms Checkbox */}
                            <div className="flex items-start gap-3" style={{ flexDirection: 'row' }}>
                                <div className="flex items-center h-5 mt-0.5">
                                    <input
                                        id="agree_terms"
                                        name="agree_terms"
                                        type="checkbox"
                                        checked={data.agree_terms}
                                        onChange={(e) => setData('agree_terms', e.target.checked)}
                                        className="h-4 w-4 sm:h-5 sm:w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer transition-colors"
                                        disabled={processing}
                                    />
                                </div>
                                <label htmlFor="agree_terms" className="text-sm text-slate-600 cursor-pointer leading-relaxed">
                                    {t('terms_agree')}{' '}
                                    <Link href="/terms" className="text-primary-600 hover:text-primary-700 font-medium hover:underline">
                                        {t('terms_of_service')}
                                    </Link>{' '}
                                    {t('terms_and')}{' '}
                                    <Link href="/privacy" className="text-primary-600 hover:text-primary-700 font-medium hover:underline">
                                        {t('privacy_policy')}
                                    </Link>
                                </label>
                            </div>
                            {errors.agree_terms && (
                                <p className="text-sm text-red-500 -mt-2">{errors.agree_terms}</p>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing || !data.agree_terms || !isPhoneValid || !data.governorate_id || !data.city_id}
                                className="group relative w-full flex justify-center items-center gap-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-primary-500/25"
                            >
                                {processing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                                        <span>{t('sending_otp')}</span>
                                    </>
                                ) : (
                                    <>
                                        {isRTL && <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 rotate-180 group-hover:-translate-x-1" />}
                                        <span>{t('send_otp')}</span>
                                        {!isRTL && <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-1" />}
                                    </>
                                )}
                            </button>

                            {/* Error Message */}
                            {errors.message && (
                                <div className="rounded-xl sm:rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                    {errors.message}
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Login Link */}
                    <div className="text-center mt-6 sm:mt-8">
                        <p className="text-sm sm:text-base text-slate-600">
                            {t('already_have_account')}{' '}
                            <Link
                                href="/login"
                                className="font-semibold text-primary-600 hover:text-primary-700 transition-colors underline decoration-2 underline-offset-4 decoration-primary-300 hover:decoration-primary-500"
                            >
                                {t('sign_in_here')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
