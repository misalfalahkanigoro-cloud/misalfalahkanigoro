'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, ImageIcon, Eye, Pin } from 'lucide-react';
import SidebarAdmin from '@/components/sidebar-admin';
import { api } from '@/lib/api';
import type { Gallery } from '@/lib/types';

const AdminGalleryPage: React.FC = () => {
    const [galleries, setGalleries] = useState<Gallery[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 10;

    const fetchGalleries = async () => {
        setLoading(true);
        try {
            const res = await api.getGalleries({ page, pageSize });
            let items: Gallery[] = [];
            let totalItems = 0;

            if (Array.isArray(res)) {
                items = res;
                totalItems = res.length;
            } else if ((res as any).items) {
                items = (res as any).items;
                totalItems = (res as any).total || 0;
            }

            setGalleries(items);
            setTotal(totalItems);
        } catch (error) {
            console.error('Failed to fetch galleries:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGalleries();
    }, [page]);

    const handleDelete = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus album galeri ini?')) return;

        try {
            await api.deleteGallery(id);
            fetchGalleries();
        } catch (error) {
            console.error('Failed to delete gallery:', error);
            alert('Gagal menghapus galeri');
        }
    };

    const handlePinToggle = async (id: string, next: boolean) => {
        try {
            await fetch(`/api/galleries/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPinned: next }),
            });
            fetchGalleries();
        } catch (error) {
            console.error('Failed to toggle pin:', error);
            alert('Gagal mengubah pin');
        }
    };

    const filteredGalleries = galleries.filter(g =>
        g.title.toLowerCase().includes(search.toLowerCase())
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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Galeri Sekolah</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Kelola album foto dan dokumentasi kegiatan</p>
                    </div>
                    <Link
                        href="/admin/galeri/create"
                        className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20"
                    >
                        <Plus size={18} /> Buat Album Baru
                    </Link>
                </div>

                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Cari album..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition"
                        />
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-gray-500">Memuat data...</div>
                    ) : filteredGalleries.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-2xl">
                            <ImageIcon className="mx-auto text-gray-300 mb-2" size={32} />
                            <p className="text-gray-500 font-medium">Belum ada album galeri</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-4 md:hidden">
                                {filteredGalleries.map((gallery) => (
                                    <div
                                        key={gallery.id}
                                        className="rounded-2xl border border-emerald-900/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-white/10 overflow-hidden flex-shrink-0">
                                                {gallery.media && gallery.media.length > 0 ? (
                                                    <img src={gallery.media[0].mediaUrl} alt="" className="w-full h-full object-cover" />
                                                ) : gallery.coverUrl ? (
                                                    <img src={gallery.coverUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-gray-400"><ImageIcon size={16} /></div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-bold text-gray-900 dark:text-white line-clamp-2">{gallery.title}</p>
                                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                    <span>{gallery.media?.length || 0} Foto</span>
                                                    <span>•</span>
                                                    <span>{new Date(gallery.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                </div>
                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${gallery.isPublished
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                                        {gallery.isPublished ? 'Published' : 'Draft'}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handlePinToggle(gallery.id, !gallery.isPinned)}
                                                        className={pinButtonClass(Boolean(gallery.isPinned))}
                                                    >
                                                        <Pin size={12} />
                                                        {gallery.isPinned ? 'Pinned' : 'Pin'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-end gap-2">
                                            <a href={`/galeri/${gallery.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-emerald-600 transition" title="Lihat">
                                                <Eye size={16} />
                                            </a>
                                            <Link href={`/admin/galeri/${gallery.id}`} className="p-2 text-blue-400 hover:text-blue-600 transition" title="Edit">
                                                <Edit size={16} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(gallery.id)}
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
                                        <th className="px-4 py-3 font-semibold">Album Info</th>
                                        <th className="px-4 py-3 font-semibold">Tanggal</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold">Pinned</th>
                                        <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                    {filteredGalleries.map((gallery) => (
                                        <tr key={gallery.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-white/10 overflow-hidden flex-shrink-0">
                                                        {gallery.media && gallery.media.length > 0 ? (
                                                            <img src={gallery.media[0].mediaUrl} alt="" className="w-full h-full object-cover" />
                                                        ) : gallery.coverUrl ? (
                                                            <img src={gallery.coverUrl} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full text-gray-400"><ImageIcon size={16} /></div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white line-clamp-1">{gallery.title}</p>
                                                        <p className="text-xs text-gray-500 line-clamp-1">{gallery.media?.length || 0} Foto</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-gray-600 dark:text-gray-300">
                                                {new Date(gallery.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 rounded-md text-xs font-bold ${gallery.isPublished
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                                    {gallery.isPublished ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <button
                                                    onClick={() => handlePinToggle(gallery.id, !gallery.isPinned)}
                                                    className={pinButtonClass(Boolean(gallery.isPinned))}
                                                    title={gallery.isPinned ? 'Unpin' : 'Pin'}
                                                >
                                                    <Pin size={14} /> {gallery.isPinned ? 'Pinned' : 'Pin'}
                                                </button>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <a href={`/galeri/${gallery.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-emerald-600 transition" title="Lihat">
                                                        <Eye size={16} />
                                                    </a>
                                                    <Link href={`/admin/galeri/${gallery.id}`} className="p-2 text-blue-400 hover:text-blue-600 transition" title="Edit">
                                                        <Edit size={16} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(gallery.id)}
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

export default AdminGalleryPage;
