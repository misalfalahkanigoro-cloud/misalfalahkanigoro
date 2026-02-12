'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Share2, ArrowLeft, Tag, Award, Clock, Trophy, Medal, MapPin, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { Achievement } from '@/lib/types';

const AchievementDetailPage: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;

    const [achievement, setAchievement] = useState<Achievement | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeImage, setActiveImage] = useState<number | null>(null);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const res = await api.getAchievementDetail(slug);
            if (!res) throw new Error('NOT_FOUND');
            setAchievement(res as Achievement);
        } catch (err: any) {
            console.error('Error fetching achievement detail:', err);
            setError(err.message === 'NOT_FOUND' || (err as any).message === 'NOT_FOUND' ? 'Prestasi tidak ditemukan' : 'Gagal memuat detail prestasi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (slug) fetchDetail();
    }, [slug]);

    const handleShare = () => {
        if (!achievement) return;
        const text = `*Prestasi: ${achievement.title}*\n\nBaca selengkapnya di: ${window.location.href}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0B0F0C]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-emerald-900/60 dark:text-white/60 font-bold animate-pulse">Membuka lembar sejarah...</p>
                </div>
            </div>
        );
    }

    if (error || !achievement) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0B0F0C] p-4">
                <div className="max-w-md w-full text-center bg-red-50 dark:bg-red-900/10 p-10 rounded-[2.5rem] border border-red-100 dark:border-red-900/20 shadow-2xl">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                        <Award size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-red-900 dark:text-red-400 mb-4">{error || 'Waduh!'}</h2>
                    <p className="text-red-800/60 dark:text-red-400/60 mb-8 font-medium">Sepertinya informasi prestasi yang Anda cari belum diarsipkan atau telah dihapus.</p>
                    <Link
                        href="/prestasi"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition transform hover:scale-105 active:scale-95"
                    >
                        <ArrowLeft size={18} /> Kembali ke Daftar
                    </Link>
                </div>
            </div>
        );
    }

    const mediaItems = achievement.media || [];
    const coverImage =
        achievement.coverUrl ||
        mediaItems.find((m) => m.isMain)?.mediaUrl ||
        mediaItems[0]?.mediaUrl ||
        'https://picsum.photos/1200/600';
    const imageItems = mediaItems.filter((m) => m.mediaType === 'image' && m.mediaUrl !== coverImage);
    const videoItems = mediaItems.filter((m) => m.mediaType === 'video' || m.mediaType === 'youtube_embed');

    return (
        <div className="min-h-screen bg-white dark:bg-[#0B0F0C] transition-colors duration-300">
            <section className="bg-gradient-to-r from-emerald-50 via-white to-emerald-50 dark:from-[#0B0F0C] dark:via-[#0F1511] dark:to-[#0B0F0C] border-b border-emerald-100/70 dark:border-white/10">
                <div className="container mx-auto px-4 py-8 md:py-10">
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-emerald-700/70 dark:text-emerald-200/70">
                        <span className="h-[2px] w-8 bg-emerald-500/70"></span>
                        Halaman
                    </div>
                    <h1 className="mt-3 text-2xl md:text-4xl font-bold text-emerald-950 dark:text-white">Detail Prestasi</h1>
                </div>
            </section>

            <article className="pt-10 pb-20">
                {/* Header Back Button & Share */}
                <div className="container mx-auto px-4 max-w-5xl mb-8 flex justify-between items-center">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm group hover:scale-105 transition"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    KEMBALI
                </button>
                <button
                    onClick={handleShare}
                    className="p-3 bg-emerald-50 dark:bg-white/5 text-emerald-600 dark:text-emerald-400 rounded-full hover:bg-emerald-100 transition"
                    title="Bagikan"
                >
                    <Share2 size={20} />
                </button>
            </div>

                <div className="container mx-auto px-4 max-w-5xl">
                    {/* Hero Section */}
                    <div className="relative aspect-[21/9] rounded-[3rem] overflow-hidden mb-12 shadow-2xl shadow-emerald-900/20 border border-emerald-900/5 dark:border-white/5 group">
                        <img
                            src={coverImage}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                            alt={achievement.title}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                    <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            {achievement.rank && (
                                <span className="px-4 py-1.5 bg-yellow-500 text-white text-sm font-black uppercase tracking-widest rounded-full shadow-lg flex items-center gap-2">
                                    <Medal size={16} /> {achievement.rank}
                                </span>
                            )}
                            <span className="px-4 py-1.5 bg-emerald-600 text-white text-sm font-black uppercase tracking-widest rounded-full shadow-lg flex items-center gap-2">
                                <Trophy size={16} /> {achievement.eventLevel || 'Prestasi'}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight drop-shadow-md">
                            {achievement.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-white/80 font-bold text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar size={18} className="text-emerald-400" />
                                <span>{new Date(achievement.achievedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                            {achievement.eventName && (
                                <div className="flex items-center gap-2">
                                    <MapPin size={18} className="text-emerald-400" />
                                    <span>Event: {achievement.eventName}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-12">
                        {/* Rich Content */}
                        <div className="bg-white dark:bg-[#151B16] rounded-[3rem] p-8 md:p-14 shadow-xl border border-emerald-900/5 dark:border-white/5">
                            {achievement.description && (
                                <div className="mb-10 text-xl md:text-2xl font-medium text-emerald-900/70 dark:text-white/80 leading-relaxed border-l-4 border-emerald-500 pl-8 italic">
                                    "{achievement.description}"
                                </div>
                            )}

                            {/* Additional Content (if any) */}
                            {achievement.content && (
                                <div
                                    className="prose prose-lg dark:prose-invert max-w-none 
                                    prose-headings:font-black prose-headings:text-emerald-950 dark:prose-headings:text-white
                                    prose-p:text-emerald-900/70 dark:prose-p:text-white/70 prose-p:leading-loose
                                    prose-img:rounded-3xl prose-img:shadow-2xl
                                    prose-strong:text-emerald-900 dark:prose-strong:text-emerald-400 prose-strong:font-black"
                                    dangerouslySetInnerHTML={{ __html: achievement.content }}
                                />
                            )}

                            {imageItems.length > 0 && (
                                <div className="mt-12">
                                    <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Dokumentasi Lainnya</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {imageItems.map((media, idx) => (
                                            <div
                                                key={media.id}
                                                className="rounded-2xl overflow-hidden aspect-square cursor-pointer group"
                                                onClick={() => setActiveImage(idx)}
                                            >
                                                <img
                                                    src={media.mediaUrl}
                                                    alt={media.caption || ''}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {videoItems.length > 0 && (
                                <div className="mt-12">
                                    <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Video Terkait</h3>
                                    <div className="grid grid-cols-1 gap-6">
                                        {videoItems.map((media) => (
                                            <div key={media.id} className="rounded-2xl overflow-hidden border border-emerald-900/5 dark:border-white/5 bg-black/5">
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
                                                    <div className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 border-t border-emerald-900/5 dark:border-white/5">
                                                        {media.caption}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Info */}
                        <div className="mt-12 flex flex-col items-center justify-center py-12 border-t border-emerald-900/5 dark:border-white/5 text-center">
                            <div className="w-16 h-16 bg-emerald-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 text-emerald-600">
                                <Award size={32} />
                            </div>
                            <h4 className="text-emerald-900 dark:text-white font-black uppercase tracking-widest text-sm mb-2">Terima Kasih Atas Inspirasinya</h4>
                            <p className="text-emerald-900/40 dark:text-white/40 text-xs font-bold font-mono">ID: ACH-{achievement.id?.slice(0, 8)}</p>
                        </div>
                    </div>
                </div>
            </div>
            </article>

            {activeImage !== null && imageItems.length > 0 && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
                    <button
                        onClick={() => setActiveImage(null)}
                        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
                    >
                        <X size={24} />
                    </button>

                    <button
                        onClick={() => setActiveImage(prev => prev! > 0 ? prev! - 1 : imageItems.length - 1)}
                        className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
                    >
                        <ChevronLeft size={32} />
                    </button>

                    <div className="max-w-5xl w-full h-[80vh] flex flex-col items-center justify-center gap-6">
                        <img
                            src={imageItems[activeImage].mediaUrl}
                            alt={imageItems[activeImage].caption || ''}
                            className="max-h-full max-w-full object-contain rounded-xl"
                        />
                        {imageItems[activeImage].caption && (
                            <p className="text-white text-lg font-bold">{imageItems[activeImage].caption}</p>
                        )}
                    </div>

                    <button
                        onClick={() => setActiveImage(prev => prev! < imageItems.length - 1 ? prev! + 1 : 0)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
                    >
                        <ChevronRight size={32} />
                    </button>
                </div>
            )}
        </div>
    );
}

export default AchievementDetailPage;
