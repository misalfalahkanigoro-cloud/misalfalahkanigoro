'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import SidebarAdmin from '@/components/sidebar-admin';
import {
    ArrowUp,
    ChevronRight,
    Database,
    File,
    Folder,
    RefreshCcw,
    Trash2,
} from 'lucide-react';

type StorageBucket = {
    id?: string;
    name: string;
    public?: boolean;
};

type StorageItem = {
    name: string;
    path: string;
    isFolder: boolean;
    size: number;
    updatedAt: string | null;
    createdAt: string | null;
    lastAccessedAt: string | null;
};

type StorageUsage = {
    totalBytes: number;
    totalFiles: number;
    totalFolders: number;
};

const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, index);
    return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
};

const StorageSettingsPage: React.FC = () => {
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('adminUser');
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as { role?: string };
                setRole(parsed.role || null);
            } catch {
                setRole(null);
            }
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors dark:bg-[#0B0F0C] dark:text-gray-100">
            <SidebarAdmin />
            <main className="min-h-screen px-6 py-10 lg:pl-80 space-y-8">
                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-emerald-600/80">File Manager</p>
                            <h1 className="mt-2 text-2xl font-semibold">File Manager</h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                                Kelola isi storage R2 aktif (via adapter), termasuk direktori dan pemakaian storage.
                            </p>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                            <Database size={16} /> Storage Aktif
                        </div>
                    </div>
                </div>

                {role && role !== 'superadmin' ? (
                    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-700 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-100">
                        Halaman ini hanya bisa diakses oleh superadmin.
                    </div>
                ) : (
                    <StorageManager />
                )}
            </main>
        </div>
    );
};

