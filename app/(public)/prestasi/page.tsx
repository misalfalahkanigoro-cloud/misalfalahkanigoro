'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Award, Calendar, Loader2, Share2, Search, ArrowRight, Tag, Trophy, Medal } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Achievement } from '@/lib/types';

const LEVEL_OPTIONS = [
    { label: 'Semua Tingkat', value: 'all' },
    { label: 'Sekolah', value: 'sekolah' },
    { label: 'Kecamatan', value: 'kecamatan' },
    { label: 'Kabupaten', value: 'kabupaten' },
    { label: 'Provinsi', value: 'provinsi' },
    { label: 'Nasional', value: 'nasional' },
    { label: 'Internasional', value: 'internasional' },
];

const PrestasiPage: React.FC = () => {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [level, setLevel] = useState<string>('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 9;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAchievements = async () => {
        setLoading(true);
        setError(null);
        try {
            // Updated API call to support level filtering
            const res = await api.getAchievements({
                page,
                pageSize,
                level: level === 'all' ? undefined : level,
            });

            // Robust response handling
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
        } catch (err) {
            console.error('Error fetching achievements:', err);
            setError('Gagal memuat prestasi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
        fetchAchievements();
    }, [level]);

    useEffect(() => {
        fetchAchievements();
    }, [page]);

    const filteredAchievements = useMemo(() => {
        if (!search) return achievements;
        return achievements.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));
    }, [achievements, search]);

    const maxPage = Math.max(1, Math.ceil(total / pageSize));

    const handleShare = (achievement: Achievement) => {
        const url = typeof window !== 'undefined' ? `${window.location.origin}/prestasi/${achievement.slug}` : '';
        const text = `*Prestasi: ${achievement.title}*\n\nBaca selengkapnya di: ${url}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0B0F0C] transition-colors duration-300">
            <section className="bg-gradient-to-r from-emerald-50 via-white to-emerald-50 dark:from-[#0B0F0C] dark:via-[#0F1511] dark:to-[#0B0F0C] border-b border-emerald-100/70 dark:border-white/10">
                <div className="container mx-auto px-4 py-8 md:py-10">
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-emerald-700/70 dark:text-emerald-200/70">
                        <span className="h-[2px] w-8 bg-emerald-500/70"></span>
                        Halaman
                    </div>
                    <h1 className="mt-3 text-2xl md:text-4xl font-bold text-emerald-950 dark:text-white">Prestasi</h1>
                </div>
            </section>

            <div className="container mx-auto px-4 py-20">
                <div className="bg-white dark:bg-[#151B16] rounded-[2rem] shadow-xl shadow-emerald-900/5 p-6 md:p-10 border border-emerald-900/5 dark:border-white/5">

                    {/* Toolbar / Filters */}
                    <div className="flex flex-col lg:flex-row gap-6 mb-10">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-600/50 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari judul prestasi..."
                                className="w-full pl-14 pr-6 py-4 bg-emerald-50/50 dark:bg-white/5 border border-emerald-900/5 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400 font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-10">
                        {/* Sidebar Filters */}
                        <aside className="lg:w-72 space-y-8">
                            <section>
                                <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-emerald-900 dark:text-emerald-400">
                                    <Trophy size={18} /> Tingkat
                                </h3>
                                <div className="space-y-2">
                                    {LEVEL_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setLevel(opt.value)}
                                            className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl font-bold transition-all ${level === opt.value
                                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 scale-[1.02]'
                                                : 'bg-emerald-50/50 dark:bg-white/5 text-emerald-900/60 dark:text-white/60 hover:bg-emerald-100 dark:hover:bg-white/10'
                                                }`}
                                        >
                                            <span className="truncate pr-2">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </aside>

                        {/* Results Grid */}
                        <div className="flex-1">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-24 gap-4">
                                    <Loader2 className="animate-spin text-emerald-600" size={48} />
                                    <p className="text-emerald-900/40 dark:text-white/40 font-bold animate-pulse">Menghubungkan ke Hall of Fame...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-24 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-200 dark:border-red-900/30">
                                    <p className="text-red-600 dark:text-red-400 font-bold">{error}</p>
                                    <button
                                        onClick={() => fetchAchievements()}
                                        className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition"
                                    >
                                        Coba Lagi
                                    </button>
                                </div>
                            ) : filteredAchievements.length === 0 ? (
                                <div className="text-center py-24 bg-emerald-50/50 dark:bg-white/5 rounded-3xl border border-dashed border-emerald-900/10 dark:border-white/10">
                                    <Award className="mx-auto text-emerald-900/20 dark:text-white/10 mb-4" size={64} />
                                    <p className="text-emerald-900/40 dark:text-white/40 font-bold">Belum ada prestasi di tingkat ini.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {filteredAchievements.map((achievement) => (
                                            <div
                                                key={achievement.id}
                                                className="group bg-white dark:bg-[#1C241D] rounded-[2.5rem] overflow-hidden border border-emerald-900/5 dark:border-white/5 hover:border-emerald-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-900/20 hover:-translate-y-2 flex flex-col h-full"
                                            >
                                                <Link href={`/prestasi/${achievement.slug}`} className="relative aspect-[16/10] block overflow-hidden bg-gray-100 dark:bg-white/5">
                                                    <img
                                                        src={achievement.coverUrl || achievement.media?.[0]?.mediaUrl || 'https://picsum.photos/800/600'}
                                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                        alt={achievement.title}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                                    {achievement.isPinned && (
                                                        <div className="absolute top-6 right-6 p-2.5 bg-amber-500 text-white rounded-2xl shadow-lg animate-bounce">
                                                            <Award size={20} />
                                                        </div>
                                                    )}

                                                    {achievement.rank && (
                                                        <div className="absolute bottom-4 left-4 flex gap-2">
                                                            <span className="px-4 py-1.5 bg-yellow-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1">
                                                                <Medal size={12} /> {achievement.rank}
                                                            </span>
                                                        </div>
                                                    )}
                                                </Link>

                                                <div className="p-8 flex flex-col flex-1">
                                                    <div className="flex flex-wrap items-center gap-3 mb-4 text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                                                            <Calendar size={12} />
                                                            {new Date(achievement.achievedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short' })}
                                                        </span>
                                                        {achievement.eventLevel && (
                                                            <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                                                                {achievement.eventLevel}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <Link href={`/prestasi/${achievement.slug}`}>
                                                        <h3 className="text-xl font-black mb-4 text-emerald-900 dark:text-white group-hover:text-emerald-600 transition-colors leading-tight line-clamp-2">
                                                            {achievement.title}
                                                        </h3>
                                                    </Link>

                                                    {achievement.eventName && (
                                                        <p className="text-xs text-emerald-600 dark:text-emerald-500 font-bold mb-4 uppercase tracking-wide">
                                                            Event: {achievement.eventName}
                                                        </p>
                                                    )}

                                                    <p className="text-emerald-900/60 dark:text-white/60 text-sm mb-8 line-clamp-3 leading-relaxed">
                                                        {achievement.description || 'Klik untuk melihat detail prestasi ini.'}
                                                    </p>

                                                    <div className="mt-auto pt-6 border-t border-emerald-900/5 dark:border-white/5 flex items-center justify-between">
                                                        <Link
                                                            href={`/prestasi/${achievement.slug}`}
                                                            className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-xs group/btn"
                                                        >
                                                            SELENGKAPNYA
                                                            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleShare(achievement)}
                                                            className="p-3 bg-emerald-50 dark:bg-white/5 text-emerald-600 dark:text-white/60 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all transform active:scale-95 shadow-sm"
                                                            title="Bagikan Prestasi"
                                                        >
                                                            <Share2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {maxPage > 1 && (
                                        <div className="mt-16 flex justify-center gap-3">
                                            {Array.from({ length: maxPage }).map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setPage(i + 1)}
                                                    className={`w-12 h-12 rounded-2xl font-black transition-all transform active:scale-90 ${page === i + 1
                                                        ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/30'
                                                        : 'bg-emerald-50 dark:bg-white/5 text-emerald-900/60 dark:text-white/40 hover:bg-emerald-100 dark:hover:bg-white/10'
                                                        }`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrestasiPage;
