import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from './Layout';
import { useTranslation } from '../hooks/useTranslation';
import AppDownloadSection from '../Components/AppDownloadSection';
import ProductCard from '../Components/ProductCard';
import CategoryCard from '../Components/CategoryCard';
import { 
    ShoppingCart, 
    Clock, 
    Shield,
    Package,
    Apple,
    Milk,
    Coffee,
    Cookie,
    Utensils,
    Wine,
    Baby,
    Shirt,
    Home as HomeIcon,
    Sparkles,
    Heart,
    Smartphone
} from 'lucide-react';
import StoreCard from '../Components/StoreCard';

export default function Home({ categories, featuredProducts, featuredStores = [] }) {
    const { t, locale } = useTranslation();
    const { props } = usePage();
    const settings = props?.settings || {};
    
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

    // دالة لتحويل أسماء الفئات إلى أيقونات
    const getCategoryIcon = (categoryName) => {
        const iconMap = {
            'grocery': <Package className="w-8 h-8" />,
            'fruits_vegetables': <Apple className="w-8 h-8" />,
            'meat_fish': <Utensils className="w-8 h-8" />,
            'dairy': <Milk className="w-8 h-8" />,
            'beverages': <Coffee className="w-8 h-8" />,
            'sweets': <Cookie className="w-8 h-8" />,
            'cleaning': <Sparkles className="w-8 h-8" />,
            'personal_care': <Heart className="w-8 h-8" />,
            'baby_supplies': <Baby className="w-8 h-8" />,
            'clothing': <Shirt className="w-8 h-8" />,
            'home_garden': <HomeIcon className="w-8 h-8" />,
            'alcohol': <Wine className="w-8 h-8" />,
        };
        return iconMap[categoryName] || <Package className="w-8 h-8" />;
    };

    const coreFeatures = [
        {
            icon: Clock,
            title: t('fast_delivery'),
            description: t('fast_delivery_desc')
        },
        {
            icon: Shield,
            title: t('quality_guaranteed'),
            description: t('quality_guaranteed_desc')
        },
        {
            icon: Package,
            title: t('wide_selection'),
            description: t('wide_selection_desc')
        }
    ];

    return (
        <Layout>
            <Head title={t('home_meta_title')}>
                <meta name="description" content={t('home_meta_description')} />
            </Head>

                {/* Hero Section */}
                <section className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-purple-900 text-white">
                    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_55%)] pointer-events-none" aria-hidden="true" />
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                        <div className="text-center space-y-6">
                            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                                {t('welcome_title')}
                            </h1>
                            <p className="text-xl md:text-2xl text-purple-100">
                                {t('welcome_subtitle')}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                                <Link 
                                    href="/products" 
                                    className="flex items-center justify-center gap-2 bg-white text-slate-900 px-6 sm:px-8 py-3 rounded-full font-semibold hover:bg-purple-100 transition-colors text-center shadow-xl shadow-purple-900/40"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    <span>{t('start_shopping')}</span>
                                </Link>
                                <Link 
                                    href="/download-app" 
                                    className="flex items-center justify-center gap-2 border-2 border-white/70 text-white px-6 sm:px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-slate-900 transition-colors"
                                >
                                    <Smartphone className="w-5 h-5" />
                                    <span>{t('download_app')}</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-16 bg-slate-950 text-slate-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12 max-w-3xl mx-auto">
                            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm font-semibold text-purple-100 mb-4">
                                {t('why_choose_us')}
                            </span>
                            <h2 className="text-3xl font-bold text-white mb-4">
                                {t('why_choose_us')}
                            </h2>
                            <p className="text-lg text-slate-300">
                                {t('why_choose_subtitle')}
                            </p>
                        </div>
                        
                        <div className="grid gap-6 md:grid-cols-3">
                            {coreFeatures.map(({ icon: Icon, title, description }) => (
                                <div 
                                    key={title} 
                                    className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-lg shadow-black/40 backdrop-blur transition hover:-translate-y-1 hover:border-purple-400/30 hover:shadow-purple-900/40"
                                >
                                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10 text-purple-200">
                                        <Icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
                                    <p className="text-slate-300 text-sm">{description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Categories Section */}
                {categories && categories.length > 0 && (
                    <section className="py-16 bg-slate-900 text-slate-100">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-12 max-w-3xl mx-auto">
                                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm font-semibold text-purple-100 mb-4">
                                    {t('product_categories')}
                                </span>
                                <h2 className="text-3xl font-bold text-white mb-4">
                                    {t('product_categories')}
                                </h2>
                            <p className="text-lg text-slate-300">
                                {t('product_categories_subtitle')}
                            </p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 sm:gap-6">
                                {categories.slice(0, 6).map((category) => (
                                    <CategoryCard key={category.id} category={category} />
                                ))}
                            </div>
                            
                            <div className="text-center mt-8">
                                <Link 
                                    href="/categories" 
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-purple-500 px-6 py-3 text-white font-semibold shadow-xl shadow-purple-900/40 hover:bg-purple-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400"
                                >
                                    <span>{t('view_all_categories')}</span>
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                {/* Featured Products Section */}
                {featuredProducts && featuredProducts.length > 0 && (
                    <section className="py-16 bg-slate-950 text-slate-100">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-12 max-w-3xl mx-auto">
                                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm font-semibold text-purple-100 mb-4">
                                    {t('featured_products')}
                                </span>
                                <h2 className="text-3xl font-bold text-white mb-4">
                                    {t('featured_products')}
                                </h2>
                            <p className="text-lg text-slate-300">
                                {t('featured_products_subtitle')}
                            </p>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {featuredProducts.slice(0, 4).map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                            
                            <div className="text-center mt-8">
                                <Link 
                                    href="/products" 
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-purple-500 px-6 py-3 text-white font-semibold shadow-xl shadow-purple-900/40 hover:bg-purple-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400"
                                >
                                    <span>{t('view_all_products')}</span>
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                {/* Featured Stores Section */}
                {featuredStores && featuredStores.length > 0 && (
                    <section className="py-16 bg-slate-900 text-slate-100">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-12 max-w-3xl mx-auto">
                                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm font-semibold text-purple-100 mb-4">
                                    {t('featured_stores')}
                                </span>
                                <h2 className="text-3xl font-bold text-white mb-4">
                                    {t('featured_stores')}
                                </h2>
                            <p className="text-lg text-slate-300">
                                {t('featured_stores_subtitle')}
                            </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {featuredStores.map((store) => (
                                    <StoreCard 
                                        key={store.id}
                                        store={store}
                                        t={t}
                                    />
                                ))}
                            </div>

                            <div className="text-center mt-8">
                                <Link 
                                    href="/stores" 
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-purple-500 px-6 py-3 text-white font-semibold shadow-xl shadow-purple-900/40 hover:bg-purple-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400"
                                >
                                    <span>{t('view_all_stores')}</span>
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                {/* Footer */}
                {/* <footer className="bg-gray-900 text-white py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-4 gap-8">
                            <div>
                                <h3 className="text-lg font-semibold mb-4">{settings?.site_name || 'Getir Clone'}</h3>
                                <p className="text-gray-400">
                                    Fast delivery service bringing groceries and essentials to your doorstep in minutes.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Quick Links</h4>
                                <ul className="space-y-2 text-gray-400">
                                    <li><a href="#" className="hover:text-white">About Us</a></li>
                                    <li><a href="#" className="hover:text-white">Contact</a></li>
                                    <li><a href="#" className="hover:text-white">Careers</a></li>
                                    <li><a href="#" className="hover:text-white">Help</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Services</h4>
                                <ul className="space-y-2 text-gray-400">
                                    <li><a href="#" className="hover:text-white">Grocery Delivery</a></li>
                                    <li><a href="#" className="hover:text-white">Food Delivery</a></li>
                                    <li><a href="#" className="hover:text-white">Pharmacy</a></li>
                                    <li><a href="#" className="hover:text-white">Pet Supplies</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Download App</h4>
                                <div className="space-y-2">
                                    <button className="block w-full bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-700">
                                        Download for iOS
                                    </button>
                                    <button className="block w-full bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-700">
                                        Download for Android
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                            <p>&copy; 2024 {settings?.site_name || 'Getir Clone'}. All rights reserved.</p>
                        </div>
                    </div>
                </footer> */}

                {/* App Download Section */}
                <AppDownloadSection />
        </Layout>
    );
}
