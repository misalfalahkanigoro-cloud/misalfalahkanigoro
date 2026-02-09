'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Eye, Calendar, FileText, Megaphone, Newspaper, Pin } from 'lucide-react';
import SidebarAdmin from '@/components/sidebar-admin';
import { api } from '@/lib/api';
import type { Publication, PublicationType } from '@/lib/types';

const AdminPublicationsPage: React.FC = () => {
    const [publications, setPublications] = useState<Publication[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [filterType, setFilterType] = useState<PublicationType | 'all'>('all');
    const [total, setTotal] = useState(0);
    const pageSize = 10;

    const fetchPublications = async () => {
        setLoading(true);
        try {
            const res = await api.getPublications({
                page,
                pageSize,
                type: filterType === 'all' ? undefined : filterType
            });
            let items: Publication[] = [];
            let totalItems = 0;

            if (Array.isArray(res)) {
                items = res;
                totalItems = res.length;
            } else if ((res as any).items) {
                items = (res as any).items;
                totalItems = (res as any).total || 0;
            }

            setPublications(items);
            setTotal(totalItems);
        } catch (error) {
            console.error('Failed to fetch publications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPublications();
    }, [page, filterType]);

    const handleDelete = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus publikasi ini?')) return;

        try {
            await api.deletePublication(id);
            fetchPublications();
        } catch (error) {
            console.error('Failed to delete publication:', error);
            alert('Gagal menghapus publikasi');
        }
    };

    const getIcon = (type: PublicationType) => {
        switch (type) {
            case 'announcement': return <Megaphone className="text-orange-500" size={18} />;
            case 'bulletin': return <FileText className="text-blue-500" size={18} />;
            default: return <Newspaper className="text-emerald-500" size={18} />;
        }
    };

    const getLabel = (type: PublicationType) => {
        switch (type) {
            case 'announcement': return 'Pengumuman';
            case 'bulletin': return 'Buletin';
            default: return 'Artikel';
        }
    };

    const filtered = publications.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase())
    );

    const pinButtonClass = (active: boolean) =>
        `inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition ${active
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200'
            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300'
        }`;

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors dark:bg-[#0B0F0C] dark:text-gray-100">
            <SidebarAdmin />
            <main className="min-h-screen px-6 py-10 lg:pl-80 space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kelola Publikasi</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Artikel, Pengumuman, dan Buletin Sekolah</p>
                    </div>
                    <Link
                        href="/admin/publikasi/create"
                        className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20"
                    >
                        <Plus size={18} /> Buat Publikasi
                    </Link>
                </div>

                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Cari judul publikasi..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                            {['all', 'article', 'announcement', 'bulletin'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setFilterType(t as any)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition ${filterType === t
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-white/5 dark:text-gray-400'}`}
                                >
                                    {t === 'all' ? 'Semua' : getLabel(t as PublicationType)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-gray-500">Memuat data...</div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-2xl">
                            <Newspaper className="mx-auto text-gray-300 mb-2" size={32} />
                            <p className="text-gray-500 font-medium">Belum ada publikasi</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-4 md:hidden">
                                {filtered.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-2xl border border-emerald-900/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-white/10 flex items-center justify-center">
                                                {getIcon(item.type)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-bold text-gray-900 dark:text-white line-clamp-2">{item.title}</p>
                                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="uppercase font-semibold">{getLabel(item.type)}</span>
                                                    <span>•</span>
                                                    <span>{new Date(item.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                </div>
                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.isPublished
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                                        {item.isPublished ? 'Published' : 'Draft'}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={async () => {
                                                            try {
                                                                await api.updatePublication(item.id, { isPinned: !item.isPinned });
                                                                fetchPublications();
                                                            } catch {
                                                                alert('Gagal mengubah pin');
                                                            }
                                                        }}
                                                        className={pinButtonClass(Boolean(item.isPinned))}
                                                    >
                                                        <Pin size={12} />
                                                        {item.isPinned ? 'Pinned' : 'Pin'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-end gap-2">
                                            <a href={`/publikasi/${item.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-emerald-600 transition" title="Lihat">
                                                <Eye size={16} />
                                            </a>
                                            <Link href={`/admin/publikasi/${item.id}`} className="p-2 text-blue-400 hover:text-blue-600 transition" title="Edit">
                                                <Edit size={16} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 text-red-400 hover:text-red-600 transition"
                                                title="Hapus"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-white/5 text-gray-500">
                                        <th className="px-4 py-3 font-semibold">Judul</th>
                                        <th className="px-4 py-3 font-semibold">Tipe</th>
                                        <th className="px-4 py-3 font-semibold">Tanggal</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold">Pinned</th>
                                        <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                    {filtered.map((item) => (
                                        <tr key={item.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                            <td className="px-4 py-4">
                                                <p className="font-bold text-gray-900 dark:text-white line-clamp-1" title={item.title}>{item.title}</p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {item.isPinned && (
                                                        <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-bold">PINNED</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    {getIcon(item.type)}
                                                    <span className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-300">
                                                        {getLabel(item.type)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                                {new Date(item.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 rounded-md text-xs font-bold ${item.isPublished
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                                    {item.isPublished ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        try {
                                                            await api.updatePublication(item.id, { isPinned: !item.isPinned });
                                                            fetchPublications();
                                                        } catch {
                                                            alert('Gagal mengubah pin');
                                                        }
                                                    }}
                                                    className={pinButtonClass(Boolean(item.isPinned))}
                                                >
                                                    <Pin size={12} />
                                                    {item.isPinned ? 'Pinned' : 'Pin'}
                                                </button>
                                            </td>
                                            <td className="px-4 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    <a href={`/publikasi/${item.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-emerald-600 transition" title="Lihat">
                                                        <Eye size={16} />
                                                    </a>
                                                    <Link href={`/admin/publikasi/${item.id}`} className="p-2 text-blue-400 hover:text-blue-600 transition" title="Edit">
                                                        <Edit size={16} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-2 text-red-400 hover:text-red-600 transition"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminPublicationsPage;
