'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ArrowUpRight,
    Bell,
    Calendar,
    FileText,
    Image,
    LayoutGrid,
    Loader2,
    ShieldCheck,
    Users,
} from 'lucide-react';
import SidebarAdmin from '@/components/sidebar-admin';

type DashboardSummary = {
    newsCount: number;
    publicationCount: number;
    achievementCount: number;
    galleryCount: number;
    totalContent: number;
    publishedContent: number;
    draftContent: number;
    ppdbTotal: number;
    ppdbAccepted: number;
    ppdbVerification: number;
    subscribersCount: number;
    adminUsersCount: number;
    activeWave: {
        id: string;
        name: string;
        startDate: string;
        endDate: string;
        quota: number | null;
    } | null;
};

type DashboardActivity = {
    id: string;
    category: 'ppdb' | 'content';
    title: string;
    subtitle: string;
    happenedAt: string;
    href: string;
};

type TopNewsItem = {
    id: string;
    title: string;
    slug: string;
    viewCount: number;
    publishedAt: string;
    href: string;
};

type DashboardResponse = {
    generatedAt: string;
    summary: DashboardSummary;
    latestActivities: DashboardActivity[];
    topNews: TopNewsItem[];
    system: {
        apiStatus: 'online' | 'offline';
        pushConfigured: boolean;
        supabaseConfigured: boolean;
    };
};

const QUICK_ACTIONS = [
    { label: 'Kelola Berita', href: '/admin/berita', icon: <FileText className="h-5 w-5" /> },
    { label: 'Kelola Galeri', href: '/admin/galeri', icon: <Image className="h-5 w-5" /> },
    { label: 'Kelola PPDB', href: '/admin/ppdb', icon: <LayoutGrid className="h-5 w-5" /> },
    { label: 'Kelola Publikasi', href: '/admin/publikasi', icon: <Users className="h-5 w-5" /> },
];

function formatDateTime(value?: string | null) {
    if (!value) return '-';
    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

function formatDateOnly(value?: string | null) {
    if (!value) return '-';
    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'long',
    }).format(new Date(value));
}

