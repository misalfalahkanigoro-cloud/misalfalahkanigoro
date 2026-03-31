'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ADMIN_TABS, type AdminTab } from './types';

interface PPDBTabsProps {
    activeTab: AdminTab;
    onChange: (tab: AdminTab) => void;
}

export const PPDBTabs: React.FC<PPDBTabsProps> = ({ activeTab, onChange }) => {
    return (
        <div className="flex w-full mb-8 overflow-x-auto admin-scrollbar pb-4 pt-1 -mx-2 sm:-mx-6 px-2 sm:px-6">
            <div className="flex items-center gap-1 sm:gap-2 bg-gray-200/50 dark:bg-white/5 p-1.5 rounded-2xl md:rounded-full shadow-sm border border-gray-300/30 dark:border-white/10 shrink-0">
                {ADMIN_TABS.map((tab) => {
                    const isActive = activeTab === tab;
                    const label = tab === 'pendaftar' ? 'Pendaftar' 
                                : tab === 'gelombang' ? 'Gelombang' 
                                : tab === 'notifikasi' ? 'Notifikasi' 
                                : 'Brosur';

                    return (
                        <button
                            key={tab}
                            onClick={() => onChange(tab)}
                            className={`px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] transition-all relative whitespace-nowrap ${
                                isActive 
                                    ? 'text-emerald-800 dark:text-emerald-400' 
                                    : 'text-gray-600 hover:text-emerald-700 dark:text-gray-400 dark:hover:text-emerald-300'
                            }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-tab-ppdb"
                                    className="absolute inset-0 bg-white dark:bg-[#1a231d] rounded-xl md:rounded-full shadow-md border border-gray-100 dark:border-white/10"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10">{label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
