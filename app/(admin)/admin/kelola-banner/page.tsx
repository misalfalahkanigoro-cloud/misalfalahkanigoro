'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SidebarAdmin from '@/components/sidebar-admin';
import HeaderAdmin from '@/components/header-admin';
import { 
    Plus, Save, Trash2, Edit2, X, RefreshCcw, 
    CheckCircle2, AlertCircle, Info, Zap,
    Layout, MousePointer2, Sparkles, Palette,
    Type, Globe, Hash, Activity, ShieldCheck,
    ChevronRight, ExternalLink
} from 'lucide-react';

type SiteBanner = {
    id?: string;
    title: string;
    description?: string | null;
    button_text: string;
    button_link: string;
    background_color: string;
    text_color: string;
    placement: 'home' | 'all' | 'custom';
    display_order: number;
    is_active: boolean;
};

const DEFAULT_FORM: SiteBanner = {
    title: '',
    description: '',
    button_text: 'Daftar Sekarang',
    button_link: '/ppdb',
    background_color: '#10b981',
    text_color: '#ffffff',
    placement: 'home',
    display_order: 1,
    is_active: true,
};

const KelolaBannerPage: React.FC = () => {
    const [items, setItems] = useState<SiteBanner[]>([]);
    const [form, setForm] = useState<SiteBanner>(DEFAULT_FORM);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/site-banners');
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch banners', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const openAddModal = () => {
        setForm(DEFAULT_FORM);
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (item: SiteBanner) => {
        setEditingId(item.id || null);
        setForm(item);
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const payload = {
                title: form.title,
                description: form.description,
                buttonText: form.button_text,
                buttonLink: form.button_link,
                backgroundColor: form.background_color,
                textColor: form.text_color,
                placement: form.placement,
                displayOrder: Number(form.display_order) || 0,
                isActive: form.is_active,
            };
            const url = editingId ? `/api/admin/site-banners/${editingId}` : '/api/admin/site-banners';
            const method = editingId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Gagal menyimpan banner');
            }
            setIsModalOpen(false);
            fetchItems();
            setMessage({ text: 'Banner berhasil disinkronkan ke sistem.', type: 'success' });
            setTimeout(() => setMessage(null), 5000);
        } catch (error: any) {
            setMessage({ text: error.message || 'Kegagalan protokol penyimpanan.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id?: string) => {
        if (!id) return;
        if (!confirm('Hapus banner ini dari grid publik?')) return;
        try {
            await fetch(`/api/admin/site-banners/${id}`, { method: 'DELETE' });
            fetchItems();
            setMessage({ text: 'Banner telah dihapus permanen.', type: 'success' });
        } catch (error) {
            setMessage({ text: 'Gagal menghapus entitas.', type: 'error' });
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080B09] text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">
            <SidebarAdmin />
            <main className="min-h-screen lg:pl-64 pb-24">
                <HeaderAdmin 
                    title="CTA Campaign Manager"
                    subtitle="Manajemen banner interaktif, kampanye visual, dan strategi konversi beranda"
                    action={
                        <div className="bg-emerald-500/10 dark:bg-emerald-500/10 px-8 py-3 rounded-2xl flex items-center gap-4 border border-emerald-500/20 shadow-inner group overflow-hidden relative text-emerald-600">
                             <div className="absolute inset-0 bg-emerald-500/5 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            <Sparkles size={18} className="animate-pulse" />
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black tracking-[0.2em] uppercase leading-none mb-1">Marketing Hub</span>
                                <span className="text-[8px] font-black tracking-widest uppercase leading-none italic">CPC Optimization: ON</span>
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
                        <div className="p-10 lg:p-14 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                             <div className="flex items-center gap-6">
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-[1.75rem] text-emerald-600 shadow-inner">
                                    <Layout size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none mb-2">Active Campaigns</h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] italic">
                                        Inventory banner publik ({items.length})
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={openAddModal}
                                className="inline-flex items-center gap-4 bg-emerald-600 text-white px-8 py-4 rounded-[1.75rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-500/30 hover:bg-emerald-500 hover:-translate-y-1 active:scale-95 group"
                            >
                                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" /> DEPLOY NEW BANNER
                            </button>
                        </div>

                        <div className="p-10 lg:p-14">
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                                        <RefreshCcw size={48} className="text-emerald-500 animate-spin mb-4" />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Accessing Campaign Grid...</p>
                                    </div>
                                ) : items.length === 0 ? (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center justify-center py-24 text-center bg-gray-50/50 dark:bg-black/20 rounded-[3rem] border border-dashed border-gray-100 dark:border-white/5"
                                    >
                                        <div className="w-24 h-24 bg-white dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center text-gray-300 mb-8 shadow-inner">
                                            <Zap size={48} className="opacity-20" />
                                        </div>
                                        <h4 className="text-lg font-black font-fraunces text-gray-900 dark:text-white uppercase tracking-tight mb-2">Campaigns Idle</h4>
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] italic max-w-xs leading-relaxed">
                                            Tidak ada banner aktif yang terdeteksi. Silakan deploy kampanye baru untuk meningkatkan konversi.
                                        </p>
                                    </motion.div>
                                ) : (
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {items.map((item, idx) => (
                                            <motion.div 
                                                key={item.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className={`group/card relative overflow-hidden rounded-[3rem] border p-8 transition-all hover:shadow-2xl hover:-translate-y-1 ${item.is_active ? 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/5' : 'bg-gray-50/50 dark:bg-black/20 border-gray-100 dark:border-white/5 grayscale opacity-60'}`}
                                            >
                                                {/* Mini Preview Bar */}
                                                <div 
                                                    className="absolute top-0 left-0 right-0 h-2 opacity-50 shadow-inner" 
                                                    style={{ backgroundColor: item.background_color }}
                                                />
                                                
                                                <div className="flex items-center justify-between mb-8">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-3 bg-gray-50 dark:bg-black/40 rounded-2xl text-emerald-600 shadow-inner">
                                                            <Globe size={18} />
                                                        </div>
                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{item.placement}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${item.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">{item.is_active ? 'LIVE' : 'IDLE'}</span>
                                                    </div>
                                                </div>

                                                <h3 className="text-xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-tight mb-3 line-clamp-1">{item.title}</h3>
                                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 line-clamp-2 uppercase tracking-tight italic mb-8">
                                                    {item.description || 'No campaign description protocol provided.'}
                                                </p>

                                                <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50/50 dark:bg-black/40 border border-gray-100 dark:border-white/5 mb-8">
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">CTA ACTION</span>
                                                        <span className="text-[10px] font-black text-emerald-600 line-clamp-1">{item.button_text}</span>
                                                    </div>
                                                    <ExternalLink size={14} className="text-gray-300" />
                                                </div>

                                                <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full border border-white dark:border-white/10 shadow-sm" style={{ backgroundColor: item.background_color }} />
                                                        <span className="text-[9px] font-black text-gray-400 font-mono">{item.background_color}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button 
                                                            onClick={() => openEditModal(item)}
                                                            className="p-3 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button 
                                                             onClick={() => handleDelete(item.id)}
                                                            className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Technical Advisory Section */}
                     <div className="p-10 bg-black dark:bg-[#050706] rounded-[3.5rem] text-white overflow-hidden relative group border border-white/5">
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 shadow-inner group-hover:rotate-12 transition-all duration-700">
                                    <ShieldCheck size={28} />
                                </div>
                                <div className="max-w-2xl">
                                    <p className="text-[10px] font-black font-fraunces text-emerald-500 uppercase tracking-[0.3em] mb-1.5 leading-none">Campaign Policy</p>
                                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed italic">
                                        Banner CTA didesain untuk visibilitas instan. Gunakan <strong className="text-white">kontras warna tinggi</strong> dan pesan singkat (maks 60 karakter) untuk hasil click-through-rate optimal pada perangkat mobile.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-10 shrink-0">
                                <div className="text-center">
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 leading-none">State</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-xs font-black text-white uppercase tracking-widest leading-none">ONLINE</p>
                                    </div>
                                </div>
                                <div className="w-px h-10 bg-white/10" />
                                <div className="text-center">
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 leading-none">Security</p>
                                    <p className="text-xs font-black text-white uppercase tracking-widest leading-none">ENCRYPTED</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/5 blur-[120px] -translate-y-40 translate-x-40" />
                    </div>
                </section>
            </main>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-[#080B09]/80 backdrop-blur-xl"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-4xl bg-white/90 dark:bg-[#151b18]/90 backdrop-blur-2xl rounded-[4rem] border border-white dark:border-white/10 shadow-3xl overflow-hidden font-sans"
                        >
                            <div className="p-10 lg:p-14 overflow-y-auto max-h-[90vh] custom-scrollbar">
                                <div className="flex items-center justify-between mb-16">
                                     <div className="flex items-center gap-6">
                                        <div className="p-4 bg-emerald-600 rounded-3xl text-white shadow-2xl shadow-emerald-600/20">
                                            <Sparkles size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none mb-2">
                                                {editingId ? 'Refine Campaign' : 'Deploy Campaign'}
                                            </h3>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none px-1">Blueprint Konfigurasi Banner</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-50 dark:bg-black/40 hover:bg-red-500 hover:text-white transition-all border border-gray-100 dark:border-white/5 active:scale-90"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="grid lg:grid-cols-2 gap-12">
                                    <div className="space-y-10">
                                        <div className="space-y-4 group">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4 transition-colors group-focus-within:text-emerald-500 flex items-center gap-3">
                                                <Type size={12} /> CAMPAIGN TITLE
                                            </label>
                                            <input
                                                value={form.title}
                                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                                className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 px-6 py-4 text-sm font-black text-gray-950 dark:text-white focus:ring-4 focus:ring-emerald-500/5 outline-none shadow-inner transition-all border-emerald-500/0 focus:border-emerald-500"
                                                placeholder="e.g. PPDB TA 2024/2025 TELAH DIBUKA"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-4 group">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4 transition-colors group-focus-within:text-emerald-500 flex items-center gap-3">
                                                    <MousePointer2 size={12} /> BUTTON TEXT
                                                </label>
                                                <input
                                                    value={form.button_text}
                                                    onChange={(e) => setForm({ ...form, button_text: e.target.value })}
                                                    className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 px-6 py-4 text-sm font-bold text-gray-950 dark:text-white focus:ring-4 focus:ring-emerald-500/5 outline-none shadow-inner transition-all"
                                                    placeholder="Daftar Sekarang"
                                                />
                                            </div>
                                            <div className="space-y-4 group">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4 transition-colors group-focus-within:text-emerald-500 flex items-center gap-3">
                                                    <ExternalLink size={12} /> ACTION LINK
                                                </label>
                                                <input
                                                    value={form.button_link}
                                                    onChange={(e) => setForm({ ...form, button_link: e.target.value })}
                                                    className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 px-6 py-4 text-sm font-bold text-emerald-600 dark:text-emerald-400 focus:ring-4 focus:ring-emerald-500/5 outline-none shadow-inner transition-all"
                                                    placeholder="/ppdb"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4 group">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4 flex items-center gap-3">
                                                <Type size={12} /> DESCRIPTION PROTOCOL
                                            </label>
                                            <textarea
                                                value={form.description || ''}
                                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                                rows={4}
                                                className="w-full rounded-[2rem] border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 px-6 py-5 text-sm font-bold text-gray-950 dark:text-white focus:ring-4 focus:ring-emerald-500/5 outline-none shadow-inner transition-all"
                                                placeholder="Detail kampanye..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-10">
                                        <div className="grid grid-cols-2 gap-8">
                                             <div className="space-y-4 group">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4 flex items-center gap-3">
                                                   <Palette size={12} /> BG COLOR
                                                </label>
                                                <div className="flex gap-4">
                                                    <input
                                                        type="color"
                                                        value={form.background_color}
                                                        onChange={(e) => setForm({ ...form, background_color: e.target.value })}
                                                        className="w-14 h-14 rounded-2xl border-none cursor-pointer bg-transparent"
                                                    />
                                                    <input
                                                        value={form.background_color}
                                                        onChange={(e) => setForm({ ...form, background_color: e.target.value })}
                                                        className="flex-1 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 px-6 py-4 font-mono text-sm font-bold text-gray-400 outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-4 group">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4 flex items-center gap-3">
                                                   < Palette size={12} /> TEXT COLOR
                                                </label>
                                                <div className="flex gap-4">
                                                    <input
                                                        type="color"
                                                        value={form.text_color}
                                                        onChange={(e) => setForm({ ...form, text_color: e.target.value })}
                                                        className="w-14 h-14 rounded-2xl border-none cursor-pointer bg-transparent"
                                                    />
                                                    <input
                                                        value={form.text_color}
                                                        onChange={(e) => setForm({ ...form, text_color: e.target.value })}
                                                        className="flex-1 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 px-6 py-4 font-mono text-sm font-bold text-gray-400 outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-4 group">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4 flex items-center gap-3">
                                                    <Globe size={12} /> PLACEMENT
                                                </label>
                                                <select
                                                    value={form.placement}
                                                    onChange={(e) => setForm({ ...form, placement: e.target.value as SiteBanner['placement'] })}
                                                    className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 px-6 py-4 text-sm font-black text-gray-950 dark:text-white outline-none appearance-none"
                                                >
                                                    <option value="home">HOME ONLY</option>
                                                    <option value="all">GLOBAL BROADCAST</option>
                                                    <option value="custom">CUSTOM NODE</option>
                                                </select>
                                            </div>
                                            <div className="space-y-4 group">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4 flex items-center gap-3">
                                                    <Hash size={12} /> PRIORITY ORDER
                                                </label>
                                                <input
                                                    type="number"
                                                    value={form.display_order}
                                                    onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                                                    className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 px-6 py-4 text-sm font-black text-gray-950 dark:text-white outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="p-8 rounded-[2.5rem] bg-gray-50/50 dark:bg-black/20 border border-gray-100 dark:border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-xl transition-all ${form.is_active ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-200 text-gray-400'}`}>
                                                    <Activity size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-950 dark:text-white uppercase tracking-widest leading-none mb-1">Status Protocol</p>
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none italic">{form.is_active ? 'ENABLED & LIVE' : 'DISABLED & STAGED'}</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={form.is_active}
                                                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                                    className="sr-only peer" 
                                                />
                                                <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-black/40 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-16 flex flex-col sm:flex-row items-center justify-end gap-6 border-t border-gray-100 dark:border-white/5 pt-12">
                                    <button 
                                        onClick={() => setIsModalOpen(false)}
                                        className="w-full sm:w-auto px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-100 dark:hover:bg-black/40 transition-all"
                                    >
                                        TERMINATE
                                    </button>
                                    <button 
                                        onClick={handleSubmit}
                                        disabled={!form.title || saving}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-4 bg-emerald-600 text-white px-14 py-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-emerald-500/30 hover:bg-emerald-500 hover:-translate-y-1 active:scale-95 disabled:opacity-50 transition-all font-sans"
                                    >
                                        {saving ? (
                                            <>
                                                <RefreshCcw size={18} className="animate-spin" />
                                                SYNCHRONIZING...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 size={18} />
                                                COMMIT CAMPAIGN
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {message && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md px-4"
                    >
                        <div className={`p-6 rounded-[2rem] border shadow-3xl backdrop-blur-3xl flex items-center gap-4 ${message.type === 'success' ? 'bg-emerald-600/90 border-emerald-400/50 text-white' : 'bg-red-600/90 border-red-400/50 text-white'}`}>
                            {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                            <p className="text-[11px] font-black uppercase tracking-widest">{message.text}</p>
                            <button onClick={() => setMessage(null)} className="ml-auto p-2 rounded-lg hover:bg-white/10">
                                <X size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default KelolaBannerPage;
