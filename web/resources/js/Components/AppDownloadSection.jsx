import React from 'react';
import { Link } from '@inertiajs/react';
import { useTranslation } from '../hooks/useTranslation';
import { Smartphone, Download, Star } from 'lucide-react';

export default function AppDownloadSection() {
    const { t } = useTranslation();

    return (
        <section className="bg-secondary-200 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <div className="mb-6">
                        <Smartphone className="w-16 h-16 mx-auto mb-4 text-primary-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        {t('download_our_app')}
                    </h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        {t('download_app_subtitle')}
                    </p>
                    
                    {/* App Rating */}
                    <div className="flex items-center justify-center space-x-2 mb-8">
                        <div className="flex items-center space-x-1">
                            <Star className="w-5 h-5 text-warning-500 fill-current" />
                            <Star className="w-5 h-5 text-warning-500 fill-current" />
                            <Star className="w-5 h-5 text-warning-500 fill-current" />
                            <Star className="w-5 h-5 text-warning-500 fill-current" />
                            <Star className="w-5 h-5 text-warning-500 fill-current" />
                        </div>
                        <span className="text-lg font-semibold text-gray-900">4.8</span>
                        <span className="text-gray-600">({t('downloads')})</span>
                    </div>

                    <Link
                        href="/download-app"
                        className="inline-flex items-center space-x-2 bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
                    >
                        <Download className="w-5 h-5" />
                        <span>{t('download_app')}</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
