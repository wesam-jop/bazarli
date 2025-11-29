import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { useTranslation } from '../hooks/useTranslation';
import FavoriteToggleButton from './FavoriteToggleButton';
import { Package, Plus, DollarSign, Store, MapPin } from 'lucide-react';

export default function ProductCard({ product, showAddToCart = true }) {
    const { t, locale } = useTranslation();
    const isRTL = locale === 'ar';
    const [imageError, setImageError] = useState(false);

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        router.post('/cart/add', {
            product_id: product.id,
            quantity: 1
        }, {
            preserveState: true,
            onSuccess: () => {
                // يمكن إضافة رسالة نجاح هنا
            }
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group relative">
            <div className={`absolute top-3 z-20 ${isRTL ? 'left-3' : 'right-3'}`}>
                <FavoriteToggleButton productId={product.id} size="sm" />
            </div>
            {/* Featured Badge */}
            {product.is_featured && (
                <div className={`absolute top-2 z-10 ${isRTL ? 'left-2' : 'right-2'}`}>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-400 text-yellow-900 shadow-md">
                        ⭐ {t('featured')}
                    </span>
                </div>
            )}
            <Link href={`/products/${product.id}`}>
                <div className="aspect-square bg-secondary-50 flex items-center justify-center overflow-hidden">
                    {product.image && !imageError ? (
                        <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <Package className="w-16 h-16 text-primary-600 group-hover:scale-110 transition-transform duration-200" />
                    )}
                </div>
                <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                        {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {product.description}
                    </p>
                    
                    {/* Store Information */}
                    {product.store && (
                        <div className="mb-2 pt-2 border-t border-secondary-200">
                            <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
                                <Store className="w-3.5 h-3.5 text-gray-500" />
                                <span className="font-medium text-gray-800">{product.store.name}</span>
                            </div>
                            {product.store.governorate && product.store.city && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                    <span>
                                        {locale === 'ar' 
                                            ? `${product.store.city.name_ar}، ${product.store.governorate.name_ar}`
                                            : `${product.store.city.name_en}, ${product.store.governorate.name_en}`
                                        }
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-success-600" />
                            <span className="text-lg font-bold text-gray-900">
                                {product.price}
                            </span>
                        </div>
                        <span className="text-xs text-gray-500">
                            {product.unit}
                        </span>
                    </div>
                </div>
            </Link>
            
            {showAddToCart && (
                <div className="px-4 pb-4">
                    <button
                        onClick={handleAddToCart}
                        className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>{t('add_to_cart')}</span>
                    </button>
                </div>
            )}
        </div>
    );
}
