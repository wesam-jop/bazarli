import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '../Layout';
import { useTranslation } from '../../hooks/useTranslation';
import ProductCard from '../../Components/ProductCard';
import FavoriteToggleButton from '../../Components/FavoriteToggleButton';
import AppDownloadSection from '../../Components/AppDownloadSection';
import { DollarSign, Plus, Minus, ShoppingCart, Store, MapPin, Package } from 'lucide-react';

export default function ProductShow({ product, relatedProducts }) {
    const { t } = useTranslation();
    const [quantity, setQuantity] = useState(1);

    const handleAddToCart = () => {
        router.post('/cart/add', {
            product_id: product.id,
            quantity: quantity
        }, {
            onSuccess: () => {
                alert(t('product_added_to_cart', { quantity, name: product.name }));
            },
            onError: (errors) => {
                if (errors.quantity) {
                    alert(errors.quantity);
                } else {
                    alert(t('error_adding_to_cart'));
                }
            }
        });
    };

    return (
        <Layout>
            <Head title={product.name} />
            
            <div className="min-h-screen bg-secondary-50">
                {/* Breadcrumb */}
                <div className="bg-white border-b border-secondary-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <nav className="flex items-center space-x-2 text-sm flex-wrap">
                            <Link href="/" className="text-gray-500 hover:text-primary-600 transition-colors">{t('home')}</Link>
                            <span className="text-gray-400">/</span>
                            <Link href="/products" className="text-gray-500 hover:text-primary-600 transition-colors">{t('products')}</Link>
                            <span className="text-gray-400">/</span>
                            <Link href={`/categories/${product.category?.id}`} className="text-gray-500 hover:text-primary-600 transition-colors">
                                {product.category?.name}
                            </Link>
                            <span className="text-gray-400">/</span>
                            <span className="text-gray-900 font-medium">{product.name}</span>
                        </nav>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                        {/* Product Image */}
                        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                            <div className="aspect-square bg-secondary-100 rounded-lg flex items-center justify-center overflow-hidden">
                                {product.image ? (
                                    <img 
                                        src={product.image} 
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-8xl">{product.category?.icon || '📦'}</span>
                                )}
                            </div>
                        </div>

                        {/* Product Details */}
                        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                            <div className="mb-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
                                    {product.category?.icon} {product.category?.name}
                                </span>
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
                            
                            <p className="text-gray-600 mb-6 leading-relaxed text-sm sm:text-base">{product.description}</p>

                            <div className="mb-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex items-center space-x-2">
                                        <DollarSign className="w-6 h-6 text-success-600" />
                                        <span className="text-2xl sm:text-3xl font-bold text-primary-600">
                                            {product.price}
                                        </span>
                                    </div>
                                    <span className="text-base sm:text-lg text-gray-500">/ {product.unit}</span>
                                </div>

                                {product.is_featured && (
                                    <div className="mb-4">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-warning-100 text-warning-800">
                                            ⭐ {t('featured')}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Store Info */}
                            {product.store && (
                                <div className="mb-6 p-4 bg-secondary-50 rounded-lg border border-secondary-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Store className="w-5 h-5 text-primary-600 flex-shrink-0" />
                                        <Link 
                                            href={`/stores/${product.store.id}`}
                                            className="font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                                        >
                                            {product.store.name}
                                        </Link>
                                    </div>
                                    {product.store.address && (
                                        <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary-600" />
                                            <span className="flex-1">{product.store.address}</span>
                                        </div>
                                    )}
                                    {(product.store.city || product.store.governorate) && (
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            {product.store.city && (
                                                <span>{product.store.city.name}</span>
                                            )}
                                            {product.store.city && product.store.governorate && (
                                                <span></span>
                                            )}
                                            {product.store.governorate && (
                                                <span>{product.store.governorate.name}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Quantity Selector */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('quantity') || 'الكمية'}
                                </label>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-secondary-100 transition-colors text-gray-700"
                                        aria-label={t('decrease_quantity') || 'تقليل الكمية'}
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-16 text-center font-medium text-gray-900">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-secondary-100 transition-colors text-gray-700"
                                        aria-label={t('increase_quantity') || 'زيادة الكمية'}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Add to Cart & Favorite */}
                            <div className="flex flex-col gap-3 flex-wrap">
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    {t('add_to_cart')}
                                </button>
                                <FavoriteToggleButton
                                    productId={product.id}
                                    variant="pill"
                                    className="w-full justify-center sm:w-auto"
                                />
                            </div>

                            {/* Product Info */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-primary-600" />
                                    {t('product_info') || 'معلومات المنتج'}
                                </h3>
                                <div className="space-y-3">
                                    {product.brand && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">{t('brand') || 'العلامة التجارية'}:</span>
                                            <span className="font-medium text-gray-900">{product.brand}</span>
                                        </div>
                                    )}
                                    {product.weight && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">{t('weight') || 'الوزن'}:</span>
                                            <span className="font-medium text-gray-900">{product.weight} {t('grams') || 'غرام'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Related Products */}
                    {relatedProducts && relatedProducts.length > 0 && (
                        <div className="mt-8 md:mt-12">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 md:mb-6">{t('related_products') || 'منتجات ذات صلة'}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {relatedProducts.map((relatedProduct) => (
                                    <ProductCard key={relatedProduct.id} product={relatedProduct} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* App Download Section */}
            <AppDownloadSection />
        </Layout>
    );
}
