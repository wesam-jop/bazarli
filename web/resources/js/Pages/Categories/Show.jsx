import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '../Layout';
import { useTranslation } from '../../hooks/useTranslation';
import ProductCard from '../../Components/ProductCard';
import AppDownloadSection from '../../Components/AppDownloadSection';
import { 
    Package,
    Apple,
    Utensils,
    Milk,
    Coffee,
    Cookie,
    Sparkles,
    Heart,
    Baby,
    Shirt,
    Home,
    Wine,
    Plus,
    Minus,
    ShoppingCart,
    Search,
    X,
    Filter
} from 'lucide-react';

export default function CategoryShow({ category, products, filters }) {
    const { t } = useTranslation();
    
    // حماية من البيانات غير المحددة
    const safeFilters = filters || {};
    const safeProducts = products || { data: [], total: 0, links: [] };
    const safeCategory = category || { id: 0, name: '', icon: '', description: '' };

    // دالة لتحويل أسماء الفئات إلى أيقونات
    const getCategoryIcon = (categoryName) => {
        const iconMap = {
            'grocery': <Package className="w-16 h-16" />,
            'fruits_vegetables': <Apple className="w-16 h-16" />,
            'meat_fish': <Utensils className="w-16 h-16" />,
            'dairy': <Milk className="w-16 h-16" />,
            'beverages': <Coffee className="w-16 h-16" />,
            'sweets': <Cookie className="w-16 h-16" />,
            'cleaning': <Sparkles className="w-16 h-16" />,
            'personal_care': <Heart className="w-16 h-16" />,
            'baby_supplies': <Baby className="w-16 h-16" />,
            'clothing': <Shirt className="w-16 h-16" />,
            'home_garden': <Home className="w-16 h-16" />,
            'alcohol': <Wine className="w-16 h-16" />,
        };
        return iconMap[categoryName] || <Package className="w-16 h-16" />;
    };

    const [search, setSearch] = useState(() => safeFilters?.search || '');
    const [sortBy, setSortBy] = useState(() => safeFilters?.sort || 'sort_order');
    const [sortDirection, setSortDirection] = useState(() => safeFilters?.direction || 'asc');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    // دوال إدارة السلة
    const addToCart = (productId) => {
        router.post('/cart/add', {
            product_id: productId,
            quantity: 1
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const updateCartQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            router.delete(`/cart/remove/${productId}`, {
                preserveState: true,
                preserveScroll: true,
            });
        } else {
            router.post('/cart/update', {
                product_id: productId,
                quantity: quantity
            }, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(`/categories/${safeCategory.id}`, {
            search,
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
        router.get(`/categories/${safeCategory.id}`, {
            search,
            sort: newSortBy,
            direction: newDirection,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <Layout>
            <Head title={safeCategory.name} />
            
            <div className="min-h-screen bg-secondary-50">
                {/* Breadcrumb */}
                <div className="bg-white border-b border-secondary-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <nav className="flex items-center space-x-2 text-sm flex-wrap">
                            <Link href="/" className="text-gray-500 hover:text-primary-600 transition-colors">{t('home')}</Link>
                            <span className="text-gray-400">/</span>
                            <Link href="/categories" className="text-gray-500 hover:text-primary-600 transition-colors">{t('categories')}</Link>
                            <span className="text-gray-400">/</span>
                            <span className="text-gray-900 font-medium">{safeCategory.name}</span>
                        </nav>
                    </div>
                </div>

                {/* Category Header */}
                <div className="bg-white shadow-sm border-b border-secondary-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                        <div className="text-center">
                            <div className="text-primary-600 mb-4 flex justify-center">
                                {getCategoryIcon(safeCategory.name)}
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{safeCategory.name}</h1>
                            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base px-4">{safeCategory.description}</p>
                        </div>
                        
                        {/* Search Bar - Mobile Only */}
                        <div className="mt-6 lg:hidden">
                            <div className="flex gap-2">
                                <form onSubmit={handleSearch} className="flex-1">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder={t('search_in_category') || 'ابحث في هذه الفئة...'}
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
                                            placeholder={t('search_in_category') || 'ابحث في هذه الفئة...'}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm md:text-base"
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>
                                </form>

                                {/* Sort */}
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3 text-sm md:text-base">{t('sort_by') || 'ترتيب حسب'}</h4>
                                    <div className="space-y-2">
                                        {[
                                            { value: 'sort_order', label: t('default_sort') },
                                            { value: 'name', label: t('sort_by_name') },
                                            { value: 'price', label: t('sort_by_price') },
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => handleSortChange(option.value)}
                                                className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                                                    sortBy === option.value 
                                                        ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                                                        : 'text-gray-600 hover:bg-secondary-100 border border-transparent'
                                                }`}
                                            >
                                                {option.label}
                                                {sortBy === option.value && (
                                                    <span className="mr-2">
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
                        <div className="lg:w-3/4 w-full">
                            <div className="mb-4 md:mb-6 flex items-center justify-between flex-wrap gap-2">
                                <p className="text-gray-600 text-sm md:text-base">
                                    {t('showing_products') || 'عرض'} <span className="font-semibold text-gray-900">{safeProducts.data.length}</span> {t('of') || 'من'} <span className="font-semibold text-gray-900">{safeProducts.total}</span> {t('products_in_category') || 'منتج في فئة'} <span className="font-semibold text-primary-600">{safeCategory.name}</span>
                                </p>
                            </div>

                        {safeProducts.data.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {safeProducts.data.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 md:py-16 px-4">
                                <div className="text-6xl mb-4">{safeCategory.icon}</div>
                                <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">{t('no_products_found')}</h3>
                                <p className="text-gray-600 mb-6">{t('try_searching_other_categories') || 'جرب البحث في فئات أخرى'}</p>
                                <Link 
                                    href="/categories" 
                                    className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm md:text-base"
                                >
                                    {t('view_all_categories')}
                                </Link>
                            </div>
                        )}

                        {/* Pagination */}
                        {safeProducts.links && safeProducts.links.length > 3 && (
                            <div className="mt-6 md:mt-8 flex justify-center overflow-x-auto">
                                <nav className="flex space-x-2">
                                    {safeProducts.links.map((link, index) => (
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
                                {/* Sort */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        {t('sort_by') || 'ترتيب حسب'}
                                    </label>
                                    <div className="space-y-2">
                                        {[
                                            { value: 'sort_order', label: t('default_sort') },
                                            { value: 'name', label: t('sort_by_name') },
                                            { value: 'price', label: t('sort_by_price') },
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    handleSortChange(option.value);
                                                    setIsFilterModalOpen(false);
                                                }}
                                                className={`w-full text-right px-4 py-3 rounded-lg text-sm transition-colors ${
                                                    sortBy === option.value 
                                                        ? 'bg-primary-100 text-primary-700 border-2 border-primary-500' 
                                                        : 'text-gray-600 hover:bg-secondary-100 border-2 border-transparent hover:border-gray-200'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span>{option.label}</span>
                                                    {sortBy === option.value && (
                                                        <span className="text-primary-600">
                                                            {sortDirection === 'asc' ? '↑' : '↓'}
                                                        </span>
                                                    )}
                                                </div>
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

            {/* App Download Section */}
            <AppDownloadSection />
        </Layout>
    );
}
