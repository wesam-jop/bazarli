import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { useTranslation } from '../../hooks/useTranslation';
import { 
    LayoutDashboard, 
    Settings, 
    Users, 
    Package, 
    ShoppingCart, 
    Store, 
    FileText,
    Globe,
    Smartphone,
    HelpCircle,
    Briefcase,
    BarChart3,
    Menu,
    X,
    LogOut,
    User,
    Bell,
    Search,
    ChevronDown,
    ChevronRight,
    Home,
    TrendingUp,
    MessageSquare,
    Shield,
    Calendar,
    CreditCard,
    MapPin,
    Truck,
    Star,
    Eye,
    Edit,
    Trash2,
    Plus,
    Filter,
    Download,
    Upload,
    RefreshCw,
    Zap,
    DollarSign,
    ClipboardList
} from 'lucide-react';
import UserAvatar from '../../Components/UserAvatar';
import DeliGoLogo from '../../Components/DeliGoLogo';

export default function AdminLayout({ children, title = "Admin Dashboard" }) {
    const { props, url } = usePage();
    const { t, locale } = useTranslation();
    const auth = props?.auth || {};
    const user = auth?.user;
    const isRTL = locale === 'ar';
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    // حفظ حالة السايد بار في localStorage
    useEffect(() => {
        const savedCollapsed = localStorage.getItem('admin_sidebar_collapsed');
        if (savedCollapsed !== null) {
            setSidebarCollapsed(JSON.parse(savedCollapsed));
        }
    }, []);

    // إغلاق القوائم عند النقر خارجها
    const notificationsRef = useRef(null);
    const userMenuRef = useRef(null);
    const settingsRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setNotificationsOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
            if (settingsRef.current && !settingsRef.current.contains(event.target)) {
                setSettingsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleSidebarCollapse = () => {
        const newState = !sidebarCollapsed;
        setSidebarCollapsed(newState);
        localStorage.setItem('admin_sidebar_collapsed', JSON.stringify(newState));
    };

    const menuItems = [
        {
            group: 'dashboard',
            label: t('admin_dashboard'),
            icon: LayoutDashboard,
            href: '/admin/dashboard',
            items: [],
            color: 'text-purple-600'
        },
        {
            group: 'users',
            label: t('user_management'),
            icon: Users,
            items: [
                { label: t('all_users'), href: '/admin/users', icon: Users },
                { label: t('customers'), href: '/admin/users/customers', icon: User },
                { label: t('store_owners'), href: '/admin/users/store-owners', icon: Store },
                { label: t('drivers'), href: '/admin/users/drivers', icon: Truck },
                { label: t('driver_applications_admin_title'), href: '/admin/drivers/applications', icon: ClipboardList },
                { label: t('access_permissions'), href: '/admin/admin-access', icon: Shield },
            ],
            color: 'text-blue-600'
        },
        {
            group: 'business',
            label: t('business_management'),
            icon: Store,
            items: [
                { label: t('orders'), href: '/admin/orders', icon: ShoppingCart },
                { label: t('stores'), href: '/admin/stores', icon: Store },
                { label: t('products'), href: '/admin/products', icon: Package },
                { label: t('categories'), href: '/admin/categories', icon: Package },
            ],
            color: 'text-green-600'
        },
        {
            group: 'locations',
            label: t('locations_management') || 'إدارة المناطق',
            icon: MapPin,
            items: [
                { label: t('governorates') || 'المحافظات', href: '/admin/governorates', icon: MapPin },
                { label: t('cities') || 'المناطق', href: '/admin/cities', icon: MapPin },
            ],
            color: 'text-indigo-600'
        },
        {
            group: 'analytics',
            label: t('reports_and_statistics'),
            icon: BarChart3,
            items: [
                { label: t('general_statistics'), href: '/admin/analytics/overview', icon: BarChart3 },
                { label: t('sales_reports'), href: '/admin/analytics/sales', icon: DollarSign },
                { label: t('customer_analysis'), href: '/admin/analytics/customers', icon: Users },
                { label: t('delivery_reports'), href: '/admin/analytics/delivery', icon: Truck },
                { label: t('financial_reports'), href: '/admin/reports/financial', icon: CreditCard },
            ],
            color: 'text-orange-600'
        },
        {
            group: 'system',
            label: t('system'),
            icon: Settings,
            items: [
                { label: t('general_settings'), href: '/admin/settings/general', icon: Settings },
                { label: t('terms_admin_title') || 'Terms', href: '/admin/settings/terms', icon: FileText },
                { label: t('store_types_settings') || 'Store Types', href: '/admin/settings/store-types', icon: Store },
                { label: t('privacy_admin_title') || 'Privacy', href: '/admin/settings/privacy', icon: Shield },
                { label: t('app_download_settings') || 'App Downloads', href: '/admin/settings/app-downloads', icon: Smartphone },
                { label: t('payment_methods'), href: '/admin/settings/payments', icon: CreditCard },
                { label: t('areas_and_delivery'), href: '/admin/settings/areas', icon: MapPin },
                { label: t('backups'), href: '/admin/backups', icon: Download },
                { label: t('logs'), href: '/admin/logs', icon: FileText },
                { label: t('help'), href: '/admin/help', icon: HelpCircle },
            ],
            color: 'text-gray-600'
        }
    ];

    // تحديد التبويبة النشطة والعنصر الفرعي النشط بناءً على URL الحالي
    const getActiveItems = () => {
        if (!url) return { group: null, subItem: null };
        
        let bestMatch = { group: null, subItem: null, length: 0 };
        
        // جمع جميع العناصر الفرعية مع مجموعاتها
        const allSubItems = [];
        for (const item of menuItems) {
            if (item.items && item.items.length > 0) {
                for (const subItem of item.items) {
                    allSubItems.push({
                        href: subItem.href,
                        group: item.group,
                        length: subItem.href.length
                    });
                }
            }
        }
        
        // ترتيب العناصر الفرعية حسب الطول (الأطول أولاً) للعثور على الأكثر تحديداً
        allSubItems.sort((a, b) => b.length - a.length);
        
        // البحث عن العنصر الفرعي الأكثر تحديداً الذي يطابق URL
        for (const subItem of allSubItems) {
            if (url === subItem.href || url.startsWith(subItem.href + '/')) {
                bestMatch = {
                    group: subItem.group,
                    subItem: subItem.href,
                    length: subItem.length
                };
                break; // وجدنا الأكثر تحديداً، نتوقف
            }
        }
        
        // إذا لم نجد عنصر فرعي نشط، نبحث عن عنصر رئيسي
        if (!bestMatch.group) {
            for (const item of menuItems) {
                if (item.href) {
                    // التحقق من التطابق الدقيق فقط (ليس startsWith) للعناصر الرئيسية
                    if (url === item.href) {
                        bestMatch.group = item.group;
                        break;
                    }
                }
            }
        }
        
        return bestMatch;
    };

    const activeItems = getActiveItems();
    const activeGroup = activeItems.group;
    const activeSubItem = activeItems.subItem;
    const [expandedGroup, setExpandedGroup] = useState(activeGroup);

    // تحديث التبويبة المفتوحة عند تغيير الصفحة
    useEffect(() => {
        const newActiveItems = getActiveItems();
        if (newActiveItems.group) {
            setExpandedGroup(newActiveItems.group);
        }
    }, [url]);

    const toggleGroup = (group) => {
        setExpandedGroup(expandedGroup === group ? null : group);
    };

    // التحقق من أن العنصر الفرعي نشط (يجب أن يكون هو الأكثر تحديداً)
    const isSubItemActive = (subItemHref) => {
        if (!url || !activeSubItem) return false;
        // فقط العنصر الفرعي الأكثر تحديداً يكون active
        return activeSubItem === subItemHref;
    };

    return (
        <div className={`min-h-screen transition-all duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
            <Head title={title} />
            
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div dir="ltr" className={`admin-sidebar fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out lg:translate-x-0  ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } ${sidebarCollapsed ? 'w-16' : 'w-64'} ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-xl border-r`}>
                
                {/* Sidebar Header */}
                <div className={`flex items-center justify-between h-16 px-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                    {!sidebarCollapsed && (
                        <Link href="/" className="flex items-center space-x-3">
                            <DeliGoLogo height={28} />
                        </Link>
                    )}
                    
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={toggleSidebarCollapse}
                            className="hidden lg:flex p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <Menu className="w-4 h-4" />
                        </button>
                        
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-2 ">
                    {menuItems.map((item) => (
                        <div key={item.group} className="mb-2">
                            {item.items.length > 0 ? (
                                <div>
                                    <button
                                        onClick={() => toggleGroup(item.group)}
                                        className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200 group ${
                                            activeGroup === item.group 
                                                ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 shadow-sm' 
                                                : 'text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <item.icon className={`w-5 h-5 ${activeGroup === item.group ? 'text-purple-600' : item.color}`} />
                                            {!sidebarCollapsed && (
                                                <span dir="rtl" className={`font-medium text-sm ${activeGroup === item.group ? 'font-semibold' : ''}`}>{item.label}</span>
                                            )}
                                        </div>
                                        {!sidebarCollapsed && (
                                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                                                expandedGroup === item.group ? 'rotate-180' : ''
                                            }`} />
                                        )}
                                    </button>
                                    
                                    {/* Submenu */}
                                    {expandedGroup === item.group && !sidebarCollapsed && (
                                        <div className="mt-1 ml-4 space-y-1">
                                            {item.items.map((subItem, index) => {
                                                const isActive = isSubItemActive(subItem.href);
                                                return (
                                                    <Link
                                                        key={index}
                                                        href={subItem.href}
                                                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                                            isActive
                                                                ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 font-semibold shadow-sm border-r-2 border-purple-500'
                                                                : 'text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-700'
                                                        }`}
                                                    >
                                                        <subItem.icon className={`w-4 h-4 ${isActive ? 'text-purple-600' : ''}`} />
                                                        <span dir="rtl">{subItem.label}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    href={item.href}
                                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                                        activeGroup === item.group 
                                            ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 shadow-sm font-semibold' 
                                            : 'text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <item.icon className={`w-5 h-5 ${activeGroup === item.group ? 'text-purple-600' : item.color}`} />
                                    {!sidebarCollapsed && (
                                        <span dir="rtl" className="font-medium text-sm">{item.label}</span>
                                    )}
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>

                {/* User section */}
                <div className={`mt-auto border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} p-4`}>
                    <div className="flex items-center space-x-3">
                        <UserAvatar user={user} size={40} className="flex-shrink-0" />
                        {!sidebarCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p dir="rtl" className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                    {user?.name || 'Admin User'}
                                </p>
                                <p dir="rtl" className={`text-xs truncate ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {user?.user_type || 'admin'}
                                </p>
                            </div>
                        )}
                    </div>
                    
                    {!sidebarCollapsed && (
                        <div className="mt-3 space-y-1">
                            <Link
                                href="/admin/profile"
                                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${isDarkMode ? 'text-slate-100 hover:bg-slate-700' : 'text-slate-900 hover:bg-slate-100'}`}
                            >
                                <User className="w-4 h-4" />
                                <span dir="rtl">{t('profile')}</span>
                            </Link>
                            <Link
                                href="/admin/settings"
                                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${isDarkMode ? 'text-slate-100 hover:bg-slate-700' : 'text-slate-900 hover:bg-slate-100'}`}
                            >
                                <Settings className="w-4 h-4" />
                                <span dir="rtl">{t('settings')}</span>
                            </Link>
                            <Link
                                href="/logout"
                                method="post"
                                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${isDarkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'}`}
                            >
                                <LogOut className="w-4 h-4" />
                                <span dir="rtl">{t('logout')}</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Main content */}
            <div className={`admin-main-content transition-all duration-300 ${sidebarCollapsed ? 'admin-sidebar-collapsed' : ''}`}>
                {/* Top bar */}
                <div className={`sticky top-0 z-30 shadow-sm border-b transition-all duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <Menu className="w-5 h-5" />
                            </button>

                            <Link href="/" className="flex items-center space-x-3">
                                <DeliGoLogo height={28} />
                            </Link>
                            <div>
                                <h1 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                    {title}
                                </h1>
                                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {t('admin_dashboard')}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Search */}
                            <div className="hidden md:block">
                                <div className="relative">
                                    <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4`} />
                                    <input
                                        type="text"
                                        placeholder={t('search')}
                                        className={`w-64 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 rounded-lg text-sm transition-all duration-200 border ${
                                            isDarkMode 
                                                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-purple-500 focus:border-purple-500' 
                                                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-500 focus:ring-purple-500 focus:border-purple-500'
                                        }`}
                                    />
                                </div>
                            </div>

                            {/* Settings */}
                            <div className="relative" ref={settingsRef}>
                                <button
                                    onClick={() => {
                                        setSettingsOpen(!settingsOpen);
                                        setNotificationsOpen(false);
                                        setUserMenuOpen(false);
                                    }}
                                    className={`p-2 rounded-lg transition-colors relative ${
                                        settingsOpen
                                            ? isDarkMode ? 'bg-slate-700 text-purple-400' : 'bg-purple-50 text-purple-600'
                                            : isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-100'
                                    }`}
                                    title={t('settings') || 'Settings'}
                                >
                                    <Settings className="w-5 h-5" />
                                </button>
                                
                                {settingsOpen && (
                                    <div className={`absolute right-0 mt-2 w-56 rounded-xl shadow-lg border z-50 ${
                                        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                                    }`}>
                                        <div className="py-2">
                                            <Link
                                                href="/admin/settings/general"
                                                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                                    isDarkMode 
                                                        ? 'text-slate-300 hover:bg-slate-700' 
                                                        : 'text-slate-700 hover:bg-slate-50'
                                                }`}
                                                onClick={() => setSettingsOpen(false)}
                                            >
                                                <Settings className="w-4 h-4" />
                                                <span>{t('general_settings') || 'General Settings'}</span>
                                            </Link>
                                            <Link
                                                href="/admin/settings/terms"
                                                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                                    isDarkMode 
                                                        ? 'text-slate-300 hover:bg-slate-700' 
                                                        : 'text-slate-700 hover:bg-slate-50'
                                                }`}
                                                onClick={() => setSettingsOpen(false)}
                                            >
                                                <FileText className="w-4 h-4" />
                                                <span>{t('terms_admin_title') || 'Terms & Conditions'}</span>
                                            </Link>
                                            <Link
                                                href="/admin/settings/payments"
                                                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                                    isDarkMode 
                                                        ? 'text-slate-300 hover:bg-slate-700' 
                                                        : 'text-slate-700 hover:bg-slate-50'
                                                }`}
                                                onClick={() => setSettingsOpen(false)}
                                            >
                                                <CreditCard className="w-4 h-4" />
                                                <span>{t('payment_settings') || 'Payment Settings'}</span>
                                            </Link>
                                            <Link
                                                href="/admin/settings/areas"
                                                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                                    isDarkMode 
                                                        ? 'text-slate-300 hover:bg-slate-700' 
                                                        : 'text-slate-700 hover:bg-slate-50'
                                                }`}
                                                onClick={() => setSettingsOpen(false)}
                                            >
                                                <MapPin className="w-4 h-4" />
                                                <span>{t('area_settings') || 'Area Settings'}</span>
                                            </Link>
                                            <div className={`border-t my-1 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}></div>
                                            <button
                                                onClick={() => {
                                                    setIsDarkMode(!isDarkMode);
                                                    setSettingsOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                                    isDarkMode 
                                                        ? 'text-slate-300 hover:bg-slate-700' 
                                                        : 'text-slate-700 hover:bg-slate-50'
                                                }`}
                                            >
                                                <Zap className="w-4 h-4" />
                                                <span>{isDarkMode ? (t('light_mode') || 'Light Mode') : (t('dark_mode') || 'Dark Mode')}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Notifications */}
                            <div className="relative" ref={notificationsRef}>
                                <button
                                    onClick={() => {
                                        setNotificationsOpen(!notificationsOpen);
                                        setSettingsOpen(false);
                                        setUserMenuOpen(false);
                                    }}
                                    className={`p-2 rounded-lg transition-colors relative ${
                                        notificationsOpen
                                            ? isDarkMode ? 'bg-slate-700 text-purple-400' : 'bg-purple-50 text-purple-600'
                                            : isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-100'
                                    }`}
                                    title={t('notifications') || 'Notifications'}
                                >
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                                </button>
                                
                                {notificationsOpen && (
                                    <div className={`absolute right-0 mt-2 w-80 rounded-xl shadow-lg border z-50 ${
                                        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                                    }`}>
                                        <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                                            <div className="flex items-center justify-between">
                                                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                    {t('notifications') || 'Notifications'}
                                                </h3>
                                                <button
                                                    className={`text-xs ${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}
                                                >
                                                    {t('mark_all_read') || 'Mark all as read'}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            <div className="p-4 text-center">
                                                <Bell className={`w-12 h-12 mx-auto mb-2 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
                                                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {t('no_notifications') || 'No new notifications'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`px-4 py-3 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                                            <Link
                                                href="/admin/notifications"
                                                className={`text-sm text-center block ${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}
                                                onClick={() => setNotificationsOpen(false)}
                                            >
                                                {t('view_all_notifications') || 'View all notifications'}
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* User menu */}
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => {
                                        setUserMenuOpen(!userMenuOpen);
                                        setSettingsOpen(false);
                                        setNotificationsOpen(false);
                                    }}
                                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                                        userMenuOpen
                                            ? isDarkMode ? 'bg-slate-700' : 'bg-slate-100'
                                            : isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    <UserAvatar user={user} size={36} className="flex-shrink-0" />
                                    <div className={`hidden md:block ${isRTL ? 'text-right' : 'text-left'}`}>
                                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                            {user?.name || t('admin_user') || 'Admin User'}
                                        </p>
                                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {t('system_manager') || 'System Manager'}
                                        </p>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {userMenuOpen && (
                                    <div className={`absolute right-0 mt-2 w-56 rounded-xl shadow-lg border z-50 ${
                                        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                                    }`}>
                                        <div className="py-2">
                                            <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                                                <div className="flex items-center gap-3">
                                                    <UserAvatar user={user} size={48} className="flex-shrink-0" />
                                                    <div>
                                                        <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                            {user?.name || t('admin_user') || 'Admin User'}
                                                        </p>
                                                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                                            {user?.phone || ''}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <Link
                                                href="/admin/profile"
                                                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                                    isDarkMode 
                                                        ? 'text-slate-300 hover:bg-slate-700' 
                                                        : 'text-slate-700 hover:bg-slate-50'
                                                }`}
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <User className="w-4 h-4" />
                                                <span>{t('profile') || 'Profile'}</span>
                                            </Link>
                                            <Link
                                                href="/admin/settings/general"
                                                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                                    isDarkMode 
                                                        ? 'text-slate-300 hover:bg-slate-700' 
                                                        : 'text-slate-700 hover:bg-slate-50'
                                                }`}
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <Settings className="w-4 h-4" />
                                                <span>{t('settings') || 'Settings'}</span>
                                            </Link>
                                            <div className={`border-t my-1 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}></div>
                                            <Link
                                                href="/logout"
                                                method="post"
                                                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                                    isDarkMode 
                                                        ? 'text-red-400 hover:bg-red-900/20' 
                                                        : 'text-red-600 hover:bg-red-50'
                                                }`}
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>{t('logout') || 'Logout'}</span>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className={`p-4 sm:p-6 lg:p-8 min-h-screen transition-all duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
