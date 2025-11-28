import React from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import StoreLayout from './StoreLayout';
import { useTranslation } from '../../hooks/useTranslation';
import { useGeneralSettings } from '../../hooks/useGeneralSettings';
import { Upload, Package, DollarSign } from 'lucide-react';

export default function StoreProducts({ store, productCategories, products }) {
    const { flash } = usePage().props;
    const { t } = useTranslation();
    const { formatCurrency, formatDate } = useGeneralSettings();

    const form = useForm({
        name: '',
        category_id: productCategories[0]?.id || '',
        price: '',
        unit: 'piece',
        description: '',
        image: null,
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        form.post('/dashboard/store/products', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset('name', 'price', 'unit', 'description', 'image');
            },
        });
    };

    const handleImageChange = (event) => {
        form.setData('image', event.target.files[0]);
    };

    return (
        <StoreLayout
            title={t('store_products_manage_title') || 'Manage Products'}
            subtitle={t('store_products_manage_subtitle', { store: store.name }) || ''}
        >
            <Head title={t('store_products_manage_title') || 'Manage Products'} />

            <div className="space-y-6">
                {(flash?.success || flash?.error) && (
                    <div
                        className={`rounded-2xl border p-4 text-sm ${
                            flash.success ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'
                        }`}
                    >
                        {flash.success || flash.error}
                    </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">{t('store_products_section_title')}</h3>
                            <p className="text-sm text-slate-500">{t('store_products_section_subtitle')}</p>
                        </div>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        {t('store_product_name_label')}
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                    {form.errors.name && <p className="mt-1 text-xs text-rose-600">{form.errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        {t('store_product_category_label')}
                                    </label>
                                    <select
                                        value={form.data.category_id}
                                        onChange={(e) => form.setData('category_id', e.target.value)}
                                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        {productCategories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    {form.errors.category_id && <p className="mt-1 text-xs text-rose-600">{form.errors.category_id}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        {t('store_product_price_label')}
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.data.price}
                                        onChange={(e) => form.setData('price', e.target.value)}
                                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                    {form.errors.price && <p className="mt-1 text-xs text-rose-600">{form.errors.price}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        {t('store_product_unit_label')}
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.unit}
                                        onChange={(e) => form.setData('unit', e.target.value)}
                                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    {t('store_product_description_label')}
                                </label>
                                <textarea
                                    rows="3"
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    {t('store_product_image_label')}
                                </label>
                                <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center cursor-pointer hover:border-purple-400 transition">
                                    <Upload className="h-8 w-8 text-purple-500" />
                                    <span className="mt-3 text-sm font-semibold text-slate-700">
                                        {form.data.image ? form.data.image.name : t('store_logo_placeholder')}
                                    </span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                </label>
                                {form.errors.image && <p className="mt-1 text-xs text-rose-600">{form.errors.image}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg disabled:opacity-50"
                            >
                                {form.processing ? t('store_submit_processing') : t('store_product_submit')}
                            </button>
                        </form>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">{t('store_products_list_title')}</h3>
                                <p className="text-sm text-slate-500">{t('store_products_list_subtitle') || t('store_products_section_subtitle')}</p>
                            </div>
                        </div>

                        {products.data.length ? (
                            <div className="space-y-3">
                                {products.data.map((product) => (
                                    <div
                                        key={product.id}
                                        className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Package className="w-4 h-4 text-purple-500" />
                                                <p className="font-semibold text-slate-900">{product.name}</p>
                                            </div>
                                            <p className="text-xs text-slate-500">{product.category || t('uncategorized')}</p>
                                            <p className="text-xs text-slate-400">{formatDate(product.created_at)}</p>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <div className="flex items-center gap-1 justify-end text-sm font-semibold text-slate-900">
                                                <DollarSign className="w-4 h-4 text-emerald-500" />
                                                <span>{formatCurrency(product.price)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">{t('store_products_list_empty')}</p>
                        )}

                        {products.links && products.links.length > 1 && (
                            <div className="flex flex-wrap gap-2">
                                {products.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-1.5 text-sm rounded-lg border ${
                                            link.active ? 'bg-purple-600 text-white border-purple-600' : 'text-slate-600 border-slate-200 hover:bg-slate-50'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
}

