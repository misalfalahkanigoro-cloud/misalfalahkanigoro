'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Search, Edit, Trash2, Eye, FileText, Megaphone, 
    Newspaper, Pin, User, Calendar, MoreVertical, 
    ChevronLeft, ChevronRight, Share2, ExternalLink,
    Clock, CheckCircle, AlertCircle, Bookmark, Filter,
    LayoutGrid, List as ListIcon, ShieldCheck
} from 'lucide-react';
import SidebarAdmin from '@/components/sidebar-admin';
import HeaderAdmin from '@/components/header-admin';
import { adminApi } from '@/lib/api';
import type { Publication, PublicationType } from '@/lib/types';

const AdminPublicationsPage: React.FC = () => {
    const [publications, setPublications] = useState<Publication[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [filterType, setFilterType] = useState<PublicationType | 'all'>('all');
    const [total, setTotal] = useState(0);
    const pageSize = 10;

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchPublications = async () => {
        setLoading(true);
        try {
            const res = await adminApi.getPublications({
                page,
                pageSize,
                type: filterType === 'all' ? undefined : filterType,
                search: debouncedSearch
            });
            setPublications(res.items);
            setTotal(res.total);
        } catch (error) {
            console.error('Failed to fetch publications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPublications();
    }, [page, filterType, debouncedSearch]);

    const handleDelete = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus publikasi ini?')) return;
        try {
            await adminApi.deletePublication(id);
            fetchPublications();
        } catch (error) {
            console.error('Failed to delete publication:', error);
        }
    };

    const handlePinToggle = async (item: Publication) => {
        try {
            await adminApi.updatePublication(item.id, { isPinned: !item.isPinned });
            fetchPublications();
        } catch {
            console.error('Failed to toggle pin');
        }
    };

    const getIcon = (type: PublicationType) => {
        switch (type) {
            case 'announcement': return <Megaphone className="text-orange-500" size={24} />;
            case 'bulletin': return <FileText className="text-blue-500" size={24} />;
            default: return <Newspaper className="text-emerald-500" size={24} />;
        }
    };

    const getLabel = (type: PublicationType) => {
        switch (type) {
            case 'announcement': return 'Pengumuman';
            case 'bulletin': return 'Buletin';
            default: return 'Artikel';
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080B09] text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <SidebarAdmin />
            
            <main className="min-h-screen lg:pl-64 pb-20">
                <HeaderAdmin 
                    title="Arsip Publikasi"
                    subtitle="Management center untuk pengumuman, buletin, dan dokumentasi resmi"
                    action={
                        <Link
                            href="/admin/publikasi/create"
                            className="group inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                        >
                            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" /> 
                            BUAT PUBLIKASI BARU
                        </Link>
                    }
                />

                <div className="px-4 sm:px-8 mt-10 max-w-7xl mx-auto space-y-10">
                    {/* FILTERS & SEARCH */}
                    <div className="flex flex-col xl:flex-row gap-6">
                        <div className="relative group flex-1">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Cari berdasarkan judul publikasi atau konten..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-16 pr-6 py-5.5 bg-white/80 dark:bg-[#151b18]/80 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all shadow-xl shadow-gray-200/50 dark:shadow-none placeholder:text-gray-400"
                            />
                        </div>
                        
                        <div className="flex items-center p-2 bg-white/80 dark:bg-[#151b18]/80 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-[2.5rem] shadow-xl overflow-x-auto whitespace-nowrap scrollbar-hide">
                            {(['all', 'article', 'announcement', 'bulletin'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`px-6 py-3.5 rounded-[1.75rem] text-[9px] font-black uppercase tracking-widest transition-all ${filterType === type
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                        : 'text-gray-500 hover:bg-emerald-50 dark:text-gray-400 dark:hover:bg-white/10'
                                        }`}
                                >
                                    {type === 'all' ? 'SEMUA TIPE' : getLabel(type as PublicationType)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CONTENT LIST */}
                    <div className="bg-white/40 dark:bg-white/[0.02] backdrop-blur-3xl rounded-[4rem] border border-white dark:border-white/5 shadow-3xl overflow-hidden min-h-[500px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-48">
                                <div className="w-16 h-16 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
                                <p className="mt-8 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em]">Sinkronisasi Database Publikasi...</p>
                            </div>
                        ) : publications.length === 0 ? (
                            <div className="text-center py-48">
                                <div className="h-32 w-32 bg-emerald-50 dark:bg-emerald-500/10 rounded-[3rem] flex items-center justify-center mx-auto mb-8 text-emerald-200 dark:text-emerald-500/30">
                                    <FileText size={64} />
                                </div>
                                <h3 className="text-2xl font-black font-fraunces text-gray-950 dark:text-white mb-3 uppercase tracking-tight">Koleksi Masih Kosong</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest max-w-sm mx-auto leading-loose">
                                    {debouncedSearch 
                                        ? `Kami tidak menemukan publikasi terkait "${debouncedSearch}".` 
                                        : 'Mulai dokumentasikan informasi sekolah hari ini.'}
                                </p>
                            </div>
                        ) : (
                            <div className="p-4 sm:p-10 space-y-6">
                                <div className="hidden lg:grid grid-cols-12 gap-6 px-10 pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-white/5 mb-6">
                                    <div className="col-span-6">Subjek Publikasi</div>
                                    <div className="col-span-3">Klasifikasi & Pin</div>
                                    <div className="col-span-3 text-right">Opsi Manajemen</div>
                                </div>

                                <AnimatePresence mode="popLayout">
                                    {publications.map((item, idx) => (
                                        <motion.div 
                                            key={item.id}
                                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="group grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-white/80 dark:bg-[#151b18]/80 backdrop-blur-xl p-6 lg:p-8 rounded-[3rem] border border-gray-100 dark:border-white/10 shadow-xl hover:shadow-2xl hover:border-emerald-500/30 transition-all duration-500 mb-4 last:mb-0"
                                        >
                                            <div className="col-span-6 flex items-center gap-7">
                                                <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-[2rem] bg-gray-50 dark:bg-black/30 flex items-center justify-center flex-shrink-0 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all duration-700 ring-4 ring-transparent group-hover:ring-emerald-500/20">
                                                    <div className="group-hover:text-white transition-colors duration-500 group-hover:scale-110">
                                                        {getIcon(item.type)}
                                                    </div>
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="font-black font-fraunces text-lg lg:text-xl uppercase tracking-tight text-gray-950 dark:text-white truncate group-hover:text-emerald-500 transition-colors">
                                                            {item.title}
                                                        </h4>
                                                        {item.isPinned && <Pin size={14} className="text-emerald-500" />}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-loose">
                                                       <span className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 px-3 py-1 rounded-lg border border-gray-100 dark:border-white/5"><User size={12} className="text-emerald-500" /> {item.authorName}</span>
                                                       <span className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 px-3 py-1 rounded-lg border border-gray-100 dark:border-white/5"><Calendar size={12} className="text-emerald-500" /> {new Date(item.publishedAt || item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-span-3">
                                                <div className="flex items-center gap-3">
                                                     <span className="px-5 py-2 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-gray-200/50 dark:border-white/5 shadow-sm">
                                                        {getLabel(item.type)}
                                                    </span>
                                                    <button
                                                        onClick={() => handlePinToggle(item)}
                                                        className={`p-2.5 rounded-xl border transition-all ${item.isPinned 
                                                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                                            : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-400 hover:border-emerald-500 hover:text-emerald-500'}`}
                                                    >
                                                        <Pin size={14} className={item.isPinned ? "fill-current" : ""} />
                                                    </button>
                                                </div>
                                                <div className="mt-3 flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                                                    <Clock size={14} className="text-emerald-500/50" />
                                                    {new Date(item.publishedAt || item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                                </div>
                                            </div>

                                            <div className="col-span-3 flex items-center justify-center lg:justify-end gap-3 translate-x-0 lg:translate-x-6 lg:opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-700">
                                                <a href={`/publikasi/${item.slug}`} target="_blank" className="p-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-[1.5rem] transition-all shadow-xl shadow-emerald-900/5 group/btn" title="View Article">
                                                    <ExternalLink size={20} className="group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform" />
                                                </a>
                                                <Link href={`/admin/publikasi/${item.id}`} className="p-4 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-[1.5rem] transition-all shadow-xl shadow-indigo-900/5 group/btn" title="Edit Article">
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
                        
                        {/* FOOTER PAGINATION */}
                        {!loading && publications.length > 0 && Math.ceil(total / pageSize) > 1 && (
                            <div className="px-10 py-10 border-t border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.01] flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-white dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10 text-emerald-600 shadow-xl">
                                        <Bookmark size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Database Archive</p>
                                        <p className="text-xl font-black text-gray-950 dark:text-white tracking-tight">{total} Official Archive</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <button 
                                        disabled={page === 1}
                                        onClick={() => setPage(prev => prev - 1)}
                                        className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-400 hover:bg-emerald-600 hover:text-white disabled:opacity-20 transition-all shadow-xl"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    
                                    <div className="flex items-center gap-2 px-2">
                                        {[...Array(Math.ceil(total / pageSize))].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setPage(i + 1)}
                                                className={`w-12 h-12 rounded-2xl text-[10px] font-black transition-all ${page === i + 1 ? 'bg-emerald-600 text-white shadow-2xl scale-110' : 'text-gray-400 hover:bg-emerald-50 dark:hover:bg-white/10'}`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    <button 
                                        disabled={page * pageSize >= total}
                                        onClick={() => setPage(prev => prev + 1)}
                                        className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-400 hover:bg-emerald-600 hover:text-white disabled:opacity-20 transition-all shadow-xl"
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

export default AdminPublicationsPage;
