'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Globe, MessageCircle, RefreshCcw, Share2, ShieldAlert, Sparkles, SlidersHorizontal, Settings2, Info, CheckCircle2 } from 'lucide-react';
import SidebarAdmin from '@/components/sidebar-admin';
import HeaderAdmin from '@/components/header-admin';
import IdentitySettingsTab from '@/components/admin/settings/IdentitySettingsTab';
import SeoSettingsTab from '@/components/admin/settings/SeoSettingsTab';
import SocialSettingsTab from '@/components/admin/settings/SocialSettingsTab';
import WhatsappSettingsTab from '@/components/admin/settings/WhatsappSettingsTab';
import SettingsSidebarPanel from '@/components/admin/settings/SettingsSidebarPanel';
import { useSettings } from '@/lib/hooks/use-settings';

const TAB_ICONS = {
    identity: Globe,
    whatsapp: MessageCircle,
    social: Share2,
    seo: BarChart3,
};

const TAB_DESCS = {
    identity: 'Logo, nama, dan metadata dasar',
    whatsapp: 'Integrasi chat dan notifikasi',
    social: 'Link platform dan profil publik',
    seo: 'Optimasi pencarian dan tracking',
};

function SettingsContent() {
    const {
        role,
        activeTab,
        setActiveTab,
        settings,
        loading,
        saving,
        error,
        handleSave,
        tabs
    } = useSettings();

    const displayTabs = tabs.map(tab => ({
        ...tab,
        icon: TAB_ICONS[tab.id as keyof typeof TAB_ICONS],
        desc: TAB_DESCS[tab.id as keyof typeof TAB_DESCS],
    }));

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#080B09] transition-colors font-sans">
                <div className="relative">
                    {/* Pulsing ambient rings */}
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 -m-8 border-4 border-emerald-500/10 rounded-full blur-xl"
                    ></motion.div>
                    
                    <div className="w-24 h-24 border-4 border-emerald-500/10 rounded-full"></div>
                    <div className="w-24 h-24 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]"></div>
                    <div className="absolute inset-0 flex items-center justify-center bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-full">
                        <Settings2 size={28} className="text-emerald-500 animate-pulse transition-transform duration-1000 rotate-180" />
                    </div>
                </div>
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-10 text-center"
                >
                    <p className="text-[12px] font-black uppercase tracking-[0.5em] text-emerald-600 dark:text-emerald-400 mb-2">Pusat Kendali</p>
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest italic">Inisialisasi Parameter Global...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080B09] text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">
            <SidebarAdmin />
            <main className="min-h-screen lg:pl-64 pb-24">
                <HeaderAdmin 
                    title="Control Center"
                    subtitle="Manajemen parameter global, kebijakan visual, dan optimasi digital MI Alfalah"
                    action={
                        <div className="bg-emerald-500/10 dark:bg-emerald-500/10 px-8 py-3 rounded-2xl flex items-center gap-4 border border-emerald-500/20 shadow-inner group overflow-hidden relative">
                            <div className="absolute inset-0 bg-emerald-500/5 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            <Sparkles size={18} className="text-emerald-600 animate-pulse" />
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 tracking-[0.2em] uppercase leading-none mb-1">Authenticated</span>
                                <span className="text-[8px] font-black text-emerald-500/60 tracking-widest uppercase leading-none italic">Control Hub Access</span>
                            </div>
                        </div>
                    }
                />

                <section className="px-4 sm:px-10 mt-12">
                    {role && role !== 'superadmin' ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-4xl mx-auto mt-20 p-16 bg-white/70 dark:bg-[#151b18]/80 backdrop-blur-3xl rounded-[4rem] border border-white dark:border-white/10 shadow-3xl text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[100px] -translate-y-32 translate-x-32" />
                            <div className="relative z-10">
                                <div className="w-24 h-24 bg-red-50 dark:bg-red-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-red-500 shadow-xl shadow-red-500/10 ring-4 ring-red-500/5">
                                    <ShieldAlert size={48} />
                                </div>
                                <h2 className="text-3xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight mb-6">Protokol Keamanan Aktif</h2>
                                <p className="text-gray-500 dark:text-gray-400 font-bold max-w-sm mx-auto uppercase tracking-widest text-xs leading-relaxed italic border-y border-gray-100 dark:border-white/5 py-4">
                                    Akses ke Control Center dibatasi hanya untuk otoritas tingkat tinggi (SUPERADMIN).
                                </p>
                                <button onClick={() => window.history.back()} className="mt-12 px-10 py-5 bg-gray-950 dark:bg-white text-white dark:text-black rounded-[1.75rem] text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl">
                                    TERMINATE & RETURN
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="grid lg:grid-cols-12 gap-12 items-start max-w-7xl mx-auto">
                            <SettingsSidebarPanel
                                tabs={displayTabs}
                                activeTab={activeTab}
                                onSelectTab={(tabId) => setActiveTab(tabId as any)}
                            />

                            {/* Main Form Content Container */}
                            <div className="lg:col-span-8 xl:col-span-9 space-y-12">
                                <AnimatePresence mode="wait">
                                    {error && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: -20, height: 0 }}
                                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                                            exit={{ opacity: 0, y: -20, height: 0 }}
                                            className="p-8 rounded-[2.5rem] bg-red-50 dark:bg-red-500/5 border border-red-500/20 flex items-start gap-6 shadow-xl shadow-red-900/5"
                                        >
                                            <div className="p-3 bg-red-500 rounded-2xl text-white shadow-lg ring-4 ring-red-500/10 shrink-0 mt-0.5 animate-bounce">
                                                <ShieldAlert size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-1.5">System Constraint Detected</p>
                                                <p className="text-sm font-black text-red-950 dark:text-red-200 leading-tight uppercase tracking-tight">{error}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <motion.div 
                                    layout
                                    className="bg-white/70 dark:bg-[#151b18]/80 backdrop-blur-3xl rounded-[4rem] border border-white dark:border-white/10 shadow-3xl p-10 lg:p-14 min-h-[700px] relative overflow-hidden"
                                >
                                    {/* Glass header inside card */}
                                    <div className="mb-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border-b border-gray-100 dark:border-white/5 pb-10">
                                        <div className="flex items-center gap-6">
                                            <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-[1.75rem] text-emerald-600 shadow-inner">
                                                {activeTab === 'identity' && <Globe size={28} />}
                                                {activeTab === 'whatsapp' && <MessageCircle size={28} />}
                                                {activeTab === 'social' && <Share2 size={28} />}
                                                {activeTab === 'seo' && <BarChart3 size={28} />}
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none mb-2">
                                                    {tabs.find(t => t.id === activeTab)?.label}
                                                </h2>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] italic">
                                                    MASTER DATA SEGMENT: {activeTab.toUpperCase()}
                                                </p>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {saving && (
                                                <motion.div 
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    className="flex items-center gap-4 bg-emerald-600/90 text-white px-8 py-3.5 rounded-[1.5rem] shadow-xl shadow-emerald-600/30 backdrop-blur-xl border border-white/20"
                                                >
                                                    <RefreshCcw size={16} className="animate-spin" />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Synchronizing...</span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="relative">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={activeTab}
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                transition={{ duration: 0.5, ease: "easeOut" }}
                                            >
                                                {activeTab === 'identity' && <IdentitySettingsTab settings={settings} onSave={handleSave} saving={saving} />}
                                                {activeTab === 'whatsapp' && <WhatsappSettingsTab settings={settings} onSave={handleSave} saving={saving} />}
                                                {activeTab === 'social' && <SocialSettingsTab settings={settings} onSave={handleSave} saving={saving} />}
                                                {activeTab === 'seo' && <SeoSettingsTab settings={settings} onSave={handleSave} saving={saving} />}
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>

                                    {/* Footer Advisory inside main card */}
                                    <div className="mt-14 p-8 bg-gray-50/50 dark:bg-black/20 rounded-[2.5rem] border border-gray-100 dark:border-white/5 flex gap-6 items-center">
                                        <div className="p-3 bg-white dark:bg-white/5 rounded-2xl text-gray-400 shadow-sm"><Info size={20}/></div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 leading-none italic">Configuration advisory</p>
                                            <p className="text-[11px] font-bold text-gray-400/80 leading-relaxed uppercase tracking-widest">
                                                Setiap perubahan parameter pada segmen ini akan direfleksikan secara instan ke seluruh sistem front-facing MI Alfalah.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    )}
                </section>

                {/* GLOBAL SUCCESS TOAST (Optional extension) */}
                <AnimatePresence>
                    {!saving && !error && !loading && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="hidden" // Just logic for now
                        />
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

export default function SettingsPage() {
    return (
        <React.Suspense fallback={
            <div className="flex flex-col min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#080B09]">
                <div className="relative">
                    <div className="w-24 h-24 border-4 border-emerald-500/10 rounded-full"></div>
                    <div className="w-24 h-24 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
            </div>
        }>
            <SettingsContent />
        </React.Suspense>
    );
}
