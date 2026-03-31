'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Bell, Search, RefreshCw, Command } from 'lucide-react';

interface HeaderAdminProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}

const HeaderAdmin: React.FC<HeaderAdminProps> = ({ title, subtitle, action }) => {
    const [scrolled, setScrolled] = useState(false);
    const [date, setDate] = useState<string>('');

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        
        setDate(new Intl.DateTimeFormat('id-ID', {
            dateStyle: 'long',
        }).format(new Date()));

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header 
            className={`sticky top-0 z-30 flex flex-col transition-all duration-300 ${
                scrolled 
                ? 'py-3 bg-white/70 dark:bg-[#0B0F0C]/70 backdrop-blur-xl border-b border-emerald-900/10 dark:border-white/10 shadow-sm' 
                : 'py-6 bg-transparent'
            }`}
        >
            <div className="container mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">
                            Admin Panel
                        </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium">
                            {subtitle}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-emerald-900/10 bg-white/50 px-4 py-2 text-[11px] font-bold text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 backdrop-blur-sm shadow-sm transition-all hover:border-emerald-500/30">
                        <Calendar size={14} className="text-emerald-500" />
                        {date}
                    </div>

                    <div className="flex items-center gap-2">
                        {action}
                        <button 
                            onClick={() => window.location.reload()}
                            className="group flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-900/10 bg-white dark:border-white/10 dark:bg-white/5 text-gray-500 transition-all hover:border-emerald-500/50 hover:text-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20"
                            title="Refresh Data"
                        >
                            <RefreshCw size={18} className="transition-transform group-hover:rotate-180 duration-500" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default HeaderAdmin;
