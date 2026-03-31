import React, { useState, useMemo } from 'react';
import { 
    Send, History, Search, Filter, Bell, MessageSquare, 
    Calendar, User, CheckCircle2, AlertCircle, X, Info 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SubscriberItem, PPDBWave } from '../types';

interface NotifikasiViewProps {
    subscribers: SubscriberItem[];
    waves: PPDBWave[];
}

export const NotifikasiView: React.FC<NotifikasiViewProps> = ({ subscribers, waves }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [template, setTemplate] = useState('');
    const [targetWave, setTargetWave] = useState('all');

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-[#151b18]/90 border border-gray-200 dark:border-white/10 p-6 sm:p-8 rounded-3xl sm:rounded-[40px] shadow-sm">
                    <div className="flex items-center gap-4 sm:gap-5">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-[22px] bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex justify-center items-center shadow-inner shrink-0">
                            <Bell size={24} className="sm:size-8" />
                        </div>
                        <div>
                            <h3 className="text-xl sm:text-2xl font-black font-fraunces text-slate-900 dark:text-white leading-tight">Broadcasting</h3>
                            <p className="text-[10px] sm:text-sm font-medium text-slate-500">Kirim pengumuman massal via WA.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] sm:text-sm font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
                    >
                        <Send size={18} className="sm:size-5" /> Kirim Pengumuman
                    </button>
                </div>
                
                <div className="bg-white dark:bg-[#151b18]/80 p-6 sm:p-8 rounded-3xl sm:rounded-[40px] border border-gray-100 dark:border-white/5 flex items-center justify-between overflow-hidden relative group">
                    <div className="relative z-10">
                        <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Total Penerima Aktif</p>
                        <h4 className="text-3xl sm:text-4xl font-black font-fraunces text-slate-900 dark:text-white leading-none">{subscribers.length}</h4>
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-tight">
                            <CheckCircle2 size={12} /> Terintegrasi ke Dashboard Utama
                        </div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <MessageSquare size={120} />
                    </div>
                </div>
            </div>

            {/* History Table / List */}
            <div className="bg-white dark:bg-[#151b18] rounded-[32px] sm:rounded-[40px] border border-gray-200 dark:border-white/5 shadow-xl overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/10 text-amber-600 flex items-center justify-center">
                            <History size={20} className="sm:size-6" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black font-fraunces text-slate-900 dark:text-white leading-tight">Riwayat Notifikasi</h2>
                    </div>
                </div>

                {/* Table View - lg breakpoint */}
                <div className="hidden lg:block overflow-x-auto admin-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-50 dark:border-white/5">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tanggal & Waktu</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Isi Pesan</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Kategori</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            {/* Empty state for demo */}
                            <tr>
                                <td colSpan={4} className="px-8 py-20 text-center">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <History size={24} className="text-slate-300" />
                                    </div>
                                    <p className="text-sm font-black uppercase tracking-widest text-slate-400">Belum ada riwayat pengiriman</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Mobile / Card View - < lg */}
                <div className="lg:hidden p-6 text-center py-20">
                     <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <History size={24} className="text-slate-300" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Belum ada riwayat</p>
                </div>
            </div>

            {/* SEND MODAL OVERLAY */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 pointer-events-none"
                        >
                            <div className="w-full max-w-xl bg-white dark:bg-[#151b18] rounded-[32px] sm:rounded-[40px] shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col pointer-events-auto max-h-[92vh]">
                                <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-black/20 shrink-0">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                                            <Send size={20} className="sm:size-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg sm:text-2xl font-black font-fraunces text-slate-900 dark:text-white leading-tight">Broadcast WA</h3>
                                            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Kirim Pengumuman</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 sm:w-12 sm:h-12 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center text-slate-400 transition-colors shrink-0">
                                        <X size={20} className="sm:size-7" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 admin-scrollbar">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Target Penerima</label>
                                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                                <button 
                                                    onClick={() => setTargetWave('all')}
                                                    className={`p-4 rounded-2xl border-2 transition-all text-xs font-black uppercase tracking-tight text-left ${targetWave === 'all' ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-slate-50 border-gray-200 text-slate-400'}`}
                                                >
                                                    Semua Pendaftar
                                                </button>
                                                <div className="relative">
                                                     <select 
                                                        value={targetWave !== 'all' ? targetWave : ''}
                                                        onChange={(e) => setTargetWave(e.target.value)}
                                                        className={`w-full h-full p-4 rounded-2xl border-2 transition-all text-xs font-black uppercase tracking-tight outline-none appearance-none ${targetWave !== 'all' && targetWave !== '' ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-slate-50 border-gray-200 text-slate-400'}`}
                                                    >
                                                        <option value="">Pilih Gelombang...</option>
                                                        {waves.map(w => (
                                                            <option key={w.id} value={w.id}>{w.name.toUpperCase()}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Isi Pesan / Template</label>
                                            <textarea 
                                                rows={6}
                                                value={template}
                                                onChange={(e) => setTemplate(e.target.value)}
                                                placeholder="Tulis pesan pengumuman di sini..."
                                                className="w-full rounded-2xl sm:rounded-[24px] border border-gray-200 bg-slate-50 px-5 sm:px-6 py-4 sm:py-5 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:border-white/10 dark:bg-black/30 dark:text-white admin-scrollbar"
                                            />
                                            <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-500/20 flex gap-4">
                                                <Info size={18} className="text-indigo-500 shrink-0" />
                                                <p className="text-[10px] text-indigo-600/70 dark:text-indigo-400/60 font-medium leading-relaxed">Gunakan variabel seperti {'{nama}'} atau {'{nisn}'} untuk pesan personal.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        disabled={!template || !targetWave}
                                        className="w-full rounded-[24px] bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 sm:py-5 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        <Send size={18} /> Kirim Pengumuman ({targetWave === 'all' ? subscribers.length : 'Filer'})
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
