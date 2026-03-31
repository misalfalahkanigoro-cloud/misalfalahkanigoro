'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Search, Edit, Trash2, Eye, Trophy, Medal, Star, 
    Pin, Calendar, MoreHorizontal, User, Filter, 
    ChevronLeft, ChevronRight, Share2, ExternalLink
} from 'lucide-react';
import SidebarAdmin from '@/components/sidebar-admin';
import HeaderAdmin from '@/components/header-admin';
import { adminApi } from '@/lib/api';
import type { Achievement, AchievementLevel } from '@/lib/types';

const AdminAchievementsPage: React.FC = () => {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [filterLevel, setFilterLevel] = useState<AchievementLevel | 'all'>('all');
    const [total, setTotal] = useState(0);
    const pageSize = 10;

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchAchievements = async () => {
        setLoading(true);
        try {
            const res = await adminApi.getAchievements({
                page,
                pageSize,
                level: filterLevel === 'all' ? undefined : filterLevel,
                search: debouncedSearch
            });
            setAchievements(res.items);
            setTotal(res.total);
        } catch (error) {
            console.error('Failed to fetch achievements:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAchievements();
    }, [page, filterLevel, debouncedSearch]);

    const handleDelete = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus prestasi ini?')) return;
        try {
            await adminApi.deleteAchievement(id);
            fetchAchievements();
        } catch (error) {
            console.error('Failed to delete achievement:', error);
        }
    };

    const handlePinToggle = async (item: Achievement) => {
        try {
            await adminApi.updateAchievement(item.id, { isPinned: !item.isPinned });
            fetchAchievements();
        } catch {
            console.error('Failed to toggle pin');
        }
    };

    const getLevelBadge = (level: string) => {
        const styles: Record<string, string> = {
            sekolah: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200',
            kecamatan: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200',
            kabupaten: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200',
            provinsi: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200',
            nasional: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200',
            internasional: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200',
        };
        return styles[level.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080B09] text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <SidebarAdmin />
            
            <main className="min-h-screen lg:pl-64 pb-20">
                <HeaderAdmin 
                    title="Galeri Prestasi"
                    subtitle="Manajemen rekam jejak kemenangan dan kebanggaan madrasah"
                    action={
                        <Link
                            href="/admin/prestasi/create"
                            className="group inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                        >
                            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" /> 
                            ENTRY PRESTASI BARU
                        </Link>
                    }
                />

                <div className="px-4 sm:px-8 mt-10 max-w-7xl mx-auto space-y-10">
                    {/* FILTERS SECTION */}
                    <div className="flex flex-col xl:flex-row gap-6">
                        <div className="relative group flex-1">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Cari nama kompetisi, siswa, atau judul prestasi..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-16 pr-6 py-5.5 bg-white/80 dark:bg-[#151b18]/80 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all shadow-xl shadow-gray-200/50 dark:shadow-none placeholder:text-gray-400"
                            />
                        </div>
                        
                        <div className="flex gap-4">
                            <div className="relative group min-w-[240px]">
                                <select
                                    value={filterLevel}
                                    onChange={(e) => setFilterLevel(e.target.value as AchievementLevel | 'all')}
                                    className="w-full appearance-none pl-12 pr-12 py-5.5 bg-white/80 dark:bg-[#151b18]/80 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.2em] focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all shadow-xl shadow-gray-200/50 dark:shadow-none cursor-pointer"
                                >
                                    <option value="all">Semua Tingkatan</option>
                                    <option value="sekolah">Lingkup Sekolah</option>
                                    <option value="kecamatan">Kecamatan</option>
                                    <option value="kabupaten">Kabupaten/Kota</option>
                                    <option value="provinsi">Provinsi</option>
                                    <option value="nasional">Nasional</option>
                                    <option value="internasional">Internasional</option>
                                </select>
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <Filter size={16} className="text-emerald-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CONTENT LIST */}
                    <div className="bg-white/40 dark:bg-white/[0.02] backdrop-blur-3xl rounded-[4rem] border border-white dark:border-white/5 shadow-3xl overflow-hidden min-h-[500px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-48 bg-white/30 dark:bg-white/5 animate-pulse">
                                <div className="w-16 h-16 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
                                <p className="mt-8 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em]">Sinkronisasi Data Prestasi...</p>
                            </div>
                        ) : achievements.length === 0 ? (
                            <div className="text-center py-48">
                                <div className="h-32 w-32 bg-emerald-50 dark:bg-emerald-500/10 rounded-[3rem] flex items-center justify-center mx-auto mb-8 text-emerald-200 dark:text-emerald-500/30">
                                    <Trophy size={64} />
                                </div>
                                <h3 className="text-2xl font-black font-fraunces text-gray-950 dark:text-white mb-3 uppercase tracking-tight">Belum Ada Catatan Juara</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest max-w-sm mx-auto leading-loose">
                                    {debouncedSearch 
                                        ? `Kami tidak menemukan prestasi yang cocok dengan pencarian Anda.` 
                                        : 'Ayo dokumentasikan kemenangan siswa hari ini untuk memotivasi generasi berikutnya.'}
                                </p>
                            </div>
                        ) : (
                            <div className="p-4 sm:p-10 space-y-6">
                                <div className="hidden lg:grid grid-cols-12 gap-6 px-10 pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">
                                    <div className="col-span-6">Informasi Pencapaian</div>
                                    <div className="col-span-3">Klasifikasi & Rank</div>
                                    <div className="col-span-3 text-right">Opsi Manajemen</div>
                                </div>

                                <AnimatePresence mode="popLayout">
                                    {achievements.map((item, idx) => (
                                        <motion.div 
                                            key={item.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-white/80 dark:bg-[#151b18]/80 backdrop-blur-xl p-6 lg:p-10 rounded-[3rem] border border-gray-100 dark:border-white/10 shadow-xl hover:shadow-2xl hover:border-emerald-500/30 transition-all duration-500"
                                        >
                                            <div className="col-span-6 flex items-center gap-8">
                                                <div className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-[2.5rem] overflow-hidden bg-gray-50 dark:bg-black flex-shrink-0 shadow-2xl group-hover:scale-105 transition-transform duration-700 ring-4 ring-transparent group-hover:ring-emerald-500/20">
                                                    {item.coverUrl ? (
                                                        <img src={item.coverUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full text-emerald-500/10"><Trophy size={48} /></div>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="font-black font-fraunces text-lg lg:text-xl uppercase tracking-tight text-gray-950 dark:text-white truncate group-hover:text-emerald-500 transition-colors">
                                                            {item.title}
                                                        </h4>
                                                        {item.isPinned && <Pin size={14} className="text-emerald-500" />}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-loose">
                                                        <span className="flex items-center gap-2"><Star size={14} className="text-amber-500" /> {item.eventName || 'Event N/A'}</span>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-white/10"></span>
                                                        <span className="flex items-center gap-2"><Calendar size={14} className="text-emerald-500" /> {new Date(item.achievedAt || item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-span-3 flex flex-col gap-4">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className={`px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm transition-all ${getLevelBadge(item.eventLevel)}`}>
                                                        {item.eventLevel}
                                                    </span>
                                                    <button
                                                        onClick={() => handlePinToggle(item)}
                                                        className={`p-2 rounded-xl border transition-all ${item.isPinned 
                                                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                                            : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-400 hover:text-emerald-500 hover:border-emerald-500'}`}
                                                    >
                                                        <Pin size={12} className={item.isPinned ? "fill-current" : ""} />
                                                    </button>
                                                </div>
                                                {item.rank && (
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest pl-1">
                                                        <Medal size={16} className="text-amber-500" />
                                                        {item.rank}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="col-span-3 flex items-center justify-center lg:justify-end gap-3 translate-x-0 lg:translate-x-6 lg:opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-700">
                                                <a href={`/prestasi/${item.slug}`} target="_blank" className="p-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-[1.5rem] transition-all shadow-xl shadow-emerald-900/5 group/btn" title="View Public Page">
                                                    <ExternalLink size={20} className="group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform" />
                                                </a>
                                                <Link href={`/admin/prestasi/${item.id}`} className="p-4 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-[1.5rem] transition-all shadow-xl shadow-indigo-900/5 group/btn" title="Edit Achievement">
                                                    <Edit size={20} className="group-hover/btn:rotate-12 transition-transform" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white rounded-[1.5rem] transition-all shadow-xl shadow-red-900/5 group/btn"
                                                    title="Permanently Delete"
                                                >
                                                    <Trash2 size={20} className="group-hover/btn:scale-110 transition-transform" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                        
                        {/* PAGINATION */}
                        {!loading && achievements.length > 0 && Math.ceil(total / pageSize) > 1 && (
                            <div className="px-10 py-10 border-t border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.01] flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-white dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10 text-emerald-600 shadow-xl">
                                        <Trophy size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Database Record</p>
                                        <p className="text-xl font-black text-gray-950 dark:text-white tracking-tight">{total} Achievement Entries</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <button 
                                        disabled={page === 1}
                                        onClick={() => setPage(prev => prev - 1)}
                                        className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-400 hover:bg-emerald-600 hover:text-white disabled:opacity-20 transition-all shadow-xl shadow-gray-200/50 dark:shadow-none"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    
                                    <div className="flex items-center gap-2 px-2">
                                        {[...Array(Math.ceil(total / pageSize))].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setPage(i + 1)}
                                                className={`w-12 h-12 rounded-2xl text-[10px] font-black transition-all ${page === i + 1 ? 'bg-emerald-600 text-white shadow-2xl shadow-emerald-500/40 scale-110' : 'text-gray-400 hover:bg-emerald-50 dark:hover:bg-white/10'}`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    <button 
                                        disabled={page * pageSize >= total}
                                        onClick={() => setPage(prev => prev + 1)}
                                        className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-400 hover:bg-emerald-600 hover:text-white disabled:opacity-20 transition-all shadow-xl shadow-gray-200/50 dark:shadow-none"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminAchievementsPage;
