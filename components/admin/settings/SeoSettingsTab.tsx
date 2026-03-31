'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    RefreshCcw, Save, X, Search, BarChart3, 
    Zap, Info, CheckCircle2, Globe, Tag, 
    Layout, LayoutGrid, Activity
} from 'lucide-react';
import type { AdminSiteSettings } from '@/lib/admin-site-settings';

type Props = {
    settings: AdminSiteSettings;
    onSave: (payload: Partial<AdminSiteSettings>) => void;
    saving: boolean;
};

export default function SeoSettingsTab({ settings, onSave, saving }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState(settings);

    const handleSave = () => {
        onSave({
            metaDescription: form.metaDescription,
            metaKeywords: form.metaKeywords,
            googleAnalyticsId: form.googleAnalyticsId,
        });
        setIsEditing(false);
    };

    const InfoCard = ({ icon: Icon, label, value, tags = false }: { icon: any, label: string, value: string, tags?: boolean }) => (
        <div className="group space-y-4 p-8 bg-gray-50/50 dark:bg-black/20 rounded-[2.5rem] border border-gray-100 dark:border-white/5 hover:bg-white dark:hover:bg-white/5 transition-all duration-500 hover:shadow-xl hover:shadow-emerald-500/5">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-white dark:bg-white/5 rounded-2xl text-gray-400 group-hover:text-emerald-500 transition-all shadow-sm ring-1 ring-gray-100 dark:ring-white/5 group-hover:rotate-12">
                    <Icon size={18} />
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</span>
            </div>
            
            {tags ? (
                <div className="flex flex-wrap gap-2 px-1">
                    {value ? value.split(',').map((kw, i) => (
                        <span key={i} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/10">
                            {kw.trim()}
                        </span>
                    )) : <span className="text-gray-300 dark:text-white/10 italic text-sm">No keywords defined</span>}
                </div>
            ) : (
                <div className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed px-1">
                    {value || <span className="text-gray-300 dark:text-white/10 italic">Not configured</span>}
                </div>
            )}
        </div>
    );

    return (
        <div className="max-w-5xl space-y-10 font-sans">
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl rounded-[3.5rem] border border-white dark:border-white/10 shadow-3xl p-10 lg:p-14 relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -translate-y-32 translate-x-32" />
                
                <div className="relative z-10">
                    <div className="mb-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-[1.75rem] text-indigo-600 shadow-inner group-hover:rotate-6 transition-transform duration-700">
                                <Search size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none mb-2">Search Optimization</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] italic">Visibilitas & Analitik Mesin Pencari</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsEditing(true)} 
                            className="inline-flex items-center gap-4 bg-white dark:bg-white/5 hover:bg-indigo-600 hover:text-white px-8 py-4 rounded-[1.75rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-gray-100 dark:border-white/10 shadow-xl active:scale-95"
                        >
                            <Zap size={16} className="animate-pulse" /> CONFIGURE SEO
                        </button>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <InfoCard icon={Layout} label="Global Meta Description" value={settings.metaDescription || ''} />
                        </div>
                        <InfoCard icon={Tag} label="Indexing Keywords" value={settings.metaKeywords || ''} tags />
                        <div className="space-y-4 p-8 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-[2.5rem] border border-indigo-500/10 hover:bg-white dark:hover:bg-white/5 transition-all duration-500 group/ga">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white dark:bg-white/5 rounded-2xl text-indigo-400 group-hover/ga:text-indigo-600 transition-all shadow-sm ring-1 ring-indigo-100 dark:ring-white/5">
                                    <Activity size={20} />
                                </div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Google Analytics 4</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-4 py-2 rounded-xl font-mono text-xs font-black tracking-widest ${settings.googleAnalyticsId ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-gray-100 text-gray-400 dark:bg-white/5'}`}>
                                    {settings.googleAnalyticsId || 'UNCONFIGURED'}
                                </span>
                                {settings.googleAnalyticsId && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-emerald-500/10">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        TRACKING ACTIVE
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-12 p-8 bg-indigo-500/5 rounded-[2.5rem] border border-indigo-500/10 flex gap-6 items-center">
                        <div className="p-3 bg-indigo-500 rounded-2xl text-white shadow-xl ring-4 ring-indigo-500/10 transition-transform group-hover:rotate-12"><Info size={20}/></div>
                        <div>
                            <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mb-1.5 leading-none italic">Indexing Advisory</p>
                            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 leading-relaxed italic">
                                Perubahan pada deskripsi dan kata kunci membutuhkan waktu 3-7 hari untuk direfleksikan oleh Google Crawler. Pastikan konten mengandung terminologi madrasah yang relevan.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {isEditing && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditing(false)}
                            className="absolute inset-0 bg-[#080B09]/80 backdrop-blur-xl"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl bg-white/90 dark:bg-[#151b18]/90 backdrop-blur-2xl rounded-[4rem] border border-white dark:border-white/10 shadow-3xl overflow-hidden font-sans"
                        >
                            <div className="p-10 lg:p-14">
                                <div className="flex items-center justify-between mb-12">
                                    <div className="flex items-center gap-5">
                                        <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-600/20">
                                            <Zap size={24} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none mb-1.5">SEO Reconstruction</h3>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic leading-none">Sinkronisasi parameter visibilitas global</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-50 dark:bg-black/40 hover:bg-red-500 hover:text-white transition-all border border-gray-100 dark:border-white/5 active:scale-90"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-10 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                                    <div className="space-y-4 group">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 transition-colors group-focus-within:text-indigo-500">GLOBAL META DESCRIPTION</label>
                                        <textarea
                                            value={form.metaDescription || ''}
                                            onChange={(event) => setForm({ ...form, metaDescription: event.target.value })}
                                            rows={4}
                                            placeholder="Deskripsi singkat yang akan tampil pada hasil pencarian Google..."
                                            className="w-full rounded-[2.5rem] border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 px-8 py-7 text-sm font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/5 outline-none shadow-inner transition-all border-indigo-500/0 focus:border-indigo-500 leading-relaxed"
                                        />
                                    </div>

                                    <div className="space-y-4 group">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 transition-colors group-focus-within:text-indigo-500">INDEXING KEYWORDS (COMMA SEPARATED)</label>
                                        <input
                                            type="text"
                                            value={form.metaKeywords || ''}
                                            onChange={(event) => setForm({ ...form, metaKeywords: event.target.value })}
                                            placeholder="sekolah, madrasah, MI Alfalah, pendidikan islam"
                                            className="w-full rounded-[2rem] border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 px-8 py-5 text-sm font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/5 outline-none shadow-inner transition-all border-indigo-500/0 focus:border-indigo-500"
                                        />
                                    </div>

                                    <div className="p-8 bg-indigo-500/5 rounded-[2.5rem] border border-indigo-500/10 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg"><Activity size={16} /></div>
                                            <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Tracking Analytics</h4>
                                        </div>
                                        <div className="space-y-3 group">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4 transition-colors group-focus-within:text-indigo-500">GOOGLE ANALYTICS 4 ID (G-XXXXXXXXXX)</label>
                                            <input
                                                type="text"
                                                value={form.googleAnalyticsId || ''}
                                                onChange={(event) => setForm({ ...form, googleAnalyticsId: event.target.value })}
                                                placeholder="G-XXXXXXXXXX"
                                                className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-black/40 px-6 py-4 font-mono text-sm text-indigo-600 dark:text-indigo-400 focus:ring-4 focus:ring-indigo-500/5 outline-none shadow-inner transition-all border-indigo-500/0 focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 flex items-center justify-end gap-5 border-t border-gray-100 dark:border-white/5 pt-10">
                                    <button 
                                        onClick={() => setIsEditing(false)} 
                                        className="px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 dark:hover:bg-black/40 transition-all"
                                    >
                                        CANCEL
                                        </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex items-center gap-4 rounded-[1.75rem] bg-indigo-600 px-10 py-5 text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <>
                                                <RefreshCcw size={18} className="animate-spin" />
                                                SYNCHRONIZING...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 size={18} />
                                                COMMIT SEO
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
