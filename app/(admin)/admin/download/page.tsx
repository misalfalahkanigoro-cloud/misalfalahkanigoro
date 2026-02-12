'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Download as DownloadIcon, File, HardDrive, Pin } from 'lucide-react';
import SidebarAdmin from '@/components/sidebar-admin';
import { api } from '@/lib/api';
import type { Download } from '@/lib/types';

const AdminDownloadsPage: React.FC = () => {
    const [downloads, setDownloads] = useState<Download[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 10;

    const fetchDownloads = async () => {
        setLoading(true);
        try {
            const res = await api.getDownloads();
            let items: Download[] = [];

            if (Array.isArray(res)) {
                items = res;
            } else if ((res as any).items) {
                items = (res as any).items;
            }

            setDownloads(items);
        } catch (error) {
            console.error('Failed to fetch downloads:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDownloads();
    }, [page]);

    const handleDelete = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus file ini?')) return;

        try {
            await api.deleteDownload(id);
            fetchDownloads();
        } catch (error) {
            console.error('Failed to delete download:', error);
            alert('Gagal menghapus file');
        }
    };

    const filtered = downloads.filter(item =>
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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kelola Download</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">File dokumen dan aplikasi untuk publik</p>
                    </div>
                    <Link
                        href="/admin/download/create"
                        className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20"
                    >
                        <Plus size={18} /> Upload File Baru
                    </Link>
                </div>

                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Cari nama file..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition"
                        />
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-gray-500">Memuat data...</div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-2xl">
                            <DownloadIcon className="mx-auto text-gray-300 mb-2" size={32} />
                            <p className="text-gray-500 font-medium">Belum ada file download</p>
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
                                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                                                {item.coverUrl ? (
                                                    <img src={item.coverUrl} alt="cover" className="w-full h-full object-cover" />
                                                ) : (
                                                    <File size={18} className="text-gray-400" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-bold text-gray-900 dark:text-white line-clamp-2">{item.title}</p>
                                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                    <span>{item.fileType?.toUpperCase() || 'FILE'}</span>
                                                    <span>•</span>
                                                    <span>{item.fileSizeKb ? `${(item.fileSizeKb / 1024).toFixed(1)} MB` : '-'}</span>
                                                    <span>•</span>
                                                    <span>{item.downloadCount}x</span>
                                                </div>
                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={async () => {
                                                            try {
                                                                await api.updateDownload(item.id, { isPinned: !item.isPinned });
                                                                fetchDownloads();
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
                                            {item.fileUrl && (
                                                <a href={item.fileUrl} target="_blank" className="p-2 text-gray-400 hover:text-emerald-600 transition" title="Download">
                                                    <DownloadIcon size={16} />
                                                </a>
                                            )}
                                            <Link href={`/admin/download/${item.id}`} className="p-2 text-blue-400 hover:text-blue-600 transition" title="Edit">
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
                                        <th className="px-4 py-3 font-semibold">Cover</th>
                                        <th className="px-4 py-3 font-semibold">Nama File</th>
                                        <th className="px-4 py-3 font-semibold">Ukuran</th>
                                        <th className="px-4 py-3 font-semibold">Didownload</th>
                                        <th className="px-4 py-3 font-semibold">Pinned</th>
                                        <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                    {filtered.map((item) => (
                                        <tr key={item.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                            <td className="px-4 py-4">
                                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                                                    {item.coverUrl ? (
                                                        <img src={item.coverUrl} alt="cover" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <File size={18} className="text-gray-400" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-gray-900 dark:text-white line-clamp-1" title={item.title}>{item.title}</p>
                                                        <p className="text-xs text-gray-500 line-clamp-1">{item.fileType?.toUpperCase() || 'FILE'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-gray-600 dark:text-gray-300">
                                                {item.fileSizeKb ? `${(item.fileSizeKb / 1024).toFixed(1)} MB` : '-'}
                                            </td>
                                            <td className="px-4 py-4 text-gray-600 dark:text-gray-300">
                                                {item.downloadCount}x
                                            </td>
                                            <td className="px-4 py-4">
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        try {
                                                            await api.updateDownload(item.id, { isPinned: !item.isPinned });
                                                            fetchDownloads();
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
                                                    {item.fileUrl && (
                                                        <a href={item.fileUrl} target="_blank" className="p-2 text-gray-400 hover:text-emerald-600 transition" title="Download">
                                                            <DownloadIcon size={16} />
                                                        </a>
                                                    )}
                                                    <Link href={`/admin/download/${item.id}`} className="p-2 text-blue-400 hover:text-blue-600 transition" title="Edit">
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

export default AdminDownloadsPage;
