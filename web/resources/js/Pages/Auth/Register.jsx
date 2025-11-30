import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowRight, ArrowLeft, User, Store, Truck, MapPin, ChevronDown, Sparkles } from 'lucide-react';
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
    
    const safeGovernorates = governorates || props?.governorates || [];
    
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        phone: '',
        governorate_id: '',
        city_id: '',
        agree_terms: false
    });
    
    const [availableAreas, setAvailableAreas] = useState([]);
    
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

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && data.agree_terms && isPhoneValid && data.governorate_id && data.city_id && !processing) {
            e.preventDefault();
            handleSubmit(e);
        }
    };
    
    useEffect(() => {
        if (data.phone) {
            const phoneWithoutCode = data.phone.replace(/\D/g, '');
            const isValid = phoneWithoutCode && phoneWithoutCode.length >= 9;
            setIsPhoneValid(isValid);
        }
    }, [data.phone]);

    return (
        <Layout>
            <div 
                className="relative min-h-screen flex" 
                dir={isRTL ? 'rtl' : 'ltr'}
            >
                <Head title={t('register_page_title')} />
                
                {/* Left Side - Branding */}
                <div className={`hidden lg:flex justify-center lg:w-1/2 relative overflow-hidden ${isRTL ? 'bg-gradient-to-l from-amber-50 via-orange-50 to-white' : 'bg-gradient-to-r from-amber-50 via-orange-50 to-white'} ${isRTL ? 'order-2' : ''}`}>
                    {/* Content */}
                    <div className="relative z-10 flex flex-col justify-center items-center h-full p-12 text-slate-800">
                        <div className="w-full max-w-md mx-auto text-center space-y-8">
                            <div className="flex justify-center">
                                <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-md border border-amber-200/50 shadow-2xl hover:scale-105 transition-transform duration-300">
                                    <DeliGoLogo height={64} className="mx-auto" />
                                </div>
                            </div>
                            
                            <div className="space-y-4 w-full">
                                <h2 className="text-4xl font-bold text-slate-800 w-full" style={{ textAlign: 'center' }}>
                                    {t('register_page_title')}
                                </h2>
                                <p className="text-lg text-slate-700 leading-relaxed w-full" style={{ textAlign: 'center' }}>
                                    {t('register_page_subtitle')}
                                </p>
                            </div>
                            
                            {/* Features */}
                            <div className="grid grid-cols-1 gap-4 pt-8 w-full">
                                <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-amber-200/50 hover:bg-white hover:scale-[1.02] transition-all duration-300 w-full shadow-lg">
                                    <div className="p-3 rounded-xl bg-primary-100 shadow-md">
                                        <Store className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <div className="w-full" style={{ textAlign: 'center' }}>
                                        <p className="font-semibold text-lg text-slate-800 w-full" style={{ textAlign: 'center' }}>{t('register_upgrade_store_title')}</p>
                                        <p className="text-sm text-slate-600 mt-1 w-full" style={{ textAlign: 'center' }}>{t('register_upgrade_store_desc')}</p>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-amber-200/50 hover:bg-white hover:scale-[1.02] transition-all duration-300 w-full shadow-lg">
                                    <div className="p-3 rounded-xl bg-accent-100 shadow-md">
                                        <Truck className="w-6 h-6 text-accent-600" />
                                    </div>
                                    <div className="w-full" style={{ textAlign: 'center' }}>
                                        <p className="font-semibold text-lg text-slate-800 w-full" style={{ textAlign: 'center' }}>{t('register_upgrade_driver_title')}</p>
                                        <p className="text-sm text-slate-600 mt-1 w-full" style={{ textAlign: 'center' }}>{t('register_upgrade_driver_desc')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className={`w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-slate-50 via-white to-slate-50 overflow-y-auto relative ${isRTL ? 'order-1' : ''}`}>
                    <div className="w-full max-w-md py-8">
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex justify-center mb-8">
                            <div className="p-4 rounded-2xl bg-white shadow-lg border border-slate-200">
                                <DeliGoLogo height={40} />
                            </div>
                        </div>
                        
                        {/* Form Card */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 p-8 sm:p-10">
                            <div className="space-y-6">
                                <div className={`text-center space-y-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                                    <h1 className="text-3xl font-bold text-slate-900">
                                        {t('register_page_title')}
                                    </h1>
                                    <p className="text-slate-600">
                                        {t('register_page_subtitle')}
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Name Field */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            {t('full_name')}
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                className="w-full ps-12 pe-4 py-4 rounded-2xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all bg-slate-50 focus:bg-white text-base shadow-sm focus:shadow-md"
                                                placeholder={t('full_name_placeholder')}
                                                disabled={processing}
                                            />
                                        </div>
                                        {errors.name && (
                                            <p className="mt-2 text-sm text-red-600 font-medium">{errors.name}</p>
                                        )}
                                    </div>

                                    {/* Phone Field */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            {t('phone_number')}
                                        </label>
                                        <div dir="ltr" className="relative phone-input-ltr" style={{ direction: 'ltr', textAlign: 'left' }}>
                                            <PhoneInput
                                                country={'sy'}
                                                value={data.phone}
                                                onChange={handlePhoneChange}
                                                inputClass="!w-full !py-4 !pr-4 !pl-14 !rounded-2xl !border !border-slate-300 !focus:outline-none !focus:ring-2 !focus:ring-primary-500/30 !focus:border-primary-500 !text-base !bg-slate-50 focus:!bg-white !text-slate-900 !transition-all !text-left !shadow-sm focus:!shadow-md"
                                                buttonClass="!rounded-l-2xl !bg-slate-100 !border-slate-300 !border-r-0"
                                                containerClass="!w-full"
                                                containerStyle={{ direction: 'ltr', flexDirection: 'row' }}
                                                placeholder={t('phone_number_placeholder')}
                                                enableSearch
                                                inputProps={{
                                                    maxLength: 17,
                                                    style: { direction: 'ltr', textAlign: 'left' },
                                                    onKeyDown: handleKeyDown
                                                }}
                                            />
                                        </div>
                                        {errors.phone && (
                                            <p className="mt-2 text-sm text-red-600 font-medium">{errors.phone}</p>
                                        )}
                                    </div>

                                    {/* Location Fields */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Governorate */}
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                {t('governorate') || 'المحافظة'} <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none">
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
                                                    onKeyDown={handleKeyDown}
                                                    className="w-full ps-12 pe-10 py-4 rounded-2xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all bg-slate-50 focus:bg-white appearance-none cursor-pointer text-base shadow-sm focus:shadow-md"
                                                    required
                                                    disabled={processing}
                                                >
                                                    <option value="">{t('select_governorate') || 'اختر المحافظة'}</option>
                                                    {safeGovernorates.map((gov) => (
                                                        <option key={gov.id} value={gov.id}>{gov.name}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 end-0 pe-4 flex items-center pointer-events-none">
                                                    <ChevronDown className="h-4 w-4 text-slate-400" />
                                                </div>
                                            </div>
                                            {errors.governorate_id && (
                                                <p className="mt-2 text-sm text-red-600 font-medium">{errors.governorate_id}</p>
                                            )}
                                        </div>

                                        {/* Area */}
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                {t('area') || 'المنطقة'} <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none">
                                                    <MapPin className="h-5 w-5 text-slate-400" />
                                                </div>
                                                <select
                                                    value={data.city_id}
                                                    onChange={(e) => setData('city_id', e.target.value)}
                                                    onKeyDown={handleKeyDown}
                                                    className="w-full ps-12 pe-10 py-4 rounded-2xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all bg-slate-50 focus:bg-white appearance-none cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400 text-base shadow-sm focus:shadow-md"
                                                    required
                                                    disabled={processing || !data.governorate_id || availableAreas.length === 0}
                                                >
                                                    <option value="">{t('select_area') || 'اختر المنطقة'}</option>
                                                    {availableAreas.map((area) => (
                                                        <option key={area.id} value={area.id}>{area.name}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 end-0 pe-4 flex items-center pointer-events-none">
                                                    <ChevronDown className="h-4 w-4 text-slate-400" />
                                                </div>
                                            </div>
                                            {errors.city_id && (
                                                <p className="mt-2 text-sm text-red-600 font-medium">{errors.city_id}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Terms Checkbox */}
                                    <div className="flex items-start gap-3">
                                        <input
                                            id="agree_terms"
                                            type="checkbox"
                                            checked={data.agree_terms}
                                            onChange={(e) => setData('agree_terms', e.target.checked)}
                                            className="mt-1 h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                            disabled={processing}
                                        />
                                        <label htmlFor="agree_terms" className="text-sm text-slate-600 cursor-pointer leading-relaxed">
                                            {t('terms_agree')}{' '}
                                            <Link href="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                                                {t('terms_of_service')}
                                            </Link>{' '}
                                            {t('terms_and')}{' '}
                                            <Link href="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                                                {t('privacy_policy')}
                                            </Link>
                                        </label>
                                    </div>
                                    {errors.agree_terms && (
                                        <p className="text-sm text-red-600 font-medium">{errors.agree_terms}</p>
                                    )}

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={processing || !data.agree_terms || !isPhoneValid || !data.governorate_id || !data.city_id}
                                        className="w-full flex justify-center items-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 py-4 text-base font-semibold text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-transparent"></div>
                                                <span>{t('sending_otp')}</span>
                                            </>
                                        ) : (
                                            <>
                                                {isRTL && <ArrowLeft className="h-5 w-5 rotate-180" />}
                                                <span>{t('send_otp')}</span>
                                                {!isRTL && <ArrowRight className="h-5 w-5" />}
                                            </>
                                        )}
                                    </button>

                                    {/* Error Message */}
                                    {errors.message && (
                                        <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-4 text-sm text-red-700 font-medium">
                                            {errors.message}
                                        </div>
                                    )}
                                </form>

                                {/* Login Link */}
                                <div className={`text-center pt-4 border-t border-slate-200 ${isRTL ? 'text-right' : 'text-left'}`}>
                                    <p className="text-sm text-slate-600">
                                        {t('already_have_account')}{' '}
                                        <Link
                                            href="/login"
                                            className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                                        >
                                            {t('sign_in_here')}
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
