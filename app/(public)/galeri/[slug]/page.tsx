'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Share2, ArrowLeft, Image as ImageIcon, X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { Gallery, MediaItem } from '@/lib/types';

const GalleryDetailPage: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;

    const [gallery, setGallery] = useState<Gallery | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeImage, setActiveImage] = useState<number | null>(null);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const res = await api.getGalleryDetail(slug);
            if (!res) throw new Error('NOT_FOUND');
            setGallery(res as Gallery);
        } catch (err: any) {
            console.error('Error fetching gallery detail:', err);
            setError(err.message === 'NOT_FOUND' || (err as any).message === 'NOT_FOUND' ? 'Galeri tidak ditemukan' : 'Gagal memuat detail galeri');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (slug) fetchDetail();
    }, [slug]);

    const handleShare = () => {
        if (!gallery) return;
        const text = `*Galeri: ${gallery.title}*\n\nLihat dokumentasi lengkap di: ${window.location.href}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
    };

    const getDownloadUrl = (url: string) => {
        if (!url) return url;
        // If Cloudinary, force attachment for direct download
        if (url.includes('/upload/')) {
            return url.replace('/upload/', '/upload/fl_attachment/');
        }
        return url;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0B0F0C]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-emerald-900/60 dark:text-white/60 font-bold animate-pulse">Menyiapkan album...</p>
                </div>
            </div>
        );
    }

    if (error || !gallery) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0B0F0C] p-4">
                <div className="max-w-md w-full text-center bg-red-50 dark:bg-red-900/10 p-10 rounded-[2.5rem] border border-red-100 dark:border-red-900/20 shadow-2xl">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                        <ImageIcon size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-red-900 dark:text-red-400 mb-4">{error || 'Album Kosong'}</h2>
                    <p className="text-red-800/60 dark:text-red-400/60 mb-8 font-medium">Sepertinya album galeri yang Anda cari tidak tersedia.</p>
                    <Link
                        href="/galeri"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition transform hover:scale-105 active:scale-95"
                    >
                        <ArrowLeft size={18} /> Kembali ke Galeri
                    </Link>
                </div>
            </div>
        );
    }

    const images = gallery.media || [];
    const coverImage = images.length > 0 ? images[0].mediaUrl : 'https://picsum.photos/1200/600';

    return (
        <div className="min-h-screen bg-white dark:bg-[#0B0F0C] transition-colors duration-300">
            <section className="bg-gradient-to-r from-emerald-50 via-white to-emerald-50 dark:from-[#0B0F0C] dark:via-[#0F1511] dark:to-[#0B0F0C] border-b border-emerald-100/70 dark:border-white/10">
                <div className="container mx-auto px-4 py-8 md:py-10">
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-emerald-700/70 dark:text-emerald-200/70">
                        <span className="h-[2px] w-8 bg-emerald-500/70"></span>
                        Halaman
                    </div>
                    <h1 className="mt-3 text-2xl md:text-4xl font-bold text-emerald-950 dark:text-white">Detail Galeri</h1>
                </div>
            </section>

            <article className="pt-10 pb-20">
                {/* Header Back Button & Share */}
                <div className="container mx-auto px-4 max-w-6xl mb-8 flex justify-between items-center">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm group hover:scale-105 transition"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    KEMBALI KE ALBUM
                </button>
                <button
                    onClick={handleShare}
                    className="p-3 bg-emerald-50 dark:bg-white/5 text-emerald-600 dark:text-emerald-400 rounded-full hover:bg-emerald-100 transition"
                    title="Bagikan"
                >
                    <Share2 size={20} />
                </button>
            </div>

            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header Info */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-block px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                        <Calendar size={14} className="inline mr-2" />
                        {new Date(gallery.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-emerald-950 dark:text-white mb-6 leading-tight">
                        {gallery.title}
                    </h1>
                    <p className="text-xl text-emerald-900/60 dark:text-white/60 leading-relaxed font-medium">
                        {gallery.description}
                    </p>
                </div>

                {/* Masonry Grid */}
                {images.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-[3rem] border border-dashed border-gray-200 dark:border-white/10">
                        <ImageIcon className="mx-auto text-gray-300 mb-4" size={48} />
                        <p className="text-gray-400 font-bold">Album ini belum memiliki foto.</p>
                    </div>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                        {images.map((img, idx) => (
                            <div
                                key={img.id}
                                onClick={() => setActiveImage(idx)}
                                className="break-inside-avoid group relative rounded-3xl overflow-hidden bg-gray-100 dark:bg-white/5 cursor-zoom-in hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                            >
                                <img
                                    src={img.mediaUrl}
                                    alt={img.caption || `Foto ${idx + 1}`}
                                    className="w-full h-auto object-cover"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    <span className="text-white font-bold text-sm bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
                                        Lihat Foto
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {activeImage !== null && images.length > 0 && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
                    {/* Controls */}
                    <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
                        <a
                            href={getDownloadUrl(images[activeImage].mediaUrl)}
                            download
                            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
                            title="Download"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Download size={22} />
                        </a>
                        <button
                            onClick={() => setActiveImage(null)}
                            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <button
                        onClick={(e) => { e.stopPropagation(); setActiveImage(prev => prev! > 0 ? prev! - 1 : images.length - 1); }}
                        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition z-50"
                    >
                        <ChevronLeft size={32} />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); setActiveImage(prev => prev! < images.length - 1 ? prev! + 1 : 0); }}
                        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition z-50"
                    >
                        <ChevronRight size={32} />
                    </button>

                    {/* Image Container */}
                    <div className="max-w-7xl max-h-[85vh] w-full flex flex-col items-center justify-center relative">
                        <img
                            src={images[activeImage].mediaUrl}
                            alt={images[activeImage].caption || ''}
                            className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl"
                        />

                        <div className="absolute -bottom-16 left-0 w-full text-center">
                            <p className="text-white/90 text-lg font-medium mb-1">
                                {images[activeImage].caption || gallery.title}
                            </p>
                            <p className="text-white/50 text-sm font-mono">
                                Foto {activeImage + 1} dari {images.length}
                            </p>
                        </div>
                    </div>
                </div>
            )}
            </article>
        </div>
    );
};

export default GalleryDetailPage;
