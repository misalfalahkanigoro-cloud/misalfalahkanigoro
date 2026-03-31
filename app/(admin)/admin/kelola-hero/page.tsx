'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SidebarAdmin from '@/components/sidebar-admin';
import HeaderAdmin from '@/components/header-admin';
import { 
    Plus, Save, Trash2, Edit2, X, RefreshCcw, 
    CheckCircle2, AlertCircle, Info, Zap,
    Image as ImageIcon, Upload, Star, Move,
    Type, AlignLeft, Sparkles, Activity,
    Eye, ExternalLink, ShieldCheck, Hash
} from 'lucide-react';
import { api } from '@/lib/api';

type HeroSlide = {
    id?: number;
    imageUrl: string;
    title: string;
    subtitle: string;
    order: number;
    isActive: boolean;
};

const DEFAULT_FORM: HeroSlide = {
    imageUrl: '',
    title: '',
    subtitle: '',
    order: 1,
    isActive: true,
};

const KelolaHeroSlidesPage: React.FC = () => {
    const [items, setItems] = useState<HeroSlide[]>([]);
    const [form, setForm] = useState<HeroSlide>(DEFAULT_FORM);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/hero-slides');
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch hero slides', error);
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

    const openEditModal = (item: HeroSlide) => {
        setEditingId(item.id || null);
        setForm({
            imageUrl: item.imageUrl || '',
            title: item.title || '',
            subtitle: item.subtitle || '',
            order: Number(item.order) || 0,
            isActive: item.isActive ?? true,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const payload = { ...form, order: Number(form.order) || 0 };
            const url = editingId ? `/api/admin/hero-slides/${editingId}` : '/api/admin/hero-slides';
            const method = editingId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Gagal menyimpan hero slide');
            }
            setIsModalOpen(false);
            fetchItems();
            setMessage({ text: 'Visual asset berhasil disinkronkan.', type: 'success' });
            setTimeout(() => setMessage(null), 5000);
        } catch (error: any) {
            setMessage({ text: error.message || 'Kegagalan transmisi data.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id?: number) => {
        if (!id) return;
        if (!confirm('Hapus slide ini dari layar utama?')) return;
        try {
            await fetch(`/api/admin/hero-slides/${id}`, { method: 'DELETE' });
            fetchItems();
            setMessage({ text: 'Asset telah dihapus permanen.', type: 'success' });
        } catch (error) {
            setMessage({ text: 'Gagal memproses penghapusan.', type: 'error' });
        }
    };

    const handleUpload = async (file: File) => {
        setUploading(true);
        try {
            const res = await api.upload.media(file, 'hero', form.imageUrl);
            setForm((prev) => ({ ...prev, imageUrl: res.mediaUrl || res.url || '' }));
        } catch (error) {
            console.error('Upload failed', error);
            alert('Upload gagal. Periksa koneksi storage.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080B09] text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">
            <SidebarAdmin />
            <main className="min-h-screen lg:pl-64 pb-24">
                <HeaderAdmin 
                    title="Hero Visual Engine"
                    subtitle="Manajemen slider utama, narasi visual, dan impresi pertama pengunjung"
                    action={
                        <div className="bg-emerald-500/10 dark:bg-emerald-500/10 px-8 py-3 rounded-2xl flex items-center gap-4 border border-emerald-500/20 shadow-inner group overflow-hidden relative text-emerald-600">
                             <div className="absolute inset-0 bg-emerald-500/5 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            <Sparkles size={18} className="animate-pulse" />
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black tracking-[0.2em] uppercase leading-none mb-1">Visual Core</span>
                                <span className="text-[8px] font-black tracking-widest uppercase leading-none italic">Immersive Mode: ON</span>
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
                                    <ImageIcon size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none mb-2">Display Inventory</h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] italic">
                                        Asset slider aktif ({items.length})
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={openAddModal}
                                className="inline-flex items-center gap-4 bg-emerald-600 text-white px-8 py-4 rounded-[1.75rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-500/30 hover:bg-emerald-500 hover:-translate-y-1 active:scale-95 group"
                            >
                                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" /> ATTACH NEW SLIDE
                            </button>
                        </div>

                        <div className="p-10 lg:p-14">
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                                        <RefreshCcw size={48} className="text-emerald-500 animate-spin mb-4" />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Accessing Visual Grid...</p>
                                    </div>
                                ) : items.length === 0 ? (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center justify-center py-24 text-center bg-gray-50/50 dark:bg-black/20 rounded-[3rem] border border-dashed border-gray-100 dark:border-white/5"
                                    >
                                        <div className="w-24 h-24 bg-white dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center text-gray-300 mb-8 shadow-inner">
                                            <ImageIcon size={48} className="opacity-20" />
                                        </div>
                                        <h4 className="text-lg font-black font-fraunces text-gray-900 dark:text-white uppercase tracking-tight mb-2">Visual Void Detected</h4>
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] italic max-w-xs leading-relaxed">
                                            Beranda tidak memiliki slider visual. Segera unggah asset untuk memperkuat identitas sekolah.
                                        </p>
                                    </motion.div>
                                ) : (
                                    <div className="grid gap-8 md:grid-cols-2">
                                        {items.map((item, idx) => (
                                            <motion.div 
                                                key={item.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className={`group/card relative overflow-hidden rounded-[3rem] border p-1 transition-all hover:shadow-2xl hover:-translate-y-1 ${item.isActive ? 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/20' : 'bg-gray-50/50 dark:bg-black/20 border-gray-100 dark:border-white/5 grayscale opacity-60'}`}
                                            >
                                                <div className="relative aspect-[21/9] rounded-[2.75rem] overflow-hidden bg-gray-100 dark:bg-black/40 border border-gray-100 dark:border-white/5 group-hover/card:scale-[1.01] transition-transform duration-700">
                                                    {item.imageUrl ? (
                                                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <ImageIcon size={48} />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 lg:p-10">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className="px-3 py-1 bg-emerald-500 rounded-lg text-[9px] font-black text-white uppercase tracking-widest shadow-lg">
                                                                #{item.order}
                                                            </div>
                                                            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest italic">{item.isActive ? 'OPERATIONAL' : 'DECOMMISSIONED'}</span>
                                                        </div>
                                                        <h3 className="text-2xl font-black font-fraunces text-white uppercase tracking-tight leading-tight mb-1 line-clamp-1">{item.title || 'Untitled Slide'}</h3>
                                                        <p className="text-xs font-bold text-white/70 line-clamp-1 uppercase tracking-tight italic">{item.subtitle || 'No subtitle hash.'}</p>
                                                    </div>
                                                </div>

                                                <div className="p-8 lg:p-10 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-3 h-3 rounded-full ${item.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Node Status</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button 
                                                            onClick={() => openEditModal(item)}
                                                            className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 hover:bg-emerald-600 hover:text-white transition-all shadow-xl group/btn"
                                                        >
                                                            <Edit2 size={18} className="group-hover/btn:rotate-12" />
                                                        </button>
                                                        <button 
                                                             onClick={() => handleDelete(item.id)}
                                                            className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-xl active:scale-90"
                                                        >
                                                            <Trash2 size={18} />
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

                    {/* Integrated Advisory Section */}
                     <div className="p-10 bg-black dark:bg-[#050706] rounded-[3.5rem] text-white overflow-hidden relative group border border-white/5">
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 shadow-inner group-hover:rotate-12 transition-all duration-700">
                                    <ShieldCheck size={28} />
                                </div>
                                <div className="max-w-2xl">
                                    <p className="text-[10px] font-black font-fraunces text-emerald-500 uppercase tracking-[0.3em] mb-1.5 leading-none">Visual Protocol Advisory</p>
                                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed italic">
                                        Untuk kualitas visual premium, gunakan gambar dengan resolusi <strong className="text-white">1920x800px</strong>. Pastikan subjek utama berada di tengah untuk menjaga integritas tampilan pada perangkat mobile.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-10 shrink-0">
                                <div className="text-center">
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 leading-none">Integrity</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-xs font-black text-white uppercase tracking-widest leading-none">99.9% SECURE</p>
                                    </div>
                                </div>
                                <div className="w-px h-10 bg-white/10" />
                                <div className="text-center">
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 leading-none">CDN Sync</p>
                                    <p className="text-xs font-black text-white uppercase tracking-widest leading-none">CLOUDFLARE R2</p>
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
                            className="relative w-full max-w-5xl bg-white/90 dark:bg-[#151b18]/90 backdrop-blur-3xl rounded-[4rem] border border-white dark:border-white/10 shadow-3xl overflow-hidden font-sans"
                        >
                            <div className="p-10 lg:p-14 overflow-y-auto max-h-[90vh] custom-scrollbar">
                                <div className="flex items-center justify-between mb-16">
                                     <div className="flex items-center gap-6">
                                        <div className="p-4 bg-emerald-600 rounded-3xl text-white shadow-2xl shadow-emerald-600/20">
                                            <Sparkles size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none mb-2">
                                                {editingId ? 'Modify Visual Node' : 'Initialize Visual Node'}
                                            </h3>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none px-1">Blueprint Konfigurasi Hero Slide</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-50 dark:bg-black/40 hover:bg-red-500 hover:text-white transition-all border border-gray-100 dark:border-white/5 active:scale-90"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="grid lg:grid-cols-12 gap-12">
                                    <div className="lg:col-span-12 space-y-10">
                                        {/* Image Upload Area */}
                                        <div className="relative aspect-[21/9] rounded-[3rem] overflow-hidden bg-gray-50/50 dark:bg-black/40 border border-dashed border-gray-200 dark:border-white/10 group/upload flex items-center justify-center">
                                            {form.imageUrl ? (
                                                <div className="relative w-full h-full">
                                                    <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/upload:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                                                        <label className="cursor-pointer bg-white text-black px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-110 active:scale-95 transition-all flex items-center gap-4">
                                                            <Upload size={18} /> SWAP ASSET
                                                            <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                                                        </label>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <div className="p-8 bg-white dark:bg-white/5 rounded-3xl text-gray-300 mb-6 shadow-xl border border-gray-100 dark:border-white/5">
                                                        {uploading ? <RefreshCcw size={48} className="animate-spin text-emerald-500" /> : <Upload size={48} className="group-hover/upload:scale-110 transition-transform" />}
                                                    </div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8">
                                                        {uploading ? 'DIGITALIZING ASSET...' : 'DRAG & DROP OR EXPLORE'}
                                                    </p>
                                                    <label className="cursor-pointer bg-emerald-600 text-white px-12 py-6 rounded-[1.75rem] text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 shadow-2xl shadow-emerald-500/30 transition-all flex items-center gap-4 active:scale-95">
                                                        <Upload size={18} /> INITIALIZE UPLOAD
                                                        <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="lg:col-span-8 space-y-10">
                                        <div className="space-y-4 group">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4 flex items-center gap-3">
                                                <Type size={12} /> PRIMARY HEADING
                                            </label>
                                            <input
                                                value={form.title}
                                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                                className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/40 px-6 py-5 text-sm font-black text-gray-950 dark:text-white focus:ring-4 focus:ring-emerald-500/5 outline-none shadow-inner transition-all border-emerald-500/0 focus:border-emerald-500"
                                                placeholder="e.g. Selamat Datang di MI Alfalah"
                                            />
                                        </div>
                                        <div className="space-y-4 group">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4 flex items-center gap-3">
                                                <AlignLeft size={12} /> SUBHEADING / ACCENT
                                            </label>
                                            <textarea
                                                value={form.subtitle}
                                                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                                                rows={4}
                                                className="w-full rounded-[2rem] border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/40 px-6 py-5 text-sm font-bold text-gray-950 dark:text-white focus:ring-4 focus:ring-emerald-500/5 outline-none font-sans"
                                                placeholder="Deskripsi singkat slider..."
                                            />
                                        </div>
                                    </div>

                                    <div className="lg:col-span-4 space-y-10">
                                        <div className="space-y-4 group">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4 flex items-center gap-3">
                                                <Hash size={12} /> SEQUENCE ORDER
                                            </label>
                                            <input
                                                type="number"
                                                value={form.order}
                                                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                                                className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/40 px-6 py-5 text-sm font-black text-gray-950 dark:text-white outline-none"
                                            />
                                        </div>

                                        <div className="p-10 rounded-[2.5rem] bg-gray-50/50 dark:bg-black/40 border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center gap-6">
                                            <div className={`p-4 rounded-2xl transition-all ${form.isActive ? 'bg-emerald-600 text-white shadow-2xl shadow-emerald-600/20' : 'bg-gray-200 text-gray-400'}`}>
                                                <Activity size={24} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] font-black text-gray-950 dark:text-white uppercase tracking-widest mb-1">Status Protocol</p>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">{form.isActive ? 'OPERATIONAL' : 'DECOMMISSIONED'}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={form.isActive}
                                                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                                    className="sr-only peer" 
                                                />
                                                <div className="w-16 h-9 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-black/40 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-emerald-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-20 flex flex-col sm:flex-row items-center justify-end gap-6 border-t border-gray-100 dark:border-white/5 pt-12">
                                    <button 
                                        onClick={() => setIsModalOpen(false)}
                                        className="w-full sm:w-auto px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-100 dark:hover:bg-black/40 transition-all"
                                    >
                                        TERMINATE
                                    </button>
                                    <button 
                                        onClick={handleSubmit}
                                        disabled={!form.imageUrl || !form.title || saving}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-4 bg-emerald-600 text-white px-14 py-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-emerald-500/30 hover:bg-emerald-500 hover:-translate-y-1 active:scale-95 disabled:opacity-50 transition-all"
                                    >
                                        {saving ? (
                                            <>
                                                <RefreshCcw size={18} className="animate-spin" />
                                                SYNCHRONIZING...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 size={18} />
                                                COMMIT VISUAL DATA
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

export default KelolaHeroSlidesPage;
