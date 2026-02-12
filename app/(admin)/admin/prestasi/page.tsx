'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Eye, Trophy, Medal, Star, Pin } from 'lucide-react';
import SidebarAdmin from '@/components/sidebar-admin';
import { api } from '@/lib/api';
import type { Achievement, AchievementLevel } from '@/lib/types';

const AdminAchievementsPage: React.FC = () => {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [filterLevel, setFilterLevel] = useState<AchievementLevel | 'all'>('all');
    const [total, setTotal] = useState(0);
    const pageSize = 10;

    const fetchAchievements = async () => {
        setLoading(true);
        try {
            const res = await api.getAchievements({
                page,
                pageSize,
                level: filterLevel === 'all' ? undefined : filterLevel
            });
            let items: Achievement[] = [];
            let totalItems = 0;

            if (Array.isArray(res)) {
                items = res;
                totalItems = res.length;
            } else if ((res as any).items) {
                items = (res as any).items;
                totalItems = (res as any).total || 0;
            }

            setAchievements(items);
            setTotal(totalItems);
        } catch (error) {
            console.error('Failed to fetch achievements:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAchievements();
    }, [page, filterLevel]);

    const handleDelete = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus prestasi ini?')) return;

        try {
            await api.deleteAchievement(id);
            fetchAchievements();
        } catch (error) {
            console.error('Failed to delete achievement:', error);
            alert('Gagal menghapus prestasi');
        }
    };

    const getLevelBadge = (level: string) => {
        const colors: Record<string, string> = {
            sekolah: 'bg-gray-100 text-gray-700',
            kecamatan: 'bg-blue-100 text-blue-700',
            kabupaten: 'bg-indigo-100 text-indigo-700',
            provinsi: 'bg-orange-100 text-orange-700',
            nasional: 'bg-red-100 text-red-700',
            internasional: 'bg-purple-100 text-purple-700',
        };
        return colors[level.toLowerCase()] || 'bg-gray-100';
    };

    const filtered = achievements.filter(item =>
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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kelola Prestasi</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Pencapaian siswa dan sekolah</p>
                    </div>
                    <Link
                        href="/admin/prestasi/create"
                        className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20"
                    >
                        <Plus size={18} /> Tambah Prestasi
                    </Link>
                </div>

                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Cari prestasi..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                            <select
                                value={filterLevel}
                                onChange={(e) => setFilterLevel(e.target.value as any)}
                                className="px-4 py-3 bg-gray-50 dark:bg-white/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition"
                            >
                                <option value="all">Semua Tingkat</option>
                                <option value="sekolah">Sekolah</option>
                                <option value="kecamatan">Kecamatan</option>
                                <option value="kabupaten">Kabupaten</option>
                                <option value="provinsi">Provinsi</option>
                                <option value="nasional">Nasional</option>
                                <option value="internasional">Internasional</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-gray-500">Memuat data...</div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-2xl">
                            <Trophy className="mx-auto text-gray-300 mb-2" size={32} />
                            <p className="text-gray-500 font-medium">Belum ada data prestasi</p>
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
                                            <div className="w-12 h-12 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center shrink-0">
                                                <Trophy size={18} className="text-yellow-600 dark:text-yellow-400" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-bold text-gray-900 dark:text-white line-clamp-2">{item.title}</p>
                                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getLevelBadge(item.eventLevel || '')}`}>
                                                        {item.eventLevel}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{new Date(item.achievedAt).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</span>
                                                </div>
                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                        <Medal size={12} className="text-emerald-500" />
                                                        {item.rank || '-'}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={async () => {
                                                            try {
                                                                await api.updateAchievement(item.id, { isPinned: !item.isPinned });
                                                                fetchAchievements();
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
                                            <a href={`/prestasi/${item.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-emerald-600 transition" title="Lihat">
                                                <Eye size={16} />
                                            </a>
                                            <Link href={`/admin/prestasi/${item.id}`} className="p-2 text-blue-400 hover:text-blue-600 transition" title="Edit">
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
                                        <th className="px-4 py-3 font-semibold">Nama Prestasi</th>
                                        <th className="px-4 py-3 font-semibold">Tingkat</th>
                                        <th className="px-4 py-3 font-semibold">Peringkat</th>
                                        <th className="px-4 py-3 font-semibold">Tanggal</th>
                                        <th className="px-4 py-3 font-semibold">Pinned</th>
                                        <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                    {filtered.map((item) => (
                                        <tr key={item.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center shrink-0">
                                                        <Trophy size={18} className="text-yellow-600 dark:text-yellow-400" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-gray-900 dark:text-white line-clamp-1" title={item.title}>{item.title}</p>
                                                        <p className="text-xs text-gray-500 line-clamp-1">{item.eventName}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${getLevelBadge(item.eventLevel || '')}`}>
                                                    {item.eventLevel}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-gray-600 dark:text-gray-300">
                                                <div className="flex items-center gap-1 font-medium">
                                                    <Medal size={14} className="text-emerald-500" />
                                                    {item.rank || '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                                {new Date(item.achievedAt).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-4 py-4">
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        try {
                                                            await api.updateAchievement(item.id, { isPinned: !item.isPinned });
                                                            fetchAchievements();
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
                                                    <a href={`/prestasi/${item.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-emerald-600 transition" title="Lihat">
                                                        <Eye size={16} />
                                                    </a>
                                                    <Link href={`/admin/prestasi/${item.id}`} className="p-2 text-blue-400 hover:text-blue-600 transition" title="Edit">
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

export default AdminAchievementsPage;
