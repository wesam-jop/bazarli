import React from 'react';

export default function StatsSection({ 
    stats, 
    title, 
    subtitle, 
    color = "purple", 
    className = "",
    showTitle = true 
}) {
    const colorClasses = {
        purple: "text-primary-600",
        green: "text-success-600",
        orange: "text-primary-600",
        blue: "text-accent-600",
        pink: "text-primary-600",
        red: "text-error-600",
        primary: "text-primary-600",
        secondary: "text-secondary-600",
        accent: "text-accent-600",
        success: "text-success-600",
        warning: "text-warning-600",
        error: "text-error-600",
        info: "text-info-600"
    };

    const bgColorClasses = {
        purple: "bg-white",
        green: "bg-white",
        orange: "bg-white",
        blue: "bg-white",
        pink: "bg-white",
        red: "bg-white"
    };

    return (
        <div className={`py-16 ${bgColorClasses[color]} ${className}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {showTitle && (title || subtitle) && (
                    <div className="text-center mb-12">
                        {title && (
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="text-lg text-gray-600">
                                {subtitle}
                            </p>
                        )}
                    </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className={`text-3xl md:text-4xl font-bold ${colorClasses[color]} mb-2`}>
                                {stat.number}
                            </div>
                            <div className="text-gray-600 font-medium">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
