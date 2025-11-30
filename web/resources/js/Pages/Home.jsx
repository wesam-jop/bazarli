import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
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
    const isRTL = locale === 'ar';
    
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
            icon: Package,
            title: t('wide_selection'),
            description: t('wide_selection_desc')
        },
        {
            icon: Shield,
            title: t('quality_guaranteed'),
            description: t('quality_guaranteed_desc')
        }
    ];

    return (
        <Layout>
            <Head title={t('home_meta_title')}>
                <meta name="description" content={t('home_meta_description')} />
            </Head>

                {/* Hero Section */}
                <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-800 to-primary-500 text-white min-h-[500px] md:min-h-[600px]">
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            {/* Left Side - Content */}
                            <div className="text-center md:text-start space-y-6 z-10">
                                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                                    {t('welcome_title')}
                                </h1>
                                <p className="text-xl md:text-2xl text-white/90">
                                    {t('welcome_subtitle')}
                                </p>
                                <div className={`flex flex-wrap gap-3 sm:gap-4 pt-4 justify-center ${isRTL ? 'md:justify-end' : 'md:justify-start'}`}>
                                    <Link 
                                        href="/products" 
                                        className="flex items-center justify-center gap-2 bg-white text-primary-600 px-6 sm:px-8 py-3 rounded-full font-semibold hover:bg-secondary-50 transition-all text-center shadow-xl shadow-primary-900/40 hover:scale-105"
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                        <span>{t('start_shopping')}</span>
                                    </Link>
                                    <Link 
                                        href="/download-app" 
                                        className="flex items-center justify-center gap-2 border-2 border-white/90 text-white px-6 sm:px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-primary-600 transition-all backdrop-blur-sm"
                                    >
                                        <Smartphone className="w-5 h-5" />
                                        <span>{t('download_app')}</span>
                                    </Link>
                                </div>
                            </div>
                            
                            {/* Right Side - Image */}
                            <div className="relative z-10 flex items-center justify-center md:justify-end">
                                <img
                                    src={locale === 'ar' ? "/images/hero-background-ar-7.png" : "/images/hero-background-en-7.png"}
                                    alt="Hero"
                                    className="w-full h-auto max-w-2xl object-contain"
                                    style={{ maxHeight: '750px' }}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="relative py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Header */}
                        <div className={`flex flex-col ${isRTL ? 'md:flex-row-reverse' : 'md:flex-row'} items-center justify-between mb-16 gap-8`}>
                            <div className="flex-1 text-center md:text-start">
                                <div className="inline-block mb-4">
                                    <span className="inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-4 py-1 text-sm font-semibold text-primary-700 mb-4">
                                        {t('why_choose_us')}
                                    </span>
                                </div>
                                <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-4 leading-tight">
                                    {t('why_choose_us')}
                                </h2>
                                <p className="text-xl text-gray-600 max-w-2xl">
                                    {t('why_choose_subtitle')}
                                </p>
                            </div>
                        </div>
                        
                        {/* Features Grid - Asymmetric Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {coreFeatures.map(({ icon: Icon, title, description }, index) => {
                                const isMiddle = index === 1;
                                return (
                                    <div 
                                        key={title}
                                        className={`group relative ${isMiddle ? 'lg:row-span-2 lg:-mt-6' : ''}`}
                                    >
                                        <div className={`relative h-full bg-gradient-to-br ${
                                            isMiddle 
                                                ? 'from-primary-600 to-primary-800 text-white' 
                                                : 'from-white to-secondary-50 text-gray-900'
                                        } rounded-2xl p-8 md:p-10 border-2 ${
                                            isMiddle 
                                                ? 'border-primary-700 shadow-2xl shadow-primary-900/30' 
                                                : 'border-gray-200 shadow-lg hover:border-primary-300 hover:shadow-xl'
                                        } transition-all duration-300 hover:-translate-y-1 overflow-hidden`}>
                                            
                                            {/* Background Pattern */}
                                            <div className={`absolute inset-0 opacity-5 ${
                                                isMiddle ? 'bg-white' : 'bg-primary-600'
                                            }`} style={{
                                                backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                                                backgroundSize: '20px 20px'
                                            }}></div>
                                            
                                            {/* Icon */}
                                            <div className={`relative mb-6 inline-flex items-center justify-center w-16 h-16 rounded-xl ${
                                                isMiddle 
                                                    ? 'bg-white/20 backdrop-blur-sm text-white' 
                                                    : 'bg-primary-100 text-primary-700'
                                            } group-hover:scale-110 transition-transform duration-300`}>
                                                <Icon className="w-8 h-8" />
                                            </div>
                                            
                                            {/* Content */}
                                            <div className="relative">
                                                <h3 className={`text-2xl font-bold mb-3 ${
                                                    isMiddle ? 'text-white' : 'text-gray-900'
                                                }`}>
                                                    {title}
                                                </h3>
                                                <p className={`leading-relaxed ${
                                                    isMiddle ? 'text-white/90' : 'text-gray-600'
                                                }`}>
                                                    {description}
                                                </p>
                                            </div>
                                            
                                            {/* Accent Line */}
                                            <div className={`absolute bottom-0 left-0 right-0 h-1 ${
                                                isMiddle 
                                                    ? 'bg-white/30' 
                                                    : 'bg-primary-600'
                                            } transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Categories Section */}
                {categories && categories.length > 0 && (
                    <section className="py-16 bg-secondary-50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-12 max-w-3xl mx-auto">
                                <span className="inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-4 py-1 text-sm font-semibold text-primary-700 mb-4">
                                    {t('product_categories')}
                                </span>
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                    {t('product_categories')}
                                </h2>
                            <p className="text-lg text-secondary-700">
                                {t('product_categories_subtitle')}
                            </p>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 sm:gap-6">
                                {categories.slice(0, 6).map((category) => (
                                    <CategoryCard key={category.id} category={category} />
                                ))}
                            </div>
                            
                            <div className="text-center mt-8">
                                <Link 
                                    href="/categories" 
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 hover:bg-primary-700 px-6 py-3 text-white font-semibold shadow-xl shadow-primary-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 transition-colors"
                                >
                                    <span>{t('view_all_categories')}</span>
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                {/* Featured Products Section */}
                {featuredProducts && featuredProducts.length > 0 && (
                    <section className="py-16 bg-white">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-12 max-w-3xl mx-auto">
                            <span className="inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-4 py-1 text-sm font-semibold text-primary-700 mb-4">
                                {t('featured_products')}
                            </span>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                {t('featured_products')}
                            </h2>
                            <p className="text-lg text-gray-600">
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
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 hover:bg-primary-700 px-6 py-3 text-white font-semibold shadow-xl shadow-primary-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 transition-colors"
                                >
                                    <span>{t('view_all_products')}</span>
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                {/* Featured Stores Section */}
                {featuredStores && featuredStores.length > 0 && (
                    <section className="py-16 bg-secondary-50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-12 max-w-3xl mx-auto">
                                <span className="inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-4 py-1 text-sm font-semibold text-primary-700 mb-4">
                                    {t('featured_stores')}
                                </span>
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                    {t('featured_stores')}
                                </h2>
                            <p className="text-lg text-secondary-700">
                                {t('featured_stores_subtitle')}
                            </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 hover:bg-primary-700 px-6 py-3 text-white font-semibold shadow-xl shadow-primary-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 transition-colors"
                                >
                                    <span>{t('view_all_stores')}</span>
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                <AppDownloadSection />
        </Layout>
    );
}