const AdminDashboardPage: React.FC = () => {
    const [adminName, setAdminName] = useState('Admin');
    const [data, setData] = useState<DashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const raw = localStorage.getItem('adminUser');
        if (!raw) return;
        try {
            const parsed = JSON.parse(raw) as { fullName?: string; username?: string };
            const name = (parsed.fullName || parsed.username || 'Admin').trim();
            if (name) setAdminName(name);
        } catch {
            setAdminName('Admin');
        }
    }, []);

    useEffect(() => {
        let active = true;
        const loadDashboard = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/admin/dashboard', { cache: 'no-store' });
                const json = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error(json.error || 'Gagal memuat dashboard');
                }
                if (active) {
                    setData(json as DashboardResponse);
                }
            } catch (err) {
                if (active) {
                    setError(err instanceof Error ? err.message : 'Gagal memuat dashboard');
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadDashboard();
        return () => {
            active = false;
        };
    }, []);

    const stats = useMemo(() => {
        if (!data) return [];
        return [
            { label: 'Total Konten', value: String(data.summary.totalContent), change: `${data.summary.publishedContent} publikasi`, icon: <FileText className="h-5 w-5" /> },
            { label: 'Total Galeri', value: String(data.summary.galleryCount), change: `${data.summary.newsCount} berita`, icon: <Image className="h-5 w-5" /> },
            { label: 'Pendaftar PPDB', value: String(data.summary.ppdbTotal), change: `${data.summary.ppdbAccepted} diterima`, icon: <Users className="h-5 w-5" /> },
            { label: 'Gelombang Aktif', value: data.summary.activeWave?.name || 'Tidak ada', change: `${data.summary.subscribersCount} subscriber`, icon: <LayoutGrid className="h-5 w-5" /> },
        ];
    }, [data]);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors dark:bg-[#0B0F0C] dark:text-gray-100">
            <SidebarAdmin />
            <main className="min-h-screen px-6 py-10 lg:pl-80">
                <section className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4 rounded-3xl border border-emerald-900/10 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">Dashboard</p>
                                <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">Selamat Datang, {adminName}</h1>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">
                                    Ringkasan data real dari konten, PPDB, dan status sistem.
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-700/20 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                                    <Calendar className="h-4 w-4" />
                                    {formatDateOnly(new Date().toISOString())}
                                </div>
                                <button
                                    onClick={() => location.reload()}
                                    className="rounded-full border border-gray-200 bg-white p-2 text-gray-600 shadow-sm transition hover:text-emerald-600 dark:border-white/10 dark:bg-white/10 dark:text-emerald-200"
                                    title="Muat ulang data"
                                >
                                    <Bell className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center gap-3 text-sm text-emerald-700 dark:text-emerald-300">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Memuat statistik dashboard...
                            </div>
                        ) : error ? (
                            <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                {stats.map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-gray-900"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                                                {stat.icon}
                                            </div>
                                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">{stat.change}</span>
                                        </div>
                                        <p className="mt-4 text-2xl font-bold">{stat.value}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                        <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">Aktivitas</p>
                                    <h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">Aktivitas Terbaru</h2>
                                </div>
                            </div>
                            <div className="mt-6 space-y-4">
                                {!loading && !error && (data?.latestActivities || []).length === 0 && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada aktivitas terbaru.</p>
                                )}
                                {(data?.latestActivities || []).map((activity) => (
                                    <Link
                                        key={activity.id}
                                        href={activity.href}
                                        className="flex items-start gap-4 rounded-2xl border border-emerald-900/10 bg-emerald-50/60 p-4 transition hover:bg-emerald-100/60 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                                    >
                                        <div className={`mt-1 h-2 w-2 rounded-full ${activity.category === 'ppdb' ? 'bg-blue-500' : 'bg-emerald-600'}`}></div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{formatDateTime(activity.happenedAt)}</p>
                                            <p className="truncate text-sm text-gray-800 dark:text-gray-200">{activity.title}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{activity.subtitle}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">Quick Actions</p>
                                    <h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">Tindakan Cepat</h2>
                                </div>
                                <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div className="mt-6 grid gap-3">
                                {QUICK_ACTIONS.map((action) => (
                                    <Link
                                        key={action.label}
                                        href={action.href}
                                        className="flex items-center justify-between rounded-2xl border border-emerald-900/10 bg-emerald-50/70 px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 dark:border-white/10 dark:bg-white/5 dark:text-emerald-200"
                                    >
                                        <span className="flex items-center gap-3">
                                            {action.icon}
                                            {action.label}
                                        </span>
                                        <ArrowUpRight className="h-4 w-4" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                        <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">Konten Populer</p>
                                    <h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">Berita Paling Dibaca</h2>
                                </div>
                            </div>
                            <div className="mt-6 space-y-4">
                                {!loading && !error && (data?.topNews || []).length === 0 && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada data view berita.</p>
                                )}
                                {(data?.topNews || []).map((item) => (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-900/10 bg-white p-4 shadow-sm transition hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(item.publishedAt)}</p>
                                        </div>
                                        <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{item.viewCount.toLocaleString('id-ID')} views</div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">Sistem</p>
                                    <h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">Status Sistem</h2>
                                </div>
                                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div className="mt-6 space-y-3">
                                <div className="flex items-center justify-between rounded-2xl border border-emerald-900/10 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-800 dark:border-white/10 dark:bg-white/5 dark:text-emerald-200">
                                    API Dashboard
                                    <span className="rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                        {data?.system.apiStatus === 'online' ? 'Online' : 'Offline'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-2xl border border-emerald-900/10 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-800 dark:border-white/10 dark:bg-white/5 dark:text-emerald-200">
                                    Konfigurasi Supabase
                                    <span className="rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                        {data?.system.supabaseConfigured ? 'Aktif' : 'Belum lengkap'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-2xl border border-emerald-900/10 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-800 dark:border-white/10 dark:bg-white/5 dark:text-emerald-200">
                                    Push Notification
                                    <span className="rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                        {data?.system.pushConfigured ? 'VAPID siap' : 'VAPID belum diset'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-2xl border border-emerald-900/10 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-800 dark:border-white/10 dark:bg-white/5 dark:text-emerald-200">
                                    Snapshot data terakhir
                                    <span className="rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                        {formatDateTime(data?.generatedAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AdminDashboardPage;
