import React from 'react';
import { usePage } from '@inertiajs/react';

/**
 * DeliGo Logo Component
 * شعار الموقع - يأتي من الإعدادات (الداشبورد)
 * 
 * @param {Object} props
 * @param {string} props.className - CSS classes إضافية
 * @param {number} props.height - ارتفاع الشعار (default: 40)
 * @param {string} props.textColor - لون النص (default: var(--color-text-primary) - أسود)
 * @param {boolean} props.iconOnly - عرض الأيقونة فقط بدون النص
 * @param {string} props.logoUrl - رابط اللوجو (اختياري - إذا لم يُمرر يأخذ من settings)
 * @param {string} props.siteName - اسم الموقع (اختياري - إذا لم يُمرر يأخذ من settings)
 */
export default function DeliGoLogo({ 
    className = '', 
    height = 40,
    textColor = 'var(--color-text-primary)',
    iconOnly = false,
    logoUrl = null,
    siteName = null
}) {
    const { props } = usePage();
    const settings = props?.settings || {};
    
    // الحصول على اللوجو والاسم من props أو من settings
    const logo = logoUrl || settings?.site_logo || '';
    const name = siteName || settings?.site_name || '';
    
    const textSize = height * 0.5; // حجم النص
    
    // إذا لم يكن هناك لوجو ولا اسم، لا نعرض شيء
    if (!logo && !name) {
        return null;
    }
    
    // معالجة رابط اللوجو
    const getLogoUrl = (url) => {
        if (!url || url.trim() === '') return null;
        if (url.startsWith('http')) return url;
        if (url.startsWith('/')) return url;
        return `/${url}`;
    };
    
    const logoSrc = getLogoUrl(logo);
    
    return (
        <div 
            className={`flex items-center gap-2 ${className}`}
            style={{ height: `${height}px` }}
        >
            {/* Logo Image - صورة اللوجو من الإعدادات */}
            {logoSrc && (
                <img 
                    src={logoSrc}
                    alt={name || 'Logo'} 
                    className="h-full w-auto object-contain flex-shrink-0"
                    style={{ maxHeight: `${height}px` }}
                    onError={(e) => {
                        // في حالة فشل تحميل الصورة، نخفيها
                        e.target.style.display = 'none';
                    }}
                />
            )}
            
            {/* Site Name - اسم الموقع من الإعدادات */}
            {!iconOnly && name && (
                <span 
                    className="font-bold tracking-tight"
                    style={{ 
                        fontSize: `${textSize}px`,
                        color: textColor,
                        lineHeight: 1
                    }}
                >
                    {name}
                </span>
            )}
        </div>
    );
}

