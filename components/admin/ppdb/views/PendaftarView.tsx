import React, { useState, useMemo } from 'react';
import { 
    Search, Filter, ChevronRight, User, Phone, IdCard, 
    Calendar, MoreVertical, CheckCircle, Clock, XCircle, 
    Download, Printer, Trash2, X, FileText, CheckCircle2,
    ShieldCheck, AlertCircle, Info, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SubscriberItem } from '../types';

interface PendaftarViewProps {
    subscribers: SubscriberItem[];
    fetchSubscribers: () => void;
}

export const PendaftarView: React.FC<PendaftarViewProps> = ({ subscribers, fetchSubscribers }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedItem, setSelectedItem] = useState<SubscriberItem | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [modalTab, setModalTab] = useState<'biodata' | 'berkas' | 'verifikasi'>('biodata');

    const filteredItems = useMemo(() => {
        return subscribers.filter(item => {
            const name = typeof item.namaLengkap === 'string' ? item.namaLengkap.toLowerCase() : '';
            const nisn = typeof item.nisn === 'string' ? item.nisn : '';
            const status = typeof item.status === 'string' ? item.status : '';
            const matchesSearch = 
                name.includes(searchTerm.toLowerCase()) ||
                nisn.includes(searchTerm);
            const matchesStatus = statusFilter === 'all' || status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [subscribers, searchTerm, statusFilter]);

    const stats = useMemo(() => ({
        total: subscribers.length,
        verifikasi: subscribers.filter(s => s.status === 'VERIFIKASI').length,
        diterima: subscribers.filter(s => s.status === 'DITERIMA').length,
        baru: subscribers.filter(s => s.status === 'BELUM_VERIFIKASI').length
    }), [subscribers]);

    const handleSelect = (item: SubscriberItem) => {
        setSelectedItem(item);
        setModalTab('biodata');
        setIsDetailOpen(true);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'DITERIMA': return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
            case 'VERIFIKASI': return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
            case 'TIDAK_DITERIMA': return 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
            default: return 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10';
        }
    };

    const getStatusLabel = (status: unknown) => {
        const normalized = typeof status === 'string' && status.trim()
            ? status.trim().toUpperCase()
            : 'BELUM_VERIFIKASI';
        return normalized.replace(/_/g, ' ');
    };

    const getDisplayName = (value: unknown) => {
        if (typeof value !== 'string') return 'Tanpa Nama';
        const trimmed = value.trim();
        return trimmed || 'Tanpa Nama';
    };

    const formatDate = (value: unknown, fallback = '-') => {
        const date = value instanceof Date ? value : new Date(String(value || ''));
        if (Number.isNaN(date.getTime())) return fallback;
        return date.toLocaleDateString('id-ID', { dateStyle: 'medium' });
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Stats Overview - 2x2 on Mobile, 4x1 on Desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                    { label: 'Pendaftar', val: stats.total, icon: User, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                    { label: 'Verifikasi', val: stats.verifikasi, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                    { label: 'Diterima', val: stats.diterima, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { label: 'Notifikasi', val: 0, icon: AlertCircle, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-500/10' }
                ].map((s, i) => (
                    <div key={i} className="bg-white dark:bg-[#151b18]/80 p-5 sm:p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center`}>
                                <s.icon size={20} className="sm:size-6" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black font-fraunces text-slate-900 dark:text-white">{s.val}</div>
                        <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 mt-1">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Main Content Card */}
            <div className="bg-white dark:bg-[#151b18] rounded-[32px] sm:rounded-[40px] border border-gray-200 dark:border-white/5 shadow-xl overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
                                <FileText size={20} className="sm:size-6" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black font-fraunces text-slate-900 dark:text-white leading-tight">Registrasi</h2>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Cari nama, nisn..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full sm:w-72 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white"
                                />
                            </div>
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl py-3 px-5 text-sm font-black uppercase tracking-widest outline-none transition-all dark:text-white"
                            >
                                <option value="all">Semua Status</option>
                                <option value="VERIFIKASI">Verifikasi</option>
                                <option value="DITERIMA">Diterima</option>
                                <option value="TIDAK_DITERIMA">Ditolak</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Desktop Table View - Changed breakpoint to lg for safety */}
                <div className="hidden lg:block overflow-x-auto admin-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-50 dark:border-white/5">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pendaftar</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Kontak</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">NISN</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            {filteredItems.map((item) => (
                                <tr key={item.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => handleSelect(item)}>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 uppercase font-black text-sm">
                                                {getDisplayName(item.namaLengkap).charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{getDisplayName(item.namaLengkap)}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                                                    {formatDate(item.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.noHp || '-'}</p>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-bold text-slate-500">{item.nisn || '-'}</td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(typeof item.status === 'string' ? item.status : '')}`}>
                                            {getStatusLabel(item.status)}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest dark:bg-indigo-500/10 dark:text-indigo-400">
                                            View Detail <ChevronRight size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Tablet & Mobile Card List View - Visible on < lg screens */}
                <div className="lg:hidden divide-y divide-gray-100 dark:divide-white/5">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="p-6 active:bg-gray-50 dark:active:bg-white/5 transition-colors" onClick={() => handleSelect(item)}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 font-black text-sm uppercase">
                                        {getDisplayName(item.namaLengkap).charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 dark:text-white text-base leading-tight">{getDisplayName(item.namaLengkap)}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">{item.nisn || 'Tanpa NISN'}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.15em] border ${getStatusStyle(typeof item.status === 'string' ? item.status : '')}`}>
                                    {getStatusLabel(item.status)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between mt-5">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                    <Calendar size={12} className="text-indigo-500" />
                                    {formatDate(item.createdAt, '-')}
                                </div>
                                <button className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:translate-x-1 transition-transform">
                                    Detail <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                {filteredItems.length === 0 && (
                    <div className="p-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-xl font-fraunces font-black text-slate-400">Tidak ada pendaftar ditemukan</h3>
                    </div>
                )}
            </div>

            {/* DETAIL MODAL OVERLAY */}
            <AnimatePresence>
                {isDetailOpen && selectedItem && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDetailOpen(false)}
                            className="fixed inset-0 z-[80] bg-slate-950/40 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 z-[90] flex items-center justify-center p-2 sm:p-4 pointer-events-none"
                        >
                            <div className="w-full max-w-2xl bg-white dark:bg-[#151b18] rounded-[32px] sm:rounded-[40px] shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col pointer-events-auto max-h-[92vh]">
                                <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-black/20 shrink-0">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                                            <ShieldCheck size={20} className="sm:size-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg sm:text-2xl font-black font-fraunces text-slate-900 dark:text-white leading-tight">{selectedItem.namaLengkap}</h3>
                                            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Detail Pendaftar</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsDetailOpen(false)} className="w-8 h-8 sm:w-12 sm:h-12 rounded-full hover:bg-gray-200 dark:hover:bg-white/5 flex items-center justify-center text-slate-400 transition-colors shrink-0">
                                        <X size={20} className="sm:size-7" />
                                    </button>
                                </div>

                                {/* Modal Internal Tabs */}
                                <div className="flex px-4 sm:px-8 bg-slate-50 dark:bg-black/10 border-b border-gray-100 dark:border-white/5 shrink-0 overflow-x-auto admin-scrollbar">
                                    {[
                                        { id: 'biodata', label: 'Biodata', icon: User },
                                        { id: 'berkas', label: 'Berkas', icon: FileText },
                                        { id: 'verifikasi', label: 'Verifikasi', icon: ShieldCheck }
                                    ].map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => setModalTab(t.id as any)}
                                            className={`flex items-center gap-2 px-4 sm:px-6 py-4 sm:py-5 text-[10px] sm:text-xs font-black uppercase tracking-widest border-b-4 transition-all whitespace-nowrap ${modalTab === t.id ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-400'}`}
                                        >
                                            <t.icon size={14} className="sm:size-4" /> {t.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 admin-scrollbar">
                                    {modalTab === 'biodata' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Informasi Personal</h4>
                                                <div className="bg-slate-50 dark:bg-black/20 p-5 rounded-[24px] space-y-4">
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Nama Lengkap</p>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white uppercase">{selectedItem.namaLengkap}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Jenis Kelamin</p>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white uppercase">{selectedItem.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">NISN / NIK</p>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedItem.nisn || '-'} / {selectedItem.nik || '-'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Kontak & Orang Tua</h4>
                                                <div className="bg-slate-50 dark:bg-black/20 p-5 rounded-[24px] space-y-4">
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Nomor WhatsApp</p>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedItem.noHp || '-'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Nama Ayah</p>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white uppercase">{selectedItem.namaAyah || '-'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">ID Gelombang</p>
                                                        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase truncate max-w-[150px]">{selectedItem.wave_id || '-'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {modalTab === 'berkas' && (
                                        <div className="flex flex-col items-center justify-center p-12 sm:p-20 text-center bg-slate-50 dark:bg-black/20 rounded-[32px] border-2 border-dashed border-gray-200 dark:border-white/5">
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-500 mb-6">
                                                <Download size={32} className="sm:size-10" />
                                            </div>
                                            <p className="text-lg font-black font-fraunces text-slate-900 dark:text-white">Berkas Terlampir</p>
                                            <p className="text-sm text-slate-400 font-medium max-w-xs mt-2">Daftar lampiran dokumen digital akan muncul di sini setelah diintegrasikan.</p>
                                        </div>
                                    )}

                                    {modalTab === 'verifikasi' && (
                                        <div className="space-y-6">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Atur Status Verifikasi</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <button className="flex items-center gap-4 p-5 rounded-[24px] border-2 border-emerald-500/30 bg-emerald-50/30 text-emerald-800 hover:bg-emerald-100 transition-all font-black text-xs uppercase tracking-widest">
                                                    <CheckCircle2 size={24} className="text-emerald-600" />
                                                    Terima Pendaftar
                                                </button>
                                                <button className="flex items-center gap-4 p-5 rounded-[24px] border border-gray-100 dark:border-white/5 bg-slate-50 dark:bg-black/20 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all font-black text-xs uppercase tracking-widest">
                                                    <XCircle size={24} />
                                                    Tolak Pendaftar
                                                </button>
                                            </div>
                                            <div className="p-5 sm:p-6 rounded-[24px] bg-sky-50 dark:bg-sky-500/5 border border-sky-100 dark:border-sky-500/20 flex gap-4">
                                                <Info size={20} className="text-sky-500 shrink-0" />
                                                <div className="space-y-1">
                                                    <p className="text-xs font-black uppercase tracking-tight text-sky-800 dark:text-sky-400">Pengiriman Notifikasi</p>
                                                    <p className="text-[10px] text-sky-600/70 dark:text-sky-400/60 font-medium leading-relaxed">Status yang diperbarui akan otomatis mengirimkan pesan konfirmasi ke nomor WhatsApp pendaftar.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="p-6 sm:p-8 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row gap-3 sm:gap-4 shrink-0">
                                    <button className="flex-1 py-4 sm:py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                                        <Printer size={16} /> Cetak Formulir
                                    </button>
                                    <button className="sm:aspect-square py-4 sm:py-5 px-6 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all flex items-center justify-center dark:bg-rose-500/10 dark:text-rose-400">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
