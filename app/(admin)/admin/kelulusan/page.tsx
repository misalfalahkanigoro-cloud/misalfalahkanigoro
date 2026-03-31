'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Save, Trash2, UserCheck, GraduationCap, 
    Search, Filter, MoreVertical, Edit3, X, 
    CheckCircle2, AlertCircle, Loader2, ChevronLeft, 
    ChevronRight, School, Landmark
} from 'lucide-react';
import SidebarAdmin from '@/components/sidebar-admin';
import HeaderAdmin from '@/components/header-admin';

type GraduationForm = {
    id?: number;
    nisn: string;
    name: string;
    className: string;
    status: 'LULUS' | 'DITUNDA';
    averageScore: number;
    year: string;
};

const DEFAULT_FORM: GraduationForm = {
    nisn: '',
    name: '',
    className: '',
    status: 'LULUS',
    averageScore: 0,
    year: new Date().getFullYear().toString(),
};

const AdminKelulusanPage: React.FC = () => {
    const [items, setItems] = useState<GraduationForm[]>([]);
    const [form, setForm] = useState<GraduationForm>(DEFAULT_FORM);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [modal, setModal] = useState(false);
    const [search, setSearch] = useState('');

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/graduation-students');
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Fetch failed', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const openCreate = () => {
        setEditingId(null);
        setForm(DEFAULT_FORM);
        setModal(true);
    };

    const handleEdit = (item: GraduationForm) => {
        setEditingId(item.id || null);
        setForm({ ...item });
        setModal(true);
    };

    const handleSubmit = async () => {
        if (!form.name || !form.nisn) return setMessage({ type: 'error', text: 'Nama dan NISN wajib diisi.' });
        
        setSaving(true);
        try {
            const url = editingId ? `/api/admin/graduation-students/${editingId}` : '/api/admin/graduation-students';
            const method = editingId ? 'PUT' : 'POST';
            const res = await fetch(url, { 
                method, 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(form) 
            });
            
            if (res.ok) {
                setModal(false);
                fetchItems();
                setMessage({ type: 'success', text: editingId ? 'Data diperbarui.' : 'Data ditambahkan.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Gagal menyimpan data.' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleDelete = async (id?: number) => {
        if (!id || !confirm('Hapus data kelulusan ini?')) return;
        try {
            const res = await fetch(`/api/admin/graduation-students/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchItems();
                setMessage({ type: 'success', text: 'Data dihapus.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Gagal menghapus.' });
        } finally {
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) || 
        item.nisn.includes(search)
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080B09] text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <SidebarAdmin />
            
            <main className="min-h-screen lg:pl-64 pb-20">
                <HeaderAdmin 
                    title="Pusat Kelulusan"
                    subtitle="Manajemen data alumni dan status kelulusan siswa"
                    action={
                        <button 
                            onClick={openCreate}
                            className="group inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                        >
                            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                            INPUT DATA KELULUSAN
                        </button>
                    }
                />

                <div className="px-4 sm:px-8 mt-10 max-w-7xl mx-auto space-y-10">
                    {/* SEARCH & STATS */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-8 relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input
                                placeholder="Cari berdasarkan nama atau NISN siswa..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-16 pr-6 py-5.5 bg-white/80 dark:bg-[#151b18]/80 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all shadow-xl shadow-gray-200/50 dark:shadow-none"
                            />
                        </div>
                        <div className="lg:col-span-4 bg-emerald-600 rounded-[2.5rem] p-6 flex items-center justify-between text-white shadow-xl shadow-emerald-500/20 px-8">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Total Lulusan</p>
                                <p className="text-3xl font-black font-fraunces tracking-tight">{items.filter(i => i.status === 'LULUS').length} Siswa</p>
                            </div>
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                <GraduationCap size={28} />
                            </div>
                        </div>
                    </div>

                    {/* LIST SECTION */}
                    <div className="bg-white/40 dark:bg-white/[0.02] backdrop-blur-3xl rounded-[4rem] border border-white dark:border-white/5 shadow-3xl overflow-hidden min-h-[400px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-48">
                                <div className="w-16 h-16 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
                                <p className="mt-8 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em]">Sinkronisasi Database Alumni...</p>
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="text-center py-48">
                                <div className="h-32 w-32 bg-emerald-50 dark:bg-emerald-500/10 rounded-[3rem] flex items-center justify-center mx-auto mb-8 text-emerald-200 dark:text-emerald-500/30">
                                    <School size={64} />
                                </div>
                                <h3 className="text-2xl font-black font-fraunces text-gray-950 dark:text-white mb-3 uppercase tracking-tight">Data Tidak Ditemukan</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest max-w-sm mx-auto leading-loose">
                                    {search ? `Belum ada data untuk "${search}".` : 'Mulai isi data kelulusan untuk angkatan tahun ini.'}
                                </p>
                            </div>
                        ) : (
                            <div className="p-4 sm:p-10">
                                <div className="hidden lg:grid grid-cols-12 gap-6 px-10 pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-white/5 mb-6">
                                    <div className="col-span-5">Data Diri & Identitas</div>
                                    <div className="col-span-3">Status & Akademik</div>
                                    <div className="col-span-2">Tahun Ajar</div>
                                    <div className="col-span-2 text-right">Manajemen</div>
                                </div>

                                <AnimatePresence mode="popLayout">
                                    {filteredItems.map((item, idx) => (
                                        <motion.div 
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="group grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-white/80 dark:bg-[#151b18]/80 backdrop-blur-xl p-6 lg:p-8 rounded-[3rem] border border-gray-100 dark:border-white/10 shadow-xl hover:shadow-2xl hover:border-emerald-500/30 transition-all duration-500 mb-4 last:mb-0"
                                        >
                                            <div className="col-span-5 flex items-center gap-6">
                                                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-50 dark:bg-black/30 rounded-3xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-inner group-hover:shadow-emerald-500/30">
                                                    <UserCheck size={28} />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-black font-fraunces text-lg uppercase tracking-tight text-gray-950 dark:text-white truncate group-hover:text-emerald-500 transition-colors">{item.name}</h4>
                                                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">NISN: {item.nisn} · {item.className}</p>
                                                </div>
                                            </div>

                                            <div className="col-span-3">
                                                <div className={`inline-flex px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest mb-2 border ${item.status === 'LULUS' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'}`}>
                                                    {item.status}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">
                                                    SKOR RATA: <span className="text-emerald-600 dark:text-emerald-400">{item.averageScore}</span>
                                                </div>
                                            </div>

                                            <div className="col-span-2">
                                                <div className="px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] w-fit">
                                                    {item.year}
                                                </div>
                                            </div>

                                            <div className="col-span-2 flex items-center justify-center lg:justify-end gap-3 translate-x-0 lg:translate-x-4 lg:opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-700">
                                                <button onClick={() => handleEdit(item)} className="p-4 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-[1.5rem] transition-all shadow-xl shadow-indigo-900/5"><Edit3 size={18} /></button>
                                                <button onClick={() => handleDelete(item.id)} className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white rounded-[1.5rem] transition-all shadow-xl shadow-red-900/5"><Trash2 size={18} /></button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>

                {/* MODAL FORM */}
                <AnimatePresence>
                    {modal && (
                        <>
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setModal(false)}
                                className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl"
                            />
                            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
                                    className="relative w-full max-w-2xl bg-white dark:bg-[#0F1411] rounded-[3.5rem] border border-white/20 dark:border-white/10 shadow-3xl overflow-hidden pointer-events-auto"
                                >
                                    <div className="p-10">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-emerald-100 dark:bg-emerald-500/10 rounded-2xl text-emerald-600"><Landmark size={24} /></div>
                                                <h3 className="text-2xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight">
                                                    {editingId ? 'Edit Kelulusan' : 'Data Kelulusan Baru'}
                                                </h3>
                                            </div>
                                            <button onClick={() => setModal(false)} className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl"><X size={20}/></button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Nomor Induk Siswa Nasional (NISN)</label>
                                                <input value={form.nisn} onChange={(e) => setForm({...form, nisn: e.target.value})} className="w-full bg-gray-50 dark:bg-black/20 p-4.5 rounded-2xl border border-transparent focus:border-emerald-500 outline-none transition-all font-bold" placeholder="Contoh: 0012345678" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Nama Lengkap Siswa</label>
                                                <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full bg-gray-50 dark:bg-black/20 p-4.5 rounded-2xl border border-transparent focus:border-emerald-500 outline-none transition-all font-bold" placeholder="Nama sesuai ijazah..." />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Kelas Terakhir</label>
                                                <input value={form.className} onChange={(e) => setForm({...form, className: e.target.value})} className="w-full bg-gray-50 dark:bg-black/20 p-4.5 rounded-2xl border border-transparent focus:border-emerald-500 outline-none transition-all font-bold" placeholder="Contoh: Kelas 6-A" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Status Kelulusan</label>
                                                <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value as any})} className="w-full bg-gray-50 dark:bg-black/20 p-4.5 rounded-2xl border border-transparent focus:border-emerald-500 outline-none transition-all font-bold appearance-none">
                                                    <option value="LULUS">LULUS</option>
                                                    <option value="DITUNDA">DITUNDA</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2 font-fraunces">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 font-sans">Skor Rata-rata Ujian</label>
                                                <input type="number" value={form.averageScore} onChange={(e) => setForm({...form, averageScore: Number(e.target.value)})} className="w-full bg-gray-50 dark:bg-black/20 p-4.5 rounded-2xl border border-transparent focus:border-emerald-500 outline-none transition-all font-bold text-lg" placeholder="0.00" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Tahun Kelulusan</label>
                                                <input value={form.year} onChange={(e) => setForm({...form, year: e.target.value})} className="w-full bg-gray-50 dark:bg-black/20 p-4.5 rounded-2xl border border-transparent focus:border-emerald-500 outline-none transition-all font-bold" placeholder="2024" />
                                            </div>
                                        </div>

                                        <div className="mt-10 flex items-center justify-end gap-6">
                                            <button onClick={() => setModal(false)} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">Abort</button>
                                            <button 
                                                onClick={handleSubmit} 
                                                disabled={saving}
                                                className="px-10 py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl shadow-emerald-500/20 flex items-center gap-3"
                                            >
                                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                                SIMPAN DATA ALUMNI
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </>
                    )}
                </AnimatePresence>

                {/* NOTIFICATION toast */}
                <AnimatePresence>
                    {message && (
                        <motion.div 
                            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                            className={`fixed bottom-10 right-10 z-[200] px-8 py-5 rounded-[2rem] shadow-2xl backdrop-blur-xl border border-white/20 flex items-center gap-4 ${message.type === 'success' ? 'bg-emerald-600/90 text-white' : 'bg-red-600/90 text-white'}`}
                        >
                            {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                            <p className="text-sm font-black uppercase tracking-tight">{message.text}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default AdminKelulusanPage;
