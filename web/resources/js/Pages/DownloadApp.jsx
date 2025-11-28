import React from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import Layout from './Layout';
import { useTranslation } from '../hooks/useTranslation';
import { 
    Smartphone, 
    Apple, 
    Download, 
    CheckCircle,
    Star,
    Users,
    Clock,
    Shield,
} from 'lucide-react';

export default function DownloadApp() {
    const { t, locale } = useTranslation();
    const { props } = usePage();
    const downloadSettings = props.downloadSettings || {};
    const settings = props?.settings || {};
    const iosUrl = downloadSettings.app_download_ios_url || 'https://apps.apple.com/app/getir/id123456789';
    const androidUrl = downloadSettings.app_download_android_url || 'https://play.google.com/store/apps/details?id=com.getir';
    const directFileUrl = downloadSettings.app_download_direct_file_url || '';
    const [downloadsCount, setDownloadsCount] = React.useState(downloadSettings.app_download_downloads_count || '100K+');
    const averageRating = downloadSettings.app_download_rating || '4.8';
    const reviewsCount = downloadSettings.app_download_reviews_count || '12K+';
    const isRTL = locale === 'ar';

    const buildQr = (url) => (url ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}` : null);

    const downloadOptions = [
        {
            id: 'ios',
            title: 'iOS',
            description: t('download_ios'),
            url: iosUrl,
            qr: buildQr(iosUrl),
            accent: 'bg-gray-900',
            iconBg: 'bg-gray-900',
            icon: Apple,
            buttonColor: 'bg-gray-900 hover:bg-gray-800',
        },
        {
            id: 'android',
            title: 'Android',
            description: t('download_android'),
            url: androidUrl,
            qr: buildQr(androidUrl),
            accent: 'bg-green-600',
            iconBg: 'bg-green-600',
            icon: Smartphone,
            buttonColor: 'bg-green-600 hover:bg-green-700',
        },
    ];

    if (directFileUrl) {
        downloadOptions.push({
            id: 'direct',
            title: t('direct_download') || 'Direct Download',
            description: t('download_now') || 'Download the latest build directly',
            url: directFileUrl,
            qr: null,
            accent: 'bg-primary-600',
            iconBg: 'bg-primary-600',
            icon: Download,
            buttonColor: 'bg-primary-600 hover:bg-primary-700',
            isDirect: true,
        });
    }

    const features = [
        {
            icon: <Clock className="w-6 h-6" />,
            title: t('fast_delivery'),
            description: t('fast_delivery_desc')
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: t('quality_guaranteed'),
            description: t('quality_guaranteed_desc')
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: t('wide_selection'),
            description: t('wide_selection_desc')
        }
    ];

    return (
        <Layout>
            <Head title={t('download_app')} />

            <div className="min-h-screen bg-secondary-50">
                {/* Hero Section */}
                <section className="bg-primary-600 text-white py-12 md:py-16 lg:py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center space-y-4 md:space-y-6">
                            <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
                                <Smartphone className="w-10 h-10 md:w-12 md:h-12" />
                            </div>
                            <div className="space-y-3 md:space-y-4">
                                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
                                    {t('download_app') || 'حمل التطبيق'}
                                </h1>
                                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto px-4">
                                    {t('download_app_subtitle') || 'احصل على تجربة أفضل مع تطبيقنا المحمول'}
                                </p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-3 md:gap-4 lg:gap-6 text-white/90 text-xs sm:text-sm md:text-base pt-2">
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 md:px-4 py-2 rounded-full">
                                    <Star className="w-4 h-4 text-warning-400 fill-warning-400" />
                                    <span>{averageRating} • {t('rating_label') || 'تقييم'}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 md:px-4 py-2 rounded-full">
                                    <Users className="w-4 h-4" />
                                    <span>{downloadsCount} {t('downloads') || 'تحميل'}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 md:px-4 py-2 rounded-full">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>{reviewsCount} {t('reviews_label') || 'تقييم'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Download Section */}
                <section className="py-12 md:py-16 lg:py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-start ${isRTL ? '' : ''}`}>
                            {/* Download Options */}
                            <div className={`space-y-6 ${isRTL ? '' : 'lg:order-1'}`}>
                                <div className={`${isRTL ? 'lg:text-right' : 'lg:text-left'} text-center lg:text-left`}>
                                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                                        {t('choose_platform') || 'Choose Your Platform'}
                                    </h2>
                                    <p className="text-base md:text-lg text-gray-600 mb-8">
                                        {t('choose_platform_desc') || 'Download the app on your preferred device'}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {downloadOptions.map((option) => {
                                    const Icon = option.icon;
                                    return (
                                        <div
                                            key={option.id}
                                            className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 overflow-hidden"
                                        >
                                            <div className="flex items-center justify-between p-5 md:p-6">
                                                <div className={`flex items-center gap-4 flex-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                    <div className={`w-14 h-14 md:w-16 md:h-16 ${option.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                                        <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                                                    </div>
                                                    <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                                                        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">{option.title}</h3>
                                                        <p className="text-sm md:text-base text-gray-600">{option.description}</p>
                                                    </div>
                                                </div>
                                                <a
                                                    href={option.url || '#'}
                                                    target={option.url ? '_blank' : undefined}
                                                    rel={option.url ? 'noopener noreferrer' : undefined}
                                                    download={option.isDirect ? '' : undefined}
                                                    onClick={async (e) => {
                                                        if (!option.url) {
                                                            e.preventDefault();
                                                            return;
                                                        }
                                                        
                                                        // Increment download count
                                                        try {
                                                            const response = await fetch('/download-app/increment', {
                                                                method: 'POST',
                                                                headers: {
                                                                    'Content-Type': 'application/json',
                                                                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                                                                    'X-Requested-With': 'XMLHttpRequest',
                                                                },
                                                            });
                                                            
                                                            if (response.ok) {
                                                                const data = await response.json();
                                                                if (data.success && data.count) {
                                                                    setDownloadsCount(data.count);
                                                                }
                                                            }
                                                        } catch (error) {
                                                            console.error('Error incrementing download count:', error);
                                                        }
                                                    }}
                                                    className={`ml-4 text-white px-6 md:px-8 py-3 md:py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 flex-shrink-0 shadow-md hover:shadow-lg hover:scale-105 ${option.buttonColor} ${!option.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <Download className="w-5 h-5" />
                                                    <span className="text-sm md:text-base">{option.isDirect ? (t('download_now') || 'Download Now') : (t('download') || 'Download')}</span>
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })}
                                </div>
                            </div>

                            {/* App Preview Card */}
                            <div className={`${isRTL ? 'lg:order-2' : 'lg:order-2'} flex justify-center lg:justify-end`}>
                                <div className="relative w-full max-w-sm">
                                    <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl shadow-2xl p-8 md:p-10 relative overflow-hidden">
                                        {/* Decorative Background Pattern */}
                                        <div className="absolute inset-0 opacity-10">
                                            <div className="absolute inset-0" style={{
                                                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                                                backgroundSize: '30px 30px'
                                            }}></div>
                                        </div>
                                        
                                        <div className="relative z-10 text-white">
                                            {/* App Icon */}
                                            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-md rounded-2xl mb-6 flex items-center justify-center mx-auto shadow-lg">
                                                <Smartphone className="w-9 h-9 md:w-11 md:h-11" />
                                            </div>
                                            
                                            {/* App Name */}
                                            <h3 className="text-2xl md:text-3xl font-bold text-center mb-2">
                                                {settings?.site_name || 'DeliGo'}
                                            </h3>
                                            
                                            {/* Tagline */}
                                            <p className="text-white/90 text-center mb-8 text-base md:text-lg">
                                                {t('fast_delivery') || '10 Minute Delivery'}
                                            </p>
                                            
                                            {/* Rating */}
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                {[...Array(5)].map((_, idx) => (
                                                    <Star 
                                                        key={idx} 
                                                        className={`w-5 h-5 md:w-6 md:h-6 ${
                                                            idx < Math.floor(parseFloat(averageRating)) 
                                                                ? 'text-warning-400 fill-warning-400' 
                                                                : idx < parseFloat(averageRating)
                                                                ? 'text-warning-400 fill-warning-400 opacity-80'
                                                                : 'text-white/30'
                                                        }`} 
                                                    />
                                                ))}
                                                <span className="text-lg md:text-xl font-semibold ml-2">{averageRating}</span>
                                            </div>
                                            
                                            {/* Downloads Count */}
                                            <p className="text-center text-white/80 text-sm md:text-base">
                                                {downloadsCount} {t('downloads') || 'Downloads'}
                                            </p>
                                        </div>
                                        
                                        {/* Shine Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-12 md:py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-8 md:mb-12">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
                                {t('why_download_app') || 'لماذا تحمل التطبيق؟'}
                            </h2>
                            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                                {t('why_download_app_desc') || 'استمتع بتجربة أفضل مع تطبيقنا المحمول'}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {features.map((feature, index) => (
                                <div key={index} className="text-center p-5 md:p-6 rounded-xl hover:bg-secondary-50 transition-colors border border-gray-100">
                                    <div className="w-14 h-14 md:w-16 md:h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm md:text-base text-gray-600">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                {/* <section className="py-16 bg-gradient-to-r from-purple-600 to-purple-800 text-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-bold mb-4">
                            {t('ready_to_start')}
                        </h2>
                        <p className="text-xl text-purple-100 mb-8">
                            {t('ready_to_start_desc')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href={downloadLinks.ios.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
                            >
                                <Apple className="w-5 h-5" />
                                <span>{t('download_ios')}</span>
                            </a>
                            <a
                                href={downloadLinks.android.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Smartphone className="w-5 h-5" />
                                <span>{t('download_android')}</span>
                            </a>
                        </div>
                    </div>
                </section> */}

                {/* Additional App Download Section */}
                {/* <AppDownloadSection /> */}
            </div>
        </Layout>
    );
}

