import React from 'react';
import { Link } from '@inertiajs/react';
import { useTranslation } from '../hooks/useTranslation';
import { Store, MapPin, ShoppingBag, Package, ArrowRight } from 'lucide-react';

export default function StoreCard({ store }) {
    const { t, locale } = useTranslation();

    return (
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group relative">
            <Link href={`/stores/${store.id}`}>
                <div className="aspect-square bg-secondary-100 flex items-center justify-center p-4">
                    <Store className="w-16 h-16 text-primary-600 group-hover:scale-110 transition-transform duration-200" />
                </div>
                <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                        {store.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                        {store.store_type_label || store.store_type}
                    </p>
                    
                    {/* Location Information */}
                    {store.governorate && store.city && (
                        <div className="mb-2 pt-2 border-t border-secondary-200">
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                <span>
                                    {locale === 'ar' 
                                        ? `${store.city.name_ar}، ${store.governorate.name_ar}`
                                        : `${store.city.name_en}, ${store.governorate.name_en}`
                                    }
                                </span>
                            </div>
                        </div>
                    )}
                    
                    {store.address && (
                        <div className="mb-2">
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                <span className="line-clamp-1">{store.address}</span>
                            </div>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-gray-700 mb-2">
                        <div className="flex items-center gap-1">
                            <Package className="w-3.5 h-3.5 text-gray-500" />
                            <span>{store.products_count || 0} {t('products') || 'منتج'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <ShoppingBag className="w-3.5 h-3.5 text-gray-500" />
                            <span>{store.orders_count || 0} {t('orders') || 'طلب'}</span>
                        </div>
                    </div>
                </div>
            </Link>
            
            <div className="px-4 pb-4">
                <Link
                    href={`/stores/${store.id}`}
                    className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <span>{t('stores_view_store') || 'عرض المتجر'}</span>
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
