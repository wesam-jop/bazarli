import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from './Layout';
import { useTranslation } from '../../hooks/useTranslation';
import { 
    HelpCircle,
    Search,
    ChevronDown,
    ChevronUp,
    BookOpen,
    Video,
    FileText,
    ExternalLink,
    Settings,
    Users,
    ShoppingCart,
    Package,
    Store,
    BarChart3,
    CreditCard,
    MapPin,
    Database,
    Archive,
    FileCode,
    Shield,
    Bell,
    Mail,
    Phone,
    MessageSquare,
    Clock,
    CheckCircle,
    AlertCircle,
    Info
} from 'lucide-react';

export default function Help() {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFAQ, setExpandedFAQ] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');

    const categories = [
        { id: 'all', name: t('all_topics') || 'All Topics', icon: HelpCircle },
        { id: 'dashboard', name: t('dashboard') || 'Dashboard', icon: BarChart3 },
        { id: 'users', name: t('users') || 'Users', icon: Users },
        { id: 'orders', name: t('orders') || 'Orders', icon: ShoppingCart },
        { id: 'products', name: t('products') || 'Products', icon: Package },
        { id: 'settings', name: t('settings') || 'Settings', icon: Settings },
    ];

    const faqs = [
        {
            id: 1,
            category: 'dashboard',
            question: t('how_to_view_dashboard_stats') || 'How do I view dashboard statistics?',
            answer: t('dashboard_stats_answer') || 'The dashboard displays key metrics including total users, orders, products, and revenue. You can view real-time statistics and recent activity. Use the date range filters to view data for specific periods.'
        },
        {
            id: 2,
            category: 'dashboard',
            question: t('how_to_export_reports') || 'How do I export reports?',
            answer: t('export_reports_answer') || 'Navigate to the Reports section from the sidebar. Select the type of report you want (Financial, Sales, etc.), choose your date range, and click the Download button to export as CSV or PDF.'
        },
        {
            id: 3,
            category: 'users',
            question: t('how_to_manage_users') || 'How do I manage users?',
            answer: t('manage_users_answer') || 'Go to Users section in the sidebar. You can view all users, filter by type (Customers, Store Owners, Drivers), search by name or phone, and manage user accounts. Click on a user to view details or edit their information.'
        },
        {
            id: 4,
            category: 'users',
            question: t('how_to_create_admin') || 'How do I create an admin account?',
            answer: t('create_admin_answer') || 'Navigate to Users > Admin Access. Click "Add Admin" button, enter the phone number and name, then save. The new admin will have full access to the dashboard.'
        },
        {
            id: 5,
            category: 'orders',
            question: t('how_to_view_orders') || 'How do I view and manage orders?',
            answer: t('view_orders_answer') || 'Go to Orders section. You can see all orders with their status, filter by status (Pending, Confirmed, Delivered, etc.), search by order number or customer, and update order status. Click on an order to view full details.'
        },
        {
            id: 6,
            category: 'orders',
            question: t('how_to_update_order_status') || 'How do I update an order status?',
            answer: t('update_order_status_answer') || 'In the Orders page, find the order you want to update. Click on the status dropdown and select the new status. The system will automatically notify the customer of the status change.'
        },
        {
            id: 7,
            category: 'products',
            question: t('how_to_add_product') || 'How do I add a new product?',
            answer: t('add_product_answer') || 'Navigate to Products section, click "Add Product" button. Fill in product details including name, description, price, category, and upload images. Set availability and featured status, then save.'
        },
        {
            id: 8,
            category: 'products',
            question: t('how_to_manage_products') || 'How do I manage products?',
            answer: t('manage_products_answer') || 'Go to Products section. You can view all products, add new products, edit existing ones, and manage their availability.'
        },
        {
            id: 9,
            category: 'products',
            question: t('how_to_manage_categories') || 'How do I manage product categories?',
            answer: t('manage_categories_answer') || 'Navigate to Categories section. You can add new categories, edit existing ones, toggle active status, and organize categories. Categories help organize products and improve navigation.'
        },
        {
            id: 10,
            category: 'settings',
            question: t('how_to_update_general_settings') || 'How do I update general settings?',
            answer: t('update_general_settings_answer') || 'Go to Settings > General. You can update site name, description, logo, favicon, default language, currency, timezone, and maintenance mode. Changes are applied immediately across the site.'
        },
        {
            id: 11,
            category: 'settings',
            question: t('how_to_configure_payments') || 'How do I configure payment methods?',
            answer: t('configure_payments_answer') || 'Navigate to Settings > Payments. Enable/disable payment methods (Cash, Card, Wallet), configure payment gateways (Stripe, PayPal), set processing fees, and configure refund policies.'
        },
        {
            id: 12,
            category: 'settings',
            question: t('how_to_manage_areas') || 'How do I manage delivery areas?',
            answer: t('manage_areas_answer') || 'Go to Settings > Areas. Add new delivery areas with name, location coordinates, delivery radius, fees, and estimated delivery time. You can activate/deactivate areas and set display order.'
        },
        {
            id: 13,
            category: 'settings',
            question: t('how_to_create_backup') || 'How do I create a backup?',
            answer: t('create_backup_answer') || 'Navigate to Backups section. Choose backup type (Database, Files, or Full), then click "Create Backup". You can download, restore, or delete backups from the list.'
        },
        {
            id: 14,
            category: 'settings',
            question: t('how_to_view_logs') || 'How do I view system logs?',
            answer: t('view_logs_answer') || 'Go to Logs section. Select a log file, filter by level (Error, Warning, Info, Debug), search for specific messages, and set result limit. You can download or clear log files as needed.'
        },
    ];

    const quickLinks = [
        {
            icon: BarChart3,
            title: t('dashboard') || 'Dashboard',
            description: t('view_overview') || 'View system overview and statistics',
            link: '/admin',
            color: 'from-blue-500 to-cyan-600'
        },
        {
            icon: Users,
            title: t('users') || 'Users',
            description: t('manage_users') || 'Manage customers, store owners, and drivers',
            link: '/admin/users/customers',
            color: 'from-purple-500 to-pink-600'
        },
        {
            icon: ShoppingCart,
            title: t('orders') || 'Orders',
            description: t('manage_orders') || 'View and manage all orders',
            link: '/admin/orders',
            color: 'from-green-500 to-emerald-600'
        },
        {
            icon: Package,
            title: t('products') || 'Products',
            description: t('manage_products') || 'Manage products',
            link: '/admin/products',
            color: 'from-orange-500 to-red-600'
        },
        {
            icon: Store,
            title: t('stores') || 'Stores',
            description: t('manage_stores') || 'Manage store information',
            link: '/admin/stores',
            color: 'from-indigo-500 to-purple-600'
        },
        {
            icon: Settings,
            title: t('settings') || 'Settings',
            description: t('configure_system') || 'Configure system settings',
            link: '/admin/settings/general',
            color: 'from-slate-500 to-slate-600'
        },
        {
            icon: BarChart3,
            title: t('analytics') || 'Analytics',
            description: t('view_analytics') || 'View detailed analytics and reports',
            link: '/admin/analytics/overview',
            color: 'from-cyan-500 to-blue-600'
        },
        {
            icon: CreditCard,
            title: t('reports') || 'Reports',
            description: t('view_reports') || 'View financial and sales reports',
            link: '/admin/reports/financial',
            color: 'from-yellow-500 to-orange-600'
        },
    ];

    const guides = [
        {
            icon: BookOpen,
            title: t('getting_started_guide') || 'Getting Started Guide',
            description: t('learn_basics') || 'Learn the basics of using the admin dashboard',
            link: '#'
        },
        {
            icon: Video,
            title: t('video_tutorials') || 'Video Tutorials',
            description: t('watch_tutorials') || 'Watch step-by-step video guides',
            link: '#'
        },
        {
            icon: FileText,
            title: t('user_manual') || 'User Manual',
            description: t('download_manual') || 'Download comprehensive user manual',
            link: '#'
        },
        {
            icon: ExternalLink,
            title: t('api_documentation') || 'API Documentation',
            description: t('view_api_docs') || 'View API documentation and endpoints',
            link: '#'
        }
    ];

    const filteredFAQs = faqs.filter(faq => {
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const toggleFAQ = (id) => {
        setExpandedFAQ(expandedFAQ === id ? null : id);
    };

    return (
        <AdminLayout title={t('help') || 'Help'}>
            <Head title={t('help') || 'Help'} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 md:p-8 text-white">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <HelpCircle className="w-7 h-7 sm:w-8 sm:h-8" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl sm:text-4xl font-bold">{t('help_center') || 'Help Center'}</h1>
                            <p className="text-purple-100 mt-2 text-sm sm:text-base">{t('find_answers') || 'Find answers to your questions or get support'}</p>
                        </div>
                    </div>
                    
                    {/* Search Bar */}
                    <div>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder={t('search_help') || 'Search for help...'}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl text-slate-900 text-base sm:text-lg focus:ring-2 focus:ring-white focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">{t('quick_links') || 'Quick Links'}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickLinks.map((link, index) => (
                            <Link
                                key={index}
                                href={link.link}
                                className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6 hover:shadow-md hover:border-purple-300 transition-all group"
                            >
                                <div className={`w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br ${link.color} rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                                    <link.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1 sm:mb-2">{link.title}</h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{link.description}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Categories */}
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">{t('browse_by_category') || 'Browse by Category'}</h2>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-base font-semibold transition-all ${
                                    selectedCategory === category.id
                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                                        : 'bg-white text-slate-700 border border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                                }`}
                            >
                                <category.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>{category.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* FAQs */}
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">{t('frequently_asked_questions') || 'Frequently Asked Questions'}</h2>
                    <div className="space-y-3">
                        {filteredFAQs.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 sm:p-12 text-center">
                                <HelpCircle className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-4" />
                                <p className="text-base sm:text-lg font-semibold text-slate-600">{t('no_results_found') || 'No results found'}</p>
                                <p className="text-sm text-slate-500 mt-2">{t('try_different_search') || 'Try a different search term or category'}</p>
                            </div>
                        ) : (
                            filteredFAQs.map((faq) => (
                                <div
                                    key={faq.id}
                                    className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <button
                                        onClick={() => toggleFAQ(faq.id)}
                                        className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-start sm:items-center justify-between text-left hover:bg-slate-50 transition-colors gap-3"
                                    >
                                        <span className="font-semibold text-slate-900 text-sm sm:text-base flex-1 text-left">{faq.question}</span>
                                        {expandedFAQ === faq.id ? (
                                            <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                                        )}
                                    </button>
                                    {expandedFAQ === faq.id && (
                                        <div className="px-4 sm:px-6 pb-4 border-t border-slate-200">
                                            <p className="text-slate-600 mt-4 leading-relaxed text-sm sm:text-base">{faq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Guides */}
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">{t('guides_and_resources') || 'Guides & Resources'}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {guides.map((guide, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6 hover:shadow-md hover:border-purple-300 transition-all cursor-pointer"
                            >
                                <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                    <guide.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1 sm:mb-2">{guide.title}</h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{guide.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Support */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
                    <div className="text-center mb-6 sm:mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{t('still_need_help') || 'Still Need Help?'}</h2>
                        <p className="text-base sm:text-lg text-slate-600">{t('contact_support_team') || 'Our support team is here to help you'}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        <div className="bg-white rounded-xl p-5 sm:p-6 text-center hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                <Phone className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">{t('call_us') || 'Call Us'}</h3>
                            <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-4">{t('speak_with_support') || 'Speak with a support representative'}</p>
                            <p className="font-semibold text-slate-900 text-sm sm:text-base">+963 123 456 789</p>
                            <p className="text-xs sm:text-sm text-slate-500 mt-2">{t('available_247') || 'Available 24/7'}</p>
                        </div>
                        <div className="bg-white rounded-xl p-5 sm:p-6 text-center hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                <Mail className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">{t('email_us') || 'Email Us'}</h3>
                            <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-4">{t('send_email_support') || 'Send us an email and we\'ll respond within 24 hours'}</p>
                            <p className="font-semibold text-slate-900 text-sm sm:text-base break-all">support@getirclone.com</p>
                            <p className="text-xs sm:text-sm text-slate-500 mt-2">{t('response_within_24h') || 'Response within 24 hours'}</p>
                        </div>
                        <div className="bg-white rounded-xl p-5 sm:p-6 text-center hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">{t('live_chat') || 'Live Chat'}</h3>
                            <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-4">{t('chat_with_support') || 'Chat with us in real-time'}</p>
                            <p className="font-semibold text-slate-900 text-sm sm:text-base">{t('available_in_app') || 'Available in app'}</p>
                            <p className="text-xs sm:text-sm text-slate-500 mt-2">{t('mon_fri_8am_10pm') || 'Mon-Fri 8AM-10PM'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

