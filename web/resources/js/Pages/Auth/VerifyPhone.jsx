import React, { useState, useEffect, useRef } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { ArrowRight, ArrowLeft, RefreshCw, CheckCircle, Clock, Shield, Smartphone, Lock } from 'lucide-react';
import Layout from '../Layout';
import { useTranslation } from '../../hooks/useTranslation';
import DeliGoLogo from '../../Components/DeliGoLogo';

export default function VerifyPhone({ phone, userType = 'customer', action = 'register' }) {
    const [timeLeft, setTimeLeft] = useState(300);
    const [isResending, setIsResending] = useState(false);
    const [verificationError, setVerificationError] = useState(null);
    const [isVerified, setIsVerified] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '']);
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRefs = useRef([]);
    const { t, locale } = useTranslation();
    const isRTL = locale === 'ar';

    const { data, setData, post, processing, errors } = useForm({
        phone: phone,
        code: '',
        user_type: userType,
        action: action
    });

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleOTPChange = (index, value) => {
        if (processing) return;
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setVerificationError(null);

        const otpString = newOtp.join('');
        setData('code', otpString);

        if (value && index < 4) {
            setActiveIndex(index + 1);
            inputRefs.current[index + 1]?.focus();
        }

        if (otpString.length === 5 && !otpString.includes('')) {
            handleSubmit(otpString);
        }
    };

    const handleKeyDown = (index, e) => {
        if (processing) return;

        if (e.key === 'Enter') {
            const otpValue = otp.join('');
            if (otpValue.length === 5) {
                e.preventDefault();
                handleSubmit(otpValue);
            }
            return;
        }

        if (e.key === 'Backspace') {
            if (otp[index]) {
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
                setData('code', newOtp.join(''));
            } else if (index > 0) {
                setActiveIndex(index - 1);
                inputRefs.current[index - 1]?.focus();
            }
        }
        
        if (e.key === 'ArrowLeft' && index > 0) {
            setActiveIndex(index - 1);
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowRight' && index < 4) {
            setActiveIndex(index + 1);
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        if (processing) return;
        
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 5);
        const newOtp = [...otp];
        
        for (let i = 0; i < pastedData.length && i < 5; i++) {
            newOtp[i] = pastedData[i];
        }
        
        setOtp(newOtp);
        const otpString = newOtp.join('');
        setData('code', otpString);
        
        const nextIndex = Math.min(pastedData.length, 4);
        setActiveIndex(nextIndex);
        inputRefs.current[nextIndex]?.focus();

        if (otpString.length === 5) {
            handleSubmit(otpString);
        }
    };

    const handleSubmit = (otpValue) => {
        post('/verify-phone', {
            data: { ...data, code: otpValue },
            onSuccess: () => {
                setIsVerified(true);
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
            },
            onError: (errors) => {
                setVerificationError(errors.code || t('verify_invalid_code') || 'رمز التحقق غير صحيح');
            }
        });
    };

    const handleResendCode = async () => {
        setIsResending(true);
        setVerificationError(null);
        
        try {
            await fetch('/resend-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({ phone: phone, action: action })
            });
            
            setTimeLeft(300);
            setOtp(['', '', '', '', '']);
            setData('code', '');
            setActiveIndex(0);
            inputRefs.current[0]?.focus();
        } catch (error) {
            setVerificationError(t('verify_resend_failed') || 'فشل إعادة إرسال الرمز');
        } finally {
            setIsResending(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const backPath = action === 'login' ? '/login' : '/register';

    // Success View
    if (isVerified) {
        return (
            <Layout>
                <div 
                    className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-white to-teal-50"
                    dir={isRTL ? 'rtl' : 'ltr'}
                >
                    <Head title={t('verify_success_title') || 'تم التحقق بنجاح'} />
                    
                    <div className="max-w-md w-full">
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 p-10 text-center space-y-6">
                            <div className="flex justify-center">
                                <div className="p-6 rounded-full bg-emerald-100 shadow-xl shadow-emerald-500/20">
                                    <CheckCircle className="w-16 h-16 text-emerald-600" />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold text-slate-900">
                                    {t('verify_success_title') || 'تم التحقق بنجاح!'}
                                </h1>
                                <p className="text-slate-600">
                                    {t('verify_success_message') || 'تم تأكيد رقم هاتفك بنجاح'}
                                </p>
                            </div>
                            
                            <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-200 border-t-emerald-600"></div>
                            </div>
                            
                            <p className="text-sm text-slate-500">
                                {t('verify_success_redirect') || 'جاري تحويلك للصفحة الرئيسية...'}
                            </p>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div 
                className="relative min-h-screen flex" 
                dir={isRTL ? 'rtl' : 'ltr'}
            >
                <Head title={t('verify_page_title') || 'التحقق من الهاتف'} />
                
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
                                    {t('verify_page_title') || 'التحقق من رقم الهاتف'}
                                </h2>
                                <p className="text-lg text-slate-700 leading-relaxed w-full" style={{ textAlign: 'center' }}>
                                    {t('verify_page_subtitle') || 'أدخل رمز التحقق المرسل إلى هاتفك'}
                                </p>
                            </div>
                            
                            {/* Features */}
                            <div className="grid grid-cols-1 gap-4 pt-8 w-full">
                                <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-amber-200/50 hover:bg-white hover:scale-[1.02] transition-all duration-300 w-full shadow-lg">
                                    <div className="p-3 rounded-xl bg-primary-100 shadow-md">
                                        <Smartphone className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <div className="w-full" style={{ textAlign: 'center' }}>
                                        <p className="font-semibold text-lg text-slate-800 w-full" style={{ textAlign: 'center' }}>{t('verify_sent_to') || 'تم إرسال الرمز إلى'}</p>
                                        <p className="text-sm text-slate-600 font-mono mt-1 w-full" style={{ textAlign: 'center' }} dir="ltr">{phone}</p>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-amber-200/50 hover:bg-white hover:scale-[1.02] transition-all duration-300 w-full shadow-lg">
                                    <div className={`p-3 rounded-xl shadow-md ${timeLeft > 60 ? 'bg-accent-100' : 'bg-red-100'}`}>
                                        <Clock className={`w-6 h-6 ${timeLeft > 60 ? 'text-accent-600' : 'text-red-600'}`} />
                                    </div>
                                    <div className="w-full" style={{ textAlign: 'center' }}>
                                        <p className="font-semibold text-lg text-slate-800 w-full" style={{ textAlign: 'center' }}>{t('verify_time_remaining') || 'الوقت المتبقي'}</p>
                                        <p className={`text-sm font-medium mt-1 w-full ${timeLeft > 60 ? 'text-slate-600' : 'text-red-600'}`} style={{ textAlign: 'center' }}>
                                            {timeLeft > 0 ? formatTime(timeLeft) : (t('verify_expired') || 'انتهت الصلاحية')}
                                        </p>
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
                                        {t('verify_page_title') || 'التحقق من رقم الهاتف'}
                                    </h1>
                                    <p className="text-slate-600">
                                        {t('verify_page_subtitle') || 'أدخل رمز التحقق المرسل إلى هاتفك'}
                                    </p>
                                </div>

                                {/* OTP Inputs */}
                                <div className="space-y-4">
                                    <label className="block text-sm font-semibold text-slate-700 text-center">
                                        {t('verify_enter_code') || 'أدخل رمز التحقق المكون من 5 أرقام'}
                                    </label>
                                    
                                    <div className="flex justify-center gap-3" dir="ltr">
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                ref={(el) => (inputRefs.current[index] = el)}
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                maxLength="1"
                                                value={digit}
                                                onChange={(e) => handleOTPChange(index, e.target.value.replace(/\D/g, ''))}
                                                onKeyDown={(e) => handleKeyDown(index, e)}
                                                onPaste={handlePaste}
                                                onFocus={() => setActiveIndex(index)}
                                                disabled={processing}
                                                className={`w-14 h-16 text-center text-2xl font-bold rounded-2xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 ${
                                                    verificationError
                                                        ? 'border-red-300 bg-red-50 text-red-700 focus:border-red-500'
                                                        : digit
                                                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                            : activeIndex === index
                                                                ? 'border-primary-500 bg-white text-slate-900 shadow-md'
                                                                : 'border-slate-300 bg-slate-50 text-slate-900'
                                                } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            />
                                        ))}
                                    </div>

                                    {verificationError && (
                                        <p className="text-center text-sm text-red-600 font-medium flex items-center justify-center gap-2">
                                            <Shield className="w-4 h-4" />
                                            {verificationError}
                                        </p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        const otpValue = otp.join('');
                                        if (otpValue.length === 5) {
                                            handleSubmit(otpValue);
                                        }
                                    }}
                                    disabled={processing || otp.join('').length !== 5}
                                    className="w-full flex justify-center items-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 py-4 text-base font-semibold text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {processing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-transparent"></div>
                                            <span>{t('verify_verifying') || 'جاري التحقق...'}</span>
                                        </>
                                    ) : (
                                        <>
                                            {isRTL && <ArrowLeft className="h-5 w-5 rotate-180" />}
                                            <span>{t('verify_button') || 'تأكيد الرمز'}</span>
                                            {!isRTL && <ArrowRight className="h-5 w-5" />}
                                        </>
                                    )}
                                </button>

                                {/* Resend Section */}
                                <div className="text-center space-y-3 pt-4 border-t border-slate-200">
                                    <p className="text-sm text-slate-600">
                                        {t('verify_didnt_receive') || 'لم تستلم الرمز؟'}
                                    </p>
                                    
                                    {timeLeft === 0 ? (
                                        <button
                                            type="button"
                                            onClick={handleResendCode}
                                            disabled={isResending}
                                            className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors disabled:opacity-50"
                                        >
                                            <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
                                            {isResending ? (t('verify_resending') || 'جاري الإرسال...') : (t('verify_resend') || 'إعادة إرسال الرمز')}
                                        </button>
                                    ) : (
                                        <p className="text-sm text-slate-500">
                                            {t('verify_wait_to_resend') || 'يمكنك إعادة الإرسال بعد'} {formatTime(timeLeft)}
                                        </p>
                                    )}
                                </div>

                                {/* Security Info */}
                                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-200">
                                    <div className="p-2 rounded-lg bg-primary-100 text-primary-600 flex-shrink-0">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <div className="text-start">
                                        <p className="text-sm font-medium text-slate-900">
                                            {t('verify_security_title') || 'حماية حسابك'}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {t('verify_security_desc') || 'لا تشارك هذا الرمز مع أي شخص'}
                                        </p>
                                    </div>
                                </div>

                                {/* Error Message */}
                                {errors.message && (
                                    <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-4 text-sm text-red-700 font-medium">
                                        {errors.message}
                                    </div>
                                )}

                                {/* Back Link */}
                                <div className="text-center pt-4 border-t border-slate-200">
                                    <button
                                        onClick={() => router.visit(backPath)}
                                        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-primary-600 transition-colors"
                                    >
                                        <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                                        <span>
                                            {action === 'login' 
                                                ? (t('verify_back_to_login') || 'العودة لتسجيل الدخول')
                                                : (t('verify_back_to_register') || 'العودة لإنشاء الحساب')
                                            }
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
