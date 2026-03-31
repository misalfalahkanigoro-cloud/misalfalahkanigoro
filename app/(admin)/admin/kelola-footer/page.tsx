'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SidebarAdmin from '@/components/sidebar-admin';
import HeaderAdmin from '@/components/header-admin';
import { 
    Plus, Save, Trash2, ChevronUp, ChevronDown, 
    Link2, Type, Sparkles, RefreshCcw, 
    CheckCircle2, AlertCircle, Info, Zap,
    Anchor, ListTree, MousePointerClick
} from 'lucide-react';

type FooterLink = {
    label: string;
    href: string;
};

const KelolaFooterPage: React.FC = () => {
    const [footerLinks, setFooterLinks] = useState<FooterLink[]>([]);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const footerRes = await fetch('/api/admin/footer-links');
                const footerData = await footerRes.json();

                if (Array.isArray(footerData)) {
                    setFooterLinks(footerData.map((item: any) => ({
                        label: item.label,
                        href: item.href,
                    })));
                }
            } catch (error) {
                console.error('Failed to load footer links', error);
            }
        };

        fetchData();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const footerRes = await fetch('/api/admin/footer-links', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: footerLinks.map((item, idx) => ({
                        ...item,
                        display_order: idx + 1,
                        is_active: true,
                    }))
                }),
            });

            if (!footerRes.ok) throw new Error('Failed to save footer links');
            setMessage({ text: 'Tautan footer berhasil disinkronkan.', type: 'success' });
            setTimeout(() => setMessage(null), 5000);
        } catch (error) {
            setMessage({ text: ' Gagal menyimpan blueprint footer.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const addFooterLink = () => {
        setFooterLinks((prev) => [...prev, { label: 'Tautan Baru', href: '/tautan' }]);
    };

    const updateFooterLink = (index: number, field: keyof FooterLink, value: string) => {
        setFooterLinks((prev) => prev.map((item, idx) => idx === index ? { ...item, [field]: value } : item));
    };

    const removeFooterLink = (index: number) => {
        if (!window.confirm('Hapus tautan ini?')) return;
        setFooterLinks((prev) => prev.filter((_, idx) => idx !== index));
    };

    const moveLink = (index: number, direction: 'up' | 'down') => {
        const newLinks = [...footerLinks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newLinks.length) return;

        [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]];
        setFooterLinks(newLinks);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080B09] text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">
            <SidebarAdmin />
            <main className="min-h-screen lg:pl-64 pb-24">
                <HeaderAdmin 
                    title="Anchor System"
                    subtitle="Manajemen pintasan footer, direktori cepat, dan navigasi bottom-level website"
                    action={
                        <div className="bg-emerald-500/10 dark:bg-emerald-500/10 px-8 py-3 rounded-2xl flex items-center gap-4 border border-emerald-500/20 shadow-inner group overflow-hidden relative">
                            <div className="absolute inset-0 bg-emerald-500/5 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            <Sparkles size={18} className="text-emerald-600 animate-pulse" />
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 tracking-[0.2em] uppercase leading-none mb-1">Architecture Readied</span>
                                <span className="text-[8px] font-black text-emerald-500/60 tracking-widest uppercase leading-none italic">Bottom-tier Grid Sync</span>
                            </div>
                        </div>
                    }
                />

                <section className="px-4 sm:px-10 mt-12 max-w-7xl mx-auto space-y-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/70 dark:bg-[#151b18]/80 backdrop-blur-3xl rounded-[4rem] border border-white dark:border-white/10 shadow-3xl overflow-hidden"
                    >
                        <div className="p-10 lg:p-14 border-b border-gray-100 dark:border-white/5 bg-white/50 dark:bg-transparent">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-[1.75rem] text-emerald-600 shadow-inner">
                                        <Anchor size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none mb-2">Footer Directory</h2>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] italic">
                                            Koleksi link strategis untuk akselerasi akses pengunjung
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={addFooterLink}
                                    className="inline-flex items-center gap-4 bg-emerald-600 text-white px-8 py-4 rounded-[1.75rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-500/30 hover:bg-emerald-500 hover:-translate-y-1 active:scale-95 group"
                                >
                                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" /> ATTACH DIRECT LINK
                                </button>
                            </div>
                        </div>

                        <div className="p-10 lg:p-14 space-y-6">
                            <AnimatePresence mode="popLayout">
                                {footerLinks.length === 0 ? (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center justify-center py-24 text-center bg-gray-50/50 dark:bg-black/20 rounded-[3rem] border border-dashed border-gray-100 dark:border-white/5"
                                    >
                                        <div className="w-24 h-24 bg-white dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center text-gray-300 mb-8 shadow-inner animate-pulse">
                                            <MousePointerClick size={48} className="opacity-20" />
                                        </div>
                                        <h4 className="text-lg font-black font-fraunces text-gray-900 dark:text-white uppercase tracking-tight mb-2">Directory Isolated</h4>
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] italic max-w-xs leading-relaxed">
                                            Tidak ada tautan cepat yang terdaftar. Footer publik hanya akan menampilkan navigasi dasar.
                                        </p>
                                    </motion.div>
                                ) : (
                                    <div className="grid gap-4">
                                        {footerLinks.map((link, index) => (
                                            <motion.div 
                                                key={index}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 10, scale: 0.95 }}
                                                transition={{ delay: index * 0.02 }}
                                                className="group/item relative flex flex-col md:flex-row md:items-center bg-gray-50/50 dark:bg-black/20 p-6 lg:p-8 rounded-[3rem] border border-gray-100 dark:border-white/5 hover:bg-white dark:hover:bg-white/5 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-500"
                                            >
                                                <div className="flex-1 grid md:grid-cols-2 gap-8 w-full">
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4 flex items-center gap-2">
                                                            <Type size={12} className="opacity-50" /> ANCHOR LABEL
                                                        </label>
                                                        <input
                                                            value={link.label}
                                                            onChange={(e) => updateFooterLink(index, 'label', e.target.value)}
                                                            className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-black/40 px-6 py-4 text-sm font-black text-gray-900 dark:text-white focus:ring-4 focus:ring-emerald-500/5 outline-none shadow-inner transition-all border-emerald-500/0 focus:border-emerald-500"
                                                            placeholder="e.g. Profil Madrasah"
                                                        />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4 flex items-center gap-2">
                                                            <Link2 size={12} className="opacity-50" /> DESTINATION URL
                                                        </label>
                                                        <input
                                                            value={link.href}
                                                            onChange={(e) => updateFooterLink(index, 'href', e.target.value)}
                                                            className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-black/40 px-6 py-4 text-sm font-bold text-emerald-600 dark:text-emerald-400 focus:ring-4 focus:ring-emerald-500/5 outline-none shadow-inner transition-all border-emerald-500/0 focus:border-emerald-500"
                                                            placeholder="/target-page"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 mt-6 md:mt-0 md:ml-8 border-t md:border-t-0 md:border-l border-gray-100 dark:border-white/5 pt-6 md:pt-0 md:pl-8">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => moveLink(index, 'up')}
                                                            disabled={index === 0}
                                                            className="p-3 rounded-xl border border-gray-100 dark:border-white/10 hover:bg-emerald-50 dark:hover:bg-white/5 disabled:opacity-20 transition-all text-gray-400 hover:text-emerald-600"
                                                            title="Promote Link"
                                                        >
                                                            <ChevronUp size={18} strokeWidth={3} />
                                                        </button>
                                                        <button
                                                            onClick={() => moveLink(index, 'down')}
                                                            disabled={index === footerLinks.length - 1}
                                                            className="p-3 rounded-xl border border-gray-100 dark:border-white/10 hover:bg-emerald-50 dark:hover:bg-white/5 disabled:opacity-20 transition-all text-gray-400 hover:text-emerald-600"
                                                            title="Demote Link"
                                                        >
                                                            <ChevronDown size={18} strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFooterLink(index)}
                                                        className="p-4 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
                                                        title="Sever Connection"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Footer Command Section */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-10 bg-white/70 dark:bg-[#151b18]/80 backdrop-blur-3xl p-10 lg:p-14 rounded-[4rem] border border-white dark:border-white/10 shadow-3xl">
                        <div className="flex gap-6 items-center max-w-2xl">
                            <div className={`p-4 rounded-[1.75rem] shadow-xl ring-4 ring-emerald-500/5 ${message?.type === 'success' ? 'bg-emerald-500 text-white animate-pulse' : 'bg-white dark:bg-white/5 text-emerald-600'}`}>
                                {message?.type === 'success' ? <CheckCircle2 size={32} /> : <Zap size={32} />}
                            </div>
                            <div>
                                <p className={`text-[11px] font-black uppercase tracking-[0.3em] mb-2 leading-none italic ${message?.type === 'success' ? 'text-emerald-600' : 'text-gray-400'}`}>
                                    {message?.type === 'success' ? 'ANCHOR DEPLOYED' : 'SYSTEM STATUS: STANDBY'}
                                </p>
                                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 leading-relaxed uppercase tracking-tight">
                                    {message?.text || 'Perubahan pada blueprint footer akan langsung dieksekusi ke seluruh interface publik. Gunakan anchor link yang valid.'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full md:w-auto rounded-[1.75rem] bg-emerald-600 px-14 py-6 text-[11px] font-black text-white uppercase tracking-[0.3em] shadow-2xl shadow-emerald-500/30 hover:bg-emerald-500 hover:-translate-y-1 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-4 group"
                        >
                            {saving ? (
                                <>
                                    <RefreshCcw size={18} className="animate-spin" />
                                    SYNCHRONIZING...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={18} />
                                    COMMIT DIRECTORY
                                </>
                            )}
                        </button>
                    </div>

                    <div className="p-10 bg-black dark:bg-[#050706] rounded-[3.5rem] text-white overflow-hidden relative group border border-white/5">
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 shadow-inner group-hover:rotate-12 transition-all duration-700">
                                    <Info size={24} />
                                </div>
                                <div className="max-w-md">
                                    <p className="text-[10px] font-black font-fraunces text-emerald-500 uppercase tracking-[0.3em] mb-1.5">DOMAIN ADVISORY</p>
                                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed italic">
                                        Rekomendasi performa: Gunakan target internal (/page) jika memungkinkan untuk performa routing SPA yang lebih cepat.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="text-center">
                                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Impact</p>
                                    <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">GLOBAL</p>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div className="text-center">
                                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">State</p>
                                    <p className="text-xs font-black text-white uppercase tracking-widest">PERSISTED</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/5 blur-[100px] -translate-y-32 translate-x-32" />
                    </div>
                </section>
            </main>
        </div>
    );
};

export default KelolaFooterPage;
