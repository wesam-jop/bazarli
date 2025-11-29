import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Heart, ShoppingBag } from 'lucide-react';
import CustomerLayout from './CustomerLayout';
import ProductCard from '../../Components/ProductCard';
import { useTranslation } from '../../hooks/useTranslation';

export default function CustomerFavorites({ favorites = [] }) {
    const { t } = useTranslation();

    return (
        <CustomerLayout
            title={t('favorite_products_title') || 'Favorite Products'}
            subtitle={t('favorite_products_subtitle') || 'Keep track of the products you love the most.'}
        >
            <Head title={t('favorite_products_title') || 'Favorite Products'} />

            <div className="space-y-6">
                {favorites.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                        {favorites.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 sm:p-12 text-center space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-white shadow-lg flex items-center justify-center">
                            <Heart className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900">
                            {t('favorite_empty_title') || 'No favorite products yet'}
                        </h3>
                        <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                            {t('favorite_empty_description') || 'Save your favorite items to access them quickly while shopping.'}
                        </p>
                        <Link
                            href="/products"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-600/90 transition-all"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            {t('browse_products_cta') || 'Browse Products'}
                        </Link>
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
