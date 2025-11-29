import React, { useState, useEffect, useRef } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { ArrowRight, ArrowLeft, RefreshCw, CheckCircle, Clock, Shield, Smartphone, Lock } from 'lucide-react';
import Layout from '../Layout';
import { useTranslation } from '../../hooks/useTranslation';
import DeliGoLogo from '../../Components/DeliGoLogo';

export default function VerifyPhone({ phone, userType = 'customer', action = 'register' }) {
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
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

    // Timer countdown
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    // Auto focus first input
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

        // Update form data
        const otpString = newOtp.join('');
        setData('code', otpString);

        // Move to next input if value is entered
        if (value && index < 4) {
            setActiveIndex(index + 1);
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when complete
        if (otpString.length === 5 && !otpString.includes('')) {
            handleSubmit(otpString);
        }
    };

    const handleKeyDown = (index, e) => {
        if (processing) return;

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

    const badges = [
        t('verify_badge_secure') || 'تحقق آمن',
        t('verify_badge_fast') || 'سريع وسهل',
        t('verify_badge_oneTime') || 'رمز لمرة واحدة',
    ];

    // Success View
    if (isVerified) {
        return (
            <Layout>
                <div 
                    className="relative min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50/30 py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
                    dir={isRTL ? 'rtl' : 'ltr'}
                >
                    <Head title={t('verify_success_title') || 'تم التحقق بنجاح'} />
                    
                    {/* Background Elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-40 -end-40 w-80 sm:w-96 h-80 sm:h-96 bg-emerald-500/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-40 -start-40 w-80 sm:w-96 h-80 sm:h-96 bg-teal-400/15 rounded-full blur-3xl" />
                    </div>

                    <div className="relative z-10 max-w-lg mx-auto">
                        <div className="text-center">
                            <div className="flex justify-center mb-6">
                                <div className="p-6 rounded-full bg-emerald-100 shadow-xl shadow-emerald-500/20">
                                    <CheckCircle className="w-16 h-16 text-emerald-600" />
                                </div>
                            </div>
                            
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
                                {t('verify_success_title') || 'تم التحقق بنجاح!'}
                            </h1>
                            <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-md mx-auto leading-relaxed mb-4">
                                {t('verify_success_message') || 'تم تأكيد رقم هاتفك بنجاح'}
                            </p>
                            <p className="text-sm text-slate-500">
                                {t('verify_success_redirect') || 'جاري تحويلك للصفحة الرئيسية...'}
                            </p>
                            
                            <div className="mt-6 flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-200 border-t-emerald-600"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div 
                className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30 py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden" 
                dir={isRTL ? 'rtl' : 'ltr'}
            >
                <Head title={t('verify_page_title') || 'التحقق من الهاتف'} />
                
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
                            {t('verify_page_title') || 'التحقق من رقم الهاتف'}
                        </h1>
                        <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-md mx-auto leading-relaxed px-2">
                            {t('verify_page_subtitle') || 'أدخل رمز التحقق المرسل إلى هاتفك'}
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
                                {/* Phone Card */}
                                <div className="flex items-start gap-3 rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow" style={{ flexDirection: 'row' }}>
                                    <div className="p-2.5 sm:p-3 rounded-xl bg-primary-100 text-primary-600 flex-shrink-0">
                                        <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1 text-start">
                                        <p className="font-semibold text-slate-900 text-sm sm:text-base">
                                            {t('verify_sent_to') || 'تم إرسال الرمز إلى'}
                                        </p>
                                        <p className="text-xs sm:text-sm text-primary-600 font-medium mt-0.5 direction-ltr" dir="ltr">
                                            {phone}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Timer Card */}
                                <div className="flex items-start gap-3 rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow" style={{ flexDirection: 'row' }}>
                                    <div className={`p-2.5 sm:p-3 rounded-xl flex-shrink-0 ${timeLeft > 60 ? 'bg-accent-100 text-accent-600' : 'bg-red-100 text-red-600'}`}>
                                        <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1 text-start">
                                        <p className="font-semibold text-slate-900 text-sm sm:text-base">
                                            {t('verify_time_remaining') || 'الوقت المتبقي'}
                                        </p>
                                        <p className={`text-xs sm:text-sm font-medium mt-0.5 ${timeLeft > 60 ? 'text-accent-600' : 'text-red-600'}`}>
                                            {timeLeft > 0 ? formatTime(timeLeft) : (t('verify_expired') || 'انتهت الصلاحية')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* OTP Input Section */}
                        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                            {/* OTP Inputs */}
                            <div className="space-y-4">
                                <label className="block text-sm font-semibold text-slate-800 text-center">
                                    {t('verify_enter_code') || 'أدخل رمز التحقق المكون من 5 أرقام'}
                                </label>
                                
                                <div className="flex justify-center gap-2 sm:gap-3" dir="ltr">
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
                                            className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl sm:rounded-2xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                                                verificationError
                                                    ? 'border-red-300 bg-red-50 text-red-700 focus:border-red-500'
                                                    : digit
                                                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                        : activeIndex === index
                                                            ? 'border-primary-500 bg-white text-slate-900'
                                                            : 'border-slate-200 bg-slate-50/50 text-slate-900'
                                            } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        />
                                    ))}
                                </div>

                                {/* Error Message */}
                                {verificationError && (
                                    <p className="text-center text-sm text-red-500 flex items-center justify-center gap-1">
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
                                className="group relative w-full flex justify-center items-center gap-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-primary-500/25"
                            >
                                {processing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                                        <span>{t('verify_verifying') || 'جاري التحقق...'}</span>
                                    </>
                                ) : (
                                    <>
                                        {isRTL && <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 rotate-180 group-hover:-translate-x-1" />}
                                        <span>{t('verify_button') || 'تأكيد الرمز'}</span>
                                        {!isRTL && <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-1" />}
                                    </>
                                )}
                            </button>

                            {/* Resend Section */}
                            <div className="text-center space-y-3">
                                <p className="text-sm text-slate-600">
                                    {t('verify_didnt_receive') || 'لم تستلم الرمز؟'}
                                </p>
                                
                                {timeLeft === 0 ? (
                                    <button
                                        type="button"
                                        onClick={handleResendCode}
                                        disabled={isResending}
                                        className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors disabled:opacity-50"
                                        style={{ flexDirection: 'row' }}
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
                            <div className="flex items-start gap-3 rounded-xl sm:rounded-2xl bg-slate-50 p-4 border border-slate-100" style={{ flexDirection: 'row' }}>
                                <div className="p-2 rounded-lg bg-primary-100 text-primary-600 flex-shrink-0">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <div className="text-start">
                                    <p className="text-sm font-medium text-slate-900">
                                        {t('verify_security_title') || 'حماية حسابك'}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {t('verify_security_desc') || 'لا تشارك هذا الرمز مع أي شخص. فريق الدعم لن يطلب منك الرمز أبداً.'}
                                    </p>
                                </div>
                            </div>

                            {/* Error Message */}
                            {errors.message && (
                                <div className="rounded-xl sm:rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                    {errors.message}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Back Link */}
                    <div className="text-center mt-6 sm:mt-8">
                        <button
                            onClick={() => router.visit(backPath)}
                            className="inline-flex items-center gap-2 text-sm sm:text-base text-slate-600 hover:text-primary-600 transition-colors"
                            style={{ flexDirection: 'row' }}
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
        </Layout>
    );
}
