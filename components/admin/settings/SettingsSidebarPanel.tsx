'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Activity, Database, Cpu, HardDrive } from 'lucide-react';

type TabIcon = React.ElementType;

type SettingsTab = {
    id: string;
    label: string;
    icon: TabIcon;
    desc: string;
};

type SettingsSidebarPanelProps = {
    tabs: readonly SettingsTab[];
    activeTab: string;
    onSelectTab: (tabId: string) => void;
};

const SettingsSidebarPanel: React.FC<SettingsSidebarPanelProps> = ({ tabs, activeTab, onSelectTab }) => (
    <div className="lg:col-span-4 xl:col-span-3 space-y-8 lg:sticky lg:top-10">
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/40 dark:bg-[#151b18]/80 backdrop-blur-3xl rounded-[3.5rem] border border-white dark:border-white/10 shadow-3xl p-5"
        >
            <div className="space-y-3">
                {tabs.map((tab, idx) => (
                    <motion.button
                        key={tab.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => onSelectTab(tab.id)}
                        className={`w-full group flex items-center gap-5 p-5 rounded-[2.5rem] transition-all duration-700 ${activeTab === tab.id
                            ? 'bg-emerald-600 text-white shadow-2xl shadow-emerald-500/40 translate-x-3 scale-[1.02]'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-white/5 hover:text-emerald-600'}`}
                    >
                        <div className={`p-4 rounded-2xl transition-all duration-700 ${activeTab === tab.id ? 'bg-white/20 rotate-0' : 'bg-gray-100 dark:bg-white/5 group-hover:bg-white dark:group-hover:bg-emerald-500/20 group-hover:rotate-12 group-hover:scale-110'}`}>
                            <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">{tab.label}</p>
                            <p className={`text-[9px] font-bold uppercase tracking-[0.1em] mt-1 line-clamp-1 ${activeTab === tab.id ? 'text-emerald-100' : 'text-gray-400 group-hover:text-emerald-500/60 transition-colors'}`}>
                                {tab.desc}
                            </p>
                        </div>
                    </motion.button>
                ))}
            </div>
        </motion.div>

        {/* System Monitoring Pulse Card */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-10 bg-black dark:bg-[#050706] rounded-[3.5rem] text-white overflow-hidden relative group border border-white/5"
        >
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 shadow-inner group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                        <Cpu size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black font-fraunces text-emerald-500 uppercase tracking-[0.3em]">Core Engine</p>
                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mt-0.5">Real-time status</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex justify-between items-center group/item hover:translate-x-1 transition-transform">
                        <div className="flex items-center gap-3">
                            <ShieldCheck size={14} className="text-gray-600 group-hover/item:text-emerald-500 transition-colors" />
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest group-hover/item:text-white transition-colors">Security Protocol</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase text-emerald-500/80">SSL ACTIVE</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center group/item hover:translate-x-1 transition-transform">
                        <div className="flex items-center gap-3">
                            <Activity size={14} className="text-gray-600 group-hover/item:text-emerald-500 transition-colors" />
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest group-hover/item:text-white transition-colors">Server Integrity</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase text-white tracking-widest">99.9%</span>
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-pulse" />
                        </div>
                    </div>
                    <div className="flex justify-between items-center group/item hover:translate-x-1 transition-transform">
                        <div className="flex items-center gap-3">
                            <HardDrive size={14} className="text-gray-600 group-hover/item:text-emerald-500 transition-colors" />
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest group-hover/item:text-white transition-colors">Build Version</span>
                        </div>
                        <span className="text-[9px] font-black uppercase bg-white/5 px-3 py-1 rounded-lg text-gray-400 group-hover/item:text-emerald-400 transition-colors tracking-widest">v2.5.Premium</span>
                    </div>
                </div>
            </div>
            
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-600/5 blur-[80px] group-hover:bg-emerald-600/10 transition-all duration-1000 -translate-y-12 translate-x-12" />
            <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-emerald-500/5 blur-[100px] border border-emerald-500/20 rounded-full" />
        </motion.div>
    </div>
);

export default SettingsSidebarPanel;
