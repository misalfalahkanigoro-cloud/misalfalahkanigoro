'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Download as DownloadIcon, File, HardDrive, Pin, Calendar, Tag, MoreHorizontal } from 'lucide-react';
import SidebarAdmin from '@/components/sidebar-admin';
import HeaderAdmin from '@/components/header-admin';
import { adminApi } from '@/lib/api';
import type { Download } from '@/lib/types';

const AdminDownloadsPage: React.FC = () => {
    const [downloads, setDownloads] = useState<Download[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 10;

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchDownloads = async () => {
        setLoading(true);
        try {
            const res = await adminApi.getDownloads({ page, pageSize, search: debouncedSearch });
            setDownloads(res.items);
            setTotal(res.total);
        } catch (error) {
            console.error('Failed to fetch downloads:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDownloads();
    }, [page, debouncedSearch]);

    const handleDelete = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus kategori download ini?')) return;

        try {
            await adminApi.deleteDownload(id);
            fetchDownloads();
        } catch (error) {
            console.error('Failed to delete download:', error);
            alert('Gagal menghapus file');
        }
    };

    const handlePinToggle = async (item: Download) => {
        try {
            await adminApi.updateDownload(item.id, { isPinned: !item.isPinned });
            fetchDownloads();
        } catch {
            alert('Gagal mengubah pin');
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080B09] text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <SidebarAdmin />
            
            <main className="min-h-screen lg:pl-64 pb-20">
                <HeaderAdmin 
                    title="Pusat Unduhan"
                    subtitle="Kelola dokumen publik, formulir pendaftaran, dan rilis materi digital"
                    action={
                        <Link
                            href="/admin/download/create"
                            className="group inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-[1.25rem] text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
                        >
                            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" /> 
                            BUAT ITEM DOWNLOAD
                        </Link>
                    }
                />

                <div className="px-4 sm:px-8 mt-8">
                    {/* Search Bar */}
                    <div className="mb-10 relative group max-w-2xl">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                            <Search className="text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari berdasarkan judul atau kategori berkas..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-14 pr-6 py-4.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[2.25rem] text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-xl shadow-gray-200/50 dark:shadow-none placeholder:text-gray-400 font-medium"
                        />
                    </div>

                    {/* Table Container */}
                    <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white dark:border-white/10 shadow-2xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32 space-y-6">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-emerald-500/10 rounded-full"></div>
                                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                                </div>
                                <p className="text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse italic">Membaca Indeks File...</p>
                            </div>
                        ) : downloads.length === 0 ? (
                            <div className="text-center py-32">
                                <div className="h-24 w-24 bg-emerald-50 dark:bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-emerald-200 dark:text-emerald-500/30">
                                    <DownloadIcon size={48} />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Data Download Kosong</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto font-medium">
                                    {debouncedSearch 
                                        ? `Tidak ada berkas yang cocok dengan "${debouncedSearch}".` 
                                        : 'Belum ada item download yang dibagikan ke publik.'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/20 dark:bg-white/[0.02]">
                                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Identitas Berkas</th>
                                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Metrik & Klasifikasi</th>
                                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Timestamp</th>
                                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 text-right">Manajemen</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                        {downloads.map((item) => (
                                            <tr key={item.id} className="group hover:bg-emerald-50/50 dark:hover:bg-emerald-500/[0.02] transition-colors">
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 border-2 border-emerald-50 dark:border-white/5 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:bg-emerald-600 group-hover:border-emerald-600 group-hover:rotate-6 transition-all duration-500 group-hover:scale-110">
                                                            <div className="group-hover:text-white text-emerald-600 dark:text-emerald-400 transition-colors">
                                                                <File size={24} />
                                                            </div>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <p className="font-bold text-gray-950 dark:text-white text-base tracking-tight group-hover:text-emerald-600 transition-colors">
                                                                    {item.title}
                                                                </p>
                                                                {item.isPinned && <Pin size={10} className="text-emerald-500 fill-current" />}
                                                            </div>
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.1em]">
                                                                <Tag size={10} className="text-emerald-500" /> {item.category || 'UMUM'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Akses</span>
                                                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                                                                    <DownloadIcon size={12} /> {item.downloadCount || 0} UNDUHAN
                                                                </span>
                                                            </div>
                                                            <div className="h-6 w-px bg-gray-100 dark:bg-white/10 mx-2"></div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pin</span>
                                                                <button
                                                                    onClick={() => handlePinToggle(item)}
                                                                    className={`mt-0.5 text-[10px] font-black uppercase tracking-widest transition-all ${item.isPinned ? 'text-emerald-500' : 'text-gray-300 hover:text-emerald-500'}`}
                                                                >
                                                                    {item.isPinned ? 'TERSEMAT' : 'SEMATKAN'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                             <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${item.is_published 
                                                                ? 'bg-emerald-500/10 text-emerald-600' 
                                                                : 'bg-gray-100 text-gray-400'}`}>
                                                                {item.is_published ? 'PUBLIK' : 'ARSIP'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-3">
                                                       <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-300 group-hover:text-emerald-500 transition-colors">
                                                            <Calendar size={18} />
                                                       </div>
                                                       <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-gray-950 dark:text-white">
                                                                {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                                                                MODIFIED DATE
                                                            </span>
                                                       </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-3 translate-x-4 opacity-100 md:opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                                                        <Link href={`/admin/download/${item.id}`} className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-xl shadow-blue-950/5 group/btn" title="Edit Metadata">
                                                            <Edit size={20} className="group-hover/btn:scale-110 transition-transform" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-xl shadow-red-950/5 group/btn"
                                                            title="Buang Selamanya"
                                                        >
                                                            <Trash2 size={20} className="group-hover/btn:scale-110 transition-transform" />
                                                        </button>
                                                    </div>
                                                    <div className="md:block hidden group-hover:hidden text-gray-200 dark:text-white/5">
                                                        <MoreHorizontal size={24} className="ml-auto" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        
                        {/* Pagination Section */}
                        {!loading && downloads.length > 0 && (
                            <div className="px-10 py-8 border-t border-gray-100 dark:border-white/5 bg-gray-50/20 dark:bg-white/[0.02] flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                                        <HardDrive size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Penyimpanan</p>
                                        <p className="text-xl font-black text-gray-950 dark:text-white tracking-tight">{total} Item Publik</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <button 
                                        disabled={page === 1}
                                        onClick={() => setPage(prev => prev - 1)}
                                        className="h-12 px-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 disabled:opacity-30 hover:bg-emerald-50 hover:text-emerald-700 transition-all shadow-sm"
                                    >
                                        Earlier
                                    </button>
                                    <div className="flex items-center gap-1.5 px-4">
                                        {[...Array(Math.ceil(total / pageSize))].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setPage(i + 1)}
                                                className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${page === i + 1 ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20' : 'text-gray-400 hover:bg-emerald-50 dark:hover:bg-white/10'}`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <button 
                                        disabled={page * pageSize >= total}
                                        onClick={() => setPage(prev => prev + 1)}
                                        className="h-12 px-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 disabled:opacity-30 hover:bg-emerald-50 hover:text-emerald-700 transition-all shadow-sm"
                                    >
                                        Next
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

export default AdminDownloadsPage;
