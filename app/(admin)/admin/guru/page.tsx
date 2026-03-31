'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Save, Trash2, Search, Users, Edit, X, UserPlus, 
    CheckCircle2, AlertCircle, Image as ImageIcon, Briefcase, 
    Power, MoreHorizontal, UserCheck, Loader2, ArrowRight
} from 'lucide-react';
import SidebarAdmin from '@/components/sidebar-admin';
import HeaderAdmin from '@/components/header-admin';
import MediaUploadButton from '@/components/admin/MediaUploadButton';

type TeacherForm = {
    id?: number;
    name: string;
    position: string;
    imageUrl?: string | null;
    isActive: boolean;
};

const DEFAULT_FORM: TeacherForm = {
    name: '',
    position: '',
    imageUrl: '',
    isActive: true,
};

const AdminGuruPage: React.FC = () => {
    const [items, setItems] = useState<TeacherForm[]>([]);
    const [form, setForm] = useState<TeacherForm>(DEFAULT_FORM);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/teachers');
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch teachers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleSubmit = async () => {
        if (!form.name.trim()) return alert('Nama guru wajib diisi');
        setSaving(true);
        try {
            const payload = { ...form, name: form.name.trim(), position: form.position.trim() };
            const url = editingId ? `/api/admin/teachers/${editingId}` : '/api/admin/teachers';
            const method = editingId ? 'PUT' : 'POST';
            const res = await fetch(url, { 
                method, 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(payload) 
            });

            if (res.ok) {
                setForm(DEFAULT_FORM);
                setEditingId(null);
                setModalOpen(false);
                fetchItems();
            }
        } catch (error) {
            console.error('Failed to save teacher:', error);
            alert('Gagal menyimpan data guru');
        } finally {
            setSaving(false);
        }
    };

    const openCreate = () => {
        setForm(DEFAULT_FORM);
        setEditingId(null);
        setModalOpen(true);
    };

    const openEdit = (item: TeacherForm) => {
        setEditingId(item.id || null);
        setForm(item);
        setModalOpen(true);
    };

    const handleDelete = async (id?: number) => {
        if (!id) return;
        if (!confirm('Apakah Anda yakin ingin menghapus data guru ini?')) return;
        
        try {
            const res = await fetch(`/api/admin/teachers/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchItems();
            }
        } catch (error) {
            console.error('Failed to delete teacher:', error);
            alert('Gagal menghapus data guru');
        }
    };

    const handleUpload = (url: string) => {
        setForm((prev) => ({ ...prev, imageUrl: url }));
    };

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return items.filter((item) =>
            item.name.toLowerCase().includes(q) || item.position.toLowerCase().includes(q)
        );
    }, [items, search]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080B09] text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <SidebarAdmin />
            
            <main className="min-h-screen lg:pl-64 pb-20">
                <HeaderAdmin 
                    title="Direktori Guru"
                    subtitle="Kelola profil tenaga pengajar dan staf kependidikan madrasah"
                    action={
                        <button
                            onClick={openCreate}
                            className="group inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-[1.25rem] sm:rounded-[1.5rem] text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
                        >
                            <UserPlus size={18} className="group-hover:translate-x-1 transition-transform" /> 
                            <span className="hidden sm:inline">TAMBAH GURU</span>
                            <span className="sm:hidden">TAMBAH</span>
                        </button>
                    }
                />

                <div className="px-4 sm:px-8 mt-5 sm:mt-10 max-w-7xl mx-auto">
                    {/* Search Bar */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 sm:mb-12 relative group max-w-2xl"
                    >
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                            <Search className="text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari guru berdasarkan nama atau jabatan..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-16 pr-8 py-5 sm:py-6 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[2.5rem] text-sm sm:text-base focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-xl shadow-gray-200/50 dark:shadow-none placeholder:text-gray-400 font-medium"
                        />
                    </motion.div>

                    {/* Content Section */}
                    <div className="space-y-6 sm:space-y-8">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32 sm:py-48 space-y-6 bg-white/50 dark:bg-white/5 rounded-[3rem] backdrop-blur-xl">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-emerald-500/10 rounded-full"></div>
                                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                                </div>
                                <p className="text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Menghubungkan Database...</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-32 sm:py-48 bg-white/50 dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-white/5 backdrop-blur-sm"
                            >
                                <div className="h-24 w-24 bg-emerald-50 dark:bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-emerald-200 dark:text-emerald-500/30">
                                    <Users size={48} />
                                </div>
                                <h3 className="text-xl sm:text-2xl font-black font-fraunces text-gray-900 dark:text-white mb-3 uppercase tracking-tight">Data Tidak Ditemukan</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm max-w-xs mx-auto font-medium leading-relaxed">
                                    {search 
                                        ? `Kami tidak menemukan guru dengan kata kunci "${search}". Periksa kembali ejaan Anda.` 
                                        : 'Belum ada data tenaga pengajar yang terdaftar dalam sistem MIS Alfalah.'}
                                </p>
                            </motion.div>
                        ) : (
                            <>
                                {/* Desktop Tablet Table */}
                                <div className="hidden md:block bg-white dark:bg-white/5 backdrop-blur-xl rounded-[3rem] border border-gray-100 dark:border-white/10 shadow-2xl shadow-gray-200/50 dark:shadow-none overflow-hidden ">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Profil Pengajar</th>
                                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Jabatan</th>
                                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Status</th>
                                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                            {filtered.map((item) => (
                                                <tr key={item.id} className="group hover:bg-emerald-50/30 dark:hover:bg-emerald-500/[0.02] transition-colors">
                                                    <td className="px-10 py-6">
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-16 h-16 rounded-[1.25rem] bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-white/10 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:bg-emerald-600 transition-all duration-500 overflow-hidden relative">
                                                                {item.imageUrl ? (
                                                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                                ) : (
                                                                    <Users className="text-gray-300 group-hover:text-white transition-colors" size={28} />
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-black font-fraunces text-lg text-gray-950 dark:text-white line-clamp-1 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">
                                                                    {item.name}
                                                                </p>
                                                                <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                                                    <UserCheck size={12} className="text-emerald-500" />
                                                                    STAFF TERVERIFIKASI
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <div className="inline-flex items-center gap-3 bg-blue-50/50 dark:bg-blue-500/5 px-4 py-2 rounded-xl text-blue-600 dark:text-blue-400">
                                                            <Briefcase size={16} />
                                                            <p className="text-xs font-black uppercase tracking-wider italic">
                                                                {item.position || 'STAF PENGAJAR'}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                                            item.isActive 
                                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                                                                : 'bg-gray-50 text-gray-400 border-gray-100 dark:bg-white/5 dark:text-gray-500'
                                                        }`}>
                                                            <div className={`w-2 h-2 rounded-full ${item.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`}></div>
                                                            {item.isActive ? 'AKTIF' : 'NONAKTIF'}
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6 text-right">
                                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                                                            <button 
                                                                onClick={() => openEdit(item)}
                                                                className="p-3.5 bg-white dark:bg-white/10 hover:bg-emerald-600 hover:text-white text-emerald-600 rounded-2xl transition-all shadow-xl shadow-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10"
                                                                title="Edit"
                                                            >
                                                                <Edit size={18} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDelete(item.id)}
                                                                className="p-3.5 bg-white dark:bg-white/10 hover:bg-red-600 hover:text-white text-red-500 rounded-2xl transition-all shadow-xl shadow-red-500/5 border border-red-100 dark:border-red-500/10"
                                                                title="Hapus"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile View: Cards */}
                                <div className="md:hidden grid grid-cols-1 gap-6">
                                    {filtered.map((item) => (
                                        <motion.div 
                                            key={item.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white dark:bg-white/5 p-6 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-xl"
                                        >
                                            <div className="flex items-center gap-5 mb-6">
                                                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                                                    {item.imageUrl ? (
                                                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300"><Users size={24} /></div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-black font-fraunces text-lg uppercase tracking-tight text-gray-950 dark:text-white truncate">{item.name}</h4>
                                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{item.position || 'Staf Pengajar'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-5 border-t border-gray-50 dark:border-white/5">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.15em] border ${
                                                    item.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-200'
                                                }`}>
                                                    {item.isActive ? 'Aktif' : 'Nonaktif'}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => openEdit(item)} className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-xl"><Edit size={16} /></button>
                                                    <button onClick={() => handleDelete(item.id)} className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-xl"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Footer Summary */}
                                <div className="px-10 py-8 bg-emerald-950 dark:bg-emerald-500/10 rounded-[2.5rem] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl shadow-emerald-900/10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400">
                                            <Users size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1">Populasi Pengajar</p>
                                            <p className="text-xl font-black text-white">{filtered.length} Personel Terdaftar</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-emerald-300/50">
                                        <AlertCircle size={14} />
                                        <p className="text-[10px] font-bold uppercase tracking-widest italic">Sinkronisasi Real-time</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* MODAL FORM */}
            <AnimatePresence>
                {modalOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            onClick={() => setModalOpen(false)} 
                            className="fixed inset-0 z-[100] bg-[#080B09]/80 backdrop-blur-xl" 
                        />
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 overflow-y-auto pointer-events-none">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-2xl bg-white dark:bg-[#0F1411] rounded-[3.5rem] border border-white/20 dark:border-white/10 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] overflow-hidden pointer-events-auto"
                            >
                                {/* Modal Header */}
                                <div className="px-10 pt-10 pb-6 flex items-start justify-between relative">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                                    <div className="relative">
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-emerald-100 dark:border-emerald-500/20">
                                            <ImageIcon size={12} /> BERKAS STAFF
                                        </div>
                                        <h2 className="text-3xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none mb-3">
                                            {editingId ? 'Pembaruan Profil' : 'Guru & Staff Baru'}
                                        </h2>
                                        <p className="text-sm text-gray-400 font-medium italic">Masukkan informasi kredensial tenaga pengajar secara akurat.</p>
                                    </div>
                                    <button onClick={() => setModalOpen(false)} className="p-4 bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-red-500 rounded-2xl transition-all shadow-inner"><X size={20} /></button>
                                </div>

                                {/* Modal Body */}
                                <div className="px-10 pb-10 space-y-8 max-h-[65vh] overflow-y-auto admin-scrollbar">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Nama Lengkap</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500">
                                                    <Users size={18} />
                                                </div>
                                                <input
                                                    value={form.name}
                                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                    className="w-full pl-16 pr-8 py-5 bg-gray-50/50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-3xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-300"
                                                    placeholder="Nama & Gelar..."
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Jabatan / Mengajar</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500">
                                                    <Briefcase size={18} />
                                                </div>
                                                <input
                                                    value={form.position}
                                                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                                                    className="w-full pl-16 pr-8 py-5 bg-gray-50/50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-3xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-300"
                                                    placeholder="Contoh: Guru Matematika..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* PHOTO UPLOAD */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Foto Resmi Studio</label>
                                        <div className="p-10 bg-gray-50/50 dark:bg-white/2 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-white/10 flex flex-col items-center gap-8 group hover:border-emerald-500/30 transition-all">
                                            {form.imageUrl ? (
                                                <div className="relative h-48 w-48 rounded-[2rem] overflow-hidden shadow-2xl group/img">
                                                    <img src={form.imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover/img:scale-110" />
                                                    <button 
                                                        onClick={() => setForm({...form, imageUrl: ''})}
                                                        className="absolute inset-0 bg-red-600/80 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover/img:opacity-100 transition-all font-black text-[10px] uppercase tracking-widest flex-col gap-2"
                                                    >
                                                        <Trash2 size={32} /> Hapus Foto
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="h-40 w-40 bg-white dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center text-gray-200 dark:text-gray-800 border border-gray-100 dark:border-white/10 shadow-xl">
                                                    <ImageIcon size={64} strokeWidth={1} />
                                                </div>
                                            )}
                                            
                                            <div className="flex flex-col items-center gap-3">
                                                <MediaUploadButton 
                                                    folder="teachers" 
                                                    label={form.imageUrl ? "GANTI FOTO PROFIL" : "UNGGAH FOTO GURU"} 
                                                    onUploaded={handleUpload} 
                                                />
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Ideal: 1:1 • Max: 2MB</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* STATUS TOGGLE */}
                                    <div className="flex items-center justify-between p-8 bg-emerald-50/50 dark:bg-emerald-500/[0.03] rounded-[2.5rem] border border-emerald-100/50 dark:border-emerald-500/10">
                                        <div className="flex items-center gap-5">
                                            <div className={`p-4 rounded-2xl ${form.isActive ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500 dark:bg-white/10'}`}>
                                                <Power size={24} />
                                            </div>
                                            <div>
                                                <p className="font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight">Status Aktif</p>
                                                <p className="text-xs text-gray-500 font-medium">Aktifkan untuk menampilkan di website publik.</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer group">
                                            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="sr-only peer" />
                                            <div className="w-16 h-9 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-emerald-600 shadow-inner duration-500"></div>
                                        </label>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="px-10 py-8 bg-gray-50/50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5 flex items-center justify-end gap-6">
                                    <button onClick={() => setModalOpen(false)} className="text-[10px] font-black text-gray-400 hover:text-gray-900 dark:hover:text-white uppercase tracking-[0.2em] transition-colors">BATALKAN</button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={saving}
                                        className="inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white px-10 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-emerald-600/20 active:scale-95"
                                    >
                                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                        {editingId ? 'TERBITKAN PERUBAHAN' : 'SIMPAN DATA'}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminGuruPage;


