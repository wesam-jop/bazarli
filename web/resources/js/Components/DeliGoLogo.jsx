import React from 'react';

/**
 * DeliGo Logo Component
 * شعار DeliGo - Icon + Wordmark بأسلوب Rounded
 * 
 * @param {Object} props
 * @param {string} props.className - CSS classes إضافية
 * @param {number} props.height - ارتفاع الشعار (default: 40)
 * @param {string} props.iconColor - لون الأيقونة (default: #FF7A32 - برتقالي)
 * @param {string} props.textColor - لون النص (default: #121212 - أسود)
 * @param {boolean} props.iconOnly - عرض الأيقونة فقط بدون النص
 */
export default function DeliGoLogo({ 
    className = '', 
    height = 40,
    iconColor = '#FF7A32',
    textColor = '#121212',
    iconOnly = false 
}) {
    const iconSize = height * 0.7; // حجم الأيقونة نسبة للارتفاع
    const textSize = height * 0.5; // حجم النص
    
    return (
        <div 
            className={`flex items-center gap-2 ${className}`}
            style={{ height: `${height}px` }}
        >
            {/* Icon - حرف D مع سهم توصيل بأسلوب Rounded */}
            <svg
                width={iconSize}
                height={iconSize}
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
            >
                {/* Background Circle - دائرة خلفية منحنية */}
                <circle
                    cx="24"
                    cy="24"
                    r="22"
                    fill={iconColor}
                    fillOpacity="0.12"
                />
                
                {/* Letter D - حرف D بزوايا منحنية */}
                <path
                    d="M17 10C17 9.44772 17.4477 9 18 9H25C30.5228 9 35 13.4772 35 19C35 24.5228 30.5228 29 25 29H18C17.4477 29 17 28.5523 17 28V10Z"
                    fill={iconColor}
                />
                <path
                    d="M19 13V25H24.5C27.5376 25 30 22.5376 30 19.5C30 16.4624 27.5376 14 24.5 14H19V13Z"
                    fill="#FFFFFF"
                />
                
                {/* Delivery Arrow - سهم التوصيل منحني */}
                <path
                    d="M26 32L31 26L26 20"
                    stroke={iconColor}
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M31 26H23"
                    stroke={iconColor}
                    strokeWidth="2.8"
                    strokeLinecap="round"
                />
                
                {/* Location Dot - نقطة الموقع دائرية */}
                <circle
                    cx="31"
                    cy="26"
                    r="3"
                    fill={iconColor}
                />
            </svg>
            
            {/* Wordmark - نص DeliGo */}
            {!iconOnly && (
                <span 
                    className="font-bold tracking-tight"
                    style={{ 
                        fontSize: `${textSize}px`,
                        color: textColor,
                        lineHeight: 1
                    }}
                >
                    DeliGo
                </span>
            )}
        </div>
    );
}

