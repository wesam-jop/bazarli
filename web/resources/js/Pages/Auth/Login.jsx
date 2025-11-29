import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, ArrowLeft, Phone, Shield, Zap } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Layout from '../Layout';
import { useTranslation } from '../../hooks/useTranslation';
import DeliGoLogo from '../../Components/DeliGoLogo';

export default function Login() {
    const [isPhoneValid, setIsPhoneValid] = useState(false);
    const { t, locale } = useTranslation();
    const isRTL = locale === 'ar';

    const { data, setData, post, processing, errors } = useForm({
        phone: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login');
    };

    const handlePhoneChange = (value, country) => {
        setData('phone', value);
        const phoneWithoutCode = value.replace(/\D/g, '');
        const isValid = phoneWithoutCode && phoneWithoutCode.length >= 9;
        setIsPhoneValid(isValid);
    };

    const badges = [
        t('login_badge_fast') || 'تسجيل سريع',
        t('login_badge_secure') || 'آمن ومشفر',
        t('login_badge_support') || 'دعم متواصل',
    ];

    return (
        <Layout>
            <div 
                className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30 py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden" 
                dir={isRTL ? 'rtl' : 'ltr'}
            >
                <Head title={t('login_page_title') || 'تسجيل الدخول'} />
                
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
                        <div className="flex justify-center mb-6">
                            <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xl shadow-primary-500/10 border border-slate-100 bg-secondary-200">
                                <DeliGoLogo height={48} className="sm:hidden" />
                                <DeliGoLogo height={56} className="hidden sm:flex" />
                            </div>
                        </div>
                        
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2 sm:mb-3">
                            {t('login_page_title') || 'مرحباً بعودتك'}
                        </h1>
                        <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-md mx-auto leading-relaxed px-2">
                            {t('login_page_subtitle') || 'سجّل دخولك لمتابعة طلباتك والاستمتاع بتجربة تسوق مميزة'}
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                {/* Security Card */}
                                <div className="flex items-start gap-3 rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow" style={{ flexDirection: 'row' }}>
                                    <div className="p-2.5 sm:p-3 rounded-xl bg-primary-100 text-primary-600 flex-shrink-0">
                                        <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1 text-start">
                                        <p className="font-semibold text-slate-900 text-sm sm:text-base">
                                            {t('login_secure_title') || 'تسجيل آمن'}
                                        </p>
                                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5 line-clamp-2">
                                            {t('login_secure_desc') || 'نستخدم رمز تحقق لمرة واحدة لحماية حسابك'}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Fast Card */}
                                <div className="flex items-start gap-3 rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow" style={{ flexDirection: 'row' }}>
                                    <div className="p-2.5 sm:p-3 rounded-xl bg-accent-100 text-accent-600 flex-shrink-0">
                                        <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1 text-start">
                                        <p className="font-semibold text-slate-900 text-sm sm:text-base">
                                            {t('login_fast_title') || 'دخول سريع'}
                                        </p>
                                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5 line-clamp-2">
                                            {t('login_fast_desc') || 'أدخل رقم هاتفك فقط وسنرسل لك رمز التحقق'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <form className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
                            {/* Phone Field - Always LTR */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-800 mb-2 text-start">
                                    {t('phone_number') || 'رقم الهاتف'}
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
                                        placeholder={t('phone_number_placeholder') || 'أدخل رقم هاتفك'}
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

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing || !isPhoneValid}
                                className="group relative w-full flex justify-center items-center gap-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-primary-500/25"
                            >
                                {processing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                                        <span>{t('sending_otp') || 'جاري الإرسال...'}</span>
                                    </>
                                ) : (
                                    <>
                                        {isRTL && <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 rotate-180 group-hover:-translate-x-1" />}
                                        <span>{t('send_otp') || 'إرسال رمز التحقق'}</span>
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

                    {/* Register Link */}
                    <div className="text-center mt-6 sm:mt-8">
                        <p className="text-sm sm:text-base text-slate-600">
                            {t('dont_have_account') || 'ليس لديك حساب؟'}{' '}
                            <Link
                                href="/register"
                                className="font-semibold text-primary-600 hover:text-primary-700 transition-colors underline decoration-2 underline-offset-4 decoration-primary-300 hover:decoration-primary-500"
                            >
                                {t('sign_up_here') || 'أنشئ حساباً جديداً'}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
