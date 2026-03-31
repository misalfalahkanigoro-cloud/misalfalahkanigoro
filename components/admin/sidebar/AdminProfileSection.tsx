import React from 'react';
import Link from 'next/link';
import { PanelsTopLeft, Sun, Moon } from 'lucide-react';

type AdminProfileSectionProps = {
    displayName: string;
    displayRole: string;
    isDark: boolean;
    toggleTheme: () => void;
};

export const AdminProfileSection: React.FC<AdminProfileSectionProps> = ({
    displayName,
    displayRole,
    isDark,
    toggleTheme,
}) => {
    return (
        <div className="sticky top-0 z-30 mb-3 flex flex-col items-stretch gap-2 rounded-2xl border border-emerald-900/10 bg-white/60 p-1.5 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
            <Link
                href="/admin/akunadmin"
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-xl bg-emerald-600 px-3 py-2.5 text-white transition-all hover:bg-emerald-500 shadow-lg shadow-emerald-500/20"
            >
                <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-white shadow-inner transition-transform duration-200 group-hover:scale-110">
                    <PanelsTopLeft size={18} />
                </div>
                <div className="relative z-10 leading-tight">
                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-80">{displayRole}</p>
                    <p className="text-sm font-bold truncate max-w-[130px]">{displayName}</p>
                </div>

                {/* Subtle Shine Effect */}
                <div className="absolute -left-full top-0 h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-all duration-500 group-hover:left-full" />
            </Link>

            <button
                onClick={toggleTheme}
                className={`inline-flex h-10 w-full items-center justify-between rounded-xl border px-3 text-[11px] font-bold shadow-sm transition-all duration-300 ${isDark
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20'
                    : 'border-emerald-900/10 bg-white text-emerald-800 hover:border-emerald-500/30 hover:bg-emerald-50'
                    }`}
            >
                <div className="flex items-center gap-2.5 tracking-wider">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-lg transition-all duration-300 ${isDark
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50'
                        : 'bg-emerald-100 text-emerald-700 shadow-sm'
                        }`}>
                        {isDark ? <Sun size={13} /> : <Moon size={13} />}
                    </div>
                    {isDark ? 'MODE TERANG' : 'MODE GELAP'}
                </div>
                <div className={`h-1.5 w-1.5 rounded-full transition-colors ${isDark ? 'bg-emerald-400 animate-pulse' : 'bg-gray-300'}`} />
            </button>
        </div>
    );
};
