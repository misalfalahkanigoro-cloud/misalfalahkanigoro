'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ArrowUpRight,
    FileText,
    ImageIcon,
    LayoutGrid,
    ShieldCheck,
    Users,
    Activity,
    Trophy,
    Bell,
    ChevronRight,
    TrendingUp,
    Clock,
    RefreshCw,
    Zap
} from 'lucide-react';
import SidebarAdmin from '@/components/sidebar-admin';
import HeaderAdmin from '@/components/header-admin';

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
    happenedAt: string | number | null;
    href: string;
};

type TopNewsItem = {
    id: string;
    title: string;
    slug: string;
    viewCount: number;
    publishedAt: string | number | null;
    href: string;
};

type DashboardResponse = {
    generatedAt: string | number | null;
    summary: DashboardSummary;
    latestActivities: DashboardActivity[];
    topNews: TopNewsItem[];
    system: {
        apiStatus: 'online' | 'offline';
        pushConfigured: boolean;
        databaseConfigured: boolean;
    };
};

const QUICK_ACTIONS = [
    { label: 'Kelola Berita', href: '/admin/berita', icon: <FileText className="h-5 w-5" />, color: 'emerald' },
    { label: 'Album Galeri', href: '/admin/galeri', icon: <ImageIcon className="h-5 w-5" />, color: 'blue' },
    { label: 'Portal PPDB', href: '/admin/ppdb', icon: <LayoutGrid className="h-5 w-5" />, color: 'indigo' },
    { label: 'Publikasi', href: '/admin/publikasi', icon: <Users className="h-5 w-5" />, color: 'purple' },
];

const STAT_STYLES = {
    emerald: {
        icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white shadow-emerald-500/10',
        label: 'text-emerald-600 dark:text-emerald-400',
        desc: 'text-emerald-600 dark:text-emerald-400/80 bg-emerald-500/5',
        glow: 'bg-emerald-500/5',
    },
    blue: {
        icon: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white shadow-blue-500/10',
        label: 'text-blue-600 dark:text-blue-400',
        desc: 'text-blue-600 dark:text-blue-400/80 bg-blue-500/5',
        glow: 'bg-blue-500/5',
    },
    indigo: {
        icon: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white shadow-indigo-500/10',
        label: 'text-indigo-600 dark:text-indigo-400',
        desc: 'text-indigo-600 dark:text-indigo-400/80 bg-indigo-500/5',
        glow: 'bg-indigo-500/5',
    },
    purple: {
        icon: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white shadow-purple-500/10',
        label: 'text-purple-600 dark:text-purple-400',
        desc: 'text-purple-600 dark:text-purple-400/80 bg-purple-500/5',
        glow: 'bg-purple-500/5',
    },
} as const;

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

const toValidDate = (value?: string | number | Date | null) => {
    if (value === undefined || value === null) return null;
    let parsed: Date;
    if (value instanceof Date) parsed = value;
    else if (typeof value === 'number') parsed = new Date(value);
    else if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return null;
        if (/^\d+$/.test(trimmed)) {
            const numeric = Number(trimmed);
            const normalized = trimmed.length === 10 ? numeric * 1000 : numeric;
            parsed = new Date(normalized);
        } else parsed = new Date(trimmed);
    } else return null;
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

