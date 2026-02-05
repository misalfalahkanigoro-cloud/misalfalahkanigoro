'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Loader2, Share2, Search, ArrowRight, Tag } from 'lucide-react';
import PublicHero from '@/components/PublicHero';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { ContentListResponse, ContentPost, ContentType } from '@/lib/types';

const TYPE_OPTIONS: { label: string; value: ContentType | 'all' }[] = [
    { label: 'Semua', value: 'all' },
    { label: 'Berita', value: 'news' },
    { label: 'Pengumuman', value: 'announcement' },
    { label: 'Artikel', value: 'article' },
    { label: 'Galeri', value: 'gallery' },
    { label: 'Unduhan', value: 'download' },
];

const TYPE_THEME: Record<ContentType, { bg: string; text: string; label: string }> = {
    news: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Berita' },
    announcement: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', label: 'Pengumuman' },
    article: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', label: 'Artikel' },
    gallery: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', label: 'Galeri' },
    download: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', label: 'Unduhan' },
};

const PublikasiPage: React.FC = () => {
    const [posts, setPosts] = useState<ContentPost[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
    const [category, setCategory] = useState<string>('Semua');
    const [type, setType] = useState<ContentType | 'all'>('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 9;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPosts = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getContentPosts({
                page,
                pageSize,
                category: category === 'Semua' ? undefined : category,
                type: type === 'all' ? undefined : type,
            }) as ContentListResponse;
            setPosts(data.items || []);
            setCategories(data.categories || []);
            setTotal(data.total || 0);
            setCategoryCounts(
                (data.categoryCounts || []).reduce<Record<string, number>>((acc, curr) => {
                    acc[curr.category] = curr.count;
                    return acc;
                }, {})
            );
        } catch (err) {
            console.error('Error fetching publikasi:', err);
            setError('Gagal memuat publikasi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [page, category, type]);

    useEffect(() => {
        setCategory('Semua');
        setPage(1);
    }, [type]);

    const filteredPosts = useMemo(() => {
        if (!search) return posts;
        return posts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
    }, [posts, search]);

    const maxPage = Math.max(1, Math.ceil(total / pageSize));

    const handleShare = (post: ContentPost) => {
        const text = `*${post.title}*\n\n${post.excerpt || ''}\n\nBaca selengkapnya di: ${window.location.protocol}//${window.location.host}/publikasi/${post.slug}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0B0F0C] transition-colors duration-300">
            <PublicHero />

            <div className="container mx-auto px-4 py-20">
                <div className="bg-white dark:bg-[#151B16] rounded-[2rem] shadow-xl shadow-emerald-900/5 p-6 md:p-10 border border-emerald-900/5 dark:border-white/5">

                    {/* Toolbar / Filters */}
                    <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-10">
                        <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                            {TYPE_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setType(option.value)}
                                    className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${type === option.value
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                                        : 'bg-gray-50 text-gray-500 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-white/5 dark:text-gray-400'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari judul publikasi..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-transparent dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition text-sm outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                        {/* Main Content */}
                        <div className="lg:col-span-3 space-y-10">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                                    <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-gray-400 text-sm font-medium">Menyelaraskan data...</p>
                                </div>
                            ) : error ? (
                                <div className="bg-red-50 dark:bg-red-900/10 p-10 rounded-3xl text-center">
                                    <p className="text-red-600 dark:text-red-400 font-bold">{error}</p>
                                    <button onClick={fetchPosts} className="mt-4 text-sm underline opacity-70">Ulangi pencarian</button>
                                </div>
                            ) : filteredPosts.length === 0 ? (
                                <div className="text-center py-20 px-6 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[2rem]">
                                    <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search className="text-gray-300" size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Konten Tidak Ditemukan</h3>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto text-sm">Maaf, kami tidak menemukan publikasi yang sesuai dengan kriteria yang Anda cari.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {filteredPosts.map((post) => {
                                        const theme = TYPE_THEME[post.type];
                                        return (
                                            <article
                                                key={post.id}
                                                className="group bg-white dark:bg-[#1A221B] rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden hover:shadow-2xl hover:shadow-emerald-900/10 transition-all duration-500 flex flex-col"
                                            >
                                                <Link href={`/publikasi/${post.slug}`} className="relative h-56 overflow-hidden">
                                                    <img
                                                        src={post.coverUrl || 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&q=80&w=800'}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                                        <span className="text-white text-xs font-bold flex items-center gap-1">
                                                            Baca Selengkapnya <ArrowRight size={14} />
                                                        </span>
                                                    </div>
                                                    <div className={`absolute top-4 left-4 ${theme.bg} ${theme.text} px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider backdrop-blur-md`}>
                                                        {theme.label}
                                                    </div>
                                                </Link>
                                                <div className="p-6 flex-1 flex flex-col">
                                                    <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-3">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={12} className="text-emerald-500" />
                                                            {new Date(post.publishedAt || post.createdAt || '').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                        {post.category && (
                                                            <span className="flex items-center gap-1">
                                                                <Tag size={12} className="text-emerald-500" />
                                                                {post.category}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Link href={`/publikasi/${post.slug}`} className="block group/title">
                                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-snug group-hover/title:text-emerald-600 transition">
                                                            {post.title}
                                                        </h3>
                                                    </Link>
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 mb-6 leading-relaxed">
                                                        {post.excerpt || post.contentText || 'Klik untuk membaca detail selengkapnya tentang publikasi ini.'}
                                                    </p>

                                                    <div className="mt-auto flex items-center justify-between pt-5 border-t border-gray-50 dark:border-white/5">
                                                        <Link
                                                            href={`/publikasi/${post.slug}`}
                                                            className="text-xs font-black text-emerald-600 dark:text-emerald-500 flex items-center gap-1 group/btn"
                                                        >
                                                            SELENGKAPNYA
                                                            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleShare(post)}
                                                            className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-white/5 transition"
                                                            title="Bagikan ke WhatsApp"
                                                        >
                                                            <Share2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Pagination */}
                            {!loading && !error && maxPage > 1 && (
                                <div className="flex items-center justify-center gap-2 pt-10">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="h-12 w-12 rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-white/5 text-gray-500 disabled:opacity-30 transition hover:bg-emerald-50 hover:text-emerald-700"
                                    >
                                        <ArrowRight size={20} className="rotate-180" />
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: maxPage }, (_, i) => i + 1).map(n => (
                                            <button
                                                key={n}
                                                onClick={() => setPage(n)}
                                                className={`h-12 w-12 rounded-2xl text-sm font-bold transition ${page === n
                                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                                                    : 'bg-gray-50 dark:bg-white/5 text-gray-500 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {n}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setPage(p => Math.min(maxPage, p + 1))}
                                        disabled={page === maxPage}
                                        className="h-12 w-12 rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-white/5 text-gray-500 disabled:opacity-30 transition hover:bg-emerald-50 hover:text-emerald-700"
                                    >
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <aside className="space-y-8">
                            <div className="bg-gray-50/50 dark:bg-white/5 rounded-3xl p-6 border border-gray-100 dark:border-white/5">
                                <h4 className="text-base font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                                    Kategori Publikasi
                                </h4>
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={() => { setCategory('Semua'); setPage(1); }}
                                        className={`flex items-center justify-between px-4 py-3 rounded-2xl transition ${category === 'Semua'
                                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                                            : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        <span className="text-sm font-bold">Semua Kategori</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${category === 'Semua' ? 'bg-white/20' : 'bg-gray-200 dark:bg-white/10'}`}>
                                            {total}
                                        </span>
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => { setCategory(cat); setPage(1); }}
                                            className={`flex items-center justify-between px-4 py-3 rounded-2xl transition ${category === cat
                                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                                                : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-600 dark:text-gray-400'
                                                }`}
                                        >
                                            <span className="text-sm font-bold">{cat}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${category === cat ? 'bg-white/20' : 'bg-gray-200 dark:bg-white/10'}`}>
                                                {categoryCounts[cat] || 0}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </aside>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublikasiPage;


