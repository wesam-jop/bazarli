import React from 'react';

export default function FeaturesSection({ 
    features, 
    title, 
    subtitle, 
    color = "purple", 
    className = "",
    showTitle = true,
    columns = 4,
    cardStyle = "default" // default, minimal, detailed
}) {
    const colorClasses = {
        purple: {
            bg: "bg-primary-100",
            text: "text-primary-600",
            hover: "group-hover:bg-primary-200"
        },
        green: {
            bg: "bg-success-100",
            text: "text-success-600",
            hover: "group-hover:bg-success-200"
        },
        orange: {
            bg: "bg-primary-100",
            text: "text-primary-600",
            hover: "group-hover:bg-primary-200"
        },
        blue: {
            bg: "bg-accent-100",
            text: "text-accent-600",
            hover: "group-hover:bg-accent-200"
        },
        pink: {
            bg: "bg-primary-100",
            text: "text-primary-600",
            hover: "group-hover:bg-primary-200"
        },
        red: {
            bg: "bg-error-100",
            text: "text-error-600",
            hover: "group-hover:bg-error-200"
        },
        primary: {
            bg: "bg-primary-100",
            text: "text-primary-600",
            hover: "group-hover:bg-primary-200"
        },
        secondary: {
            bg: "bg-secondary-100",
            text: "text-secondary-600",
            hover: "group-hover:bg-secondary-200"
        },
        accent: {
            bg: "bg-accent-100",
            text: "text-accent-600",
            hover: "group-hover:bg-accent-200"
        },
        success: {
            bg: "bg-success-100",
            text: "text-success-600",
            hover: "group-hover:bg-success-200"
        },
        warning: {
            bg: "bg-warning-100",
            text: "text-warning-600",
            hover: "group-hover:bg-warning-200"
        },
        error: {
            bg: "bg-error-100",
            text: "text-error-600",
            hover: "group-hover:bg-error-200"
        },
        info: {
            bg: "bg-info-100",
            text: "text-info-600",
            hover: "group-hover:bg-info-200"
        }
    };

    const gridClasses = {
        2: "md:grid-cols-2",
        3: "md:grid-cols-2 lg:grid-cols-3",
        4: "md:grid-cols-2 lg:grid-cols-4",
        6: "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
    };

    const renderCard = (feature, index) => {
        const baseClasses = "text-center";
        const cardClasses = {
            default: "p-6 rounded-lg hover:shadow-lg transition-shadow",
            minimal: "p-4",
            detailed: "bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        };

        return (
            <div key={index} className={`${baseClasses} ${cardClasses[cardStyle]}`}>
                <div className={`${colorClasses[color].bg} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <feature.icon className={`w-8 h-8 ${colorClasses[color].text}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                    {feature.description}
                </p>
            </div>
        );
    };

    return (
        <div className={`py-16 ${className}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {showTitle && (title || subtitle) && (
                    <div className="text-center mb-12">
                        {title && (
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                {subtitle}
                            </p>
                        )}
                    </div>
                )}
                <div className={`grid grid-cols-1 ${gridClasses[columns]} gap-8`}>
                    {features.map(renderCard)}
                </div>
            </div>
        </div>
    );
}
