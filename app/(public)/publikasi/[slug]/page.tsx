'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Share2, ArrowLeft, ArrowRight, ExternalLink, Image as ImageIcon, ChevronLeft, ChevronRight, X, User } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { Publication, MediaItem } from '@/lib/types';

const TYPE_LABEL: Record<string, string> = {
    announcement: 'Pengumuman',
    article: 'Artikel',
    bulletin: 'Buletin',
};

const PublicationDetailPage: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;

    const [post, setPost] = useState<Publication | null>(null);
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeImage, setActiveImage] = useState<number | null>(null);

    useEffect(() => {
        if (!slug) return;
        const fetchDetail = async () => {
            setLoading(true);
            try {
                // Should return Publication object with embedded media or separate
                const data = await api.getPublicationDetail(slug);
                if (!data) throw new Error('NOT_FOUND');

                // Assuming data structure matches what we expect from API (single object with media relation)
                setPost(data as Publication);
                if ((data as Publication).media) {
                    setMedia((data as Publication).media || []);
                }
            } catch (err) {
                console.error('Error fetching detail:', err);
                setError('Gagal memuat detail publikasi');
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0B0F0C] flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 font-medium animate-pulse">Menyiapkan halaman...</p>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0B0F0C] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mb-6">
                    <X className="text-red-500" size={48} />
                </div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Waduh!</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-md">{error || 'Halaman yang Anda cari tidak tersedia.'}</p>
                <Link href="/publikasi" className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition shadow-xl shadow-emerald-600/20">
                    Kembali ke Publikasi
                </Link>
            </div>
        );
    }

    // Filter media by type
    const images = media.filter(m => m.mediaType === 'image');
    const embeds = media.filter(m => m.mediaType === 'video' || m.mediaType === 'youtube_embed');

    // Get a cover image for SimpleHero (either from post.media or placeholder)
    const coverImage = images.find(img => img.isMain)?.mediaUrl || images[0]?.mediaUrl;

    const handleShare = () => {
        const text = `*${post.title}*\n\nBaca selengkapnya di: ${window.location.href}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0B0F0C] transition-colors duration-300 pb-20">
            <section className="bg-gradient-to-r from-emerald-50 via-white to-emerald-50 dark:from-[#0B0F0C] dark:via-[#0F1511] dark:to-[#0B0F0C] border-b border-emerald-100/70 dark:border-white/10">
                <div className="container mx-auto px-4 py-8 md:py-10">
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-emerald-700/70 dark:text-emerald-200/70">
                        <span className="h-[2px] w-8 bg-emerald-500/70"></span>
                        Halaman
                    </div>
                    <h1 className="mt-3 text-2xl md:text-4xl font-bold text-emerald-950 dark:text-white">Detail Publikasi</h1>
                </div>
            </section>
            <div className="container mx-auto px-4 py-20 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white dark:bg-[#151B16] rounded-[2.5rem] shadow-2xl shadow-emerald-900/20 p-8 md:p-14 border border-emerald-900/5 dark:border-white/5">

                        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-8 border-b border-gray-50 dark:border-white/5">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-emerald-600 transition group"
                            >
                                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition" /> Kembali
                            </button>

                            <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-gray-50 dark:bg-white/5 px-4 py-2 rounded-full">
                                    <Calendar size={14} className="text-emerald-500" />
                                    {new Date(post.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-10 leading-tight">
                            {post.title}
                        </h1>

                        <div
                            className="prose prose-lg max-w-none dark:prose-invert prose-emerald prose-headings:font-black prose-p:leading-relaxed prose-img:rounded-3xl prose-a:text-emerald-600"
                            dangerouslySetInnerHTML={{ __html: post.content || post.description || '' }}
                        />

                        {/* Gallery Section */}
                        {images.length > 0 && (
                            <div className="mt-20 space-y-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-8 bg-emerald-500 rounded-full"></div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">Galeri Foto</h2>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {images.map((img, idx) => (
                                        <div
                                            key={img.id}
                                            onClick={() => setActiveImage(idx)}
                                            className="group relative aspect-square rounded-3xl overflow-hidden cursor-pointer bg-gray-100 dark:bg-white/5"
                                        >
                                            <img
                                                src={img.mediaUrl}
                                                alt={img.caption || 'Gallery Image'}
                                                className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                                <ImageIcon className="text-white" size={32} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Embeds Section (Videos) */}
                        {embeds.length > 0 && (
                            <div className="mt-20 space-y-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-8 bg-emerald-500 rounded-full"></div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">Video Terkait</h2>
                                </div>
                                <div className="space-y-8">
                                    {embeds.map((embed) => (
                                        <div
                                            key={embed.id}
                                            className="aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-white/5"
                                        >
                                            {embed.mediaType === 'youtube_embed' ? (
                                                <iframe
                                                    src={embed.mediaUrl}
                                                    title={embed.caption || 'Video'}
                                                    className="w-full h-full"
                                                    allowFullScreen
                                                />
                                            ) : (
                                                <video src={embed.mediaUrl} controls className="w-full h-full" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-20 pt-10 border-t border-gray-50 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-emerald-100 flex items-center justify-center">
                                    <span className="text-emerald-700 font-bold">AF</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-black uppercase tracking-widest">Penulis</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">Admin Madrasah</p>
                                </div>
                            </div>

                            <button
                                onClick={handleShare}
                                className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition shadow-xl shadow-emerald-600/20"
                            >
                                <Share2 size={18} /> Bagikan Sekarang
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Lightbox */}
            {activeImage !== null && (
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
                            src={images[activeImage].mediaUrl || ''}
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

export default PublicationDetailPage;
