import React from 'react';
import { Head } from '@inertiajs/react';
import Layout from './Layout';
import { useTranslation } from '../hooks/useTranslation';
import HeroSection from '../Components/HeroSection';
import StatsSection from '../Components/StatsSection';
import FeaturesSection from '../Components/FeaturesSection';
import CTASection from '../Components/CTASection';
import { 
    Truck, 
    Clock, 
    Shield, 
    Users, 
    Heart, 
    Award,
    Target,
    Globe,
    Star,
    CheckCircle
} from 'lucide-react';

export default function About() {
    const { t } = useTranslation();

    const features = [
        {
            icon: Clock,
            title: t('fast_delivery'),
            description: t('fast_delivery_desc'),
        },
        {
            icon: Shield,
            title: t('quality_guaranteed'),
            description: t('quality_guaranteed_desc'),
        },
        {
            icon: Users,
            title: t('wide_selection'),
            description: t('wide_selection_desc'),
        },
    ];

    const values = [
        {
            icon: Heart,
            title: 'Customer First',
            description: 'We put our customers at the heart of everything we do, ensuring their satisfaction is our top priority.',
        },
        {
            icon: Award,
            title: 'Excellence',
            description: 'We strive for excellence in every aspect of our service, from product quality to delivery speed.',
        },
        {
            icon: Target,
            title: 'Innovation',
            description: 'We continuously innovate to provide better solutions and improve the customer experience.',
        },
        {
            icon: Globe,
            title: 'Community',
            description: 'We are committed to supporting and strengthening the communities we serve.',
        },
    ];

    const stats = [
        { number: '10+', label: 'Cities Served' },
        { number: '50K+', label: 'Happy Customers' },
        { number: '100K+', label: 'Orders Delivered' },
        { number: '10min', label: 'Average Delivery' },
    ];

    return (
        <Layout>
            <Head title={t('about_us')} />
            
            <div className="min-h-screen bg-slate-50">
                {/* Hero Section */}
                <HeroSection
                    title={t('about_us')}
                    subtitle={t('footer_description')}
                    gradientFrom="from-purple-600"
                    gradientTo="to-purple-800"
                />

                {/* Stats Section */}
                <StatsSection
                    stats={stats}
                    color="purple"
                />

                {/* Our Story Section */}
                <div className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 mb-6">
                                    Our Story
                                </h2>
                                <p className="text-lg text-slate-600 mb-6">
                                    DeliGo was born from a simple idea: to make grocery shopping 
                                    as convenient as possible. We understand that time is precious, 
                                    and we believe that getting your daily essentials shouldn't 
                                    take up your valuable time.
                                </p>
                                <p className="text-lg text-gray-600 mb-6">
                                    Since our launch, we've been committed to revolutionizing 
                                    the way people shop for groceries. Our fast delivery network 
                                    and carefully curated product selection ensure that you get 
                                    exactly what you need, when you need it.
                                </p>
                                <div className="flex items-center space-x-2 text-purple-600">
                                    <Star className="w-5 h-5 fill-current" />
                                    <span className="font-semibold">Trusted by thousands of customers</span>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-8">
                                <Truck className="w-32 h-32 text-purple-600 mx-auto mb-6" />
                                <h3 className="text-2xl font-bold text-center text-slate-900 mb-4">
                                    Fast & Reliable
                                </h3>
                                <p className="text-center text-slate-600">
                                    Our delivery network ensures your orders reach you in record time
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <FeaturesSection
                    features={features}
                    title="Why Choose Us?"
                    subtitle="We're committed to providing the best possible service to our customers"
                    color="purple"
                    columns={3}
                />

                {/* Values Section */}
                <div className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">
                                Our Values
                            </h2>
                            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                                The principles that guide everything we do
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {values.map((value, index) => (
                                <div key={index} className="text-center">
                                    <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <value.icon className="w-8 h-8 text-purple-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-3">
                                        {value.title}
                                    </h3>
                                    <p className="text-slate-600 text-sm">
                                        {value.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Mission Section */}
                <div className="py-16 bg-purple-600 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-bold mb-6">
                            Our Mission
                        </h2>
                        <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-8">
                            To make grocery shopping effortless and accessible for everyone, 
                            delivering fresh products and essential items to your doorstep 
                            in minutes, not hours.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <div className="flex items-center space-x-2 bg-white bg-opacity-20 px-4 py-2 rounded-full text-purple-600">
                                <CheckCircle className="w-5 h-5" />
                                <span>Fresh Products</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-white bg-opacity-20 px-4 py-2 rounded-full text-purple-600">
                                <CheckCircle className="w-5 h-5" />
                                <span>Fast Delivery</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-white bg-opacity-20 px-4 py-2 rounded-full text-purple-600">
                                <CheckCircle className="w-5 h-5" />
                                <span>Quality Guaranteed</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-white bg-opacity-20 px-4 py-2 rounded-full text-purple-600">
                                <CheckCircle className="w-5 h-5" />
                                <span>24/7 Support</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
