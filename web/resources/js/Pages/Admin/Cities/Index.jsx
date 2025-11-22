import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../Layout';
import { useTranslation } from '../../../hooks/useTranslation';
import {
    Building2,
    Search,
    Edit,
    CheckCircle,
    XCircle,
    Plus,
    Trash2,
    Store,
    Users,
    MapPin,
} from 'lucide-react';

export default function Cities({ cities, governorates, stats, filters }) {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedGovernorate, setSelectedGovernorate] = useState(filters?.governorate_id || '');

    const normalizedSearch = searchTerm.toLowerCase();
    const filteredCities = cities?.filter(city => {
        const searchable = [
            city.name_ar,
            city.name_en,
            city.governorate?.name_ar,
            city.governorate?.name_en,
        ]
            .filter(Boolean)
            .map((value) => value.toLowerCase());

        const matchesSearch =
            !normalizedSearch || searchable.some((value) => value.includes(normalizedSearch));

        const matchesFilter =
            filterStatus === 'all' ||
            (filterStatus === 'active' && city.is_active) ||
            (filterStatus === 'inactive' && !city.is_active);

        const matchesGovernorate = !selectedGovernorate || city.governorate_id == selectedGovernorate;

        return matchesSearch && matchesFilter && matchesGovernorate;
    }) || [];

    const handleToggleActive = (city) => {
        router.post(`/admin/cities/${city.id}/toggle-active`, {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = (city) => {
        if (!confirm(t('confirm_delete_city') || 'هل أنت متأكد من حذف هذه المنطقة؟')) {
            return;
        }

        router.delete(`/admin/cities/${city.id}`, {
            preserveScroll: true,
        });
    };

    const handleGovernorateFilter = (governorateId) => {
        setSelectedGovernorate(governorateId);
        router.get('/admin/cities', {
            governorate_id: governorateId || null,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AdminLayout title={t('cities')}>
            <Head title={t('cities')} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">{t('cities')}</h2>
                        <p className="text-slate-600 mt-2">{t('manage_cities') || 'إدارة المناطق داخل المحافظات'}</p>
                    </div>
                    <Link
                        href={`/admin/cities/create${selectedGovernorate ? `?governorate_id=${selectedGovernorate}` : ''}`}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="font-semibold">{t('add_city')}</span>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600 mb-1">{t('total_cities')}</p>
                                <p className="text-2xl font-bold text-blue-900">{stats?.total || 0}</p>
                            </div>
                            <Building2 className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl shadow-sm border border-emerald-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-emerald-600 mb-1">{t('active')}</p>
                                <p className="text-2xl font-bold text-emerald-900">{stats?.active || 0}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-emerald-500" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl shadow-sm border border-rose-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-rose-600 mb-1">{t('inactive')}</p>
                                <p className="text-2xl font-bold text-rose-900">{stats?.inactive || 0}</p>
                            </div>
                            <XCircle className="w-8 h-8 text-rose-500" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-sm border border-indigo-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-indigo-600 mb-1">{t('total_stores') || 'إجمالي المتاجر'}</p>
                                <p className="text-2xl font-bold text-indigo-900">{stats?.total_stores || 0}</p>
                            </div>
                            <Store className="w-8 h-8 text-indigo-500" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder={t('search_city') || 'ابحث عن منطقة...'}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={selectedGovernorate}
                            onChange={(e) => handleGovernorateFilter(e.target.value)}
                            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="">{t('all_governorates')}</option>
                            {governorates?.map((gov) => (
                                <option key={gov.id} value={gov.id}>
                                    {gov.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="all">{t('all') || 'الكل'}</option>
                            <option value="active">{t('active')}</option>
                            <option value="inactive">{t('inactive')}</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">{t('city')}</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">{t('governorate')}</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">{t('stores')}</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">{t('users')}</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">{t('delivery_radius_km')}</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">{t('status')}</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredCities.length > 0 ? (
                                    filteredCities.map((city) => (
                                        <tr key={city.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-slate-900">{city.name_ar}</div>
                                                    <div className="text-sm text-slate-500">{city.name_en}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-slate-900">
                                                    {city.governorate?.name_ar || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-slate-900">{city.stores_count || 0}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-slate-900">{city.users_count || 0}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-slate-900">{city.delivery_radius || 10} {t('km') || 'كم'}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleToggleActive(city)}
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                        city.is_active
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : 'bg-rose-100 text-rose-800'
                                                    }`}
                                                >
                                                    {city.is_active ? t('active') : t('inactive')}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/admin/cities/${city.id}/edit`}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(city)}
                                                        className="text-rose-600 hover:text-rose-900"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                                            {t('no_cities') || 'لا توجد مناطق'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

