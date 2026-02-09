'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Share2, Loader2, User } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { NewsPost } from '@/lib/types';

const Berita: React.FC = () => {
    const [news, setNews] = useState<NewsPost[]>([]);
    const [page, setPage] = useState(1);
    const pageSize = 6;
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            setError(null);
            try {
                // Assuming API returns { items: NewsPost[], total: number } or just NewsPost[]
                const res = await api.getNews({ page, pageSize });

                // Handle various response types for robustness
                if (Array.isArray(res)) {
                    setNews(res);
                    setTotal(res.length); // Mock total if no pagination metadata
                } else if ((res as any).items) {
                    setNews((res as any).items);
                    setTotal((res as any).total || 0);
                } else {
                    setNews([]);
                }
            } catch (err) {
                console.error('Error fetching news:', err);
                setError('Gagal memuat berita');
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [page]);

    // Simple Pagination Logic
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    const pageNumbers = Array.from({ length: maxPage }, (_, i) => i + 1);

    const handleShare = (title: string, slug: string) => {
        const url = typeof window !== 'undefined' ? `${window.location.origin}/berita/${slug}` : '';
        const text = `*${title}*\n\nBaca selengkapnya: ${url}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 transition-colors duration-200">
            <section className="bg-gradient-to-r from-emerald-50 via-white to-emerald-50 dark:from-[#0B0F0C] dark:via-[#0F1511] dark:to-[#0B0F0C] border-b border-emerald-100/70 dark:border-white/10">
                <div className="container mx-auto px-4 py-8 md:py-10">
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-emerald-700/70 dark:text-emerald-200/70">
                        <span className="h-[2px] w-8 bg-emerald-500/70"></span>
                        Halaman
                    </div>
                    <h1 className="mt-3 text-2xl md:text-4xl font-bold text-emerald-950 dark:text-white">Berita</h1>
                </div>
            </section>

            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Main Content: News List */}
                    <div className="flex-1 space-y-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold border-l-4 border-primary pl-4 text-gray-800 dark:text-gray-100">
                                Berita Terbaru
                            </h2>
                        </div>

                        {loading && (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="animate-spin text-primary" size={32} />
                            </div>
                        )}

                        {error && (
                            <div className="text-center py-12 text-red-500 bg-red-50 rounded-lg">
                                <p>{error}</p>
                            </div>
                        )}

                        {!loading && !error && news.length === 0 && (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                <p>Belum ada berita tersedia.</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {!loading && !error && news.map((item) => (
                                <article key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full border border-gray-100 dark:border-gray-700">
                                    <div className="relative h-56 overflow-hidden">
                                        <Link href={`/berita/${item.slug}`}>
                                            <img
                                                src={item.coverUrl || 'https://picsum.photos/800/600'}
                                                alt={item.title}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                            />
                                        </Link>
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                {new Date(item.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <User size={14} />
                                                {item.authorName || 'Admin'}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 hover:text-primary dark:hover:text-green-400 line-clamp-2">
                                            <Link href={`/berita/${item.slug}`}>{item.title}</Link>
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                                            {item.excerpt || (item.content ? item.content.substring(0, 100) + '...' : '')}
                                        </p>

                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                                            <Link href={`/berita/${item.slug}`} className="text-primary dark:text-green-400 font-medium text-sm hover:underline">
                                                Baca Selengkapnya
                                            </Link>
                                            <button
                                                onClick={() => handleShare(item.title, item.slug)}
                                                className="text-gray-400 hover:text-green-600 transition-colors p-2 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20"
                                                title="Bagikan"
                                            >
                                                <Share2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* Pagination */}
                        {!loading && !error && news.length > 0 && maxPage > 1 && (
                            <div className="flex justify-center mt-10 gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                    className="px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 disabled:opacity-50"
                                >
                                    Sebelumnya
                                </button>
                                <span className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">
                                    Halaman {page} dari {maxPage}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(maxPage, p + 1))}
                                    disabled={page >= maxPage}
                                    className="px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 disabled:opacity-50"
                                >
                                    Selanjutnya
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Berita;
