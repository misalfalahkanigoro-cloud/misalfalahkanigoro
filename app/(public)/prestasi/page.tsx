'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Award, Calendar, Loader2, Share2, Search, ArrowRight, Tag } from 'lucide-react';
import PublicHero from '@/components/PublicHero';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Achievement } from '@/lib/types';

interface AchievementResponse {
    items: Achievement[];
    total: number;
    page: number;
    pageSize: number;
    categories: string[];
    categoryCounts: { category: string; count: number }[];
}

const PrestasiPage: React.FC = () => {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
    const [category, setCategory] = useState<string>('Semua');
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
            const data = await api.getAchievements({
                page,
                pageSize,
                category: category === 'Semua' ? undefined : category,
            }) as AchievementResponse;
            setAchievements(data.items || []);
            setCategories(data.categories || []);
            setTotal(data.total || 0);
            setCategoryCounts(
                (data.categoryCounts || []).reduce<Record<string, number>>((acc, curr) => {
                    acc[curr.category] = curr.count;
                    return acc;
                }, {})
            );
        } catch (err) {
            console.error('Error fetching achievements:', err);
            setError('Gagal memuat prestasi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAchievements();
    }, [page, category]);

    const filteredAchievements = useMemo(() => {
        if (!search) return achievements;
        return achievements.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));
    }, [achievements, search]);

    const maxPage = Math.max(1, Math.ceil(total / pageSize));

    const handleShare = (achievement: Achievement) => {
        const text = `*Prestasi: ${achievement.title}*\n\n${achievement.excerpt || ''}\n\nBaca selengkapnya di: ${window.location.protocol}//${window.location.host}/prestasi/${achievement.slug}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0B0F0C] transition-colors duration-300">
            <PublicHero />

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
                                placeholder="Cari berdasarkan judul prestasi..."
                                className="w-full pl-14 pr-6 py-4 bg-emerald-50/50 dark:bg-white/5 border border-emerald-900/5 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400 font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-10">
                        {/* Sidebar Filters */}
                        <aside className="lg:w-72 space-y-8">
                            <section>
                                <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-emerald-900 dark:text-emerald-400">
                                    <Tag size={18} /> Kategori
                                </h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setCategory('Semua')}
                                        className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl font-bold transition-all ${category === 'Semua'
                                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 scale-[1.02]'
                                            : 'bg-emerald-50/50 dark:bg-white/5 text-emerald-900/60 dark:text-white/60 hover:bg-emerald-100 dark:hover:bg-white/10'
                                            }`}
                                    >
                                        <span>Semua</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${category === 'Semua' ? 'bg-white/20' : 'bg-emerald-900/10 dark:bg-white/10'}`}>
                                            {total}
                                        </span>
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setCategory(cat)}
                                            className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl font-bold transition-all ${category === cat
                                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 scale-[1.02]'
                                                : 'bg-emerald-50/50 dark:bg-white/5 text-emerald-900/60 dark:text-white/60 hover:bg-emerald-100 dark:hover:bg-white/10'
                                                }`}
                                        >
                                            <span className="truncate pr-2">{cat}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${category === cat ? 'bg-white/20' : 'bg-emerald-900/10 dark:bg-white/10'}`}>
                                                {categoryCounts[cat] || 0}
                                            </span>
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
                                    <p className="text-emerald-900/40 dark:text-white/40 font-bold animate-pulse">Menghubungkan ke arsip...</p>
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
                                    <p className="text-emerald-900/40 dark:text-white/40 font-bold">Belum ada prestasi di kategori ini.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {filteredAchievements.map((achievement) => (
                                            <div
                                                key={achievement.id}
                                                className="group bg-white dark:bg-[#1C241D] rounded-[2.5rem] overflow-hidden border border-emerald-900/5 dark:border-white/5 hover:border-emerald-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-900/20 hover:-translate-y-2 flex flex-col"
                                            >
                                                <Link href={`/prestasi/${achievement.slug}`} className="relative aspect-[16/10] block overflow-hidden">
                                                    <img
                                                        src={achievement.coverUrl || 'https://picsum.photos/800/600'}
                                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                        alt={achievement.title}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                                    {achievement.isPinned && (
                                                        <div className="absolute top-6 right-6 p-2.5 bg-amber-500 text-white rounded-2xl shadow-lg animate-bounce">
                                                            <Award size={20} />
                                                        </div>
                                                    )}
                                                </Link>

                                                <div className="p-8 flex flex-col flex-1">
                                                    <div className="flex items-center gap-3 mb-4 text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                                                            <Calendar size={12} />
                                                            {achievement.achievedAt ? new Date(achievement.achievedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short' }) : 'Baru'}
                                                        </span>
                                                        {achievement.category && (
                                                            <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                                                                {achievement.category}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <Link href={`/prestasi/${achievement.slug}`}>
                                                        <h3 className="text-xl font-black mb-4 text-emerald-900 dark:text-white group-hover:text-emerald-600 transition-colors leading-tight line-clamp-2">
                                                            {achievement.title}
                                                        </h3>
                                                    </Link>

                                                    <p className="text-emerald-900/60 dark:text-white/60 text-sm mb-8 line-clamp-3 leading-relaxed">
                                                        {achievement.excerpt || achievement.contentText?.substring(0, 150) + '...'}
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
