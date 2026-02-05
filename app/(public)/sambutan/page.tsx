'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Quote, Sparkles } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import type { HeadmasterGreeting } from '@/lib/types';

const headingFont = Playfair_Display({
    subsets: ['latin'],
    weight: ['500', '600', '700'],
});

const bodyFont = Plus_Jakarta_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
});

const isCloudinaryUrl = (src?: string | null) =>
    !!src && src.includes('res.cloudinary.com') && src.includes('/upload/');

const SambutanPage: React.FC = () => {
    const [greeting, setGreeting] = useState<HeadmasterGreeting | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGreeting = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/headmaster-greeting', { cache: 'no-store' });
                if (res.status === 404) {
                    setError('Sambutan kepala madrasah tidak tersedia.');
                    setGreeting(null);
                    return;
                }
                if (!res.ok) {
                    throw new Error('Gagal memuat sambutan.');
                }
                const data = (await res.json()) as HeadmasterGreeting;
                setGreeting(data);
            } catch (err) {
                console.error(err);
                setError('Sambutan kepala madrasah tidak tersedia.');
            } finally {
                setLoading(false);
            }
        };

        fetchGreeting();
    }, []);

    const photoUrl = greeting?.photoUrl;
    const photoIsCloudinary = isCloudinaryUrl(photoUrl);
    const richContent = greeting?.contentHtml;
    const contentText = greeting?.contentText;

    const heroSubtitle = useMemo(() => {
        if (greeting?.subtitle) return greeting.subtitle;
        if (contentText) return contentText.split('\n').slice(0, 2).join(' ');
        return '';
    }, [greeting?.subtitle, contentText]);

    return (
        <div className={`${bodyFont.className} min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-[#0A0F0B] dark:via-[#0B120E] dark:to-[#111A14] transition-colors duration-200`}>
            <section className="relative overflow-hidden">
                <div className="absolute -top-32 right-10 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-500/10" />
                <div className="absolute top-24 -left-20 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl dark:bg-amber-500/10" />
                <div className="container mx-auto px-4 py-16 lg:py-20">
                    <div className="max-w-3xl space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700 shadow-sm dark:border-emerald-500/30 dark:bg-white/5 dark:text-emerald-200">
                            <Sparkles size={14} />
                            Sambutan Kepala Madrasah
                        </div>
                        <h1 className={`${headingFont.className} text-4xl font-semibold leading-tight text-emerald-900 dark:text-white md:text-5xl`}>
                            {greeting?.title || 'Sambutan Kepala Madrasah'}
                        </h1>
                        <p className="text-lg text-emerald-900/70 dark:text-emerald-100/70">
                            {heroSubtitle || 'Sambutan kepala madrasah tidak tersedia.'}
                        </p>
                    </div>
                </div>
            </section>

            <section className="container mx-auto px-4 pb-16">
                {loading && (
                    <div className="rounded-3xl border border-emerald-100 bg-white/80 p-10 text-center text-sm text-emerald-900/70 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-emerald-100/70">
                        Memuat sambutan...
                    </div>
                )}

                {!loading && error && (
                    <div className="rounded-3xl border border-dashed border-emerald-200 bg-white/80 p-10 text-center text-sm text-emerald-900/70 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-emerald-100/70">
                        {error}
                    </div>
                )}

                {!loading && !error && greeting && (
                    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
                        <article className="space-y-8">
                            {richContent ? (
                                <div
                                    className="prose max-w-none prose-emerald prose-h2:font-semibold prose-h2:text-emerald-900 prose-p:text-emerald-900/80 prose-blockquote:border-emerald-300 dark:prose-invert dark:prose-h2:text-white"
                                    dangerouslySetInnerHTML={{ __html: richContent }}
                                />
                            ) : (
                                <div className="rounded-2xl border border-emerald-100 bg-white/70 p-8 text-sm text-emerald-900/70 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-emerald-100/70">
                                    Sambutan kepala madrasah tidak tersedia.
                                </div>
                            )}
                        </article>

                        <aside className="space-y-6">
                            <div className="rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-lg dark:border-white/10 dark:bg-white/5">
                                <div className="relative overflow-hidden rounded-2xl bg-emerald-50 dark:bg-white/10">
                                    {photoUrl ? (
                                        photoIsCloudinary ? (
                                            <CldImage
                                                src={photoUrl}
                                                width={320}
                                                height={400}
                                                sizes="(max-width: 1024px) 100vw, 320px"
                                                alt={greeting.headmasterName}
                                                className="h-80 w-full object-cover"
                                                preserveTransformations
                                            />
                                        ) : (
                                            <img
                                                src={photoUrl}
                                                alt={greeting.headmasterName}
                                                className="h-80 w-full object-cover"
                                            />
                                        )
                                    ) : (
                                        <div className="flex h-80 items-center justify-center text-xs uppercase tracking-[0.3em] text-emerald-700/70 dark:text-emerald-100/70">
                                            Foto belum tersedia
                                        </div>
                                    )}
                                </div>
                                <div className="mt-6">
                                    <p className={`${headingFont.className} text-xl font-semibold text-emerald-900 dark:text-white`}>
                                        {greeting.headmasterName}
                                    </p>
                                    <p className="text-sm text-emerald-700/70 dark:text-emerald-100/70">
                                        {greeting.headmasterTitle || 'Kepala Madrasah'}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-amber-100 bg-white/80 p-6 shadow-lg dark:border-white/10 dark:bg-white/5">
                                <div className="flex items-center gap-3 text-amber-700 dark:text-amber-200">
                                    <Quote size={20} />
                                    <span className="text-xs font-semibold uppercase tracking-[0.3em]">Pesan</span>
                                </div>
                                <p className="mt-4 text-sm text-emerald-900/70 dark:text-emerald-100/70">
                                    {greeting.subtitle || 'Sambutan kepala madrasah tidak tersedia.'}
                                </p>
                            </div>
                        </aside>
                    </div>
                )}
            </section>
        </div>
    );
};

export default SambutanPage;
