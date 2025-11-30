import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, ArrowLeft, Phone, Shield, Zap, Sparkles } from 'lucide-react';
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

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && isPhoneValid && !processing) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <Layout>
            <div 
                className="relative min-h-screen flex" 
                dir={isRTL ? 'rtl' : 'ltr'}
            >
                <Head title={t('login_page_title') || 'تسجيل الدخول'} />
                
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
                                    {t('login_page_title') || 'مرحباً بعودتك'}
                                </h2>
                                <p className="text-lg text-slate-700 leading-relaxed w-full" style={{ textAlign: 'center' }}>
                                    {t('login_page_subtitle') || 'سجّل دخولك لمتابعة طلباتك والاستمتاع بتجربة تسوق مميزة'}
                                </p>
                            </div>
                            
                            {/* Features */}
                            <div className="grid grid-cols-1 gap-4 pt-8 w-full">
                                <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-amber-200/50 hover:bg-white hover:scale-[1.02] transition-all duration-300 w-full shadow-lg">
                                    <div className="p-3 rounded-xl bg-primary-100 shadow-md">
                                        <Shield className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <div className="w-full" style={{ textAlign: 'center' }}>
                                        <p className="font-semibold text-lg text-slate-800 w-full" style={{ textAlign: 'center' }}>{t('login_secure_title') || 'تسجيل آمن'}</p>
                                        <p className="text-sm text-slate-600 mt-1 w-full" style={{ textAlign: 'center' }}>{t('login_secure_desc') || 'نستخدم رمز تحقق لمرة واحدة'}</p>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-amber-200/50 hover:bg-white hover:scale-[1.02] transition-all duration-300 w-full shadow-lg">
                                    <div className="p-3 rounded-xl bg-accent-100 shadow-md">
                                        <Zap className="w-6 h-6 text-accent-600" />
                                    </div>
                                    <div className="w-full" style={{ textAlign: 'center' }}>
                                        <p className="font-semibold text-lg text-slate-800 w-full" style={{ textAlign: 'center' }}>{t('login_fast_title') || 'دخول سريع'}</p>
                                        <p className="text-sm text-slate-600 mt-1 w-full" style={{ textAlign: 'center' }}>{t('login_fast_desc') || 'أدخل رقم هاتفك فقط'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className={`w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-slate-50 via-white to-slate-50 relative ${isRTL ? 'order-1' : ''}`}>
                    <div className="w-full max-w-md">
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
                                        {t('login_page_title') || 'مرحباً بعودتك'}
                                    </h1>
                                    <p className="text-slate-600">
                                        {t('login_page_subtitle') || 'سجّل دخولك للبدء'}
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Phone Field */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            {t('phone_number') || 'رقم الهاتف'}
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
                                                placeholder={t('phone_number_placeholder') || 'أدخل رقم هاتفك'}
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

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={processing || !isPhoneValid}
                                        className="w-full flex justify-center items-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 py-4 text-base font-semibold text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-transparent"></div>
                                                <span>{t('sending_otp') || 'جاري الإرسال...'}</span>
                                            </>
                                        ) : (
                                            <>
                                                {isRTL && <ArrowLeft className="h-5 w-5 rotate-180" />}
                                                <span>{t('send_otp') || 'إرسال رمز التحقق'}</span>
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

                                {/* Register Link */}
                                <div className={`text-center pt-4 border-t border-slate-200 ${isRTL ? 'text-right' : 'text-left'}`}>
                                    <p className="text-sm text-slate-600">
                                        {t('dont_have_account') || 'ليس لديك حساب؟'}{' '}
                                        <Link
                                            href="/register"
                                            className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                                        >
                                            {t('sign_up_here') || 'أنشئ حساباً جديداً'}
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
