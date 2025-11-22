import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '../Layout';
import { useTranslation } from '../../hooks/useTranslation';
import StoreCard from '../../Components/StoreCard';
import { 
    Store, 
    Search,
    MapPin,
    Package,
    ShoppingBag,
    Filter
} from 'lucide-react';

export default function StoresIndex({ stores, storeTypes, governorates, cities, filters }) {
    const { t, locale } = useTranslation();
    
    // حماية من البيانات غير المحددة
    const safeFilters = filters || {};
    const safeStores = stores || { data: [], total: 0, links: [] };
    const safeStoreTypes = storeTypes || [];
    const safeGovernorates = governorates || [];
    const safeCities = cities || [];

    const [search, setSearch] = useState(() => safeFilters?.search || '');
    const [selectedType, setSelectedType] = useState(() => safeFilters?.type || '');
    const [selectedGovernorate, setSelectedGovernorate] = useState(() => safeFilters?.governorate_id || '');
    const [selectedCity, setSelectedCity] = useState(() => safeFilters?.city_id || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/stores', {
            search,
            type: selectedType,
            governorate_id: selectedGovernorate,
            city_id: selectedCity,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleTypeChange = (type) => {
        setSelectedType(type);
        router.get('/stores', {
            search,
            type: type,
            governorate_id: selectedGovernorate,
            city_id: selectedCity,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleGovernorateChange = async (governorateId) => {
        setSelectedGovernorate(governorateId);
        setSelectedCity(''); // إعادة تعيين المدينة عند تغيير المحافظة
        
        // جلب المناطق للمحافظة المختارة
        if (governorateId) {
            try {
                const response = await fetch(`/api/v1/cities?governorate_id=${governorateId}`);
                const result = await response.json();
                if (result.success) {
                    // سيتم تحديث cities تلقائياً من الـ props عند إعادة تحميل الصفحة
                }
            } catch (error) {
                console.error('Error fetching cities:', error);
            }
        }
        
        router.get('/stores', {
            search,
            type: selectedType,
            governorate_id: governorateId,
            city_id: '',
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleCityChange = (cityId) => {
        setSelectedCity(cityId);
        router.get('/stores', {
            search,
            type: selectedType,
            governorate_id: selectedGovernorate,
            city_id: cityId,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <Layout>
            <Head title={t('stores_page_title')} />
            
            <div className="min-h-screen bg-slate-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <h1 className="text-2xl font-bold text-slate-900">{t('stores_page_title')}</h1>
                        <p className="text-slate-600 mt-1">{t('stores_page_subtitle') || 'تصفح جميع المتاجر المتاحة'}</p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Sidebar - Filters */}
                        <div className="lg:w-1/4">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('search_filter') || 'البحث والفلترة'}</h3>
                                
                                {/* Search */}
                                <form onSubmit={handleSearch} className="mb-6">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder={t('stores_search_placeholder') || 'ابحث عن متجر...'}
                                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-5 w-5 text-slate-400" />
                                        </div>
                                    </div>
                                </form>

                                {/* Location Filters */}
                                <div className="mb-6">
                                    <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-purple-600" />
                                        {t('location') || 'الموقع'}
                                    </h4>
                                    <div className="space-y-3">
                                        {/* Governorate */}
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1.5">
                                                {t('governorate')}
                                            </label>
                                            <select
                                                value={selectedGovernorate}
                                                onChange={(e) => handleGovernorateChange(e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            >
                                                <option value="">{t('all_governorates')}</option>
                                                {safeGovernorates.map((gov) => (
                                                    <option key={gov.id} value={gov.id}>
                                                        {gov.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* City */}
                                        {selectedGovernorate && (
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                                                    {t('city')}
                                                </label>
                                                <select
                                                    value={selectedCity}
                                                    onChange={(e) => handleCityChange(e.target.value)}
                                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                >
                                                    <option value="">{t('all_cities') || 'جميع المناطق'}</option>
                                                    {safeCities.map((city) => (
                                                        <option key={city.id} value={city.id}>
                                                            {city.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Store Types */}
                                <div className="mb-6">
                                    <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                                        <Filter className="w-4 h-4 text-purple-600" />
                                        {t('store_type') || 'نوع المتجر'}
                                    </h4>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => handleTypeChange('')}
                                            className={`w-full px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                                                selectedType === '' 
                                                    ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                                                    : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <Store className="w-4 h-4" />
                                                {t('stores_filter_all') || 'جميع الأنواع'}
                                            </span>
                                        </button>
                                        {safeStoreTypes.map((storeType) => (
                                            <button
                                                key={storeType.value}
                                                onClick={() => handleTypeChange(storeType.value)}
                                                className={`w-full px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                                                    selectedType === storeType.value 
                                                        ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                                                        : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                                                }`}
                                            >
                                                <span>{storeType.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stores Grid */}
                        <div className="lg:w-3/4">
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-slate-600">
                                    عرض {safeStores.data.length} من {safeStores.total} متجر
                                </p>
                            </div>

                            {safeStores.data.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {safeStores.data.map((store) => (
                                        <StoreCard key={store.id} store={store} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                                    <div className="text-6xl mb-4">🔍</div>
                                    <h3 className="text-lg font-medium text-slate-900 mb-2">{t('stores_no_results') || 'لم يتم العثور على متاجر'}</h3>
                                    <p className="text-slate-600">{t('stores_try_search') || 'جرب تغيير معايير البحث أو التصفية'}</p>
                                </div>
                            )}

                            {/* Pagination */}
                            {safeStores.links && safeStores.links.length > 3 && (
                                <div className="mt-8 flex justify-center">
                                    <nav className="flex space-x-2">
                                        {safeStores.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-3 py-2 text-sm rounded-lg ${
                                                    link.active
                                                        ? 'bg-purple-600 text-white'
                                                        : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
                                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
