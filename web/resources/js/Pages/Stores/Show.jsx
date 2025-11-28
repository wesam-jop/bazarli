import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '../Layout';
import { useTranslation } from '../../hooks/useTranslation';
import ProductCard from '../../Components/ProductCard';
import AppDownloadSection from '../../Components/AppDownloadSection';
import { 
    Store, 
    MapPin, 
    Search,
    Package,
    DollarSign,
    ArrowLeft,
    Phone,
    Clock,
    Filter,
    X
} from 'lucide-react';

export default function StoreShow({ store, products, categories, filters }) {
    const { t, locale } = useTranslation();
    
    const safeFilters = filters || {};
    const safeProducts = products || { data: [], total: 0, links: [] };
    const safeCategories = categories || [];

    const [search, setSearch] = useState(() => safeFilters?.search || '');
    const [selectedCategory, setSelectedCategory] = useState(() => safeFilters?.category || '');
    const [sortBy, setSortBy] = useState(() => safeFilters?.sort || 'sort_order');
    const [sortDirection, setSortDirection] = useState(() => safeFilters?.direction || 'asc');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(`/stores/${store.id}`, {
            search,
            category: selectedCategory,
            sort: sortBy,
            direction: sortDirection,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
        router.get(`/stores/${store.id}`, {
            search,
            category: categoryId,
            sort: sortBy,
            direction: sortDirection,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSortChange = (newSortBy) => {
        const newDirection = sortBy === newSortBy && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortBy(newSortBy);
        setSortDirection(newDirection);
        router.get(`/stores/${store.id}`, {
            search,
            category: selectedCategory,
            sort: newSortBy,
            direction: newDirection,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <Layout>
            <Head title={store.name} />
            
            <div className="min-h-screen bg-secondary-50">
                {/* Breadcrumb */}
                <div className="bg-white border-b border-secondary-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <nav className="flex items-center space-x-2 text-sm flex-wrap">
                            <Link href="/" className="text-gray-500 hover:text-primary-600 transition-colors">{t('home')}</Link>
                            <span className="text-gray-400">/</span>
                            <Link href="/stores" className="text-gray-500 hover:text-primary-600 transition-colors">{t('stores')}</Link>
                            <span className="text-gray-400">/</span>
                            <span className="text-gray-900 font-medium">{store.name}</span>
                        </nav>
                    </div>
                </div>

                {/* Store Header */}
                <div className="bg-primary-600 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                        {/* Back Button */}
                        <Link 
                            href="/stores"
                            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4 sm:mb-6 transition-colors text-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>{t('back_to_stores') || 'العودة إلى المتاجر'}</span>
                        </Link>
                        
                        {/* Store Info - Mobile Layout */}
                        <div className="block md:hidden space-y-4">
                            {/* Top Row: Icon + Name + Count */}
                            <div className="flex items-start gap-3">
                                <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm flex-shrink-0">
                                    <Store className="w-8 h-8" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-xl font-bold mb-1 break-words leading-tight">{store.name}</h1>
                                    {store.store_type_label && (
                                        <p className="text-white/90 text-sm mb-2">
                                            {store.store_type_label}
                                        </p>
                                    )}
                                </div>
                                <div className="text-center flex-shrink-0">
                                    <div className="text-2xl font-bold">{safeProducts.total}</div>
                                    <div className="text-white/90 text-xs">{t('available_products') || 'منتج'}</div>
                                </div>
                            </div>
                            
                            {/* Store Details - Stacked */}
                            <div className="space-y-2 pt-2 border-t border-white/20">
                                {store.address && (
                                    <div className="flex items-start gap-2 text-sm">
                                        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <span className="break-words flex-1">{store.address}</span>
                                    </div>
                                )}
                                
                                {store.governorate && store.city && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="w-4 h-4 flex-shrink-0" />
                                        <span>
                                            {locale === 'ar' 
                                                ? `${store.city.name_ar}، ${store.governorate.name_ar}`
                                                : `${store.city.name_en}, ${store.governorate.name_en}`
                                            }
                                        </span>
                                    </div>
                                )}
                                
                                {store.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="w-4 h-4 flex-shrink-0" />
                                        <a href={`tel:${store.phone}`} className="hover:underline">{store.phone}</a>
                                    </div>
                                )}
                                
                                {store.opening_time && store.closing_time && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="w-4 h-4 flex-shrink-0" />
                                        <span>{store.opening_time} - {store.closing_time}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Store Info - Desktop Layout */}
                        <div className="hidden md:flex flex-col lg:flex-row gap-4 lg:gap-6 items-start lg:items-center">
                            <div className="p-4 lg:p-6 rounded-xl lg:rounded-2xl bg-white/10 backdrop-blur-sm flex-shrink-0">
                                <Store className="w-12 h-12 lg:w-14 lg:h-14" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <h1 className="text-3xl lg:text-4xl font-bold mb-2 break-words">{store.name}</h1>
                                {store.store_type_label && (
                                    <p className="text-white/90 text-lg mb-3 lg:mb-4">
                                        {store.store_type_label}
                                    </p>
                                )}
                                
                                <div className="flex flex-wrap gap-3 lg:gap-4 text-sm lg:text-base">
                                    {store.address && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                                            <span className="break-words">{store.address}</span>
                                        </div>
                                    )}
                                    
                                    {store.governorate && store.city && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                                            <span>
                                                {locale === 'ar' 
                                                    ? `${store.city.name_ar}، ${store.governorate.name_ar}`
                                                    : `${store.city.name_en}, ${store.governorate.name_en}`
                                                }
                                            </span>
                                        </div>
                                    )}
                                    
                                    {store.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                                            <a href={`tel:${store.phone}`} className="hover:underline">{store.phone}</a>
                                        </div>
                                    )}
                                    
                                    {store.opening_time && store.closing_time && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                                            <span>{store.opening_time} - {store.closing_time}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="text-center flex-shrink-0 lg:mt-0">
                                <div className="text-3xl lg:text-4xl font-bold">{safeProducts.total}</div>
                                <div className="text-white/90 text-sm lg:text-base">{t('available_products') || 'منتج متاح'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
                    {/* Mobile Search & Filter */}
                    <div className="lg:hidden mb-4 space-y-3">
                        {/* Search Input */}
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t('search_in_store') || 'ابحث في المتجر...'}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                        </form>

                        {/* Filter Button */}
                        <button
                            onClick={() => setIsFilterModalOpen(true)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                        >
                            <Filter className="w-4 h-4" />
                            <span>{t('filter') || 'فلترة'}</span>
                        </button>
                    </div>

                    <div className="md:flex flex-col lg:flex-row gap-4 md:gap-6">
                        {/* Sidebar - Filters (Desktop) */}
                        <div className="hidden lg:block lg:w-1/4">
                            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 sticky top-4">
                                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">{t('search_and_filter') || 'البحث والفلترة'}</h3>
                                
                                {/* Search */}
                                <form onSubmit={handleSearch} className="mb-6">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder={t('search_in_store') || 'ابحث في المتجر...'}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>
                                </form>

                                {/* Categories */}
                                <div className="mb-6">
                                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2 text-sm md:text-base">
                                        <Package className="w-4 h-4 text-primary-600" />
                                        {t('categories') || 'الفئات'}
                                    </h4>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => handleCategoryChange('')}
                                            className={`w-full px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                                                selectedCategory === '' 
                                                    ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                                                    : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <Package className="w-4 h-4" />
                                                {t('all_categories') || 'جميع الفئات'}
                                            </span>
                                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                                                {safeProducts.total}
                                            </span>
                                        </button>
                                        {safeCategories.map((category) => (
                                            <button
                                                key={category.id}
                                                onClick={() => handleCategoryChange(category.id)}
                                                className={`w-full px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                                                    selectedCategory == category.id 
                                                        ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                                                        : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                                                }`}
                                            >
                                                <span>{category.name_ar || category.name_en || category.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sort */}
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2 text-sm md:text-base">
                                        <DollarSign className="w-4 h-4 text-primary-600" />
                                        {t('sort') || 'الترتيب'}
                                    </h4>
                                    <div className="space-y-2">
                                        {[
                                            { value: 'sort_order', label: t('default') || 'الافتراضي' },
                                            { value: 'name', label: t('sort_by_name') || 'حسب الاسم' },
                                            { value: 'price', label: t('sort_by_price') || 'حسب السعر' },
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => handleSortChange(option.value)}
                                                className={`w-full px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                                                    sortBy === option.value 
                                                        ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                                                        : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                                                }`}
                                            >
                                                <span>{option.label}</span>
                                                {sortBy === option.value && (
                                                    <span className="text-primary-600">
                                                        {sortDirection === 'asc' ? '↑' : '↓'}
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="lg:w-3/4">
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-gray-600 text-sm md:text-base">
                                    {t('showing_products') || 'عرض'} {safeProducts.data.length} {t('of') || 'من'} {safeProducts.total} {t('products') || 'منتج'}
                                </p>
                            </div>

                            {safeProducts.data.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mx-auto">
                                    {safeProducts.data.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                                    <div className="text-6xl mb-4">🔍</div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('no_products_found') || 'لم يتم العثور على منتجات'}</h3>
                                    <p className="text-gray-600">{t('try_changing_search') || 'جرب تغيير معايير البحث أو التصفية'}</p>
                                </div>
                            )}

                            {/* Pagination */}
                            {safeProducts.links && safeProducts.links.length > 3 && (
                                <div className="mt-6 md:mt-8 flex justify-center">
                                    <nav className="flex flex-wrap gap-2 justify-center">
                                        {safeProducts.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                                    link.active
                                                        ? 'bg-primary-600 text-white'
                                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
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

                {/* Filter Modal (Mobile) */}
                {isFilterModalOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto lg:hidden">
                        {/* Backdrop */}
                        <div 
                            className="fixed inset-0 bg-black/50 transition-opacity"
                            onClick={() => setIsFilterModalOpen(false)}
                        />
                        
                        {/* Modal */}
                        <div className="relative min-h-screen flex items-end">
                            <div className="relative bg-white w-full max-h-[90vh] overflow-y-auto rounded-t-2xl shadow-xl">
                                {/* Header */}
                                <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between z-10">
                                    <h3 className="text-lg font-semibold text-gray-900">{t('filter') || 'فلترة'}</h3>
                                    <button
                                        onClick={() => setIsFilterModalOpen(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-4 space-y-6">
                                    {/* Categories */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                            <Package className="w-4 h-4 text-primary-600" />
                                            {t('categories') || 'الفئات'}
                                        </h4>
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => {
                                                    handleCategoryChange('');
                                                    setIsFilterModalOpen(false);
                                                }}
                                                className={`w-full px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                                                    selectedCategory === '' 
                                                        ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                                                        : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                                                }`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <Package className="w-4 h-4" />
                                                    {t('all_categories') || 'جميع الفئات'}
                                                </span>
                                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                                                    {safeProducts.total}
                                                </span>
                                            </button>
                                            {safeCategories.map((category) => (
                                                <button
                                                    key={category.id}
                                                    onClick={() => {
                                                        handleCategoryChange(category.id);
                                                        setIsFilterModalOpen(false);
                                                    }}
                                                    className={`w-full px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                                                        selectedCategory == category.id 
                                                            ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                                                            : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                                                    }`}
                                                >
                                                    <span>{category.name_ar || category.name_en || category.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Sort */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-primary-600" />
                                            {t('sort') || 'الترتيب'}
                                        </h4>
                                        <div className="space-y-2">
                                            {[
                                                { value: 'sort_order', label: t('default') || 'الافتراضي' },
                                                { value: 'name', label: t('sort_by_name') || 'حسب الاسم' },
                                                { value: 'price', label: t('sort_by_price') || 'حسب السعر' },
                                            ].map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        handleSortChange(option.value);
                                                        setIsFilterModalOpen(false);
                                                    }}
                                                    className={`w-full px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                                                        sortBy === option.value 
                                                            ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                                                            : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                                                    }`}
                                                >
                                                    <span>{option.label}</span>
                                                    {sortBy === option.value && (
                                                        <span className="text-primary-600">
                                                            {sortDirection === 'asc' ? '↑' : '↓'}
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* App Download Section */}
                <AppDownloadSection />
            </div>
        </Layout>
    );
}

