import React from 'react';

export default function HeroSection({ 
    title, 
    subtitle, 
    icon: Icon, 
    bgColor = "bg-primary-600", 
    badges = [],
    className = ""
}) {
    return (
        <div className={`${bgColor} text-white py-20 ${className}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    {Icon && (
                        <div className="flex justify-center mb-6">
                            <div className="bg-white bg-opacity-20 p-4 rounded-full">
                                <Icon className="w-16 h-16" />
                            </div>
                        </div>
                    )}
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-xl md:text-2xl text-opacity-90 max-w-3xl mx-auto mb-8">
                            {subtitle}
                        </p>
                    )}
                    {badges.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-4">
                            {badges.map((badge, index) => (
                                <div key={index} className="flex items-center space-x-2 bg-white bg-opacity-20 px-4 py-2 rounded-full">
                                    {badge.icon && <badge.icon className="w-5 h-5" />}
                                    <span>{badge.text}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
