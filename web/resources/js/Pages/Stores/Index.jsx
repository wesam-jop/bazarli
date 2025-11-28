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
    Filter,
    X,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

export default function StoresIndex({ stores, storeTypes, governorates, cities: initialCities, filters, userGovernorateId, userCityId }) {
    const { t, locale } = useTranslation();
    
    // حماية من البيانات غير المحددة
    const safeFilters = filters || {};
    const safeStores = stores || { data: [], total: 0, links: [] };
    const safeStoreTypes = storeTypes || [];
    const safeGovernorates = governorates || [];

    // استخدام إعدادات المستخدم كقيم افتراضية إذا لم يتم تحديد فلتر
    const [search, setSearch] = useState(() => safeFilters?.search || '');
    const [selectedType, setSelectedType] = useState(() => safeFilters?.type || '');
    const [selectedGovernorate, setSelectedGovernorate] = useState(() => {
        return safeFilters?.governorate_id || userGovernorateId || '';
    });
    const [selectedCity, setSelectedCity] = useState(() => safeFilters?.city_id || userCityId || '');
    const [availableCities, setAvailableCities] = useState(() => initialCities || []);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    
    // جلب المدن عند تغيير المحافظة أو عند تحميل الصفحة لأول مرة
    React.useEffect(() => {
        if (selectedGovernorate) {
            fetch(`/api/v1/cities?governorate_id=${selectedGovernorate}`)
                .then(res => res.json())
                .then(result => {
                    if (result.success) {
                        setAvailableCities(result.data || []);
                        // إذا كان المستخدم لديه city_id ولم يتم تحديد واحد، استخدم إعدادات المستخدم
                        if (!selectedCity && userCityId && result.data.find(c => c.id == userCityId)) {
                            setSelectedCity(userCityId);
                            // تطبيق الفلترة تلقائياً
                            router.get('/stores', {
                                search,
                                type: selectedType,
                                governorate_id: selectedGovernorate,
                                city_id: userCityId,
                            }, {
                                preserveState: true,
                                replace: true,
                            });
                        }
                        // إذا كانت المدينة المحددة ليست في القائمة الجديدة، إعادة تعيينها
                        else if (selectedCity && !result.data.find(c => c.id == selectedCity)) {
                            setSelectedCity('');
                        }
                    }
                })
                .catch(err => console.error('Error fetching cities:', err));
        } else {
            setAvailableCities([]);
            setSelectedCity('');
        }
    }, [selectedGovernorate]);

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
            
            <div className="min-h-screen bg-secondary-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b border-secondary-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('stores_page_title') || t('stores')}</h1>
                        <p className="text-sm sm:text-base text-gray-600 mt-1">{t('stores_page_subtitle') || 'تصفح جميع المتاجر المتاحة'}</p>
                        
                        {/* Search Bar - Mobile Only */}
                        <div className="mt-6 lg:hidden">
                            <div className="flex gap-2">
                                <form onSubmit={handleSearch} className="flex-1">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder={t('stores_search_placeholder') || 'ابحث عن متجر...'}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>
                                </form>
                                <button
                                    onClick={() => setIsFilterModalOpen(true)}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
                                    aria-label={t('filter') || 'فلترة'}
                                >
                                    <Filter className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                    <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
                        {/* Sidebar - Filters (Desktop Only) */}
                        <div className="hidden lg:block lg:w-1/4">
                            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 sticky top-4">
                                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">{t('search_and_filter') || 'البحث والترتيب'}</h3>
                                
                                {/* Search */}
                                <form onSubmit={handleSearch} className="mb-6">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder={t('stores_search_placeholder') || 'ابحث عن متجر...'}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm md:text-base"
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>
                                </form>

                                {/* Location Filters */}
                                <div className="mb-6">
                                    <h4 className="font-medium text-gray-900 mb-3 text-sm md:text-base flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-primary-600" />
                                        {t('location') || 'الموقع'}
                                    </h4>
                                    <div className="space-y-3">
                                        {/* Governorate */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                {t('governorate')}
                                            </label>
                                            <select
                                                value={selectedGovernorate}
                                                onChange={(e) => handleGovernorateChange(e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
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
                                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                    {t('city')}
                                                </label>
                                                <select
                                                    value={selectedCity}
                                                    onChange={(e) => handleCityChange(e.target.value)}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                                >
                                                    <option value="">{t('all_cities') || 'جميع المناطق'}</option>
                                                    {availableCities.map((city) => (
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
                                    <h4 className="font-medium text-gray-900 mb-3 text-sm md:text-base flex items-center gap-2">
                                        <Filter className="w-4 h-4 text-primary-600" />
                                        {t('store_type') || 'نوع المتجر'}
                                    </h4>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => handleTypeChange('')}
                                            className={`w-full px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                                                selectedType === '' 
                                                    ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                                                    : 'text-gray-600 hover:bg-secondary-100 border border-transparent'
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
                                                        ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                                                        : 'text-gray-600 hover:bg-secondary-100 border border-transparent'
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
                        <div className="lg:w-3/4 w-full">
                            <div className="mb-4 md:mb-6 flex items-center justify-between flex-wrap gap-2">
                                <p className="text-gray-600 text-sm md:text-base">
                                    {t('showing_products') || 'عرض'} <span className="font-semibold text-gray-900">{safeStores.data.length}</span> {t('of') || 'من'} <span className="font-semibold text-gray-900">{safeStores.total}</span> {t('stores') || 'متجر'}
                                </p>
                            </div>

                            {safeStores.data.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                    {safeStores.data.map((store) => (
                                        <StoreCard key={store.id} store={store} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 md:py-16 px-4 bg-white rounded-lg shadow-sm">
                                    <div className="text-6xl mb-4">🔍</div>
                                    <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">{t('stores_no_results') || 'لم يتم العثور على متاجر'}</h3>
                                    <p className="text-gray-600">{t('stores_try_search') || 'جرب تغيير معايير البحث أو التصفية'}</p>
                                </div>
                            )}

                            {/* Pagination */}
                            {safeStores.links && safeStores.links.length > 3 && (
                                <div className="mt-6 md:mt-8 flex justify-center overflow-x-auto">
                                    <nav className="flex space-x-2">
                                        {safeStores.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-3 py-2 text-sm rounded-lg transition-colors whitespace-nowrap ${
                                                    link.active
                                                        ? 'bg-primary-600 text-white'
                                                        : 'bg-white text-gray-700 hover:bg-secondary-100 border border-gray-300'
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

            {/* Filter Modal - Mobile Only */}
            {isFilterModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto lg:hidden">
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black/50 transition-opacity"
                        onClick={() => setIsFilterModalOpen(false)}
                    ></div>
                    
                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {t('filter') || 'فلترة'}
                                </h3>
                                <button
                                    onClick={() => setIsFilterModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    aria-label={t('close') || 'إغلاق'}
                                >
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                            
                            {/* Content */}
                            <div className="p-6">
                                {/* Location Filters */}
                                <div className="mb-6">
                                    <h4 className="font-medium text-gray-900 mb-3 text-sm md:text-base flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-primary-600" />
                                        {t('location') || 'الموقع'}
                                    </h4>
                                    <div className="space-y-3">
                                        {/* Governorate */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                {t('governorate')}
                                            </label>
                                            <select
                                                value={selectedGovernorate}
                                                onChange={(e) => handleGovernorateChange(e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
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
                                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                    {t('city')}
                                                </label>
                                                <select
                                                    value={selectedCity}
                                                    onChange={(e) => handleCityChange(e.target.value)}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                                >
                                                    <option value="">{t('all_cities') || 'جميع المناطق'}</option>
                                                    {availableCities.map((city) => (
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
                                    <h4 className="font-medium text-gray-900 mb-3 text-sm md:text-base flex items-center gap-2">
                                        <Filter className="w-4 h-4 text-primary-600" />
                                        {t('store_type') || 'نوع المتجر'}
                                    </h4>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => {
                                                handleTypeChange('');
                                                setIsFilterModalOpen(false);
                                            }}
                                            className={`w-full px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                                                selectedType === '' 
                                                    ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                                                    : 'text-gray-600 hover:bg-secondary-100 border border-transparent'
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
                                                onClick={() => {
                                                    handleTypeChange(storeType.value);
                                                    setIsFilterModalOpen(false);
                                                }}
                                                className={`w-full px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                                                    selectedType === storeType.value 
                                                        ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                                                        : 'text-gray-600 hover:bg-secondary-100 border border-transparent'
                                                }`}
                                            >
                                                <span>{storeType.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Close Button */}
                                <div className="mt-6">
                                    <button
                                        onClick={() => setIsFilterModalOpen(false)}
                                        className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                                    >
                                        {t('close') || 'إغلاق'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
