import React, { useState, useEffect, useMemo } from 'react';
import { Image as ImageIcon, Edit2, Trash2, Layout, CheckCircle2, X, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MediaUploadButton from '@/components/admin/MediaUploadButton';
import type { PPDBWave, BrochureItem } from '../types';

interface BrosurViewProps {
    waves: PPDBWave[];
}

export const BrosurView: React.FC<BrosurViewProps> = ({ waves }) => {
    const [brochures, setBrochures] = useState<BrochureItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [brochureForm, setBrochureForm] = useState({
        waveId: '',
        mediaUrl: '',
        caption: '',
        displayOrder: 0,
        isMain: false,
    });
    const [editingBrochureId, setEditingBrochureId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchBrochures = async () => {
        try {
            const res = await fetch('/api/admin/ppdb-brochures');
            const data = await res.json();
            const mapped = (Array.isArray(data) ? data : []).map((b: any) => ({
                id: b.id,
                entityId: b.entityId,
                mediaUrl: b.mediaUrl,
                caption: b.caption,
                displayOrder: b.displayOrder ?? 0,
                isMain: Boolean(b.isMain),
                createdAt: b.createdAt,
            }));
            setBrochures(mapped);
        } catch (error) {
            console.error('Failed to fetch brochures', error);
        }
    };

    useEffect(() => {
        fetchBrochures();
    }, []);

    const waveMap = useMemo(() => new Map(waves.map((w) => [w.id, w.name])), [waves]);

    const openCreateModal = () => {
        setEditingBrochureId(null);
        setBrochureForm({ waveId: '', mediaUrl: '', caption: '', displayOrder: 0, isMain: false });
        setIsModalOpen(true);
    };

    const saveBrochure = async () => {
        if (!brochureForm.waveId || !brochureForm.mediaUrl) return;
        setIsLoading(true);
        try {
            const payload = {
                waveId: brochureForm.waveId,
                mediaUrl: brochureForm.mediaUrl,
                caption: brochureForm.caption,
                displayOrder: Number(brochureForm.displayOrder) || 0,
                isMain: brochureForm.isMain,
            };
            const method = editingBrochureId ? 'PUT' : 'POST';
            const url = editingBrochureId ? `/api/admin/ppdb-brochures/${editingBrochureId}` : '/api/admin/ppdb-brochures';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                setIsModalOpen(false);
                setEditingBrochureId(null);
                setBrochureForm({ waveId: '', mediaUrl: '', caption: '', displayOrder: 0, isMain: false });
                fetchBrochures();
            }
        } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };

    const editBrochure = (item: BrochureItem) => {
        setEditingBrochureId(item.id);
        setBrochureForm({
            waveId: item.entityId,
            mediaUrl: item.mediaUrl,
            caption: item.caption || '',
            displayOrder: item.displayOrder ?? 0,
            isMain: item.isMain,
        });
        setIsModalOpen(true);
    };

    const deleteBrochure = async (id: string) => {
        if (!confirm('Hapus brosur ini?')) return;
        await fetch(`/api/admin/ppdb-brochures/${id}`, { method: 'DELETE' });
        fetchBrochures();
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-[#151b18]/90 border border-gray-200 dark:border-white/10 p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] shadow-sm">
                <div className="flex items-center gap-4 sm:gap-5">
                    <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-2xl sm:rounded-[22px] bg-sky-100 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex justify-center items-center shadow-inner shrink-0">
                        <ImageIcon size={28} className="sm:size-8" />
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black font-fraunces text-slate-900 dark:text-white leading-tight">Brosur PPDB</h3>
                        <p className="text-[10px] sm:text-sm font-medium text-slate-500">Kelola banner promosi digital.</p>
                    </div>
                </div>
                <button 
                    onClick={openCreateModal}
                    className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl text-[10px] sm:text-sm font-black uppercase tracking-widest shadow-xl shadow-sky-600/20 transition-all active:scale-95"
                >
                    <PlusCircle size={18} className="sm:size-5" /> Tambah Brosur
                </button>
            </div>

            {/* Grid View */}
            {brochures.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 rounded-3xl border-2 border-dashed border-gray-100 dark:border-white/5 text-slate-400">
                    <ImageIcon size={40} className="mb-3 opacity-10" />
                    <p className="text-xs font-black uppercase tracking-widest opacity-30">Belum ada brosur</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                    {brochures.map((item) => (
                        <motion.div 
                            key={item.id}
                            layout
                            className="group relative bg-white dark:bg-[#1a231d] rounded-[32px] sm:rounded-[40px] border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden"
                        >
                            <div className="aspect-[3/4] relative overflow-hidden">
                                <img src={item.mediaUrl} alt={item.caption || 'Brosur'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                                {item.isMain && (
                                    <div className="absolute top-4 sm:top-6 left-4 sm:left-6 flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-500 text-white rounded-full text-[8px] sm:text-[10px] font-black tracking-widest shadow-lg">
                                        <CheckCircle2 size={12} /> UTAMA
                                    </div>
                                )}
                                <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 text-white transform group-hover:translate-y-[-4px] transition-transform duration-500">
                                    <h4 className="font-black text-lg sm:text-xl font-fraunces line-clamp-1 leading-tight">{item.caption || 'Tanpa Judul'}</h4>
                                    <p className="text-[8px] sm:text-[10px] text-sky-400 font-black uppercase tracking-widest mt-1.5 sm:mt-2 flex items-center gap-2">
                                        <Layout size={10} className="sm:size-3" /> {waveMap.get(item.entityId) || 'Umum'}
                                    </p>
                                </div>
                                <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 ease-out md:opacity-0 lg:group-hover:opacity-100">
                                    <button onClick={() => editBrochure(item)} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/95 text-slate-700 hover:bg-sky-600 hover:text-white flex items-center justify-center transition-all"><Edit2 size={16} /></button>
                                    <button onClick={() => deleteBrochure(item.id)} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/95 text-rose-600 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-all"><Trash2 size={16} /></button>
                                </div>
                                {/* Mobile Persistent Actions */}
                                <div className="absolute top-4 right-4 flex lg:hidden gap-2">
                                     <button onClick={() => editBrochure(item)} className="p-2 sm:p-2.5 bg-white/90 rounded-xl text-slate-900 shadow-xl border border-white/20"><Edit2 size={14}/></button>
                                     <button onClick={() => deleteBrochure(item.id)} className="p-2 sm:p-2.5 bg-white/90 rounded-xl text-rose-600 shadow-xl border border-white/20"><Trash2 size={14}/></button>
                                </div>
                            </div>
                            <div className="p-4 sm:p-6 flex items-center justify-between text-[8px] sm:text-[10px] font-black text-slate-400 tracking-widest border-t border-gray-50 dark:border-white/5 uppercase">
                                <span className="px-2 sm:px-3 py-1 rounded-lg bg-slate-50 dark:bg-black/40">Order #{item.displayOrder}</span>
                                <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID') : ''}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* MODAL */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 pointer-events-none">
                            <div className="w-full max-w-xl bg-white dark:bg-[#151b18] rounded-[32px] sm:rounded-[40px] shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col pointer-events-auto max-h-[95vh]">
                                <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-black/20 shrink-0">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl sm:rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0">
                                            {editingBrochureId ? <Edit2 size={24} /> : <PlusCircle size={24} />}
                                        </div>
                                        <h3 className="text-lg sm:text-2xl font-black font-fraunces text-slate-900 dark:text-white leading-tight">{editingBrochureId ? 'Update' : 'Baru'}</h3>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} className="w-8 sm:w-10 h-8 sm:h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center text-slate-400 transition-colors shrink-0"><X size={20} /></button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 admin-scrollbar">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                        <div className="col-span-1 sm:col-span-2">
                                            <label className="block text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Caption</label>
                                            <input type="text" value={brochureForm.caption} onChange={(e) => setBrochureForm({ ...brochureForm, caption: e.target.value })} className="w-full rounded-2xl sm:rounded-[20px] border border-gray-200 bg-slate-50 px-5 sm:px-6 py-3.5 sm:py-4 text-xs sm:text-sm font-bold focus:ring-4 focus:ring-sky-500/10 outline-none transition-all dark:border-white/10 dark:bg-black/30 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Gelombang</label>
                                            <select value={brochureForm.waveId} onChange={(e) => setBrochureForm({ ...brochureForm, waveId: e.target.value })} className="w-full rounded-2xl sm:rounded-[20px] border border-gray-200 bg-slate-50 px-5 py-3.5 sm:py-4 text-xs sm:text-sm font-bold focus:ring-4 focus:ring-sky-500/10 outline-none transition-all dark:border-white/10 dark:bg-black/30 dark:text-white"><option value="">Pilih...</option>{waves.map((wave) => (<option key={wave.id} value={wave.id}>{wave.name.toUpperCase()}</option>))}</select>
                                        </div>
                                        <div>
                                            <label className="block text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Order</label>
                                            <input type="number" value={brochureForm.displayOrder} onChange={(e) => setBrochureForm({ ...brochureForm, displayOrder: Number(e.target.value) })} className="w-full rounded-2xl sm:rounded-[20px] border border-gray-200 bg-slate-50 px-5 sm:px-6 py-3.5 sm:py-4 text-xs sm:text-sm font-bold focus:ring-4 focus:ring-sky-500/10 outline-none transition-all dark:border-white/10 dark:bg-black/30 dark:text-white" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="block text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Gambar</label>
                                        <MediaUploadButton folder="mis-al-falah/ppdb/brosur" label={brochureForm.mediaUrl ? 'Ganti' : 'Unggah'} onUploaded={(url) => setBrochureForm({ ...brochureForm, mediaUrl: url })} className="w-full py-4 text-[10px] font-black" />
                                        {brochureForm.mediaUrl && (<div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-emerald-500/20 shadow-lg"><img src={brochureForm.mediaUrl} alt="Preview" className="w-full h-full object-cover" /></div>)}
                                    </div>
                                    <button onClick={saveBrochure} disabled={isLoading || !brochureForm.mediaUrl || !brochureForm.waveId} className="w-full rounded-[24px] bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white px-8 py-4 sm:py-5 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-sky-600/20 transition-all active:scale-95 flex items-center justify-center gap-3 mt-4">{isLoading ? 'Loading...' : (editingBrochureId ? 'Update' : 'Publish')} Brosur</button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
