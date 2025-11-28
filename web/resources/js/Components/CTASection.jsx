import React from 'react';
import { Link } from '@inertiajs/react';

export default function CTASection({ 
    title, 
    subtitle, 
    primaryButton, 
    secondaryButton, 
    icon: Icon,
    bgColor = "bg-primary-600", 
    className = "",
    centered = true
}) {
    const contentClasses = centered ? "text-center" : "text-left";

    return (
        <div className={`${bgColor} text-white py-16 ${className}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={contentClasses}>
                    {Icon && (
                        <div className={`flex ${centered ? 'justify-center' : 'justify-start'} mb-6`}>
                            <div className="bg-white bg-opacity-20 p-4 rounded-full">
                                <Icon className="w-12 h-12" />
                            </div>
                        </div>
                    )}
                    
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {title}
                    </h2>
                    
                    {subtitle && (
                        <p className="text-xl text-opacity-90 mb-8 max-w-2xl mx-auto">
                            {subtitle}
                        </p>
                    )}
                    
                    <div className={`flex flex-col sm:flex-row gap-4 ${centered ? 'justify-center' : 'justify-start'}`}>
                        {primaryButton && (
                            <Link
                                href={primaryButton.href}
                                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-secondary-50 transition-colors"
                            >
                                {primaryButton.icon && <primaryButton.icon className="w-5 h-5 mr-2" />}
                                {primaryButton.text}
                            </Link>
                        )}
                        
                        {secondaryButton && (
                            <Link
                                href={secondaryButton.href}
                                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-primary-600 transition-colors"
                            >
                                {secondaryButton.icon && <secondaryButton.icon className="w-5 h-5 mr-2" />}
                                {secondaryButton.text}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
