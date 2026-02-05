'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Share2, Loader2 } from 'lucide-react';
import PublicHero from '@/components/PublicHero';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { NewsItem, NewsListResponse } from '@/lib/types';

const Berita: React.FC = () => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
    const [category, setCategory] = useState<string>('Semua');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 6;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await api.getNews({
                    page,
                    pageSize,
                    category: category === 'Semua' ? undefined : category,
                }) as NewsListResponse;
                setNews(data.items);
                setCategories(data.categories);
                setTotal(data.total);
                setCategoryCounts(
                    data.categoryCounts.reduce<Record<string, number>>((acc, curr) => {
                        acc[curr.category] = curr.count;
                        return acc;
                    }, {})
                );
            } catch (err) {
                console.error('Error fetching news:', err);
                setError('Gagal memuat berita');
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [page, category]);

    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    const pageNumbers = Array.from({ length: maxPage }, (_, i) => i + 1);

    useEffect(() => {
        if (page > maxPage) {
            setPage(maxPage);
        }
    }, [page, maxPage]);

    const handleShare = (title: string) => {
        const text = `*${title}*\n\nBaca berita selengkapnya di Website MIS Al-Falah Kanigoro.`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 transition-colors duration-200">
            <PublicHero
                title="Kabar Madrasah"
                subtitle="Ikuti terus perkembangan dan kegiatan terbaru di MIS Al-Falah Kanigoro."
            />

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content: News List */}
                    <div className="lg:col-span-2 space-y-8">
                        {loading && (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="animate-spin text-primary" size={32} />
                            </div>
                        )}

                        {error && (
                            <div className="text-center py-12 text-red-500">
                                <p>{error}</p>
                            </div>
                        )}

                        {!loading && !error && news.length === 0 && (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                <p>Belum ada berita tersedia.</p>
                            </div>
                        )}

                        {!loading && !error && news.map((item) => (
                            <article key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-all">
                                <div className="md:w-1/3 h-48 md:h-auto">
                                    <img src={item.thumbnailUrl || 'https://picsum.photos/800/600'} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-6 md:w-2/3 flex flex-col justify-center">
                                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-2">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </span>
                                        <span className="text-primary dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded">{item.category}</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 hover:text-primary dark:hover:text-green-400 cursor-pointer">{item.title}</h2>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{item.excerpt}</p>

                                    <div className="flex items-center justify-between mt-auto">
                                        {item.slug ? (
                                            <Link href={`/berita/${item.slug}`} className="text-primary dark:text-green-400 font-medium text-sm hover:underline">Baca Selengkapnya</Link>
                                        ) : (
                                            <button className="text-primary dark:text-green-400 font-medium text-sm hover:underline">Baca Selengkapnya</button>
                                        )}
                                        <button
                                            onClick={() => handleShare(item.title)}
                                            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-[#25D366] dark:hover:text-[#25D366] text-sm font-medium transition-colors px-3 py-1.5 rounded-full hover:bg-green-50 dark:hover:bg-gray-700 group"
                                            title="Bagikan ke WhatsApp"
                                        >
                                            <Share2 size={16} className="group-hover:scale-110 transition-transform" />
                                            <span>Share</span>
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                        {!loading && !error && news.length > 0 && (
                            <div className="flex flex-wrap justify-center mt-8 gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                    className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Previous page"
                                >
                                    ‹
                                </button>
                                {pageNumbers.map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => setPage(num)}
                                        className={`w-10 h-10 rounded-full text-sm font-semibold flex items-center justify-center ${num === page ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                    >
                                        {num}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setPage(p => Math.min(maxPage, p + 1))}
                                    disabled={page >= maxPage}
                                    className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Next page"
                                >
                                    ›
                                </button>
                                <div className="flex gap-2 items-center ml-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Jump:</span>
                                    <select
                                        value={page}
                                        onChange={(e) => setPage(parseInt(e.target.value, 10))}
                                        className="h-10 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200"
                                    >
                                        {pageNumbers.map((num) => (
                                            <option key={num} value={num}>Hal {num}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-8">
                        {/* Categories */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-colors">
                            <h3 className="font-bold text-lg mb-4 border-b dark:border-gray-700 pb-2 text-gray-900 dark:text-white">Kategori</h3>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                {['Semua', ...categories].map((cat) => (
                                    <li
                                        key={cat}
                                        onClick={() => {
                                            setCategory(cat);
                                            setPage(1);
                                        }}
                                        className={`flex justify-between cursor-pointer ${category === cat ? 'text-primary dark:text-green-400 font-semibold' : 'hover:text-primary dark:hover:text-green-400'}`}
                                    >
                                        <span>{cat}</span>
                                        <span className="bg-gray-100 dark:bg-gray-700 px-2 rounded-full text-xs py-0.5">
                                            {cat === 'Semua' ? total : (categoryCounts[cat] || 0)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Recent Posts Mini */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-colors">
                            <h3 className="font-bold text-lg mb-4 border-b dark:border-gray-700 pb-2 text-gray-900 dark:text-white">Terpopuler</h3>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-3 items-start group cursor-pointer">
                                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden shrink-0">
                                            <img src={`https://picsum.photos/id/${1050 + i}/100/100`} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 group-hover:text-primary dark:group-hover:text-green-400 line-clamp-2">Kegiatan Tengah Semester Genap Tahun 2023</h4>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">12 Okt 2023</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>

                </div>
            </div>
        </div>
    );
};

export default Berita;
