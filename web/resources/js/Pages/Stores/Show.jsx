import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import Layout from '../Layout';
import { useTranslation } from '../../hooks/useTranslation';
import ProductCard from '../../Components/ProductCard';
import { 
    Store, 
    MapPin, 
    Search,
    Package,
    DollarSign,
    ArrowLeft,
    Phone,
    Clock
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
            
            <div className="min-h-screen bg-slate-50">
                {/* Store Header */}
                <div className="bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <Link 
                            href="/stores"
                            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>العودة إلى المتاجر</span>
                        </Link>
                        
                        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm">
                                <Store className="w-12 h-12" />
                            </div>
                            
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold mb-2">{store.name}</h1>
                                <p className="text-white/80 text-lg mb-4">
                                    {store.store_type_label || store.store_type}
                                </p>
                                
                                <div className="flex flex-wrap gap-4 text-sm">
                                    {store.address && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            <span>{store.address}</span>
                                        </div>
                                    )}
                                    
                                    {store.governorate && store.city && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
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
                                            <Phone className="w-4 h-4" />
                                            <span>{store.phone}</span>
                                        </div>
                                    )}
                                    
                                    {store.opening_time && store.closing_time && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            <span>
                                                {store.opening_time} - {store.closing_time}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="text-center">
                                <div className="text-3xl font-bold">{safeProducts.total}</div>
                                <div className="text-white/80 text-sm">منتج متاح</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Sidebar - Filters */}
                        <div className="lg:w-1/4">
                            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">البحث والفلترة</h3>
                                
                                {/* Search */}
                                <form onSubmit={handleSearch} className="mb-6">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="ابحث عن منتج..."
                                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-5 w-5 text-slate-400" />
                                        </div>
                                    </div>
                                </form>

                                {/* Categories */}
                                <div className="mb-6">
                                    <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                                        <Package className="w-4 h-4 text-purple-600" />
                                        الفئات
                                    </h4>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => handleCategoryChange('')}
                                            className={`w-full px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                                                selectedCategory === '' 
                                                    ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                                                    : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <Package className="w-4 h-4" />
                                                جميع الفئات
                                            </span>
                                            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                                                {safeProducts.total}
                                            </span>
                                        </button>
                                        {safeCategories.map((category) => (
                                            <button
                                                key={category.id}
                                                onClick={() => handleCategoryChange(category.id)}
                                                className={`w-full px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                                                    selectedCategory == category.id 
                                                        ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                                                        : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                                                }`}
                                            >
                                                <span>{category.name_ar || category.name_en || category.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sort */}
                                <div>
                                    <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-purple-600" />
                                        الترتيب
                                    </h4>
                                    <div className="space-y-2">
                                        {[
                                            { value: 'sort_order', label: 'الافتراضي' },
                                            { value: 'name', label: 'حسب الاسم' },
                                            { value: 'price', label: 'حسب السعر' },
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => handleSortChange(option.value)}
                                                className={`w-full px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                                                    sortBy === option.value 
                                                        ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                                                        : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                                                }`}
                                            >
                                                <span>{option.label}</span>
                                                {sortBy === option.value && (
                                                    <span className="text-purple-600">
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
                                <p className="text-slate-600">
                                    عرض {safeProducts.data.length} من {safeProducts.total} منتج
                                </p>
                            </div>

                            {safeProducts.data.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {safeProducts.data.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                                    <div className="text-6xl mb-4">🔍</div>
                                    <h3 className="text-lg font-medium text-slate-900 mb-2">لم يتم العثور على منتجات</h3>
                                    <p className="text-slate-600">جرب تغيير معايير البحث أو التصفية</p>
                                </div>
                            )}

                            {/* Pagination */}
                            {safeProducts.links && safeProducts.links.length > 3 && (
                                <div className="mt-8 flex justify-center">
                                    <nav className="flex space-x-2">
                                        {safeProducts.links.map((link, index) => (
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

