'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SidebarAdmin from '@/components/sidebar-admin';
import HeaderAdmin from '@/components/header-admin';
import {
    ArrowUp,
    ChevronLeft,
    ChevronRight,
    Download,
    File,
    Folder,
    RefreshCcw,
    Trash2,
    HardDrive,
    Sparkles,
    ShieldAlert,
    Activity,
    Database,
    FileCode,
    FileText,
    FileImage,
    Layout,
    ExternalLink,
    Zap,
    Info,
    Cloud,
    PieChart
} from 'lucide-react';

// --- Types ---

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

// --- Utils ---

const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, index);
    return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
};

const getFileIcon = (fileName: string, isFolder: boolean) => {
    if (isFolder) return Folder;
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext || '')) return FileImage;
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) return FileText;
    if (['zip', 'rar', '7z'].includes(ext || '')) return Database;
    return File;
};

// --- Storage Manager Component ---

const StorageManager: React.FC = () => {
    const [bucket] = useState('publikweb');
    const [prefix, setPrefix] = useState('');
    const [items, setItems] = useState<StorageItem[]>([]);
    const [usage, setUsage] = useState<StorageUsage | null>(null);
    const [dbUsage, setDbUsage] = useState<{ totalBytes: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [usageLoading, setUsageLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nextOffset, setNextOffset] = useState<number | null>(null);

    const loadItems = useCallback(async () => {
        if (!bucket) return;
        setLoading(true);
        setError(null);
        try {
            const query = new URLSearchParams({
                bucket,
                prefix,
                limit: '500', // Increased limit for manager view
            });
            const res = await fetch(`/api/admin/storage?${query.toString()}`);
            if (!res.ok) throw new Error('Gagal memuat file');
            const json = await res.json();
            setItems(Array.isArray(json.items) ? json.items : []);
            setNextOffset(typeof json.nextOffset === 'number' ? json.nextOffset : null);
            setDbUsage(json.dbUsage || null);
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
            if (!res.ok) throw new Error('Gagal menghitung penggunaan');
            const json = await res.json();
            setUsage(json.usage || null);
        } catch (err: any) {
            console.error('Usage calculation failed:', err);
        } finally {
            setUsageLoading(false);
        }
    }, [bucket]);

    useEffect(() => {
        loadItems();
        refreshUsage();
    }, [loadItems, refreshUsage]);

    const breadcrumbItems = useMemo(() => (prefix ? prefix.split('/') : []), [prefix]);

    const handleDownload = (item: StorageItem) => {
        const url = `/api/storage/public?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(item.path)}&download=1`;
        window.open(url, '_blank');
    };

    const handleDelete = async (item: StorageItem) => {
        if (!bucket) return;
        const confirmText = item.isFolder
            ? `Konfirmasi penghapusan folder \"${item.name}\" beserta seluruh isinya secara PERMANEN?`
            : `Hapus file \"${item.name}\" secara permanen?`;
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

    const quotaGb = Number(process.env.NEXT_PUBLIC_STORAGE_QUOTA_GB || '3');
    const quotaBytes = quotaGb > 0 ? quotaGb * 1024 * 1024 * 1024 : 3 * 1024 * 1024 * 1024;
    const usedBytes = usage?.totalBytes ?? dbUsage?.totalBytes ?? 0;
    const usedPercent = quotaBytes ? Math.min((usedBytes / quotaBytes) * 100, 100) : null;

    return (
        <div className="grid lg:grid-cols-12 gap-10 items-start max-w-7xl mx-auto font-sans">
            {/* Main Manager Content */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/70 dark:bg-[#151b18]/80 backdrop-blur-3xl rounded-[4rem] border border-white dark:border-white/10 shadow-3xl overflow-hidden"
                >
                    {/* Glass header inside card */}
                    <div className="p-10 lg:p-14 border-b border-gray-100 dark:border-white/5">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-[1.75rem] text-emerald-600 shadow-inner">
                                    <Cloud size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none mb-2">Cloud Ecosystem</h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] italic">
                                        Directory: <span className="text-emerald-500">/{prefix || 'root'}</span>
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={loadItems}
                                className="inline-flex items-center gap-4 bg-white dark:bg-white/5 hover:bg-emerald-600 hover:text-white px-8 py-4 rounded-[1.75rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-gray-100 dark:border-white/10 shadow-xl active:scale-95 group"
                            >
                                <RefreshCcw size={16} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'} /> 
                                {loading ? 'SYNCHRONIZING...' : 'REFRESH ASSETS'}
                            </button>
                        </div>

                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest overflow-x-auto pb-4 custom-scrollbar">
                            <button
                                onClick={() => {
                                    if (breadcrumbItems.length === 0) return;
                                    const nextPrefix = breadcrumbItems.slice(0, -1).join('/');
                                    setPrefix(nextPrefix);
                                }}
                                disabled={breadcrumbItems.length === 0}
                                className={`inline-flex items-center gap-2 p-3 rounded-2xl border transition-all ${breadcrumbItems.length === 0 ? 'opacity-30 cursor-not-allowed border-gray-100' : 'border-emerald-100 dark:border-white/5 hover:bg-emerald-50 dark:hover:bg-white/5 text-emerald-600'}`}
                            >
                                <ChevronLeft size={14} /> UP
                            </button>
                            
                            <div className="flex items-center gap-2 bg-gray-50/50 dark:bg-black/20 p-2 rounded-[1.5rem] border border-gray-100 dark:border-white/5">
                                <button
                                    onClick={() => setPrefix('')}
                                    className={`px-4 py-2 rounded-xl transition-all ${!prefix ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-emerald-500'}`}
                                >
                                    ROOT
                                </button>
                                {breadcrumbItems.map((segment, idx) => (
                                    <React.Fragment key={`${segment}-${idx}`}>
                                        <ChevronRight size={10} className="text-gray-300" />
                                        <button
                                            onClick={() => setPrefix(breadcrumbItems.slice(0, idx + 1).join('/'))}
                                            className="px-4 py-2 rounded-xl text-emerald-600 hover:bg-white dark:hover:bg-white/5 transition-all whitespace-nowrap"
                                        >
                                            {segment}
                                        </button>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-10 lg:p-14 min-h-[500px]">
                        <AnimatePresence mode="wait">
                            {error ? (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="p-8 rounded-[2.5rem] bg-red-50 dark:bg-red-500/5 border border-red-500/20 flex items-start gap-6 shadow-xl shadow-red-900/5 animate-bounce-subtle"
                                >
                                    <div className="p-3 bg-red-500 rounded-2xl text-white shadow-lg ring-4 ring-red-500/10 shrink-0">
                                        <ShieldAlert size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-1.5 leading-none">Access Violation / Error</p>
                                        <p className="text-sm font-black text-red-950 dark:text-red-200 leading-tight uppercase tracking-tight">{error}</p>
                                    </div>
                                </motion.div>
                            ) : items.length === 0 && !loading ? (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex flex-col items-center justify-center py-20 text-center bg-gray-50/50 dark:bg-black/20 rounded-[3rem] border border-dashed border-gray-100 dark:border-white/5"
                                >
                                    <div className="w-24 h-24 bg-white dark:bg-white/5 rounded-[2rem] flex items-center justify-center text-gray-300 mb-8 shadow-inner">
                                        <Folder size={48} className="opacity-20 translate-y-1" />
                                    </div>
                                    <h4 className="text-lg font-black font-fraunces text-gray-900 dark:text-white uppercase tracking-tight mb-2">Directory Isolated</h4>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] italic max-w-xs leading-relaxed">
                                        Tidak ada muatan digital yang terdeteksi pada path ini.
                                    </p>
                                </motion.div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-6 mb-6">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Payload Inventory ({items.length})</h3>
                                        <div className="flex items-center gap-4 text-[9px] font-black text-gray-300 uppercase tracking-widest italic">
                                            <span>Sorted by Type</span>
                                            <span>•</span>
                                            <span>Bucket: {bucket}</span>
                                        </div>
                                    </div>

                                    <div className="grid gap-4">
                                        <AnimatePresence mode="popLayout">
                                            {items.map((item, idx) => {
                                                const Icon = getFileIcon(item.name, item.isFolder);
                                                return (
                                                    <motion.div
                                                        key={item.path}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.02 }}
                                                        className="group/item flex flex-col md:flex-row md:items-center justify-between p-5 lg:p-6 rounded-[2.5rem] bg-gray-50/50 dark:bg-black/20 border border-gray-100 dark:border-white/5 hover:bg-white dark:hover:bg-white/5 hover:shadow-2xl hover:shadow-emerald-500/5 hover:-translate-y-1 transition-all duration-500"
                                                    >
                                                        <div className="flex items-center gap-6">
                                                            <div className={`p-4 rounded-2xl transition-all duration-700 shadow-xl ${item.isFolder ? 'bg-emerald-500 text-white shadow-emerald-500/20 group-hover/item:rotate-12' : 'bg-white dark:bg-black/40 text-gray-400 dark:text-gray-500 shadow-inner group-hover/item:scale-110'}`}>
                                                                <Icon size={24} strokeWidth={item.isFolder ? 2.5 : 2} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-gray-950 dark:text-white uppercase tracking-tight leading-none mb-2 line-clamp-1">{item.name}</p>
                                                                <div className="flex items-center gap-4">
                                                                    <div className="flex items-center gap-2 px-3 py-1 bg-white/50 dark:bg-black/40 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-400 ring-1 ring-gray-100 dark:ring-white/5">
                                                                        {item.isFolder ? 'FOLDER' : 'STATIC ASSET'}
                                                                    </div>
                                                                    {!item.isFolder && (
                                                                        <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-600 font-black">
                                                                            {formatBytes(item.size)}
                                                                        </div>
                                                                    )}
                                                                    <span className="text-[9px] font-black text-gray-300 dark:text-white/10 italic truncate max-w-[120px]">
                                                                        {item.path.split('.').pop()?.toUpperCase() || '-'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-end gap-3 mt-4 md:mt-0 opacity-0 group-hover/item:opacity-100 transition-all duration-500 translate-x-4 group-hover/item:translate-x-0">
                                                            {!item.isFolder ? (
                                                                <button
                                                                    onClick={() => handleDownload(item)}
                                                                    className="inline-flex items-center gap-3 bg-emerald-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
                                                                >
                                                                    <Download size={14} /> PULL
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => setPrefix(item.path)}
                                                                    className="inline-flex items-center gap-3 bg-gray-950 dark:bg-white text-white dark:text-black px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl"
                                                                >
                                                                    ENTER
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDelete(item)}
                                                                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-90"
                                                                title="Purge permanently"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>

                        {nextOffset !== null && (
                            <div className="mt-12 p-8 bg-amber-500/5 rounded-[2.5rem] border border-amber-500/10 flex gap-6 items-center">
                                <div className="p-3 bg-amber-500 rounded-2xl text-white shadow-xl ring-4 ring-amber-500/10"><Info size={20}/></div>
                                <div>
                                    <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em] mb-1.5 leading-none italic">Inventory Overflow</p>
                                    <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 leading-relaxed italic uppercase tracking-widest">
                                        Beberapa aset tidak ditampilkan karena limit tampilan (500 items). Silakan jelajahi folder spesifik untuk manajemen yang lebih presisi.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Side Analytics Panels */}
            <div className="lg:col-span-4 xl:col-span-3 space-y-10 lg:sticky lg:top-10">
                {/* Quota Gauge Card */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/40 dark:bg-[#151b18]/80 backdrop-blur-3xl rounded-[3.5rem] border border-white dark:border-white/10 shadow-3xl p-10 relative group overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[60px] rounded-full -translate-y-12 translate-x-12" />
                    
                    <div className="relative z-10 space-y-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-emerald-600 shadow-inner group-hover:rotate-12 transition-transform duration-700">
                                    <PieChart size={22} />
                                </div>
                                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Cloud Quota</h3>
                            </div>
                            <button
                                onClick={refreshUsage}
                                className={`text-emerald-600 p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-white/5 transition-all ${usageLoading ? 'animate-spin' : ''}`}
                            >
                                <RefreshCcw size={16} />
                            </button>
                        </div>

                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 italic">Aggregated Usage</p>
                            <p className="text-4xl font-black font-fraunces text-emerald-950 dark:text-white leading-none tracking-tight">
                                {formatBytes(usedBytes)}
                            </p>
                            
                            <div className="mt-8 space-y-4">
                                <div className="h-4 w-full rounded-full bg-emerald-100 dark:bg-emerald-500/10 overflow-hidden p-1 shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(usedPercent || 0).toFixed(1)}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className={`h-full rounded-full transition-all duration-1000 ease-out shadow-lg ${(usedPercent || 0) > 90 ? 'bg-red-500' : (usedPercent || 0) > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${(usedPercent || 0) > 90 ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse`} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${ (usedPercent || 0) > 90 ? 'text-red-500' : 'text-emerald-600'}`}>
                                            {(usedPercent || 0).toFixed(1)}% Consumed
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">CAP: {quotaGb} GB</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-white/5 pt-10">
                            <div className="p-5 rounded-[2rem] bg-gray-50/80 dark:bg-black/40 border border-gray-100 dark:border-white/5 text-center group/stat">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 transition-colors group-hover/stat:text-emerald-500">ASSETS</p>
                                <p className="text-xl font-black font-fraunces text-gray-900 dark:text-white">{usage?.totalFiles ?? '-'}</p>
                            </div>
                            <div className="p-5 rounded-[2rem] bg-gray-50/80 dark:bg-black/40 border border-gray-100 dark:border-white/5 text-center group/stat">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 transition-colors group-hover/stat:text-emerald-500">FOLDERS</p>
                                <p className="text-xl font-black font-fraunces text-gray-900 dark:text-white">{usage?.totalFolders ?? '-'}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* System Integrity Monitoring */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-10 bg-black dark:bg-[#050706] rounded-[3.5rem] text-white overflow-hidden relative group border border-white/5"
                >
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 shadow-inner group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                                <Activity size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black font-fraunces text-emerald-500 uppercase tracking-[0.3em]">Network Integrity</p>
                                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mt-0.5 whitespace-nowrap italic">Cloudflare R2 Synchronized</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-center group/item hover:translate-x-1 transition-transform">
                                <div className="flex items-center gap-3">
                                    <ShieldAlert size={14} className="text-gray-600 group-hover/item:text-emerald-500 transition-colors" />
                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest group-hover/item:text-white transition-colors">Safety Protocol</span>
                                </div>
                                <span className="text-[9px] font-black uppercase text-emerald-500/80 tracking-widest">ENABLED</span>
                            </div>
                            <div className="flex justify-between items-center group/item hover:translate-x-1 transition-transform">
                                <div className="flex items-center gap-3">
                                    <Zap size={14} className="text-gray-600 group-hover/item:text-emerald-500 transition-colors" />
                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest group-hover/item:text-white transition-colors">Access Key</span>
                                </div>
                                <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">ENCRYPTED</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-600/5 blur-[80px] group-hover:bg-emerald-600/10 transition-all duration-1000 -translate-y-12 translate-x-12" />
                </motion.div>
            </div>
        </div>
    );
};

const StoragePage: React.FC = () => {
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
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080B09] text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">
            <SidebarAdmin />
            <main className="min-h-screen lg:pl-64 pb-24">
                <HeaderAdmin 
                    title="Storage Manager"
                    subtitle="Manajemen pusat data publik, aset media, dan sinkronisasi Cloudflare R2"
                    action={
                        <div className="bg-emerald-500/10 dark:bg-emerald-500/10 px-8 py-3 rounded-2xl flex items-center gap-4 border border-emerald-500/20 shadow-inner group overflow-hidden relative">
                            <div className="absolute inset-0 bg-emerald-500/5 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            <Sparkles size={18} className="text-emerald-600 animate-pulse" />
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 tracking-[0.2em] uppercase leading-none mb-1">R2 Connected</span>
                                <span className="text-[8px] font-black text-emerald-500/60 tracking-widest uppercase leading-none italic italic">Region: ID-SIN</span>
                            </div>
                        </div>
                    }
                />

                <section className="px-4 sm:px-10 mt-12">
                    {role && role !== 'superadmin' ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-4xl mx-auto mt-20 p-16 bg-white/70 dark:bg-[#151b18]/80 backdrop-blur-3xl rounded-[4rem] border border-white dark:border-white/10 shadow-3xl text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[100px] -translate-y-32 translate-x-32" />
                            <div className="relative z-10">
                                <div className="w-24 h-24 bg-red-50 dark:bg-red-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-red-500 shadow-xl shadow-red-500/10 ring-4 ring-red-500/5">
                                    <ShieldAlert size={48} />
                                </div>
                                <h2 className="text-3xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight mb-6">Security Breach Blocked</h2>
                                <p className="text-gray-500 dark:text-gray-400 font-bold max-w-sm mx-auto uppercase tracking-widest text-xs leading-relaxed italic border-y border-gray-100 dark:border-white/5 py-4">
                                    Akses ke Storage System dibatasi hanya untuk otoritas tingkat tinggi (SUPERADMIN).
                                </p>
                                <button onClick={() => window.history.back()} className="mt-12 px-10 py-5 bg-gray-950 dark:bg-white text-white dark:text-black rounded-[1.75rem] text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl">
                                    TERMINATE ACCESS
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <StorageManager />
                    )}
                </section>
            </main>
        </div>
    );
};

export default StoragePage;