function formatDateTime(value?: string | number | Date | null) {
    const parsed = toValidDate(value);
    if (!parsed) return '-';
    try { return DATE_TIME_FORMATTER.format(parsed); } catch { return '-'; }
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
            setAdminName((parsed.fullName || parsed.username || 'Admin').trim());
        } catch { setAdminName('Admin'); }
    }, []);

    useEffect(() => {
        let active = true;
        const loadDashboard = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/admin/dashboard', { cache: 'no-store' });
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || 'Gagal memuat dashboard');
                if (active) setData(json as DashboardResponse);
            } catch (err) {
                if (active) setError(err instanceof Error ? err.message : 'Gagal memuat dashboard');
            } finally {
                if (active) setLoading(false);
            }
        };
        loadDashboard();
        return () => { active = false; };
    }, []);

    const stats = useMemo(() => {
        if (!data) return [];
        return [
            { label: 'Konten Publik', value: String(data.summary.totalContent), desc: `${data.summary.publishedContent} Published`, icon: <FileText size={24} />, color: 'emerald' },
            { label: 'Dokumentasi', value: String(data.summary.galleryCount), desc: `${data.summary.achievementCount} Prestasi`, icon: <Trophy size={24} />, color: 'blue' },
            { label: 'Pendaftar Baru', value: String(data.summary.ppdbTotal), desc: `${data.summary.ppdbAccepted} Diterima`, icon: <Users size={24} />, color: 'indigo' },
            { label: 'Subscribers', value: String(data.summary.subscribersCount), desc: 'Newsletter Active', icon: <Bell size={24} />, color: 'purple' },
        ];
    }, [data]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080B09] text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <SidebarAdmin />
            
            <main className="min-h-screen lg:pl-64 pb-20">
                <HeaderAdmin 
                    title={`Halo, ${adminName}`}
                    subtitle="Monitor perkembangan madrasah dan atur konten dalam satu dashboard premium."
                />

                <section className="px-4 sm:px-8 mt-8 space-y-8">
                    {error && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                            {error}
                        </div>
                    )}
                    {/* Stats Highlights */}
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                        {loading ? (
                            [...Array(4)].map((_, i) => (
                                <div key={i} className="h-44 rounded-[2.5rem] bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 animate-pulse shadow-xl shadow-gray-200/50 dark:shadow-none" />
                            ))
                        ) : stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="group relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-white/5 border border-white dark:border-white/10 p-8 shadow-2xl shadow-gray-200/50 dark:shadow-none transition-all duration-500 hover:-translate-y-2"
                            >
                                {(() => {
                                    const style = STAT_STYLES[(stat.color as keyof typeof STAT_STYLES) || 'emerald'];
                                    return (
                                        <>
                                <div className="flex items-start justify-between relative z-10">
                                    <div className={`p-4 rounded-2xl transition-all duration-500 shadow-lg ${style.icon}`}>
                                        {stat.icon}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0 translate-x-4 duration-500 ${style.label}`}>
                                        Detail <ChevronRight size={10} className="inline" />
                                    </span>
                                </div>
                                <div className="mt-6 relative z-10">
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-4xl font-black text-gray-950 dark:text-white tracking-tighter group-hover:translate-x-1 transition-transform duration-500">{stat.value}</h3>
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    </div>
                                    <p className="text-xs font-black text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-[0.2em]">{stat.label}</p>
                                    <p className={`mt-3 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block ${style.desc}`}>
                                        {stat.desc}
                                    </p>
                                </div>
                                <div className={`absolute -right-8 -bottom-8 h-32 w-32 rounded-full blur-3xl transition-all duration-700 group-hover:scale-150 ${style.glow}`} />
                                        </>
                                    );
                                })()}
                            </div>
                        ))}
                    </div>

                    <div className="grid gap-8 lg:grid-cols-12 items-start">
                        {/* Latest Activities */}
                        <div className="lg:col-span-8 space-y-8">
                            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white dark:border-white/10 shadow-2xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
                                <div className="p-8 border-b border-gray-50 dark:border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl text-indigo-600">
                                            <Activity size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-black text-gray-950 dark:text-white uppercase tracking-tight">Timeline Aktivitas</h2>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Update real-time operasional sekolah</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            const loadDashboard = async () => {
                                                setLoading(true);
                                                setError(null);
                                                try {
                                                    const res = await fetch('/api/admin/dashboard', { cache: 'no-store' });
                                                    const json = await res.json();
                                                    if (!res.ok) throw new Error(json.error || 'Gagal memuat dashboard');
                                                    setData(json as DashboardResponse);
                                                } catch (err) {
                                                    setError(err instanceof Error ? err.message : 'Gagal memuat dashboard');
                                                } finally {
                                                    setLoading(false);
                                                }
                                            };
                                            loadDashboard();
                                        }}
                                        className="p-2.5 bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-emerald-600 rounded-xl transition-all"
                                    >
                                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                                    </button>
                                </div>
                                
                                <div className="p-8 space-y-6">
                                    {loading ? (
                                        [...Array(5)].map((_, i) => (
                                            <div key={i} className="h-20 w-full bg-gray-100/50 dark:bg-white/5 rounded-2xl animate-pulse" />
                                        ))
                                    ) : (data?.latestActivities || []).length === 0 ? (
                                        <div className="text-center py-20 bg-gray-50/20 dark:bg-white/[0.02] rounded-[2rem] border border-dashed border-gray-100 dark:border-white/10">
                                            <Clock size={40} className="mx-auto text-gray-200 mb-4" />
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Belum ada catatan aktivitas baru</p>
                                        </div>
                                    ) : (data?.latestActivities || []).map((activity) => (
                                        <Link
                                            key={activity.id}
                                            href={activity.href}
                                            className="group flex items-center gap-6 p-5 rounded-[2rem] bg-white dark:bg-white/[0.02] border border-transparent hover:border-emerald-500/20 hover:bg-emerald-50/30 dark:hover:bg-emerald-500/[0.02] transition-all"
                                        >
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:rotate-6 ${activity.category === 'ppdb' ? 'bg-indigo-500 text-white' : 'bg-emerald-500 text-white'}`}>
                                                {activity.category === 'ppdb' ? <Users size={20} /> : <FileText size={20} />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{formatDateTime(activity.happenedAt)}</span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{activity.category}</span>
                                                </div>
                                                <p className="text-sm font-black text-gray-950 dark:text-white uppercase tracking-tight group-hover:text-emerald-600 transition-colors">{activity.title}</p>
                                                <p className="text-xs text-gray-500 font-medium italic mt-0.5">{activity.subtitle}</p>
                                            </div>
                                            <ChevronRight size={20} className="text-gray-200 group-hover:text-emerald-600 transition-colors" />
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Top News */}
                            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white dark:border-white/10 shadow-2xl p-8">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 bg-orange-50 dark:bg-orange-500/10 rounded-2xl text-orange-600">
                                        <TrendingUp size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-gray-950 dark:text-white uppercase tracking-tight">Tren Berita Utama</h2>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Konten paling populer dalam 30 hari terakhir</p>
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {(data?.topNews || []).map((item) => (
                                        <Link
                                            key={item.id}
                                            href={item.href}
                                            className="group p-6 rounded-[2rem] bg-gray-50/50 dark:bg-white/[0.02] border border-transparent hover:border-orange-500/20 hover:bg-orange-500/[0.02] transition-all"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="bg-orange-100 dark:bg-orange-500/20 text-orange-600 px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase">
                                                    {item.viewCount.toLocaleString()} VIEWS
                                                </div>
                                                <ArrowUpRight size={16} className="text-orange-500 opacity-0 group-hover:opacity-100 transition-all" />
                                            </div>
                                            <p className="text-sm font-black text-gray-950 dark:text-white uppercase tracking-tight line-clamp-2 leading-snug">{item.title}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">{formatDateTime(item.publishedAt)}</p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions & System Status */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white dark:border-white/10 shadow-2xl p-8">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-8 ml-2">Quick Commands</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {QUICK_ACTIONS.map((action) => (
                                        <Link
                                            key={action.label}
                                            href={action.href}
                                            className="group flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-emerald-600 hover:text-white transition-all duration-500 shadow-sm shadow-gray-200/30 dark:shadow-none"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 text-emerald-600 shadow-lg group-hover:bg-white group-hover:text-emerald-600 group-hover:rotate-12 transition-all">
                                                    {action.icon}
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-widest">{action.label}</span>
                                            </div>
                                            <Zap size={14} className="opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity" />
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-emerald-950 rounded-[3rem] border border-emerald-800 shadow-2xl p-10 relative overflow-hidden">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400">
                                            <ShieldCheck size={24} />
                                        </div>
                                        <h3 className="text-lg font-black text-white uppercase tracking-tight">System State</h3>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center group cursor-help">
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] group-hover:text-emerald-400 transition-colors">Core API</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-black text-white uppercase">{data?.system.apiStatus || 'CHECKING'}</span>
                                                <div className={`h-2 w-2 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] ${data?.system.apiStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center group cursor-help">
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] group-hover:text-emerald-400 transition-colors">Database</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-black text-white uppercase">{data?.system.databaseConfigured ? 'CONNECTED' : 'STANDBY'}</span>
                                                <div className={`h-2 w-2 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] ${data?.system.databaseConfigured ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center group cursor-help">
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] group-hover:text-emerald-400 transition-colors">Push Engine</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-black text-white uppercase">{data?.system.pushConfigured ? 'READY' : 'OFF'}</span>
                                                <div className={`h-2 w-2 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] ${data?.system.pushConfigured ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10 p-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                                        <p className="text-[8px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-1">Generated Snapshot</p>
                                        <p className="text-[10px] font-black text-white uppercase">{formatDateTime(data?.generatedAt)}</p>
                                    </div>
                                </div>
                                <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />
                                <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AdminDashboardPage;
