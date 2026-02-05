'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import PublicHero from '@/components/PublicHero';
import { api } from '@/lib/api';
import type { NewsItem } from '@/lib/types';

const NewsDetail: React.FC = () => {
    const params = useParams<{ slug?: string | string[] }>();
    const slug = Array.isArray(params?.slug) ? params?.slug?.[0] : params?.slug;
    const [news, setNews] = useState<NewsItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;
        const fetchDetail = async () => {
            try {
                const data = await api.getNewsDetail(slug);
                setNews(data as NewsItem);
            } catch (err) {
                const message = err instanceof Error ? err.message : '';
                console.error('Error fetching news detail:', err);
                setError(message === 'NOT_FOUND' ? 'Berita tidak ditemukan' : 'Gagal memuat berita');
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (error || !news) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
                <p className="text-red-500 mb-4">{error || 'Berita tidak tersedia'}</p>
                <Link href="/berita" className="text-primary dark:text-green-400 font-semibold flex items-center gap-2">
                    <ArrowLeft size={16} /> Kembali ke Berita
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 transition-colors duration-200">
            <PublicHero
                title={news.title}
                subtitle={news.excerpt}
                fallbackImage={news.thumbnailUrl || 'https://picsum.photos/1200/400'}
                newsCount={4}
            />

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 md:p-8">
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                        <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(news.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <span className="text-primary dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded">
                            {news.category}
                        </span>
                    </div>

                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        {news.title}
                    </h1>

                    {news.content ? (
                        <div className="prose prose-green dark:prose-invert max-w-none">
                            {news.content.split('\n').map((paragraph, idx) => (
                                <p key={idx}>{paragraph}</p>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-600 dark:text-gray-300">{news.excerpt}</p>
                    )}

                    <div className="mt-8">
                        <Link href="/berita" className="text-primary dark:text-green-400 font-semibold flex items-center gap-2">
                            <ArrowLeft size={16} /> Kembali ke Berita
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsDetail;
