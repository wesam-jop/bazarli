import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import Layout from './Layout';
import { useTranslation } from '../hooks/useTranslation';
import { Shield, CheckCircle, Clock, FileText } from 'lucide-react';

export default function Terms({ intro, lastUpdated, sections = [] }) {
    const { t } = useTranslation();
    const { props } = usePage();
    const settings = props?.settings || {};

    return (
        <Layout>
            <Head title={t('terms_of_service') || 'Terms & Conditions'} />

            <div className="bg-gradient-to-b from-purple-50 via-white to-white min-h-screen">
                <section className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-16">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center shadow-2xl">
                                <Shield className="w-10 h-10" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <p className="text-sm uppercase tracking-[0.3em] text-purple-200">
                                {t('legal_center') || 'Legal Center'}
                            </p>
                            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                                {t('terms_title') || 'Terms & Conditions'}
                            </h1>
                            <p className="text-lg text-purple-100 max-w-3xl mx-auto">
                                {intro}
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4 text-sm text-purple-100">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10">
                                <Clock className="w-4 h-4" />
                                <span>{t('last_updated')} {lastUpdated}</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10">
                                <CheckCircle className="w-4 h-4" />
                                <span>{t('terms_applicable')} {settings?.site_name || 'Getir Clone'}</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-16">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                        {sections.map((section, index) => (
                            <article
                                key={`${section.title}-${index}`}
                                className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-semibold">
                                        {index + 1}
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        {section.title}
                                    </h2>
                                </div>
                                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                                    {section.content}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="pb-20">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-slate-900 text-white rounded-3xl p-8 lg:p-10 flex flex-col lg:flex-row items-start lg:items-center gap-6">
                            <div className="flex-1 space-y-2">
                                <p className="text-sm uppercase tracking-[0.3em] text-purple-300">
                                    {t('questions')}?
                                </p>
                                <h3 className="text-2xl font-bold">
                                    {t('terms_support_heading') || 'Need clarification about our terms?'}
                                </h3>
                                <p className="text-slate-200">
                                    {t('terms_support_text') || 'Our compliance team is happy to walk you through any clause or requirement.'}
                                </p>
                            </div>
                            <a
                                href="mailto:legal@getir-clone.test"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-purple-700 font-semibold hover:bg-purple-50 transition-colors"
                            >
                                <FileText className="w-4 h-4" />
                                {t('contact_legal_team') || 'Contact legal team'}
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
}

