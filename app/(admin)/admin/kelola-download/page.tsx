'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Save, Trash2, Upload, FileText, 
    Download as DownloadIcon, HardDrive, CheckCircle2, 
    AlertCircle, RefreshCw, X, Search, FileCode,
    FileImage, FileArchive, FileSpreadsheet, MoreVertical,
    CheckCircle, ShieldCheck
} from 'lucide-react';
import SidebarAdmin from '@/components/sidebar-admin';
import HeaderAdmin from '@/components/header-admin';
import { api, adminApi } from '@/lib/api';
import type { Download } from '@/lib/types';

type DownloadFileForm = {
    id?: string;
    downloadId: string;
    fileName: string;
    fileType: string;
    fileSizeKb: number | null;
    publicUrl: string;
    storagePath?: string;
    displayOrder: number;
};

const DEFAULT_FORM: DownloadFileForm = {
    downloadId: '',
    fileName: '',
    fileType: 'application/pdf',
    fileSizeKb: null,
    publicUrl: '',
    storagePath: '',
    displayOrder: 1,
};

const AdminDownloadFilesPage: React.FC = () => {
    const [items, setItems] = useState<DownloadFileForm[]>([]);
    const [downloads, setDownloads] = useState<Download[]>([]);
    const [form, setForm] = useState<DownloadFileForm>(DEFAULT_FORM);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/download-files');
            const data = await res.json();
            const mapped = (Array.isArray(data) ? data : []).map((item: any) => ({
                id: item.id,
                downloadId: item.download_id ?? item.downloadId ?? '',
                fileName: item.file_name ?? item.fileName ?? '',
                fileType: item.file_type ?? item.fileType ?? '',
                fileSizeKb: item.file_size_kb ?? item.fileSizeKb ?? null,
                publicUrl: item.public_url ?? item.publicUrl ?? '',
                storagePath: item.storage_path ?? item.storagePath ?? '',
                displayOrder: item.display_order ?? item.displayOrder ?? 0,
            }));
            setItems(mapped);
        } catch (e) {
            console.error('Failed to fetch items', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchDownloads = async () => {
        try {
            const res = await adminApi.getDownloads();
            const list = Array.isArray((res as any).items) ? (res as any).items : res;
            setDownloads(list || []);
            if (!form.downloadId && list?.[0]) {
                setForm((prev) => ({ ...prev, downloadId: list[0].id }));
            }
        } catch (e) {
            console.error('Failed to fetch downloads', e);
        }
    };

    useEffect(() => {
        fetchItems();
        fetchDownloads();
    }, []);

    const handleSubmit = async () => {
        if (!form.downloadId) return setMessage({ type: 'error', text: 'Pilih koleksi download tujuan.' });
        if (!form.publicUrl) return setMessage({ type: 'error', text: 'File belum diunggah.' });
        if (!form.fileName) return setMessage({ type: 'error', text: 'Nama file wajib diisi.' });

        setLoading(true);
        try {
            const url = editingId ? `/api/admin/download-files/${editingId}` : '/api/admin/download-files';
            const method = editingId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            
            if (res.ok) {
                setForm({ ...DEFAULT_FORM, downloadId: downloads[0]?.id || '' });
                setEditingId(null);
                setMessage({ type: 'success', text: editingId ? 'Lampiran diperbarui.' : 'Lampiran ditambahkan.' });
                fetchItems();
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Gagal menyimpan data.' });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleEdit = (item: DownloadFileForm) => {
        setEditingId(item.id || null);
        setForm({ ...item });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id?: string) => {
        if (!id || !confirm('Hapus lampiran ini?')) return;
        try {
            const res = await fetch(`/api/admin/download-files/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchItems();
                setMessage({ type: 'success', text: 'Lampiran dihapus.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Gagal menghapus.' });
        } finally {
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleUpload = async (file: File) => {
        setUploading(true);
        try {
            const res = await api.upload.file(file, 'downloads');
            setForm((prev) => ({
                ...prev,
                publicUrl: res.fileUrl,
                storagePath: res.path,
                fileType: res.fileType,
                fileSizeKb: res.fileSizeKb,
                fileName: prev.fileName || file.name,
            }));
            setMessage({ type: 'success', text: 'File siap diunggah.' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Unggahan gagal.' });
        } finally {
            setUploading(false);
            setTimeout(() => setMessage(null), 2000);
        }
    };

    const getFileIcon = (type: string) => {
        if (type.includes('pdf')) return <FileText size={24} className="text-red-500" />;
        if (type.includes('word') || type.includes('doc')) return <FileCode size={24} className="text-blue-500" />;
        if (type.includes('excel') || type.includes('sheet')) return <FileSpreadsheet size={24} className="text-emerald-500" />;
        if (type.includes('zip') || type.includes('rar')) return <FileArchive size={24} className="text-amber-500" />;
        if (type.includes('image')) return <FileImage size={24} className="text-purple-500" />;
        return <DownloadIcon size={24} className="text-gray-400" />;
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080B09] text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <SidebarAdmin />
            
            <main className="min-h-screen lg:pl-64 pb-20">
                <HeaderAdmin 
                    title="Repositori Berkas"
                    subtitle="Manajemen aset digital dan dokumen publik sekolah"
                />

                <div className="px-4 sm:px-8 mt-10 max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 items-start">
                    {/* LEFT: FORM SECTION */}
                    <div className="lg:col-span-5 lg:sticky lg:top-8">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white/80 dark:bg-[#151b18]/80 backdrop-blur-3xl rounded-[3.5rem] border border-gray-100 dark:border-white/10 shadow-2xl p-10 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <HardDrive size={120} className="text-emerald-500" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="p-3.5 bg-emerald-100 dark:bg-emerald-500/10 rounded-2xl text-emerald-600">
                                        <Plus size={24} />
                                    </div>
                                    {editingId && (
                                        <button 
                                            onClick={() => { setForm({ ...DEFAULT_FORM, downloadId: downloads[0]?.id || '' }); setEditingId(null); }}
                                            className="px-4 py-2 bg-red-50 dark:bg-red-500/5 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all"
                                        >
                                            <X size={14} /> Batalkan Edit
                                        </button>
                                    )}
                                </div>
                                
                                <h2 className="text-2xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight mb-2">
                                    {editingId ? 'Update Berkas' : 'Tambah Berkas'}
                                </h2>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.2em] mb-10">Unggah berkas baru ke direktori publik</p>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Koleksi Induk</label>
                                        <select
                                            value={form.downloadId}
                                            onChange={(e) => setForm({ ...form, downloadId: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-black/20 p-4.5 rounded-2xl border border-transparent focus:border-emerald-500 outline-none transition-all font-bold appearance-none shadow-inner"
                                        >
                                            {downloads.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Nama Tampilan</label>
                                        <input
                                            value={form.fileName}
                                            onChange={(e) => setForm({ ...form, fileName: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-black/20 p-4.5 rounded-2xl border border-transparent focus:border-emerald-500 outline-none transition-all font-bold shadow-inner"
                                            placeholder="Contoh: Brosur Sekolah.pdf"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Urutan</label>
                                            <input
                                                type="number"
                                                value={form.displayOrder}
                                                onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) || 0 })}
                                                className="w-full bg-gray-50 dark:bg-black/20 p-4.5 rounded-2xl border border-transparent focus:border-emerald-500 outline-none transition-all font-bold shadow-inner text-center"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Tipe File</label>
                                            <div className="w-full bg-gray-50 dark:bg-black/20 p-4.5 rounded-2xl border border-transparent flex items-center justify-center font-black text-[10px] uppercase text-emerald-600 shadow-inner">
                                                {form.fileType.split('/')[1]?.toUpperCase() || 'NONE'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <div className={`relative group border-4 border-dashed rounded-[2.5rem] p-10 text-center transition-all ${uploading ? 'bg-emerald-50/50 border-emerald-500 cursor-wait' : 'bg-gray-50/10 border-gray-100 dark:border-white/5 hover:border-emerald-500/50 hover:bg-emerald-50/5 cursor-pointer'}`}>
                                            {!uploading && (
                                                <input 
                                                    type="file" 
                                                    className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" 
                                                    onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                                                />
                                            )}
                                            <div className="flex flex-col items-center gap-5">
                                                {uploading ? (
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="w-12 h-12 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
                                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] animate-pulse">MENYIMPAN DATA KE AWAN...</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-3xl shadow-xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                                            <Upload size={32} />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest">DRAG & DROP FILE DISINI</p>
                                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">PDF, DOCX, ZIP, IMAGES • MAX 10MB</p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {form.publicUrl && !uploading && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4.5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center gap-4">
                                                <div className="p-2.5 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-500/20"><ShieldCheck size={20} /></div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">BERKAS TERVERIFIKASI</p>
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight truncate">{form.publicUrl}</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>

                                    <button 
                                        onClick={handleSubmit} 
                                        disabled={loading || uploading}
                                        className="w-full flex items-center justify-center gap-4 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-5.5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl shadow-emerald-500/30 active:scale-[0.98] mt-8 group disabled:opacity-50"
                                    >
                                        {loading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} className="group-hover:-rotate-12 transition-transform" />} 
                                        {editingId ? 'KONFIRMASI UPDATE' : 'SIMPAN KE REPOSITORI'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT: LIST SECTION */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="flex items-center justify-between px-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-blue-600"><FileText size={24} /></div>
                                <h3 className="text-xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight">Active Files</h3>
                            </div>
                            <div className="relative group min-w-[200px]">
                                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input placeholder="Cari berkas..." className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl py-3 pl-10 pr-4 text-[10px] font-bold outline-none focus:border-emerald-500 transition-all font-black uppercase tracking-widest" />
                            </div>
                        </div>

                        {loading && items.length === 0 ? (
                            <div className="grid grid-cols-1 gap-6">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-28 w-full bg-white/50 dark:bg-white/5 rounded-[2.5rem] animate-pulse"></div>
                                ))}
                            </div>
                        ) : items.length === 0 ? (
                            <div className="text-center py-32 bg-white/40 dark:bg-white/5 rounded-[4rem] border border-dashed border-gray-100 dark:border-white/10 backdrop-blur-xl">
                                <AlertCircle size={64} className="mx-auto text-gray-200 dark:text-white/5 mb-6" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">REPOSITORI MASIH KOSONG</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                <AnimatePresence mode="popLayout">
                                    {items.sort((a,b) => a.displayOrder - b.displayOrder).map((item) => (
                                        <motion.div 
                                            key={item.id} 
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="group relative bg-white/80 dark:bg-[#151b18]/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-xl hover:border-emerald-500/30 transition-all"
                                        >
                                            <div className="flex flex-col md:flex-row items-center gap-6">
                                                <div className="w-20 h-20 bg-gray-50 dark:bg-black/30 rounded-3xl flex items-center justify-center transition-all group-hover:bg-emerald-600 group-hover:text-white shadow-inner group-hover:shadow-emerald-500/30">
                                                    {getFileIcon(item.fileType)}
                                                </div>
                                                
                                                <div className="flex-1 min-w-0 text-center md:text-left">
                                                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                                                        <h4 className="font-black font-fraunces text-lg uppercase tracking-tight text-gray-950 dark:text-white truncate group-hover:text-emerald-500 transition-colors">
                                                            {item.fileName}
                                                        </h4>
                                                        <div className="px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-lg text-[9px] font-black text-gray-400 uppercase tracking-widest w-fit mx-auto md:mx-0">
                                                            Order {item.displayOrder}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-center md:justify-start gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                        <span className="flex items-center gap-1.5"><DownloadIcon size={12} className="text-emerald-500" /> {item.fileSizeKb ? `${(item.fileSizeKb / 1024).toFixed(2)} MB` : 'Size N/A'}</span>
                                                        <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                                                        <span className="truncate text-xs font-black text-gray-500">{downloads.find(d => d.id === item.downloadId)?.title || item.downloadId}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-3 w-full md:w-auto">
                                                    <button 
                                                        onClick={() => handleEdit(item)}
                                                        className="flex-1 md:flex-none px-6 py-4 bg-emerald-50 dark:bg-emerald-500/5 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                    >
                                                        Buka Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-4 bg-red-50 dark:bg-red-500/5 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>

                {/* NOTIFICATION */}
                <AnimatePresence>
                    {message && (
                        <motion.div 
                            initial={{ opacity: 0, y: 50 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: 20 }}
                            className={`fixed bottom-10 right-10 z-[200] px-8 py-5 rounded-[2rem] shadow-2xl backdrop-blur-xl border border-white/20 flex items-center gap-4 ${message.type === 'success' ? 'bg-emerald-600/90 text-white' : 'bg-red-600/90 text-white'}`}
                        >
                            <div className="p-2 bg-white/20 rounded-full">
                                {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest">{message.text}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default AdminDownloadFilesPage;
