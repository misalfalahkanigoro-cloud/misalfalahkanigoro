'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, BookOpen, Sparkles, X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { api } from '@/lib/api';
import type { AcademicPage, MediaItem } from '@/lib/types';

const Akademik: React.FC = () => {
    const [page, setPage] = useState<AcademicPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeImage, setActiveImage] = useState<number | null>(null);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const data = await api.pages.getAcademic();
                setPage(data as AcademicPage);
            } catch (err) {
                console.error('Error fetching academic page:', err);
                setError('Gagal memuat akademik');
            } finally {
                setLoading(false);
            }
        };

        fetchPage();
    }, []);

    const fallback: AcademicPage = {
        id: 'main',
        title: 'Akademik',
        subtitle: 'Integrasi kurikulum nasional dan nilai keislaman.',
        content: 'Halaman akademik berisi gambaran kurikulum, metode pembelajaran, dan program unggulan.',
        sections: [
            { id: '1', pageId: 'main', title: 'Kurikulum Terintegrasi', body: 'Kurikulum nasional dipadukan dengan kurikulum madrasah.', displayOrder: 1 },
            { id: '2', pageId: 'main', title: 'Program Unggulan', body: 'Tahfidz, literasi, sains, dan penguatan bahasa.', displayOrder: 2 },
            { id: '3', pageId: 'main', title: 'Metode Pembelajaran', body: 'Project based learning, kolaboratif, dan pembiasaan adab.', displayOrder: 3 },
        ],
        media: [],
        coverUrl: null,
    };

    const view = page ?? fallback;
    const mediaItems = (view.media || []) as MediaItem[];
    const coverImage =
        view.coverUrl ||
        mediaItems.find((m) => m.isMain)?.mediaUrl ||
        mediaItems[0]?.mediaUrl ||
        'https://picsum.photos/1200/700';
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
                    <h1 className="mt-3 text-2xl md:text-4xl font-bold text-emerald-950 dark:text-white">Akademik</h1>
                </div>
            </section>

            <div className="container mx-auto px-4 py-14">
                {(loading || error) && (
                    <div className={`mb-8 rounded-3xl border px-6 py-4 ${error ? 'border-red-200 bg-red-50 text-red-600' : 'border-emerald-100/60 bg-white'}`}>
                        {loading ? (
                            <div className="flex items-center gap-3 text-sm text-emerald-600">
                                <Loader2 className="animate-spin" size={18} /> Memuat konten akademik...
                            </div>
                        ) : (
                            <p className="text-sm">{error}</p>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-7 space-y-6">
                        <div className="rounded-[2.5rem] border border-emerald-900/5 dark:border-white/10 bg-white dark:bg-[#151B16] p-8 md:p-10 shadow-xl shadow-emerald-900/5">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-emerald-600/70 mb-4">
                                <BookOpen size={14} /> Akademik
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-emerald-950 dark:text-white mb-4">
                                {view.title}
                            </h2>
                            {view.subtitle && (
                                <p className="text-lg text-emerald-900/70 dark:text-white/70 font-medium mb-6">
                                    {view.subtitle}
                                </p>
                            )}
                            {view.content && (
                                <p className="text-sm md:text-base text-emerald-900/70 dark:text-white/70 leading-relaxed whitespace-pre-line">
                                    {view.content}
                                </p>
                            )}
                        </div>

                        <div className="rounded-[2.5rem] border border-emerald-900/5 dark:border-white/10 bg-white dark:bg-[#151B16] p-8 md:p-10 shadow-xl shadow-emerald-900/5">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-emerald-600/70 mb-6">
                                <Sparkles size={14} /> Sorotan Akademik
                            </div>
                            <div className="grid gap-5 md:grid-cols-2">
                                {(view.sections || []).map((section, index) => (
                                    <div
                                        key={section.id || index}
                                        className="rounded-3xl border border-emerald-900/10 dark:border-white/10 bg-emerald-50/60 dark:bg-white/5 p-6"
                                    >
                                        <div className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500/80 mb-3">
                                            {String(index + 1).padStart(2, '0')}
                                        </div>
                                        <h3 className="text-lg font-bold text-emerald-950 dark:text-white mb-2">
                                            {section.title}
                                        </h3>
                                        {section.body && (
                                            <p className="text-sm text-emerald-900/70 dark:text-white/70 leading-relaxed">
                                                {section.body}
                                            </p>
                                        )}
                                    </div>
                                ))}
                                {(view.sections || []).length === 0 && (
                                    <div className="rounded-3xl border border-dashed border-emerald-900/20 dark:border-white/10 bg-emerald-50/50 dark:bg-white/5 p-6 text-sm text-emerald-900/50 dark:text-white/50">
                                        Belum ada bagian akademik yang ditampilkan.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 space-y-6">
                        <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-emerald-900/10 dark:border-white/10 shadow-2xl shadow-emerald-900/20">
                            <img src={coverImage} alt={view.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <p className="text-xs uppercase tracking-[0.3em] text-white/70 mb-2">Cover Akademik</p>
                                <h3 className="text-2xl font-black text-white">{view.title}</h3>
                            </div>
                        </div>

                        {(imageItems.length > 0 || videoItems.length > 0) && (
                            <div className="rounded-[2.5rem] border border-emerald-900/5 dark:border-white/10 bg-white dark:bg-[#151B16] p-8 shadow-xl shadow-emerald-900/5">
                                <h3 className="text-lg font-bold text-emerald-950 dark:text-white mb-5">Galeri Akademik</h3>

                                {imageItems.length > 0 && (
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        {imageItems.map((media, idx) => (
                                            <button
                                                key={media.id || idx}
                                                type="button"
                                                onClick={() => setActiveImage(idx)}
                                                className="relative rounded-2xl overflow-hidden aspect-square group"
                                            >
                                                <img
                                                    src={media.mediaUrl}
                                                    alt={media.caption || ''}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {videoItems.length > 0 && (
                                    <div className="space-y-4">
                                        {videoItems.map((media, idx) => (
                                            <div key={media.id || idx} className="rounded-2xl overflow-hidden border border-emerald-900/10 dark:border-white/10 bg-black/5">
                                                {media.mediaType === 'video' ? (
                                                    <video controls className="w-full aspect-video bg-black">
                                                        <source src={media.mediaUrl} />
                                                    </video>
                                                ) : (
                                                    media.mediaUrl.includes('<iframe') ? (
                                                        <div className="aspect-video [&_iframe]:h-full [&_iframe]:w-full" dangerouslySetInnerHTML={{ __html: media.mediaUrl }} />
                                                    ) : (
                                                        <iframe src={media.mediaUrl} className="w-full aspect-video" allowFullScreen />
                                                    )
                                                )}
                                                {media.caption && (
                                                    <div className="px-4 py-2 text-xs text-emerald-900/70 dark:text-white/70 border-t border-emerald-900/10 dark:border-white/10 flex items-center gap-2">
                                                        <Play size={12} /> {media.caption}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {activeImage !== null && imageItems.length > 0 && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
                    <button
                        onClick={() => setActiveImage(null)}
                        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
                    >
                        <X size={24} />
                    </button>

                    <button
                        onClick={() => setActiveImage((prev) => (prev !== null && prev > 0 ? prev - 1 : imageItems.length - 1))}
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
                        onClick={() => setActiveImage((prev) => (prev !== null && prev < imageItems.length - 1 ? prev + 1 : 0))}
                        className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
                    >
                        <ChevronRight size={32} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Akademik;
