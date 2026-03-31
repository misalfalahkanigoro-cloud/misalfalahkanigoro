'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SidebarAdmin from '@/components/sidebar-admin';
import HeaderAdmin from '@/components/header-admin';
import { 
    Plus, Trash2, Save, Edit2, X, RefreshCcw, 
    CheckCircle2, AlertCircle, Info, Zap,
    Star, BookOpen, Users, Award, Shield, 
    Zap as ZapIcon, Heart, Globe, Target,
    Sparkles, Square, Type, AlignLeft, Hash,
    Activity, ShieldCheck, MousePointer2
} from 'lucide-react';

type Highlight = {
    id?: number;
    icon: string;
    title: string;
    description: string;
    order: number;
};

const DEFAULT_FORM: Highlight = { icon: 'Star', title: '', description: '', order: 1 };

const ICON_OPTIONS = [
    { name: 'Star', icon: Star },
    { name: 'BookOpen', icon: BookOpen },
    { name: 'Users', icon: Users },
    { name: 'Award', icon: Award },
    { name: 'Shield', icon: Shield },
    { name: 'Zap', icon: ZapIcon },
    { name: 'Heart', icon: Heart },
    { name: 'Globe', icon: Globe },
    { name: 'Target', icon: Target },
];

const KelolaHighlightsPage: React.FC = () => {
    const [items, setItems] = useState<Highlight[]>([]);
    const [form, setForm] = useState<Highlight>(DEFAULT_FORM);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/highlights');
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch highlights', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const resetForm = () => {
        setForm(DEFAULT_FORM);
        setEditingId(null);
    };

    const openAddModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (item: Highlight) => {
        setEditingId(item.id || null);
        setForm({
            icon: item.icon || 'Star',
            title: item.title || '',
            description: item.description || '',
            order: Number(item.order) || 0,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const payload = { ...form, order: Number(form.order) || 0 };
            const url = editingId ? `/api/admin/highlights/${editingId}` : '/api/admin/highlights';
            const method = editingId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Gagal menyimpan highlight');
            }
            setIsModalOpen(false);
            fetchItems();
            setMessage({ text: 'Value proposition berhasil disinkronkan.', type: 'success' });
            setTimeout(() => setMessage(null), 5000);
        } catch (error: any) {
            setMessage({ text: error.message || 'Kegagalan transmisi data.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id?: number) => {
        if (!id) return;
        if (!confirm('Hapus highlight ini dari section "Kenapa Memilih Kami"?')) return;
        try {
            await fetch(`/api/admin/highlights/${id}`, { method: 'DELETE' });
            fetchItems();
            setMessage({ text: 'Highlight telah dihapus permanen.', type: 'success' });
        } catch (error) {
            setMessage({ text: 'Gagal memproses penghapusan.', type: 'error' });
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080B09] text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">
            <SidebarAdmin />
            <main className="min-h-screen lg:pl-64 pb-24">
                <HeaderAdmin 
                    title="Value Highlights"
                    subtitle="Manajemen keunggulan kompetitif, diferensiasi institusi, dan section 'Kenapa Memilih Kami'"
                    action={
                        <div className="bg-emerald-500/10 dark:bg-emerald-500/10 px-8 py-3 rounded-2xl flex items-center gap-4 border border-emerald-500/20 shadow-inner group overflow-hidden relative text-emerald-600">
                             <div className="absolute inset-0 bg-emerald-500/5 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            <Sparkles size={18} className="animate-pulse" />
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black tracking-[0.2em] uppercase leading-none mb-1">Brand Core</span>
                                <span className="text-[8px] font-black tracking-widest uppercase leading-none italic">Proposition State: ACTIVE</span>
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
                        <div className="p-10 lg:p-14 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-white/50 dark:bg-transparent">
                             <div className="flex items-center gap-6">
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-[1.75rem] text-emerald-600 shadow-inner">
                                    <Target size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none mb-2">Value Grid</h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] italic">
                                        Daftar keunggulan kompetitif ({items.length})
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={openAddModal}
                                className="inline-flex items-center gap-4 bg-emerald-600 text-white px-8 py-4 rounded-[1.75rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-500/30 hover:bg-emerald-500 hover:-translate-y-1 active:scale-95 group"
                            >
                                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" /> ATTACH VALUE PROPOSITION
                            </button>
                        </div>

                        <div className="p-10 lg:p-14">
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                                        <RefreshCcw size={48} className="text-emerald-500 animate-spin mb-4" />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Accessing Value Grid...</p>
                                    </div>
                                ) : items.length === 0 ? (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center justify-center py-24 text-center bg-gray-50/50 dark:bg-black/20 rounded-[3rem] border border-dashed border-gray-100 dark:border-white/5"
                                    >
                                        <div className="w-24 h-24 bg-white dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center text-gray-300 mb-8 shadow-inner">
                                            <Award size={48} className="opacity-20" />
                                        </div>
                                        <h4 className="text-lg font-black font-fraunces text-gray-900 dark:text-white uppercase tracking-tight mb-2">Propositions Offline</h4>
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] italic max-w-xs leading-relaxed">
                                            Section keunggulan masih kosong. Berikan alasan kuat bagi audiens untuk memilih MI Alfalah.
                                        </p>
                                    </motion.div>
                                ) : (
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {items.map((item, idx) => {
                                            const IconComp = ICON_OPTIONS.find(i => i.name === item.icon)?.icon || Star;
                                            return (
                                                <motion.div 
                                                    key={item.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="group/card relative overflow-hidden rounded-[3rem] border bg-white dark:bg-white/5 border-gray-100 dark:border-white/5 p-8 transition-all hover:shadow-2xl hover:-translate-y-1 shadow-xl shadow-gray-200/20"
                                                >
                                                    <div className="flex items-center justify-between mb-8">
                                                        <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-[1.75rem] text-emerald-600 shadow-inner group-hover/card:rotate-12 transition-transform duration-700 ring-4 ring-emerald-500/5">
                                                            <IconComp size={24} />
                                                        </div>
                                                        <div className="px-3 py-1 bg-gray-50 dark:bg-black/40 rounded-lg text-[9px] font-black text-gray-400 uppercase tracking-widest shadow-sm">
                                                            Pos: {item.order}
                                                        </div>
                                                    </div>

                                                    <h3 className="text-xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-tight mb-3 line-clamp-1">{item.title}</h3>
                                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 line-clamp-3 uppercase tracking-tight italic mb-8">
                                                        {item.description || 'No specialized description protocol.'}
                                                    </p>

                                                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/5 mt-6">
                                                        <button 
                                                            onClick={() => openEditModal(item)}
                                                            className="p-3 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 hover:bg-emerald-600 hover:text-white transition-all shadow-sm group/btn text-gray-400 hover:text-white"
                                                        >
                                                            <Edit2 size={16} className="group-hover/btn:rotate-12" />
                                                        </button>
                                                        <button 
                                                             onClick={() => handleDelete(item.id)}
                                                            className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Integrated Advisory Section */}
                     <div className="p-10 bg-black dark:bg-[#050706] rounded-[3.5rem] text-white overflow-hidden relative group border border-white/5">
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 shadow-inner group-hover:rotate-12 transition-all duration-700">
                                    <ShieldCheck size={28} />
                                </div>
                                <div className="max-w-2xl">
                                    <p className="text-[10px] font-black font-fraunces text-emerald-500 uppercase tracking-[0.3em] mb-1.5 leading-none">Value Proposition Advisory</p>
                                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed italic">
                                        Highlights dirancang untuk memperjelas identitas madrasah. Gunakan <strong className="text-white">ikon yang relevan</strong> dan deskripsi maksimal 120 karakter untuk menjaga keseimbangan visual grid di perangkat mobile.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-10 shrink-0">
                                <div className="text-center">
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 leading-none">Conversion</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-xs font-black text-white uppercase tracking-widest leading-none">OPTIMIZED</p>
                                    </div>
                                </div>
                                <div className="w-px h-10 bg-white/10" />
                                <div className="text-center">
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 leading-none">Global State</p>
                                    <p className="text-xs font-black text-white uppercase tracking-widest leading-none">ACTIVE</p>
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
                            className="relative w-full max-w-4xl bg-white/90 dark:bg-[#151b18]/90 backdrop-blur-3xl rounded-[4rem] border border-white dark:border-white/10 shadow-3xl overflow-hidden font-sans"
                        >
                            <div className="p-10 lg:p-14 overflow-y-auto max-h-[90vh] custom-scrollbar">
                                <div className="flex items-center justify-between mb-16">
                                     <div className="flex items-center gap-6">
                                        <div className="p-4 bg-emerald-600 rounded-3xl text-white shadow-2xl shadow-emerald-600/20">
                                            <Sparkles size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none mb-2">
                                                {editingId ? 'Modify Value Proposition' : 'Initialize Proposition'}
                                            </h3>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none px-1">Blueprint Konfigurasi Highlight</p>
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
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4 flex items-center gap-3 transition-colors group-focus-within:text-emerald-500">
                                                <Type size={12} /> PROPOSITION TITLE
                                            </label>
                                            <input
                                                value={form.title}
                                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                                className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/40 px-6 py-5 text-sm font-black text-gray-950 dark:text-white focus:ring-4 focus:ring-emerald-500/5 outline-none shadow-inner transition-all border-emerald-500/0 focus:border-emerald-500"
                                                placeholder="e.g. Kurikulum Berbasis Adab"
                                            />
                                        </div>
                                        <div className="space-y-4 group">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4 flex items-center gap-3">
                                                <AlignLeft size={12} /> DESCRIPTION PROTOCOL
                                            </label>
                                            <textarea
                                                value={form.description}
                                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                                rows={5}
                                                className="w-full rounded-[2.5rem] border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/40 px-8 py-6 text-sm font-bold text-gray-950 dark:text-white focus:ring-4 focus:ring-emerald-500/5 outline-none shadow-inner transition-all font-sans"
                                                placeholder="Berikan detail singkat mengenai keunggulan ini..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-10">
                                        <div className="space-y-6">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4 flex items-center gap-3">
                                                <Square size={12} /> SYMBOLIC SELECTION
                                            </label>
                                            <div className="grid grid-cols-3 gap-4 bg-gray-50/50 dark:bg-black/40 p-6 rounded-[2.5rem] border border-gray-100 dark:border-white/5">
                                                {ICON_OPTIONS.map((icon) => {
                                                    const IconItem = icon.icon;
                                                    const isSelected = form.icon === icon.name;
                                                    return (
                                                        <button
                                                            key={icon.name}
                                                            onClick={() => setForm({ ...form, icon: icon.name })}
                                                            className={`p-5 rounded-2xl flex flex-col items-center gap-3 transition-all ${isSelected ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'bg-white dark:bg-black/40 text-gray-400 hover:bg-emerald-50 dark:hover:bg-white/5 hover:text-emerald-500'}`}
                                                        >
                                                            <IconItem size={20} />
                                                            <span className="text-[8px] font-black uppercase tracking-widest">{icon.name}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="space-y-4 group">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4 flex items-center gap-3">
                                                <Hash size={12} /> GRID POSITION
                                            </label>
                                            <input
                                                type="number"
                                                value={form.order}
                                                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                                                className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/40 px-6 py-5 text-sm font-black text-gray-950 dark:text-white outline-none"
                                                placeholder="Order index"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-20 flex flex-col sm:flex-row items-center justify-end gap-6 border-t border-gray-100 dark:border-white/5 pt-12">
                                    <button 
                                        onClick={() => setIsModalOpen(false)}
                                        className="w-full sm:w-auto px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-100 dark:hover:bg-black/40 transition-all font-sans"
                                    >
                                        TERMINATE
                                    </button>
                                    <button 
                                        onClick={handleSubmit}
                                        disabled={!form.title || !form.description || saving}
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
                                                COMMIT PROPOSITION
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

export default KelolaHighlightsPage;
