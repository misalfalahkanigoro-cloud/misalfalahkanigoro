'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SidebarAdmin from '@/components/sidebar-admin';
import HeaderAdmin from '@/components/header-admin';
import { 
    Save, Sparkles, Target, Compass, CheckCircle2, 
    AlertCircle, RefreshCw, Layers, ShieldCheck, 
    Zap, Info, Star, Bookmark
} from 'lucide-react';

type VisionMissionPayload = {
    id?: string;
    visionText?: string;
    missionText?: string;
    isActive?: boolean;
};

const VisiMisiAdminPage: React.FC = () => {
    const [id, setId] = useState<string | null>(null);
    const [visionText, setVisionText] = useState('');
    const [missionText, setMissionText] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/admin/vision-mission');
                const data = (await res.json()) as VisionMissionPayload | null;
                if (data) {
                    setId(data.id || null);
                    setVisionText(data.visionText || '');
                    setMissionText(data.missionText || '');
                    setIsActive(data.isActive ?? true);
                }
            } catch (error) {
                console.error('Failed to load vision mission data', error);
            }
        };
        fetchData();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const res = await fetch('/api/admin/vision-mission', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, visionText, missionText, isActive }),
            });
            if (!res.ok) throw new Error('Gagal menyimpan perubahan');
            const data = (await res.json()) as VisionMissionPayload;
            if (data?.id) setId(data.id);
            setMessage({ text: 'Konfigurasi Visi & Misi berhasil direformasi secara global.', type: 'success' });
            setTimeout(() => setMessage(null), 4000);
        } catch (error) {
            setMessage({ text: 'Kegagalan sinkronisasi pilar madrasah.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080B09] text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">
            <SidebarAdmin />
            
            <main className="min-h-screen lg:pl-64 pb-24">
                <HeaderAdmin 
                    title="Pilar Strategis"
                    subtitle="Definisikan arah perjuangan dan nilai-nilai fundamental madrasah"
                    action={
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="group inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4.5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl shadow-emerald-600/30 active:scale-95 disabled:opacity-50"
                        >
                            <Save size={18} className="group-hover:-rotate-12 transition-transform" /> 
                            {saving ? 'SYNCHRONIZING...' : 'UPDATE FOUNDATION'}
                        </button>
                    }
                />

                <div className="px-4 sm:px-10 mt-12 space-y-12 max-w-7xl mx-auto">
                    {/* STATUS & OVERVIEW SECTION */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/70 dark:bg-[#151b18]/80 backdrop-blur-3xl rounded-[4rem] border border-white dark:border-white/10 shadow-3xl p-10 lg:p-14"
                    >
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-14">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-[1.75rem] text-emerald-600 shadow-inner">
                                    <Target size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none mb-2">Publikasi Pilar</h3>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">Manajemen visibilitas nilai luhur madrasah</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-5 bg-gray-50/50 dark:bg-black/20 p-2.5 rounded-[2rem] border border-gray-100 dark:border-white/5 ring-1 ring-emerald-500/5">
                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] ml-4">visibility Registry</span>
                                <label className="flex items-center gap-4 cursor-pointer group bg-white dark:bg-white/5 px-6 py-3 rounded-[1.5rem] border border-gray-100 dark:border-white/5 transition-all hover:border-emerald-500/20 shadow-sm">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                                        {isActive ? 'ACTIVE ONLINE' : 'INTERNAL ONLY'}
                                    </span>
                                    <div 
                                        className={`relative w-14 h-7 rounded-full transition-all duration-500 ${isActive ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-gray-300 dark:bg-white/10'}`}
                                        onClick={() => setIsActive(!isActive)}
                                    >
                                        <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-lg transition-transform duration-500 ${isActive ? 'translate-x-[1.75rem]' : ''}`} />
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="grid gap-14 lg:grid-cols-2">
                            {/* VISION BLOCK */}
                            <div className="space-y-8 group">
                                <div className="flex items-center justify-between px-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-[1.25rem] text-indigo-600 shadow-inner">
                                            <Compass size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none">Visi Madrasah</h4>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Titik tujuan transendental</p>
                                        </div>
                                    </div>
                                    <Star size={20} className="text-indigo-400 opacity-20 group-hover:opacity-100 transition-opacity animate-pulse" />
                                </div>
                                
                                <div className="relative">
                                    <textarea
                                        value={visionText}
                                        onChange={(e) => setVisionText(e.target.value)}
                                        rows={6}
                                        className="w-full rounded-[3rem] border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 p-10 text-lg font-bold text-gray-900 dark:text-white focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all shadow-inner leading-relaxed italic placeholder:text-gray-300 dark:placeholder:text-white/5"
                                        placeholder="Tuliskan komitmen visi jangka panjang madrasah..."
                                    />
                                    <div className="absolute top-8 right-8 text-indigo-500/20 pointer-events-none">
                                        <Layers size={40} />
                                    </div>
                                </div>
                            </div>

                            {/* MISSION BLOCK */}
                            <div className="space-y-8 group">
                                <div className="flex items-center justify-between px-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-[1.25rem] text-emerald-600 shadow-inner">
                                            <Target size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none">Misi Madrasah</h4>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Langkah nyata & implementasi</p>
                                        </div>
                                    </div>
                                    <Zap size={20} className="text-emerald-400 opacity-20 group-hover:opacity-100 transition-opacity" />
                                </div>
                                
                                <div className="relative">
                                    <textarea
                                        value={missionText}
                                        onChange={(e) => setMissionText(e.target.value)}
                                        rows={8}
                                        className="w-full rounded-[3rem] border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 p-10 text-sm font-bold text-gray-900 dark:text-white focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all shadow-inner leading-relaxed placeholder:text-gray-300 dark:placeholder:text-white/5"
                                        placeholder="Gunakan baris baru untuk memisahkan setiap butir misi (akan dikonversi ke format List otomatis)..."
                                    />
                                    <div className="absolute top-8 right-8 text-emerald-500/20 pointer-events-none">
                                        <Bookmark size={40} />
                                    </div>
                                </div>
                                
                                <motion.div 
                                    whileHover={{ scale: 1.02 }}
                                    className="p-6 bg-emerald-500/5 rounded-[2rem] border border-emerald-500/10 flex gap-6 items-center shadow-sm"
                                >
                                    <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-xl ring-4 ring-emerald-500/10 transition-transform group-hover:rotate-12"><Info size={20}/></div>
                                    <div>
                                        <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-1 leading-none">Data Formatting Engine</p>
                                        <p className="text-[12px] font-bold text-gray-500 dark:text-gray-400 leading-relaxed italic">
                                            Setiap baris naratif pada Misi akan otomatis dikonversi menjadi elemen poin berbutir di halaman profil publik.
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                    {/* TOAST SYSTEM */}
                    <AnimatePresence>
                        {message && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 50 }} 
                                animate={{ opacity: 1, scale: 1, y: 0 }} 
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className={`fixed bottom-12 right-12 z-[200] flex items-center gap-6 px-10 py-6 rounded-[2.5rem] shadow-3xl backdrop-blur-2xl border border-white/20 transition-all ${
                                    message.type === 'success' ? 'bg-emerald-600/90 text-white shadow-emerald-900/20' : 'bg-red-600/90 text-white shadow-red-900/20'
                                }`}
                            >
                                <div className="p-3 bg-white/20 rounded-full shadow-lg ring-1 ring-white/30">
                                    {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 leading-none mb-1.5">Foundation Synch Status</p>
                                    <p className="text-base font-black uppercase tracking-tight leading-none">{message.text}</p>
                                </div>
                                <div className="ml-4 pl-6 border-l border-white/20">
                                    <button onClick={() => setMessage(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                        <RefreshCw size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default VisiMisiAdminPage;
