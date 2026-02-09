'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Loader2, Share2, Search, ArrowRight, Image as ImageIcon, Layers } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Gallery } from '@/lib/types';

const GaleriPage: React.FC = () => {
    const [galleries, setGalleries] = useState<Gallery[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 9;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGalleries = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.getGalleries({
                page,
                pageSize,
            });

            // Robust response handling
            let items: Gallery[] = [];
            let totalItems = 0;

            if (Array.isArray(res)) {
                items = res;
                totalItems = res.length;
            } else if ((res as any).items) {
                items = (res as any).items;
                totalItems = (res as any).total || 0;
            }

            setGalleries(items);
            setTotal(totalItems);
        } catch (err) {
            console.error('Error fetching galleries:', err);
            setError('Gagal memuat galeri');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGalleries();
    }, [page]);

    const filteredGalleries = galleries.filter(g =>
        g.title.toLowerCase().includes(search.toLowerCase())
    );

    const maxPage = Math.max(1, Math.ceil(total / pageSize));

    return (
        <div className="min-h-screen bg-white dark:bg-[#0B0F0C] transition-colors duration-300">
            <section className="bg-gradient-to-r from-emerald-50 via-white to-emerald-50 dark:from-[#0B0F0C] dark:via-[#0F1511] dark:to-[#0B0F0C] border-b border-emerald-100/70 dark:border-white/10">
                <div className="container mx-auto px-4 py-8 md:py-10">
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-emerald-700/70 dark:text-emerald-200/70">
                        <span className="h-[2px] w-8 bg-emerald-500/70"></span>
                        Halaman
                    </div>
                    <h1 className="mt-3 text-2xl md:text-4xl font-bold text-emerald-950 dark:text-white">Galeri</h1>
                </div>
            </section>

            <div className="container mx-auto px-4 py-20">
                <div className="bg-white dark:bg-[#151B16] rounded-[2rem] shadow-xl shadow-emerald-900/5 p-6 md:p-10 border border-emerald-900/5 dark:border-white/5">

                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-10">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                                <ImageIcon size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white">Galeri Sekolah</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Dokumentasi kegiatan dan momen berharga</p>
                            </div>
                        </div>

                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari album galeri..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-transparent dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition text-sm outline-none"
                            />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div>
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-gray-400 text-sm font-medium">Menyiapkan album foto...</p>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 dark:bg-red-900/10 p-10 rounded-3xl text-center">
                                <p className="text-red-600 dark:text-red-400 font-bold">{error}</p>
                                <button onClick={fetchGalleries} className="mt-4 text-sm underline opacity-70">Ulangi pencarian</button>
                            </div>
                        ) : filteredGalleries.length === 0 ? (
                            <div className="text-center py-20 px-6 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[2rem]">
                                <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Layers className="text-gray-300" size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Album Kosong</h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto text-sm">Belum ada album galeri yang dipublikasikan saat ini.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredGalleries.map((gallery) => {
                                    // Get cover from media array or fallback
                                    const coverUrl = gallery.media && gallery.media.length > 0
                                        ? gallery.media[0].mediaUrl
                                        : 'https://images.unsplash.com/photo-1509024644558-2f56ce0a5fb4?auto=format&fit=crop&q=80&w=800';

                                    const itemCount = gallery.media ? gallery.media.length : 0;

                                    return (
                                        <Link
                                            key={gallery.id}
                                            href={`/galeri/${gallery.slug}`}
                                            className="group relative block bg-gray-100 dark:bg-white/5 rounded-[2.5rem] overflow-hidden aspect-[4/5] hover:shadow-2xl hover:shadow-emerald-900/20 transition-all duration-500 hover:-translate-y-2"
                                        >
                                            <img
                                                src={coverUrl}
                                                alt={gallery.title}
                                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>

                                            <div className="absolute bottom-0 left-0 w-full p-8 text-white">
                                                <div className="mb-4">
                                                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold mb-2">
                                                        {new Date(gallery.publishedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}
                                                    </span>
                                                    <h3 className="text-2xl font-black leading-tight mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors">
                                                        {gallery.title}
                                                    </h3>
                                                    <p className="text-white/70 text-sm line-clamp-2 mb-4">
                                                        {gallery.description}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
                                                        <ImageIcon size={14} />
                                                        {itemCount} Foto
                                                    </div>
                                                    <span className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                                        <ArrowRight size={18} />
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination */}
                        {!loading && !error && maxPage > 1 && (
                            <div className="flex items-center justify-center gap-2 pt-16">
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
                </div>
            </div>
        </div>
    );
};

export default GaleriPage;
