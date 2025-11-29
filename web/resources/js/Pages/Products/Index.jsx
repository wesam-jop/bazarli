import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '../Layout';
import { useTranslation } from '../../hooks/useTranslation';
import ProductCard from '../../Components/ProductCard';
import AppDownloadSection from '../../Components/AppDownloadSection';
import { 
    Plus, 
    Minus, 
    ShoppingCart, 
    Search,
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
    DollarSign,
    MapPin,
    Filter,
    X,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

export default function ProductsIndex({ products, categories, governorates, cities: initialCities, filters, userGovernorateId, userCityId }) {
    const { t, locale } = useTranslation();
    const isRTL = locale === 'ar';
    
    // حماية من البيانات غير المحددة
    const safeFilters = filters || {};
    const safeProducts = products || { data: [], total: 0, links: [] };
    const safeCategories = categories || [];
    const safeGovernorates = governorates || [];

    const [search, setSearch] = useState(() => safeFilters?.search || '');
    const [selectedCategory, setSelectedCategory] = useState(() => safeFilters?.category || '');
    const [selectedGovernorate, setSelectedGovernorate] = useState(() => {
        return safeFilters?.governorate_id || userGovernorateId || '';
    });
    const [selectedCity, setSelectedCity] = useState(() => safeFilters?.city_id || userCityId || '');
    const [sortBy, setSortBy] = useState(() => safeFilters?.sort || 'sort_order');
    const [sortDirection, setSortDirection] = useState(() => safeFilters?.direction || 'asc');
    const [availableCities, setAvailableCities] = useState(() => initialCities || []);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    
    // جلب المدن عند تغيير المحافظة أو عند تحميل الصفحة لأول مرة
    useEffect(() => {
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
                            router.get('/products', {
                                search,
                                category: selectedCategory,
                                governorate_id: selectedGovernorate,
                                city_id: userCityId,
                                sort: sortBy,
                                direction: sortDirection,
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

    // دالة لتحويل أسماء الفئات إلى أيقونات
    const getCategoryIcon = (categoryName) => {
        const iconMap = {
            'grocery': <Package className="w-4 h-4" />,
            'fruits_vegetables': <Apple className="w-4 h-4" />,
            'meat_fish': <Utensils className="w-4 h-4" />,
            'dairy': <Milk className="w-4 h-4" />,
            'beverages': <Coffee className="w-4 h-4" />,
            'sweets': <Cookie className="w-4 h-4" />,
            'cleaning': <Sparkles className="w-4 h-4" />,
            'personal_care': <Heart className="w-4 h-4" />,
            'baby_supplies': <Baby className="w-4 h-4" />,
            'clothing': <Shirt className="w-4 h-4" />,
            'home_garden': <Home className="w-4 h-4" />,
            'alcohol': <Wine className="w-4 h-4" />,
        };
        return iconMap[categoryName] || <Package className="w-4 h-4" />;
    };

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
        router.get('/products', {
            search,
            category: selectedCategory,
            governorate_id: selectedGovernorate,
            city_id: selectedCity,
            sort: sortBy,
            direction: sortDirection,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
        router.get('/products', {
            search,
            category: categoryId,
            governorate_id: selectedGovernorate,
            city_id: selectedCity,
            sort: sortBy,
            direction: sortDirection,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleGovernorateChange = async (governorateId) => {
        setSelectedGovernorate(governorateId);
        setSelectedCity(''); // إعادة تعيين المدينة عند تغيير المحافظة
        
        router.get('/products', {
            search,
            category: selectedCategory,
            governorate_id: governorateId,
            city_id: '',
            sort: sortBy,
            direction: sortDirection,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleCityChange = (cityId) => {
        setSelectedCity(cityId);
        router.get('/products', {
            search,
            category: selectedCategory,
            governorate_id: selectedGovernorate,
            city_id: cityId,
            sort: sortBy,
            direction: sortDirection,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSortChange = (newSortBy, newDirection = null) => {
        const direction = newDirection || (sortBy === newSortBy && sortDirection === 'asc' ? 'desc' : 'asc');
        setSortBy(newSortBy);
        setSortDirection(direction);
        router.get('/products', {
            search,
            category: selectedCategory,
            governorate_id: selectedGovernorate,
            city_id: selectedCity,
            sort: newSortBy,
            direction: direction,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <Layout>
            <Head title={t('products')} />
            
            <div className="min-h-screen bg-secondary-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b border-secondary-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('products')}</h1>
                        <p className="text-gray-600 mt-1 text-sm sm:text-base">{t('browse_all_products') || 'تصفح جميع المنتجات'}</p>
                        
                        {/* Search Bar - Mobile Only */}
                        <div className="mt-6 lg:hidden">
                            <div className="flex gap-2">
                                <form onSubmit={handleSearch} className="flex-1">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder={t('search_products')}
                                            className="w-full ps-10 pe-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
                                        />
                                        <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
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
                        <div className={`hidden lg:block lg:w-1/4 ${isRTL ? 'lg:order-2' : 'lg:order-1'}`}>
                            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 sticky top-4">
                                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">{t('search_and_filter') || 'البحث والترتيب'}</h3>
                                
                                {/* Search */}
                                <form onSubmit={handleSearch} className="mb-6">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder={t('search_products')}
                                            className="w-full ps-10 pe-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm md:text-base"
                                        />
                                        <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
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

                                {/* Categories */}
                                <div className="mb-6">
                                    <h4 className="font-medium text-gray-900 mb-3 text-sm md:text-base flex items-center gap-2">
                                        <Package className="w-4 h-4 text-primary-600" />
                                        {t('categories')}
                                    </h4>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => handleCategoryChange('')}
                                            className={`w-full px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                                                selectedCategory === '' 
                                                    ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                                                    : 'text-gray-600 hover:bg-secondary-100 border border-transparent'
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <Package className="w-4 h-4" />
                                                {t('all_categories')}
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
                                                        : 'text-gray-600 hover:bg-secondary-100 border border-transparent'
                                                }`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <span className="text-primary-600">
                                                        {getCategoryIcon(category.name)}
                                                    </span>
                                                    {category.name}
                                                </span>
                                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                                                    {category.products_count}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sort */}
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3 text-sm md:text-base flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-primary-600" />
                                        {t('sort_by')}
                                    </h4>
                                    <div className="space-y-2">
                                        {[
                                            { value: 'sort_order', label: t('default_sort') },
                                            { value: 'name', label: t('sort_by_name') },
                                            { value: 'price', label: t('sort_by_price') },
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => handleSortChange(option.value)}
                                                className={`w-full text-start px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                                                    sortBy === option.value 
                                                        ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                                                        : 'text-gray-600 hover:bg-secondary-100 border border-transparent'
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
                        <div className={`lg:w-3/4 w-full ${isRTL ? 'lg:order-1' : 'lg:order-2'}`}>
                            <div className="mb-4 md:mb-6 flex items-center justify-between flex-wrap gap-2">
                                <p className="text-gray-600 text-sm md:text-base">
                                    {t('showing_products') || 'عرض'} <span className="font-semibold text-gray-900">{safeProducts.data.length}</span> {t('of') || 'من'} <span className="font-semibold text-gray-900">{safeProducts.total}</span> {t('products') || 'منتج'}
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
                                    <div className="text-6xl mb-4">🔍</div>
                                    <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">{t('no_products_found')}</h3>
                                    <p className="text-gray-600">{t('try_searching_other_categories') || 'جرب تغيير معايير البحث أو التصفية'}</p>
                                </div>
                            )}

                            {/* Pagination */}
                            {safeProducts.links && safeProducts.links.length > 3 && (
                                <div className="mt-6 md:mt-8 flex justify-center overflow-x-auto">
                                    <nav className="flex gap-2">
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

                                {/* Categories */}
                                <div className="mb-6">
                                    <h4 className="font-medium text-gray-900 mb-3 text-sm md:text-base flex items-center gap-2">
                                        <Package className="w-4 h-4 text-primary-600" />
                                        {t('categories')}
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
                                                    : 'text-gray-600 hover:bg-secondary-100 border border-transparent'
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <Package className="w-4 h-4" />
                                                {t('all_categories')}
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
                                                        : 'text-gray-600 hover:bg-secondary-100 border border-transparent'
                                                }`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <span className="text-primary-600">
                                                        {getCategoryIcon(category.name)}
                                                    </span>
                                                    {category.name}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sort */}
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3 text-sm md:text-base flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-primary-600" />
                                        {t('sort_by')}
                                    </h4>
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
                                                className={`w-full text-start px-4 py-3 rounded-lg text-sm transition-colors ${
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
