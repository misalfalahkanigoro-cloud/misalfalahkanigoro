'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Search, Edit, Trash2, ImageIcon, Eye, Pin, 
    Calendar, ImagePlus, MoreHorizontal, ChevronLeft, 
    ChevronRight, LayoutGrid, Layers, Share2, 
    ExternalLink, Bookmark, CheckCircle2, AlertCircle
} from 'lucide-react';
import SidebarAdmin from '@/components/sidebar-admin';
import HeaderAdmin from '@/components/header-admin';
import { adminApi } from '@/lib/api';
import type { Gallery } from '@/lib/types';

const AdminGalleryPage: React.FC = () => {
    const [galleries, setGalleries] = useState<Gallery[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 12;

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchGalleries = async () => {
        setLoading(true);
        try {
            const res = await adminApi.getGalleries({ page, pageSize, search: debouncedSearch });
            setGalleries(res.items);
            setTotal(res.total);
        } catch (error) {
            console.error('Failed to fetch galleries:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGalleries();
    }, [page, debouncedSearch]);

    const handleDelete = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus album galeri ini?')) return;
        try {
            await adminApi.deleteGallery(id);
            fetchGalleries();
        } catch (error) {
            console.error('Failed to delete gallery:', error);
        }
    };

    const handlePinToggle = async (item: Gallery) => {
        try {
            await adminApi.updateGallery(item.id, { isPinned: !item.isPinned });
            fetchGalleries();
        } catch (error) {
            console.error('Failed to toggle pin:', error);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080B09] text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <SidebarAdmin />
            
            <main className="min-h-screen lg:pl-64 pb-20">
                <HeaderAdmin 
                    title="Studio Visual"
                    subtitle="Dokumentasi perjalanan dan momen berharga madrasah dalam satu album"
                    action={
                        <Link
                            href="/admin/galeri/create"
                            className="group inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                        >
                            <ImagePlus size={18} className="group-hover:rotate-12 transition-transform duration-500" /> 
                            BUAT ALBUM VISUAL
                        </Link>
                    }
                />

                <div className="px-4 sm:px-8 mt-10 max-w-7xl mx-auto space-y-12">
                    {/* SEARCH BAR */}
                    <div className="relative group max-w-3xl">
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                            <Search className="text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari album berdasarkan nama atau kata kunci..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-16 pr-6 py-5.5 bg-white/80 dark:bg-[#151b18]/80 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all shadow-xl shadow-gray-200/50 dark:shadow-none"
                        />
                    </div>

                    {/* CONTENT GRID */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="aspect-[4/5] bg-white/40 dark:bg-white/5 rounded-[3rem] animate-pulse"></div>
                            ))}
                        </div>
                    ) : galleries.length === 0 ? (
                        <div className="text-center py-48 bg-white/20 dark:bg-white/[0.02] backdrop-blur-3xl rounded-[4rem] border border-white dark:border-white/5">
                            <div className="h-32 w-32 bg-emerald-50 dark:bg-emerald-500/10 rounded-[3.5rem] flex items-center justify-center mx-auto mb-8 text-emerald-200 dark:text-emerald-500/30">
                                <ImageIcon size={64} />
                            </div>
                            <h3 className="text-2xl font-black font-fraunces text-gray-950 dark:text-white mb-3 uppercase tracking-tight">Perpustakaan Visual Kosong</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest max-w-sm mx-auto leading-loose">
                                {debouncedSearch 
                                    ? `Kami tidak menemukan album dengan kata kunci "${debouncedSearch}".` 
                                    : 'Mulai abadikan momen berharga madrasah dengan membuat album pertama.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            <AnimatePresence mode="popLayout">
                                {galleries.map((item, idx) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        layout
                                        className="group relative flex flex-col rounded-[3.5rem] bg-white dark:bg-[#151b18]/80 backdrop-blur-xl border border-gray-100 dark:border-white/10 shadow-3xl overflow-hidden transition-all duration-700 hover:-translate-y-4"
                                    >
                                        {/* Cover Image */}
                                        <div className="relative aspect-[4/5] overflow-hidden">
                                            {item.coverUrl ? (
                                                <img 
                                                    src={item.coverUrl} 
                                                    alt={item.title} 
                                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-emerald-50 dark:bg-black/40 flex items-center justify-center">
                                                    <ImageIcon className="text-emerald-200 dark:text-emerald-500/20" size={64} />
                                                </div>
                                            )}
                                            
                                            {/* Top Badges */}
                                            <div className="absolute top-6 left-6 right-6 flex items-center justify-between pointer-events-none">
                                                {item.isPinned && (
                                                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-emerald-600 text-white px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2">
                                                        <Pin size={12} className="fill-current" />
                                                        <span className="text-[9px] font-black tracking-widest uppercase">TOP ALBUM</span>
                                                    </motion.div>
                                                )}
                                                <div className="ml-auto bg-black/40 backdrop-blur-xl text-white px-4 py-2 rounded-2xl border border-white/20 shadow-xl flex items-center gap-2">
                                                    <Layers size={12} className="text-emerald-400" />
                                                    <span className="text-[9px] font-black tracking-widest uppercase">{item.media?.length || 0} ITEMS</span>
                                                </div>
                                            </div>

                                            {/* Hover Controller Overlay */}
                                            <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-5 px-10">
                                                <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] mb-2">Manajemen Konten</p>
                                                <Link
                                                    href={`/admin/galeri/${item.id}`}
                                                    className="w-full flex items-center justify-center gap-3 py-4.5 bg-white text-emerald-950 rounded-[1.75rem] font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-emerald-500 hover:text-white transition-all transform hover:scale-105 active:scale-95"
                                                >
                                                    <Edit size={18} /> EDIT ALBUM
                                                </Link>
                                                <a
                                                    href={`/galeri/${item.slug}`}
                                                    target="_blank"
                                                    className="w-full flex items-center justify-center gap-3 py-4.5 bg-white/10 border border-white/20 text-white rounded-[1.75rem] font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95"
                                                >
                                                    <ExternalLink size={18} /> PREVIEW WEB
                                                </a>
                                            </div>

                                            {/* Bottom Gradient Detail */}
                                            <div className="absolute inset-x-0 bottom-0 p-8 pt-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end">
                                                <h3 className="text-xl font-black font-fraunces text-white uppercase tracking-tight mb-2 drop-shadow-lg group-hover:text-emerald-400 transition-colors">
                                                    {item.title}
                                                </h3>
                                                <div className="flex items-center gap-3 text-[9px] font-black text-white/60 uppercase tracking-widest">
                                                    <Calendar size={14} className="text-emerald-400" />
                                                    {new Date(item.eventDate || item.createdAt).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* External Card Controls */}
                                        <div className="p-7 flex items-center justify-between border-t border-gray-100 dark:border-white/5">
                                            <button
                                                onClick={() => handlePinToggle(item)}
                                                className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl transition-all text-[10px] font-black tracking-widest border ${item.isPinned 
                                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-600/20 scale-105' 
                                                    : 'bg-gray-50 dark:bg-white/5 text-gray-400 border-gray-100 dark:border-white/10 hover:text-emerald-500 hover:border-emerald-500/30'}`}
                                            >
                                                <Bookmark size={14} className={item.isPinned ? 'fill-current' : ''} />
                                                {item.isPinned ? 'FEATURED' : 'MARK'}
                                            </button>
                                            
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="w-12 h-12 flex items-center justify-center text-red-100 hover:text-white bg-transparent hover:bg-red-600 rounded-2xl transition-all shadow-hover shadow-red-600/20"
                                                title="Destruction Mode"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* PAGINATION AREA */}
                    {!loading && galleries.length > 0 && Math.ceil(total / pageSize) > 1 && (
                        <div className="flex items-center justify-between p-8 px-12 bg-white/80 dark:bg-[#151b18]/80 backdrop-blur-3xl rounded-[3rem] border border-white dark:border-white/10 shadow-3xl">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600"><Layers size={24}/></div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Global Repository</p>
                                    <p className="text-2xl font-black text-gray-950 dark:text-white tracking-tight">{total} Visual Albums</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <button 
                                    disabled={page === 1}
                                    onClick={() => setPage(prev => prev - 1)}
                                    className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-400 hover:bg-emerald-600 hover:text-white disabled:opacity-30 transition-all shadow-xl"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <div className="flex items-center gap-2 px-4">
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
                                    className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-400 hover:bg-emerald-600 hover:text-white disabled:opacity-30 transition-all shadow-xl"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminGalleryPage;