const StorageManager: React.FC = () => {
    const [buckets, setBuckets] = useState<StorageBucket[]>([]);
    const [bucket, setBucket] = useState('');
    const [prefix, setPrefix] = useState('');
    const [items, setItems] = useState<StorageItem[]>([]);
    const [usage, setUsage] = useState<StorageUsage | null>(null);
    const [loading, setLoading] = useState(false);
    const [usageLoading, setUsageLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nextOffset, setNextOffset] = useState<number | null>(null);

    const loadBuckets = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/storage?listBuckets=1');
            if (!res.ok) throw new Error('Gagal memuat bucket');
            const json = await res.json();
            const list = Array.isArray(json.buckets) ? (json.buckets as StorageBucket[]) : [];
            setBuckets(list);
            if (!bucket && list[0]?.name) {
                setBucket(list[0].name);
            }
        } catch (err: any) {
            setError(err.message || 'Gagal memuat bucket');
        }
    }, [bucket]);

    const loadItems = useCallback(async () => {
        if (!bucket) return;
        setLoading(true);
        setError(null);
        try {
            const query = new URLSearchParams({
                bucket,
                prefix,
                limit: '200',
            });
            const res = await fetch(`/api/admin/storage?${query.toString()}`);
            if (!res.ok) throw new Error('Gagal memuat file');
            const json = await res.json();
            setItems(Array.isArray(json.items) ? json.items : []);
            setNextOffset(typeof json.nextOffset === 'number' ? json.nextOffset : null);
        } catch (err: any) {
            setError(err.message || 'Gagal memuat file');
        } finally {
            setLoading(false);
        }
    }, [bucket, prefix]);

    const refreshUsage = useCallback(async () => {
        if (!bucket) return;
        setUsageLoading(true);
        try {
            const query = new URLSearchParams({ bucket, includeUsage: '1' });
            const res = await fetch(`/api/admin/storage?${query.toString()}`);
            if (!res.ok) throw new Error('Gagal menghitung usage');
            const json = await res.json();
            setUsage(json.usage || null);
        } catch (err: any) {
            setError(err.message || 'Gagal menghitung usage');
        } finally {
            setUsageLoading(false);
        }
    }, [bucket]);

    useEffect(() => {
        loadBuckets();
    }, [loadBuckets]);

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    const breadcrumbItems = useMemo(() => (prefix ? prefix.split('/') : []), [prefix]);

    const handleDelete = async (item: StorageItem) => {
        if (!bucket) return;
        const confirmText = item.isFolder
            ? `Hapus folder \"${item.name}\" beserta seluruh isinya?`
            : `Hapus file \"${item.name}\"?`;
        if (!window.confirm(confirmText)) return;
        try {
            const res = await fetch('/api/admin/storage', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bucket,
                    path: item.path,
                    isFolder: item.isFolder,
                }),
            });
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json.error || 'Gagal menghapus');
            }
            loadItems();
            refreshUsage();
        } catch (err: any) {
            setError(err.message || 'Gagal menghapus');
        }
    };

    const quotaGb = Number(process.env.NEXT_PUBLIC_STORAGE_QUOTA_GB || process.env.NEXT_PUBLIC_SUPABASE_STORAGE_QUOTA_GB || '');
    const quotaBytes = quotaGb > 0 ? quotaGb * 1024 * 1024 * 1024 : null;
    const usedBytes = usage?.totalBytes ?? 0;
    const usedPercent = quotaBytes ? Math.min((usedBytes / quotaBytes) * 100, 100) : null;

    return (
        <div className="space-y-6">
            <div className="rounded-3xl border border-emerald-900/20 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">Storage Aktif (R2)</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-300">Kelola bucket dan file yang tersimpan di storage aktif.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={refreshUsage}
                            className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 px-3 py-1.5 text-xs font-semibold text-emerald-600"
                        >
                            <RefreshCcw size={14} /> {usageLoading ? 'Menghitung...' : 'Hitung Usage'}
                        </button>
                        <button
                            onClick={loadItems}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600"
                        >
                            <RefreshCcw size={14} /> Refresh
                        </button>
                    </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div className="md:col-span-2">
                        <label className="text-xs font-semibold text-gray-500">Bucket</label>
                        <select
                            value={bucket}
                            onChange={(e) => {
                                setBucket(e.target.value);
                                setPrefix('');
                            }}
                            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                        >
                            {buckets.length === 0 && <option value="">Tidak ada bucket</option>}
                            {buckets.map((b) => (
                                <option key={b.name} value={b.name}>
                                    {b.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="rounded-2xl border border-emerald-900/10 bg-emerald-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                        <p className="text-xs font-semibold text-emerald-600">Pemakaian Storage</p>
                        <p className="mt-2 text-lg font-bold text-emerald-900 dark:text-white">{formatBytes(usedBytes)}</p>
                        {usedPercent !== null ? (
                            <div className="mt-3">
                                <div className="h-2 w-full rounded-full bg-emerald-100">
                                    <div
                                        className="h-2 rounded-full bg-emerald-500"
                                        style={{ width: `${usedPercent.toFixed(1)}%` }}
                                    />
                                </div>
                                <p className="mt-1 text-[11px] text-emerald-700">
                                    {usedPercent.toFixed(1)}% dari {quotaGb} GB
                                </p>
                            </div>
                        ) : (
                            <p className="mt-2 text-[11px] text-emerald-700">
                                Set `NEXT_PUBLIC_STORAGE_QUOTA_GB` di `.env` untuk persentase.
                            </p>
                        )}
                        {usage && (
                            <p className="mt-2 text-[11px] text-emerald-700">
                                {usage.totalFiles} file, {usage.totalFolders} folder
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
                    <button
                        onClick={() => {
                            if (breadcrumbItems.length === 0) return;
                            const nextPrefix = breadcrumbItems.slice(0, -1).join('/');
                            setPrefix(nextPrefix);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-[11px] text-gray-600"
                    >
                        <ArrowUp size={12} /> Up
                    </button>
                    <span className="font-semibold">Bucket Root</span>
                    {breadcrumbItems.map((segment, idx) => (
                        <button
                            key={`${segment}-${idx}`}
                            onClick={() => setPrefix(breadcrumbItems.slice(0, idx + 1).join('/'))}
                            className="inline-flex items-center gap-1 rounded-lg border border-transparent px-1 py-0.5 text-[11px] text-emerald-700 hover:border-emerald-100"
                        >
                            <ChevronRight size={12} /> {segment}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <div className="rounded-3xl border border-emerald-900/20 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Daftar File</h3>
                    {loading && <span className="text-xs text-emerald-600">Memuat...</span>}
                </div>
                {items.length === 0 && !loading && (
                    <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                        Folder kosong.
                    </div>
                )}
                <div className="mt-4 space-y-3">
                    {items.map((item) => (
                        <div
                            key={item.path}
                            className="flex flex-col gap-3 rounded-2xl border border-emerald-900/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5 md:flex-row md:items-center md:justify-between"
                        >
                            <div className="flex items-start gap-3">
                                <div className={`mt-0.5 rounded-xl p-2 ${item.isFolder ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {item.isFolder ? <Folder size={18} /> : <File size={18} />}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{item.name}</p>
                                    <p className="text-[11px] text-gray-500">{item.path}</p>
                                    <p className="text-[11px] text-gray-400">{item.isFolder ? 'Folder' : formatBytes(item.size)}</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                {item.isFolder && (
                                    <button
                                        onClick={() => setPrefix(item.path)}
                                        className="rounded-lg border border-emerald-600 px-3 py-1 text-xs text-emerald-600"
                                    >
                                        Buka
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(item)}
                                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1 text-xs text-red-500"
                                >
                                    <Trash2 size={12} /> Hapus
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                {nextOffset !== null && (
                    <p className="mt-4 text-xs text-amber-600">Masih ada data lain. Persempit prefix untuk melihat lebih lanjut.</p>
                )}
            </div>
        </div>
    );
};

export default StorageSettingsPage;
