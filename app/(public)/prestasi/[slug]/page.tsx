'use client';

import React, { useEffect, useState, use } from 'react';
import { Calendar, Share2, ArrowLeft, Tag, Award, Clock } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Achievement } from '@/lib/types';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default function AchievementDetailPage({ params }: PageProps) {
    const { slug } = use(params);
    const [achievement, setAchievement] = useState<Achievement | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const res = await api.getAchievementDetail(slug) as { achievement: Achievement };
            setAchievement(res.achievement);
        } catch (err: any) {
            console.error('Error fetching achievement detail:', err);
            setError(err.message === 'NOT_FOUND' ? 'Prestasi tidak ditemukan' : 'Gagal memuat detail prestasi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
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

    return (
        <article className="min-h-screen bg-white dark:bg-[#0B0F0C] pt-32 pb-20 transition-colors duration-300">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
                    <div className="flex-1 order-2 md:order-1">
                        <Link
                            href="/prestasi"
                            className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-sm mb-6 group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            KEMBALI KE DAFTAR
                        </Link>

                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-4 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <Award size={14} /> {achievement.category || 'Prestasi'}
                            </span>
                            {achievement.isPinned && (
                                <span className="px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                    Unggulan
                                </span>
                            )}
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-emerald-950 dark:text-white mb-6 leading-tight">
                            {achievement.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-emerald-900/40 dark:text-white/40 font-bold text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar size={18} className="text-emerald-600" />
                                <span>{achievement.achievedAt ? new Date(achievement.achievedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Tanggal Baru'}</span>
                            </div>
                            {achievement.createdAt && (
                                <div className="flex items-center gap-2">
                                    <Clock size={18} className="text-emerald-600" />
                                    <span>Diarsipkan pada {new Date(achievement.createdAt).toLocaleDateString('id-ID')}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-full md:w-80 order-1 md:order-2">
                        <button
                            onClick={handleShare}
                            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-3xl font-black hover:bg-emerald-700 transition transform hover:-translate-y-1 active:scale-95 shadow-xl shadow-emerald-600/30"
                        >
                            <Share2 size={20} /> BAGIKAN PRESTASI
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-12">
                        {/* Cover Image */}
                        <div className="relative aspect-[21/9] rounded-[3rem] overflow-hidden mb-12 shadow-2xl shadow-emerald-900/20 border border-emerald-900/5 dark:border-white/5">
                            <img
                                src={achievement.coverUrl || 'https://picsum.photos/1200/600'}
                                className="w-full h-full object-cover"
                                alt={achievement.title}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/20 to-transparent"></div>
                        </div>

                        {/* Rich Content */}
                        <div className="bg-white dark:bg-[#151B16] rounded-[3rem] p-8 md:p-14 shadow-xl border border-emerald-900/5 dark:border-white/5">
                            {achievement.excerpt && (
                                <div className="mb-10 text-xl md:text-2xl font-medium text-emerald-900/70 dark:text-white/80 leading-relaxed border-l-4 border-emerald-500 pl-8 italic">
                                    "{achievement.excerpt}"
                                </div>
                            )}

                            <div
                                className="prose prose-lg dark:prose-invert max-w-none 
                                prose-headings:font-black prose-headings:text-emerald-950 dark:prose-headings:text-white
                                prose-p:text-emerald-900/70 dark:prose-p:text-white/70 prose-p:leading-loose
                                prose-img:rounded-3xl prose-img:shadow-2xl
                                prose-strong:text-emerald-900 dark:prose-strong:text-emerald-400 prose-strong:font-black"
                                dangerouslySetInnerHTML={{ __html: achievement.contentHtml || achievement.contentText || '' }}
                            />
                        </div>

                        {/* Footer Info */}
                        <div className="mt-12 flex flex-col items-center justify-center py-12 border-t border-emerald-900/5 dark:border-white/5 text-center">
                            <div className="w-16 h-16 bg-emerald-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 text-emerald-600">
                                <Award size={32} />
                            </div>
                            <h4 className="text-emerald-900 dark:text-white font-black uppercase tracking-widest text-sm mb-2">Terima Kasih Atas Inspirasinya</h4>
                            <p className="text-emerald-900/40 dark:text-white/40 text-xs font-bold font-mono">ID ARSIP: ACH-{achievement.id.toString().padStart(6, '0')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}
