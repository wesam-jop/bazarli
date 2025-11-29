import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../Layout';
import { useTranslation } from '../../../hooks/useTranslation';
import { 
    Package, 
    Search, 
    Filter,
    Eye,
    Edit,
    CheckCircle,
    XCircle,
    Calendar,
    Store,
    Tag,
    DollarSign,
    Download,
    Plus,
    Star,
    AlertTriangle,
    ShoppingCart,
    TrendingUp
} from 'lucide-react';

export default function Products({ products, stats }) {
    const { t, locale } = useTranslation();
    const isRTL = locale === 'ar';
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const filteredProducts = products?.filter(product => {
        const matchesSearch = 
            product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.barcode?.includes(searchTerm) ||
            product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.store?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = 
            filterStatus === 'all' ||
            (filterStatus === 'available' && product.is_available) ||
            (filterStatus === 'unavailable' && !product.is_available) ||
            (filterStatus === 'featured' && product.is_featured) ||
            false; // Stock system removed
        
        return matchesSearch && matchesFilter;
    }) || [];

    const handleToggleAvailable = (product) => {
        router.post(`/admin/products/${product.id}/toggle-available`, {}, {
            preserveScroll: true,
        });
    };

    const handleToggleFeatured = (product) => {
        router.post(`/admin/products/${product.id}/toggle-featured`, {}, {
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout title={t('products')}>
            <Head title={t('products')} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">{t('products')}</h2>
                        <p className="text-slate-600 mt-2">{t('manage_products') || 'Manage all products in the platform'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm">
                            <Download className="w-4 h-4" />
                            <span className="font-medium">{t('export') || 'Export'}</span>
                        </button>
                        <Link
                            href="/admin/products/create"
                            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="font-semibold">{t('add_product') || 'Add Product'}</span>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6 hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-700">{t('total_products') || 'Total Products'}</p>
                                <p className="text-3xl font-bold text-blue-900 mt-2">{stats?.total || 0}</p>
                                <p className="text-xs text-blue-600 mt-1">{t('all_products') || 'All products'}</p>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Package className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-6 hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-700">{t('available') || 'Available'}</p>
                                <p className="text-3xl font-bold text-green-900 mt-2">{stats?.available || 0}</p>
                                <p className="text-xs text-green-600 mt-1">{t('in_stock') || 'In stock'}</p>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <CheckCircle className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm border border-red-200 p-6 hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-red-700">{t('unavailable') || 'Unavailable'}</p>
                                <p className="text-3xl font-bold text-red-900 mt-2">{stats?.unavailable || 0}</p>
                                <p className="text-xs text-red-600 mt-1">{t('not_available') || 'Not available'}</p>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <XCircle className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-sm border border-yellow-200 p-6 hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-yellow-700">{t('featured') || 'Featured'}</p>
                                <p className="text-3xl font-bold text-yellow-900 mt-2">{stats?.featured || 0}</p>
                                <p className="text-xs text-yellow-600 mt-1">{t('featured_products') || 'Featured products'}</p>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Star className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm border border-purple-200 p-6 hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-700">{t('total_sales') || 'Total Sales'}</p>
                                <p className="text-3xl font-bold text-purple-900 mt-2">{stats?.total_sales || 0}</p>
                                <p className="text-xs text-purple-600 mt-1">{t('units_sold') || 'Units sold'}</p>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <div className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2`}>
                                <Search className="w-5 h-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={t('search_products') || 'Search by name, description, barcode, category, or store...'}
                                className={`w-full ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm`}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
                                <Filter className="w-4 h-4 text-slate-500" />
                                <span className="text-sm font-medium text-slate-700">{t('filter') || 'Filter'}</span>
                            </div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm font-medium text-slate-700 min-w-[150px]"
                            >
                                <option value="all">{t('all') || 'All'}</option>
                                <option value="available">{t('available') || 'Available'}</option>
                                <option value="unavailable">{t('unavailable') || 'Unavailable'}</option>
                                <option value="featured">{t('featured') || 'Featured'}</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                                <tr>
                                    <th className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'} text-xs font-semibold text-slate-700 uppercase tracking-wider`}>
                                        {t('product') || 'Product'}
                                    </th>
                                    <th className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'} text-xs font-semibold text-slate-700 uppercase tracking-wider`}>
                                        {t('category') || 'Category'}
                                    </th>
                                    <th className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'} text-xs font-semibold text-slate-700 uppercase tracking-wider`}>
                                        {t('store') || 'Store'}
                                    </th>
                                    <th className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'} text-xs font-semibold text-slate-700 uppercase tracking-wider`}>
                                        {t('price') || 'Price'}
                                    </th>
                                    <th className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'} text-xs font-semibold text-slate-700 uppercase tracking-wider`}>
                                        {t('stock') || 'Stock'}
                                    </th>
                                    <th className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'} text-xs font-semibold text-slate-700 uppercase tracking-wider`}>
                                        {t('status') || 'Status'}
                                    </th>
                                    <th className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'} text-xs font-semibold text-slate-700 uppercase tracking-wider`}>
                                        {t('actions') || 'Actions'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-slate-50/50 transition-all duration-150 group">
                                            <td className="px-6 py-4">
                                                <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse' : ''} gap-3`}>
                                                    {product.image ? (
                                                        <img 
                                                            src={product.image} 
                                                            alt={product.name}
                                                            className="w-12 h-12 rounded-xl object-cover shadow-md"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                            {product.name?.charAt(0)?.toUpperCase() || 'P'}
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse' : ''} gap-2`}>
                                                            <div className="text-sm font-bold text-slate-900 truncate">
                                                                {product.name || '-'}
                                                            </div>
                                                            {product.is_featured && (
                                                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                            )}
                                                        </div>
                                                        {product.barcode && (
                                                            <div className="text-xs text-slate-500 mt-0.5">
                                                                {t('barcode') || 'Barcode'}: {product.barcode}
                                                            </div>
                                                        )}
                                                        {product.unit && (
                                                            <div className="text-xs text-slate-500 mt-0.5">
                                                                {product.unit}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {product.category ? (
                                                    <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse' : ''} gap-2`}>
                                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                                            <Tag className="w-4 h-4 text-blue-600" />
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-900">{product.category.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {product.store ? (
                                                    <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse' : ''} gap-2`}>
                                                        <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                                                            <Store className="w-4 h-4 text-green-600" />
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-900">{product.store.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse' : ''} gap-2`}>
                                                    <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
                                                        <DollarSign className="w-4 h-4 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        {product.discount_price ? (
                                                            <>
                                                                <div className="text-sm font-bold text-slate-900">
                                                                    {parseFloat(product.discount_price).toFixed(2)}
                                                                </div>
                                                                <div className="text-xs text-slate-500 line-through">
                                                                    {parseFloat(product.price).toFixed(2)}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="text-sm font-bold text-slate-900">
                                                                {parseFloat(product.price || 0).toFixed(2)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        onClick={() => handleToggleAvailable(product)}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all w-fit ${
                                                            product.is_available
                                                                ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                                                                : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                                                        }`}
                                                    >
                                                        {product.is_available ? (
                                                            <>
                                                                <CheckCircle className="w-3.5 h-3.5" />
                                                                <span>{t('available') || 'Available'}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <XCircle className="w-3.5 h-3.5" />
                                                                <span>{t('unavailable') || 'Unavailable'}</span>
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleFeatured(product)}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all w-fit ${
                                                            product.is_featured
                                                                ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100'
                                                                : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                                                        }`}
                                                    >
                                                        <Star className={`w-3.5 h-3.5 ${product.is_featured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                                                        <span>{product.is_featured ? (t('featured') || 'Featured') : (t('not_featured') || 'Not Featured')}</span>
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse' : ''} gap-1`}>
                                                    <Link
                                                        href={`/admin/products/${product.id}`}
                                                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 group/action"
                                                        title={t('view') || 'View'}
                                                    >
                                                        <Eye className="w-4 h-4 group-hover/action:scale-110 transition-transform" />
                                                    </Link>
                                                    <Link
                                                        href={`/admin/products/${product.id}/edit`}
                                                        className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all duration-200 group/action"
                                                        title={t('edit') || 'Edit'}
                                                    >
                                                        <Edit className="w-4 h-4 group-hover/action:scale-110 transition-transform" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                                    <Package className="w-10 h-10 text-slate-400" />
                                                </div>
                                                <p className="text-slate-600 font-medium mb-1">{t('no_products_found') || 'No products found'}</p>
                                                <p className="text-sm text-slate-400">{t('try_different_search') || 'Try adjusting your search or filter criteria'}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Results Count */}
                {filteredProducts.length > 0 && (
                    <div className="text-center text-sm text-slate-600">
                        {t('showing_results') || 'Showing'} {filteredProducts.length} {t('of') || 'of'} {products?.length || 0} {t('products') || 'products'}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

