'use client';

import React from 'react';

interface SimpleHeroProps {
    title: string;
    subtitle?: string;
    image?: string;
}

const SimpleHero: React.FC<SimpleHeroProps> = ({
    title,
    subtitle,
    image = 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=2000',
}) => {
    return (
        <div className="relative h-[300px] md:h-[400px] overflow-hidden text-white">
            {/* Background */}
            <div className="absolute inset-0">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover blur-[2px] scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-950/70 to-emerald-950/40"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
                <h1 className="text-3xl md:text-5xl font-black mb-4 drop-shadow-2xl">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-sm md:text-lg text-emerald-50/70 max-w-2xl drop-shadow-md">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Bottom Wave Divider */}
            <div className="absolute bottom-0 left-0 right-0 z-20 leading-none pointer-events-none">
                <svg
                    className="relative block w-full h-[30px] md:h-[60px]"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                        className="fill-white dark:fill-[#0B0F0C]"
                    ></path>
                </svg>
            </div>
        </div>
    );
};

export default SimpleHero;
