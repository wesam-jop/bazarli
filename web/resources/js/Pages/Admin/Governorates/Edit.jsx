import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '../Layout';
import { useTranslation } from '../../../hooks/useTranslation';
import { ArrowLeft, Save } from 'lucide-react';

export default function EditGovernorate({ governorate }) {
    const { t } = useTranslation();
    const { data, setData, put, processing, errors } = useForm({
        name_ar: governorate.name_ar || '',
        name_en: governorate.name_en || '',
        is_active: governorate.is_active ?? true,
        display_order: governorate.display_order || 0,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/admin/governorates/${governorate.id}`);
    };

    return (
        <AdminLayout title={t('edit_governorate')}>
            <Head title={t('edit_governorate')} />
            
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/governorates"
                        className="p-2 hover:bg-slate-100 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">{t('edit_governorate')}</h2>
                        <p className="text-slate-600 mt-1">{governorate.name_ar}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name Arabic */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                {t('governorate_name_ar')} <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name_ar}
                                onChange={(e) => setData('name_ar', e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            {errors.name_ar && (
                                <p className="mt-1 text-sm text-rose-600">{errors.name_ar}</p>
                            )}
                        </div>

                        {/* Name English */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                {t('governorate_name_en')} <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name_en}
                                onChange={(e) => setData('name_en', e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            {errors.name_en && (
                                <p className="mt-1 text-sm text-rose-600">{errors.name_en}</p>
                            )}
                        </div>

                        {/* Display Order */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                ترتيب العرض
                            </label>
                            <input
                                type="number"
                                value={data.display_order}
                                onChange={(e) => setData('display_order', parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                min="0"
                            />
                            {errors.display_order && (
                                <p className="mt-1 text-sm text-rose-600">{errors.display_order}</p>
                            )}
                        </div>

                        {/* Is Active */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                الحالة
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="w-5 h-5 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                                />
                                <span className="text-sm text-slate-700">نشطة</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span className="font-semibold">{t('save_changes')}</span>
                        </button>
                        <Link
                            href="/admin/governorates"
                            className="px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                        >
                            {t('cancel') || 'إلغاء'}
                        </Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

