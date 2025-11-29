import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { useTranslation } from '../../hooks/useTranslation';
import StoreLayout from './StoreLayout';
import UserAvatar from '../../Components/UserAvatar';
import { Camera, Loader, User as UserIcon, Phone, MapPin, Store as StoreIcon, DollarSign, Ruler } from 'lucide-react';

export default function StoreProfile({ profile }) {
    const { t } = useTranslation();
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        name: profile?.name || '',
        phone: profile?.phone || '',
        address: profile?.address || '',
        avatar: null,
        store_name: profile?.store?.name || '',
        store_phone: profile?.store?.phone || '',
        store_address: profile?.store?.address || '',
        delivery_radius: profile?.store?.delivery_radius || 5,
        delivery_fee: profile?.store?.delivery_fee || 0,
        store_logo: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/dashboard/store/profile', {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const handleAvatarChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setData('avatar', file);
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleLogoChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setData('store_logo', file);
            const reader = new FileReader();
            reader.onloadend = () => setLogoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const currentAvatar = avatarPreview || profile?.avatar;
    const currentLogo = logoPreview || profile?.store?.logo_path;

    return (
        <StoreLayout title={t('store_profile_title') || 'Store Profile'} subtitle={t('store_profile_subtitle') || ''}>
            <Head title={t('store_profile_title') || 'Store Profile'} />

            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="px-6 py-4 border-b border-slate-100">
                            <h2 className="text-lg font-semibold text-slate-900">{t('personal_information')}</h2>
                            <p className="text-sm text-slate-500">{t('profile_update_hint')}</p>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                        <UserAvatar user={{ avatar: currentAvatar, name: data.name }} size={96} showInitials />
                                    </div>
                                    <label className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center shadow-lg cursor-pointer hover:bg-purple-700">
                                        <Camera className="w-4 h-4 text-white" />
                                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                    </label>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">{t('allowed_file_types')}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-900 mb-2">{t('name')}*</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-11 py-3 text-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        />
                                    </div>
                                    {errors.name && <p className="text-sm text-rose-600 mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-900 mb-2">{t('phone_number')}*</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="tel"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-11 py-3 text-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        />
                                    </div>
                                    {errors.phone && <p className="text-sm text-rose-600 mt-1">{errors.phone}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-2">{t('address')}</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <textarea
                                        rows={3}
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-11 py-3 text-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-4">
                                <h3 className="text-base font-semibold text-slate-900 mb-4">{t('store_information') || 'Store Information'}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-900 mb-2">{t('store_name_label')}</label>
                                        <div className="relative">
                                            <StoreIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                value={data.store_name}
                                                onChange={(e) => setData('store_name', e.target.value)}
                                                className="w-full rounded-xl border border-slate-200 bg-white px-11 py-3 text-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            />
                                        </div>
                                        {errors.store_name && <p className="text-sm text-rose-600 mt-1">{errors.store_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-900 mb-2">{t('store_phone_label')}</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                value={data.store_phone}
                                                onChange={(e) => setData('store_phone', e.target.value)}
                                                className="w-full rounded-xl border border-slate-200 bg-white px-11 py-3 text-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-slate-900 mb-2">{t('store_address_label')}</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <textarea
                                            rows={3}
                                            value={data.store_address}
                                            onChange={(e) => setData('store_address', e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-11 py-3 text-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-900 mb-2">{t('delivery_radius')}</label>
                                        <div className="relative">
                                            <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="number"
                                                value={data.delivery_radius}
                                                onChange={(e) => setData('delivery_radius', e.target.value)}
                                                className="w-full rounded-xl border border-slate-200 bg-white px-11 py-3 text-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-900 mb-2">{t('delivery_fee')}</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={data.delivery_fee}
                                                onChange={(e) => setData('delivery_fee', e.target.value)}
                                                className="w-full rounded-xl border border-slate-200 bg-white px-11 py-3 text-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* <div className="mt-4">
                                    <label className="block text-sm font-medium text-slate-900 mb-2">{t('store_logo_label')}</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                                            {currentLogo ? (
                                                <img
                                                    src={currentLogo}
                                                    alt="Store logo"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <StoreIcon className="w-8 h-8 text-slate-400" />
                                            )}
                                        </div>
                                        <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-50">
                                            <Camera className="w-4 h-4" />
                                            {t('upload_new_file')}
                                            <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                                        </label>
                                    </div>
                                </div> */}
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50"
                                >
                                    {processing ? (
                                        <>
                                            <Loader className="w-4 h-4 animate-spin" />
                                            {t('saving')}
                                        </>
                                    ) : (
                                        t('save_changes')
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">{t('account_details')}</h3>
                            <p className="text-sm text-slate-500">{t('account_details_hint')}</p>
                        </div>
                        <div className="space-y-3">
                            <Item label={t('user_type')} value={t('store_owner')} />
                            <Item
                                label={t('store_type_label')}
                                value={profile?.store?.store_type_label || profile?.store?.store_type || 'store'}
                            />
                            <Item label={t('member_since')} value={profile?.created_at_formatted} />
                            <Item
                                label={t('verification_status')}
                                value={
                                    profile?.is_verified ? (
                                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                            {t('verified')}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                                            {t('unverified')}
                                        </span>
                                    )
                                }
                            />
                        </div>
                        <p className="text-sm text-slate-500 border-t border-slate-100 pt-4">
                            {t('profile_security_note')}
                        </p>
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
}

function Item({ label, value }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">{label}</span>
            <span className="font-semibold text-slate-900">{value}</span>
        </div>
    );
}

