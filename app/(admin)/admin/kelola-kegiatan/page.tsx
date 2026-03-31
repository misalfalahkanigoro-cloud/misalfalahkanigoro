'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SidebarAdmin from '@/components/sidebar-admin';
import HeaderAdmin from '@/components/header-admin';
import { 
    Plus, Save, Trash2, Edit2, X, RefreshCcw, 
    CheckCircle2, AlertCircle, Info, Zap,
    Image as ImageIcon, Upload, Eye,
    Type, MousePointer2, Sparkles, Activity,
    ShieldCheck, Link2, Ghost,
    Dribbble, Palette, ExternalLink
} from 'lucide-react';
import { api } from '@/lib/api';

type ActivityForm = {
    id?: number;
    title: string;
    imageUrl?: string | null;
    isActive: boolean;
};

const DEFAULT_FORM: ActivityForm = {
    title: '',
    imageUrl: '',
    isActive: true,
};

const AdminKegiatanPage: React.FC = () => {
    const [items, setItems] = useState<ActivityForm[]>([]);
    const [form, setForm] = useState<ActivityForm>(DEFAULT_FORM);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/activities');
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch activities', error);
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

    const openEditModal = (item: ActivityForm) => {
        setEditingId(item.id || null);
        setForm({
            ...item,
            imageUrl: item.imageUrl || '',
            isActive: item.isActive ?? true,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const url = editingId ? `/api/admin/activities/${editingId}` : '/api/admin/activities';
            const method = editingId ? 'PUT' : 'POST';
            const res = await fetch(url, { 
                method, 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(form) 
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Gagal menyimpan data kegiatan');
            }
            setIsModalOpen(false);
            fetchItems();
            setMessage({ text: 'Blueprint kegiatan berhasil diperbarui.', type: 'success' });
            setTimeout(() => setMessage(null), 5000);
        } catch (error: any) {
            setMessage({ text: error.message || 'Kegagalan komunikasi server.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id?: number) => {
        if (!id) return;
        if (!confirm('Hapus entitas kegiatan ini dari inventaris publik?')) return;
        try {
            await fetch(`/api/admin/activities/${id}`, { method: 'DELETE' });
            fetchItems();
            setMessage({ text: 'Entitas telah dihapus permanen.', type: 'success' });
        } catch (error) {
            setMessage({ text: 'Gagal memproses penghapusan.', type: 'error' });
        }
    };

    const handleUpload = async (file: File) => {
        setUploading(true);
        try {
            const res = await api.upload.media(file, 'mis-al-falah/activities', form.imageUrl || undefined);
            setForm((prev) => ({ ...prev, imageUrl: res.mediaUrl || res.url }));
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
                    title="Activity & Programs"
                    subtitle="Manajemen ekstrakurikuler, program unggulan, dan portofolio kegiatan madrasah"
                    action={
                        <div className="bg-emerald-500/10 dark:bg-emerald-500/10 px-8 py-3 rounded-2xl flex items-center gap-4 border border-emerald-500/20 shadow-inner group overflow-hidden relative text-emerald-600">
                             <div className="absolute inset-0 bg-emerald-500/5 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            <Sparkles size={18} className="animate-pulse" />
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black tracking-[0.2em] uppercase leading-none mb-1">Activities Hub</span>
                                <span className="text-[8px] font-black tracking-widest uppercase leading-none italic">Display Sync: ON</span>
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
                                    <Dribbble size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none mb-2">Internal Inventory</h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] italic">
                                        Daftar program & kegiatan ({items.length})
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={openAddModal}
                                className="inline-flex items-center gap-4 bg-emerald-600 text-white px-8 py-4 rounded-[1.75rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-500/30 hover:bg-emerald-500 hover:-translate-y-1 active:scale-95 group"
                            >
                                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" /> ATTACH NEW PROGRAM
                            </button>
                        </div>

                        <div className="p-10 lg:p-14">
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                                        <RefreshCcw size={48} className="text-emerald-500 animate-spin mb-4" />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Accessing Program Grid...</p>
                                    </div>
                                ) : items.length === 0 ? (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center justify-center py-24 text-center bg-gray-50/50 dark:bg-black/20 rounded-[3rem] border border-dashed border-gray-100 dark:border-white/5"
                                    >
                                        <div className="w-24 h-24 bg-white dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center text-gray-300 mb-8 shadow-inner">
                                            <Dribbble size={48} className="opacity-20" />
                                        </div>
                                        <h4 className="text-lg font-black font-fraunces text-gray-900 dark:text-white uppercase tracking-tight mb-2">Program Catalog Empty</h4>
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] italic max-w-xs leading-relaxed">
                                            Kegiatan ekstrakurikuler atau program unggulan belum didaftarkan. Katalog ini penting untuk daya tarik calon wali santri.
                                        </p>
                                    </motion.div>
                                ) : (
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                        {items.map((item, idx) => (
                                            <motion.div 
                                                key={item.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className={`group/card relative overflow-hidden rounded-[3rem] border bg-white dark:bg-white/5 border-gray-100 dark:border-white/5 p-6 transition-all hover:shadow-2xl hover:-translate-y-1 shadow-xl shadow-gray-200/20 ${!item.isActive && 'grayscale opacity-60'}`}
                                            >
                                                <div className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/5 mb-6 group-hover/card:scale-[1.03] transition-transform duration-700">
                                                    {item.imageUrl ? (
                                                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <ImageIcon size={32} />
                                                        </div>
                                                    )}
                                                    <div className="absolute top-4 right-4">
                                                        <div className={`w-3 h-3 rounded-full border-2 border-white dark:border-black/50 ${item.isActive ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-gray-400'}`} />
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h3 className="text-lg font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-tight line-clamp-1">{item.title}</h3>
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">{item.isActive ? 'OPERATIONAL' : 'DECOMMISSIONED'}</p>
                                                </div>

                                                <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/5 mt-6">
                                                    <div className="flex items-center gap-3 w-full">
                                                        <button 
                                                            onClick={() => openEditModal(item)}
                                                            className="flex-1 py-3 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 hover:bg-emerald-600 hover:text-white transition-all shadow-sm group/btn text-gray-400 hover:text-white flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
                                                        >
                                                            <Edit2 size={14} className="group-hover/btn:rotate-12" /> EDIT
                                                        </button>
                                                        <button 
                                                             onClick={() => handleDelete(item.id)}
                                                            className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
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

                    {/* Integrated Advisory Section */}
                     <div className="p-10 bg-black dark:bg-[#050706] rounded-[3.5rem] text-white overflow-hidden relative group border border-white/5">
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 shadow-inner group-hover:rotate-12 transition-all duration-700">
                                    <ShieldCheck size={28} />
                                </div>
                                <div className="max-w-2xl">
                                    <p className="text-[10px] font-black font-fraunces text-emerald-500 uppercase tracking-[0.3em] mb-1.5 leading-none">Activity Management Policy</p>
                                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed italic">
                                        Untuk integritas tampilan katalog, gunakan gambar berasio <strong className="text-white">1:1 (Square)</strong> dengan resolusi minimal 500x500px. Kegiatan yang tidak aktif akan disembunyikan dari grid publik namun tetap tersimpan di inventaris.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-10 shrink-0">
                                <div className="text-center">
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 leading-none">Catalog Status</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-xs font-black text-white uppercase tracking-widest leading-none">SYNCHRONIZED</p>
                                    </div>
                                </div>
                                <div className="w-px h-10 bg-white/10" />
                                <div className="text-center">
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 leading-none">Visual Sync</p>
                                    <p className="text-xs font-black text-white uppercase tracking-widest leading-none">AUTO-RESIZE</p>
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
                                                {editingId ? 'Refine activity Node' : 'Initialize activity Node'}
                                            </h3>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none px-1">Blueprint Konfigurasi Program & Kegiatan</p>
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
                                        {/* Image Asset Area */}
                                        <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-gray-50/50 dark:bg-black/40 border border-dashed border-gray-200 dark:border-white/10 group/upload flex items-center justify-center">
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
                                                        {uploading ? 'PROCESING ASSET...' : 'TARGET ASSET REQUIRED'}
                                                    </p>
                                                    <label className="cursor-pointer bg-emerald-600 text-white px-12 py-6 rounded-[1.75rem] text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 shadow-2xl shadow-emerald-500/30 transition-all flex items-center gap-4 active:scale-95">
                                                        <Upload size={18} /> INITIALIZE UPLOAD
                                                        <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-10 flex flex-col justify-center">
                                        <div className="space-y-4 group">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4 flex items-center gap-3 transition-colors group-focus-within:text-emerald-500">
                                                <Type size={12} /> PROGRAM TITLE
                                            </label>
                                            <input
                                                value={form.title}
                                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                                className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/40 px-6 py-5 text-sm font-black text-gray-950 dark:text-white focus:ring-4 focus:ring-emerald-500/5 outline-none shadow-inner transition-all border-emerald-500/0 focus:border-emerald-500"
                                                placeholder="e.g. Ekstrakurikuler Memanah"
                                            />
                                        </div>

                                        <div className="p-10 rounded-[2.5rem] bg-gray-50/50 dark:bg-black/40 border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center gap-6">
                                            <div className={`p-4 rounded-2xl transition-all ${form.isActive ? 'bg-emerald-600 text-white shadow-2xl shadow-emerald-600/20' : 'bg-gray-200 text-gray-400'}`}>
                                                <Activity size={24} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] font-black text-gray-950 dark:text-white uppercase tracking-widest leading-none mb-1">Status Protocol</p>
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

                                        <div className="p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-4">
                                             <Info size={16} className="text-emerald-600 shrink-0" />
                                             <p className="text-[9px] font-bold text-emerald-700/70 uppercase tracking-widest leading-relaxed">
                                                 Tampilan pada katalog publik akan disesuaikan secara otomatis untuk menjaga harmoni visual layout grid.
                                             </p>
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
                                        disabled={!form.title || !form.imageUrl || saving}
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
                                                COMMIT ACTIVITY DATA
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

export default AdminKegiatanPage;
