import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useTranslation } from '../../hooks/useTranslation';
import CustomerLayout from './CustomerLayout';
import UserAvatar from '../../Components/UserAvatar';
import { Camera, Loader, Phone, MapPin, User as UserIcon, AlertCircle, ChevronDown } from 'lucide-react';

export default function CustomerProfile({ customer, governorates = [], areas = [] }) {
    const { t, locale } = useTranslation();
    const isRTL = locale === 'ar';
    const { props } = usePage();
    const flash = props.flash || {};
    const [avatarPreview, setAvatarPreview] = useState(null);
    
    const safeGovernorates = governorates || props?.governorates || [];
    const safeAreas = areas || props?.areas || [];
    const [cities, setCities] = useState([]);

    const { data, setData, post, processing, errors } = useForm({
        name: customer?.name || '',
        phone: customer?.phone || '',
        address: customer?.address || '',
        governorate_id: customer?.governorate_id || '',
        area_id: customer?.area_id || '',
        avatar: null,
    });
    
    // Fetch cities when governorate changes
    useEffect(() => {
        if (data.governorate_id) {
            fetch(`/api/v1/cities?governorate_id=${data.governorate_id}`)
                .then(res => res.json())
                .then(result => {
                    if (result.success) {
                        setCities(result.data || []);
                    }
                })
                .catch(err => console.error('Error fetching cities:', err));
        }
    }, [data.governorate_id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/dashboard/customer/profile', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => setAvatarPreview(null),
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

    const currentAvatar = avatarPreview || customer?.avatar;

    return (
        <CustomerLayout title={t('customer_profile') || 'My Profile'}>
            <Head title={t('customer_profile') || 'My Profile'} />

            <div className="space-y-6">
                {flash.success && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 text-start">
                        {flash.success}
                    </div>
                )}
                {flash.error && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 text-start">
                        {flash.error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="px-6 py-4 border-b border-slate-100">
                            <h2 className="text-lg font-semibold text-slate-900 text-start">{t('personal_information')}</h2>
                            <p className="text-sm text-slate-500 text-start">{t('profile_update_hint') || 'Update your contact details.'}</p>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Avatar Section */}
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                        <UserAvatar user={{ avatar: currentAvatar, name: data.name }} size={96} showInitials />
                                    </div>
                                    <label className={`absolute bottom-0 ${isRTL ? 'left-0' : 'right-0'} w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center shadow-lg cursor-pointer hover:bg-purple-700`}>
                                        <Camera className="w-4 h-4 text-white" />
                                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                    </label>
                                </div>
                                <div className="text-start">
                                    <p className="text-sm text-slate-500">{t('allowed_file_types') || 'JPEG, PNG up to 2MB'}</p>
                                    {errors.avatar && (
                                        <p className="text-sm text-rose-600 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.avatar}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Name Field */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-800 mb-2 text-start">
                                    {t('name')}*
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none">
                                        <UserIcon className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full ps-12 pe-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all"
                                        required
                                    />
                                </div>
                                {errors.name && <p className="text-sm text-rose-600 mt-1 text-start">{errors.name}</p>}
                            </div>

                            {/* Phone Field */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-800 mb-2 text-start">
                                    {t('phone_number')}*
                                </label>
                                <div className="relative" dir="ltr">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Phone className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all text-left"
                                        required
                                    />
                                </div>
                                {errors.phone && <p className="text-sm text-rose-600 mt-1 text-start">{errors.phone}</p>}
                            </div>

                            {/* Location Fields Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Governorate Field */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-800 mb-2 text-start">
                                        {t('governorate') || 'المحافظة'}*
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none">
                                            <MapPin className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <select
                                            value={data.governorate_id}
                                            onChange={(e) => {
                                                setData('governorate_id', e.target.value);
                                                setData('area_id', '');
                                            }}
                                            className="w-full ps-12 pe-10 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white appearance-none cursor-pointer transition-all"
                                            required
                                        >
                                            <option value="">{t('select_governorate') || 'اختر المحافظة'}</option>
                                            {safeGovernorates.map((gov) => (
                                                <option key={gov.id} value={gov.id}>
                                                    {gov.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 end-0 pe-3 flex items-center pointer-events-none">
                                            <ChevronDown className="h-4 w-4 text-slate-400" />
                                        </div>
                                    </div>
                                    {errors.governorate_id && <p className="text-sm text-rose-600 mt-1 text-start">{errors.governorate_id}</p>}
                                </div>

                                {/* Area Field */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-800 mb-2 text-start">
                                        {t('area') || 'المنطقة'}*
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none">
                                            <MapPin className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <select
                                            value={data.area_id}
                                            onChange={(e) => setData('area_id', e.target.value)}
                                            className="w-full ps-12 pe-10 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white appearance-none cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed transition-all"
                                            required
                                            disabled={!data.governorate_id}
                                        >
                                            <option value="">{t('select_area') || 'اختر المنطقة'}</option>
                                            {safeAreas
                                                .filter(area => !data.governorate_id || area.city === data.governorate_id)
                                                .map((area) => (
                                                    <option key={area.id} value={area.id}>
                                                        {area.name}
                                                    </option>
                                                ))}
                                        </select>
                                        <div className="absolute inset-y-0 end-0 pe-3 flex items-center pointer-events-none">
                                            <ChevronDown className="h-4 w-4 text-slate-400" />
                                        </div>
                                    </div>
                                    {errors.area_id && <p className="text-sm text-rose-600 mt-1 text-start">{errors.area_id}</p>}
                                </div>
                            </div>

                            {/* Address Field */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-800 mb-2 text-start">
                                    {t('address')}
                                </label>
                                <div className="relative">
                                    <div className="absolute top-3 start-0 ps-4 pointer-events-none">
                                        <MapPin className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <textarea
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        rows={3}
                                        className="w-full ps-12 pe-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white resize-none transition-all"
                                    />
                                </div>
                                {errors.address && <p className="text-sm text-rose-600 mt-1 text-start">{errors.address}</p>}
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-600/90 disabled:opacity-50 transition-all"
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

                    {/* Account Details Sidebar */}
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-4 h-fit">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 text-start">{t('account_details')}</h3>
                            <p className="text-sm text-slate-500 text-start">{t('account_details_hint') || 'Basic information about your account.'}</p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">{t('user_type')}</span>
                                <span className="text-sm font-semibold text-slate-900">{t('customer')}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">{t('verification_status')}</span>
                                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${customer?.is_verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {customer?.is_verified ? t('verified') : t('unverified')}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">{t('member_since')}</span>
                                <span className="text-sm font-semibold text-slate-900">{customer?.created_at_formatted}</span>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-100">
                            <p className="text-sm text-slate-500 text-start">{t('profile_security_note') || 'We respect your privacy and never share your personal data.'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
