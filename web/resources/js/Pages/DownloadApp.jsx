import React from 'react';
import { Head, usePage } from '@inertiajs/react';
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
    const downloadsCount = downloadSettings.app_download_downloads_count || '100K+';
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
            accent: 'bg-slate-900',
            iconBg: 'bg-slate-900',
            icon: Apple,
            buttonColor: 'bg-slate-900 hover:bg-slate-800',
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
            accent: 'bg-purple-600',
            iconBg: 'bg-purple-600',
            icon: Download,
            buttonColor: 'bg-purple-600 hover:bg-purple-700',
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

            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 bg-slate-50">
                {/* Hero Section */}
                <section className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center space-y-6">
                            <Smartphone className="w-20 h-20 mx-auto opacity-90" />
                            <div className="space-y-4">
                                <h1 className="text-4xl md:text-6xl font-bold">
                                    {t('download_app')}
                                </h1>
                                <p className="text-xl md:text-2xl text-purple-100 max-w-3xl mx-auto">
                                    {t('download_app_subtitle')}
                                </p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-6 text-purple-100 text-sm md:text-base">
                                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                                    <Star className="w-4 h-4 text-yellow-300" />
                                    <span>{averageRating} • {t('rating_label') || 'Rating'}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                                    <Users className="w-4 h-4" />
                                    <span>{downloadsCount} {t('downloads')}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>{reviewsCount} {t('reviews_label') || 'Reviews'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Download Section */}
                <section className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className={`grid lg:grid-cols-2 gap-12 items-center ${isRTL ? '' : ''}`}>
                            {/* App Preview */}
                            <div className={`text-center ${isRTL ? 'lg:text-right' : 'lg:text-left'} ${isRTL ? '' : 'lg:order-2'}`}>
                                <div className="relative inline-block">
                                    <div className="w-80 h-96 bg-gradient-to-b from-purple-600 to-purple-800 rounded-3xl shadow-2xl mx-auto relative overflow-hidden">
                                        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                                        <div className="relative z-10 p-8 text-white">
                                            <div className="text-center">
                                                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                                                    <Smartphone className="w-8 h-8" />
                                                </div>
                                                <h3 className="text-2xl font-bold mb-2">{settings?.site_name || 'Getir Clone'}</h3>
                                                <p className="text-purple-100 mb-6">{t('fast_delivery')}</p>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-center gap-3">
                                                        {[...Array(5)].map((_, idx) => (
                                                            <Star key={idx} className="w-5 h-5 text-yellow-400 fill-current" />
                                                        ))}
                                                        <span className="text-sm">{averageRating}</span>
                                                    </div>
                                                    <p className="text-sm text-purple-200">{downloadsCount} {t('downloads')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Download Options */}
                            <div className={`space-y-8 ${isRTL ? '' : 'lg:order-1'}`}>
                                <div className={`text-center ${isRTL ? 'lg:text-right' : 'lg:text-left'}`}>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                                        {t('choose_platform')}
                                    </h2>
                                    <p className="text-lg text-slate-600 mb-8">
                                        {t('choose_platform_desc')}
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {downloadOptions.map((option) => {
                                    const Icon = option.icon;
                                    return (
                                        <div
                                            key={option.id}
                                            className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
                                        >
                                            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                                                <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                    <div className={`w-16 h-16 ${option.iconBg} rounded-2xl flex items-center justify-center`}>
                                                        <Icon className="w-8 h-8 text-white" />
                                                    </div>
                                                    <div className={isRTL ? 'text-right' : 'text-left'}>
                                                        <h3 className="text-xl font-semibold text-slate-900">{option.title}</h3>
                                                        <p className="text-slate-600">{option.description}</p>
                                                    </div>
                                                </div>
                                                <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                    {/* {option.qr && (
                                                        <div className="text-center">
                                                            <img 
                                                                src={option.qr} 
                                                                alt={`QR Code for ${option.title}`} 
                                                                className="w-20 h-20 mx-auto mb-2"
                                                            />
                                                            <p className="text-xs text-slate-500">{t('scan_qr')}</p>
                                                        </div>
                                                    )} */}
                                                    <a
                                                        href={option.url || '#'}
                                                        target={option.url ? '_blank' : undefined}
                                                        rel={option.url ? 'noopener noreferrer' : undefined}
                                                        download={option.isDirect ? '' : undefined}
                                                        onClick={(e) => {
                                                            if (!option.url) e.preventDefault();
                                                        }}
                                                        className={`text-white px-6 py-3 rounded-xl transition-colors flex items-center gap-2 ${option.buttonColor} ${!option.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        <Download className="w-5 h-5" />
                                                        <span>{option.isDirect ? (t('download_now') || 'Download') : t('download')}</span>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">
                                {t('why_download_app')}
                            </h2>
                            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                                {t('why_download_app_desc')}
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {features.map((feature, index) => (
                                <div key={index} className="text-center p-6 rounded-xl hover:bg-slate-50 transition-colors">
                                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-600">
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
