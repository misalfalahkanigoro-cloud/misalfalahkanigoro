'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, ArrowLeft, Loader2, User, Clock, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { NewsPost } from '@/lib/types';

const NewsDetail: React.FC = () => {
    const params = useParams();
    const slug = params?.slug as string;
    const [news, setNews] = useState<NewsPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeImage, setActiveImage] = useState<number | null>(null);

    useEffect(() => {
        if (!slug) return;
        const fetchDetail = async () => {
            try {
                const data = await api.getNewsDetail(slug);
                if (!data) throw new Error('NOT_FOUND');
                setNews(data as NewsPost);
            } catch (err) {
                const message = err instanceof Error ? err.message : '';
                console.error('Error fetching news detail:', err);
                setError(message === 'NOT_FOUND' || (err as any).message === 'NOT_FOUND' ? 'Berita tidak ditemukan' : 'Gagal memuat berita');
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (error || !news) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4 bg-gray-50 dark:bg-gray-900">
                <p className="text-red-500 mb-4 font-semibold">{error || 'Berita tidak tersedia'}</p>
                <Link href="/berita" className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-primary dark:text-green-400 font-semibold flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <ArrowLeft size={16} /> Kembali ke Berita
                </Link>
            </div>
        );
    }

    const images = news.media?.filter((m) => m.mediaType === 'image') || [];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors duration-200">
            <section className="bg-gradient-to-r from-emerald-50 via-white to-emerald-50 dark:from-[#0B0F0C] dark:via-[#0F1511] dark:to-[#0B0F0C] border-b border-emerald-100/70 dark:border-white/10">
                <div className="container mx-auto px-4 py-8 md:py-10">
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-emerald-700/70 dark:text-emerald-200/70">
                        <span className="h-[2px] w-8 bg-emerald-500/70"></span>
                        Halaman
                    </div>
                    <h1 className="mt-3 text-2xl md:text-4xl font-bold text-emerald-950 dark:text-white">Detail Berita</h1>
                </div>
            </section>
            <div className="container mx-auto px-4 py-20 relative z-10">
                <article className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                    {/* Header Image */}
                    {news.coverUrl && (
                        <div className="w-full h-[300px] md:h-[400px] overflow-hidden group">
                            <img
                                src={news.coverUrl}
                                alt={news.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    )}

                    <div className="p-6 md:p-10">
                        {/* Meta Data */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                            <span className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                                <Calendar size={14} className="text-primary" />
                                {new Date(news.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                                <User size={14} className="text-primary" />
                                {news.authorName || 'Admin'}
                            </span>
                            {news.updatedAt !== news.createdAt && (
                                <span className="flex items-center gap-2 text-xs italic">
                                    <Clock size={12} />
                                    Diupdate: {new Date(news.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
                            {news.title}
                        </h1>

                        {/* Content */}
                        <div className="prose prose-lg prose-emerald dark:prose-invert max-w-none">
                            {news.content ? (
                                // If content is HTML (from WYSIWYG)
                                <div dangerouslySetInnerHTML={{ __html: news.content }} />
                            ) : (
                                // Fallback if no content
                                <p className="text-gray-600 dark:text-gray-300 italic">Belum ada konten detail untuk berita ini.</p>
                            )}
                        </div>

                        {/* Gallery / Media Attachments (Optional) */}
                        {news.media && news.media.length > 0 && (
                            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-700 space-y-10">
                                {news.media.filter((m) => m.mediaType === 'image').length > 0 && (
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Galeri Foto</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {images.map((media, idx) => (
                                                <div
                                                    key={media.id}
                                                    className="rounded-lg overflow-hidden h-40 cursor-zoom-in group"
                                                    onClick={() => setActiveImage(idx)}
                                                >
                                                    <img src={media.mediaUrl} alt={media.caption || ''} className="w-full h-full object-cover hover:scale-110 transition-transform" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {news.media.filter((m) => m.mediaType === 'video' || m.mediaType === 'youtube_embed').length > 0 && (
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Video Terkait</h3>
                                        <div className="grid grid-cols-1 gap-6">
                                            {news.media.filter((m) => m.mediaType === 'video' || m.mediaType === 'youtube_embed').map((media) => (
                                                <div key={media.id} className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-black/5">
                                                    {media.mediaType === 'video' ? (
                                                        <video controls className="w-full aspect-video bg-black">
                                                            <source src={media.mediaUrl} />
                                                        </video>
                                                    ) : (
                                                        media.mediaUrl.includes('<iframe') ? (
                                                            <div
                                                                className="aspect-video [&_iframe]:h-full [&_iframe]:w-full"
                                                                dangerouslySetInnerHTML={{ __html: media.mediaUrl }}
                                                            />
                                                        ) : (
                                                            <iframe
                                                                src={media.mediaUrl}
                                                                className="w-full aspect-video"
                                                                allowFullScreen
                                                            />
                                                        )
                                                    )}
                                                    {media.caption && (
                                                        <div className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700">
                                                            {media.caption}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </article>

                <div className="mt-8 text-center">
                    <Link href="/berita" className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-all">
                        <ArrowLeft size={18} /> Kembali ke Daftar Berita
                    </Link>
                </div>
            </div>

            {activeImage !== null && images.length > 0 && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
                    <button
                        onClick={() => setActiveImage(null)}
                        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
                    >
                        <X size={24} />
                    </button>

                    <button
                        onClick={() => setActiveImage(prev => prev! > 0 ? prev! - 1 : images.length - 1)}
                        className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
                    >
                        <ChevronLeft size={32} />
                    </button>

                    <div className="max-w-5xl w-full h-[80vh] flex flex-col items-center justify-center gap-6">
                        <img
                            src={images[activeImage].mediaUrl}
                            alt={images[activeImage].caption || ''}
                            className="max-h-full max-w-full object-contain rounded-xl"
                        />
                        {images[activeImage].caption && (
                            <p className="text-white text-lg font-bold">{images[activeImage].caption}</p>
                        )}
                    </div>

                    <button
                        onClick={() => setActiveImage(prev => prev! < images.length - 1 ? prev! + 1 : 0)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
                    >
                        <ChevronRight size={32} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default NewsDetail;
