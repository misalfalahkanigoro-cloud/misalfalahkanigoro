'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Loader2, MapPin } from 'lucide-react';
import { CldImage } from 'next-cloudinary';

type HistoryPage = {
    id: string;
    title: string;
    subtitle: string | null;
    contentHtml: string | null;
    contentText: string | null;
    coverImageUrl: string | null;
    videoUrl: string | null;
};

type HistoryTimelineItem = {
    id: string;
    year: string;
    title: string;
    descriptionHtml: string | null;
    descriptionText: string | null;
    mediaUrl: string | null;
};

const isCloudinaryUrl = (src?: string | null) =>
    !!src && src.includes('res.cloudinary.com') && src.includes('/upload/');

const isCloudinaryVideo = (src?: string | null) =>
    !!src && src.includes('res.cloudinary.com') && src.includes('/video/upload/');

const SejarahPage: React.FC = () => {
    const [page, setPage] = useState<HistoryPage | null>(null);
    const [timeline, setTimeline] = useState<HistoryTimelineItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/history-page');
                if (res.status === 404) {
                    setError('Sejarah belum tersedia.');
                    setPage(null);
                    return;
                }
                if (!res.ok) {
                    throw new Error('Gagal memuat sejarah');
                }
                const data = await res.json();
                setPage(data.page || null);
                setTimeline(Array.isArray(data.timelineItems) ? data.timelineItems : []);
            } catch (err) {
                console.error(err);
                setError('Sejarah belum tersedia.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const coverIsCloudinary = isCloudinaryUrl(page?.coverImageUrl);
    const heroSubtitle = useMemo(() => {
        if (page?.subtitle) return page.subtitle;
        if (page?.contentText) return page.contentText.split('\n').slice(0, 2).join(' ');
        return '';
    }, [page]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-[#0A0F0B] dark:via-[#0B120E] dark:to-[#111A14] transition-colors duration-200 pb-16">
            <section className="relative overflow-hidden">
                <div className="absolute -top-16 right-12 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-500/10" />
                <div className="absolute top-20 -left-16 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl dark:bg-amber-500/10" />
                <div className="container mx-auto px-4 py-14">
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] items-center">
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-200">Sejarah Madrasah</p>
                            <h1 className="mt-3 text-4xl font-semibold text-emerald-900 dark:text-white">{page?.title || 'Sejarah Madrasah'}</h1>
                            <p className="mt-4 text-lg text-emerald-900/70 dark:text-emerald-100/70">
                                {heroSubtitle || 'Sejarah belum tersedia.'}
                            </p>
                        </div>
                        <div className="rounded-3xl border border-emerald-100 bg-white/80 p-4 shadow-lg shadow-emerald-100/40 backdrop-blur dark:border-white/10 dark:bg-white/5">
                            <div className="relative h-56 w-full overflow-hidden rounded-2xl bg-emerald-50 dark:bg-white/10">
                                {page?.coverImageUrl ? (
                                    coverIsCloudinary ? (
                                        <CldImage
                                            src={page.coverImageUrl}
                                            width={420}
                                            height={280}
                                            sizes="(max-width: 1024px) 100vw, 420px"
                                            alt={page.title}
                                            className="h-full w-full object-cover"
                                            preserveTransformations
                                        />
                                    ) : (
                                        <img src={page.coverImageUrl} alt={page.title} className="h-full w-full object-cover" />
                                    )
                                ) : (
                                    <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.3em] text-emerald-600/70 dark:text-emerald-100/70">
                                        Cover belum tersedia
                                    </div>
                                )}
                            </div>
                            {page?.videoUrl && (
                                <div className="mt-4 overflow-hidden rounded-2xl border border-emerald-100 dark:border-white/10">
                                    <video src={page.videoUrl} controls className="w-full" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="container mx-auto px-4">
                {loading && (
                    <div className="rounded-3xl border border-emerald-100 bg-white/80 p-10 text-center text-sm text-emerald-900/70 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-emerald-100/70">
                        <Loader2 className="mx-auto mb-3 animate-spin text-emerald-600" size={24} />
                        Memuat sejarah...
                    </div>
                )}

                {!loading && error && (
                    <div className="rounded-3xl border border-dashed border-emerald-200 bg-white/80 p-10 text-center text-sm text-emerald-900/70 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-emerald-100/70">
                        {error}
                    </div>
                )}

                {!loading && !error && page && (
                    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
                        <article className="space-y-8">
                            <div className="rounded-3xl border border-emerald-100 bg-white/90 p-8 shadow-lg shadow-emerald-100/40 backdrop-blur dark:border-white/10 dark:bg-white/5">
                                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-200">
                                    <Calendar size={18} />
                                    <span className="text-xs font-semibold uppercase tracking-[0.3em]">Narasi</span>
                                </div>
                                <div className="mt-4">
                                    {page.contentHtml ? (
                                        <div
                                            className="prose max-w-none text-gray-600 dark:text-gray-300 dark:prose-invert"
                                            dangerouslySetInnerHTML={{ __html: page.contentHtml }}
                                        />
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">Narasi sejarah belum tersedia.</p>
                                    )}
                                </div>
                            </div>
                        </article>

                        <aside className="space-y-6">
                            <div className="rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-lg shadow-emerald-100/40 backdrop-blur dark:border-white/10 dark:bg-white/5">
                                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-200">
                                    <MapPin size={18} />
                                    <span className="text-xs font-semibold uppercase tracking-[0.3em]">Timeline</span>
                                </div>
                                <div className="mt-6 space-y-6">
                                    {timeline.length === 0 && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Timeline belum tersedia.</p>
                                    )}
                                    {timeline.map((item) => (
                                        <div key={item.id} className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-emerald-500" />
                                            <div className="rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                                                <p className="text-xs uppercase tracking-[0.3em] text-emerald-600/70 dark:text-emerald-100/70">{item.year}</p>
                                                <h4 className="mt-2 text-sm font-semibold text-emerald-900 dark:text-white">{item.title}</h4>
                                                {item.descriptionHtml ? (
                                                    <div
                                                        className="mt-2 text-sm text-gray-600 dark:text-gray-300"
                                                        dangerouslySetInnerHTML={{ __html: item.descriptionHtml }}
                                                    />
                                                ) : item.descriptionText ? (
                                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                                                        {item.descriptionText}
                                                    </p>
                                                ) : null}
                                                {item.mediaUrl && (
                                                    <div className="mt-3 overflow-hidden rounded-xl border border-emerald-100 dark:border-white/10">
                                                        {isCloudinaryVideo(item.mediaUrl) ? (
                                                            <video src={item.mediaUrl} controls className="w-full" />
                                                        ) : isCloudinaryUrl(item.mediaUrl) ? (
                                                            <CldImage
                                                                src={item.mediaUrl}
                                                                width={320}
                                                                height={200}
                                                                sizes="(max-width: 1024px) 100vw, 320px"
                                                                alt={item.title}
                                                                className="h-full w-full object-cover"
                                                                preserveTransformations
                                                            />
                                                        ) : (
                                                            <img src={item.mediaUrl} alt={item.title} className="h-full w-full object-cover" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </aside>
                    </div>
                )}
            </section>
        </div>
    );
};

export default SejarahPage;
