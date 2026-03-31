import React from 'react';
import { dbAdmin } from '@/lib/db';
import { Calendar, MapPin, History, Film } from 'lucide-react';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';

const headingFont = Playfair_Display({
    subsets: ['latin'],
    weight: ['500', '600', '700'],
});

const bodyFont = Plus_Jakarta_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
});

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

const isHostedVideoUrl = (src?: string | null) => {
    if (!src) return false;
    const normalized = src.toLowerCase();
    return normalized.includes('/video/upload/') || /\.(mp4|webm|ogg|mov|m3u8)(\?|#|$)/.test(normalized);
};

async function getHistoryData() {
    try {
        const { data: page } = await dbAdmin()
            .from('history_page')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (!page) return null;

        const { data: timeline } = await dbAdmin()
            .from('history_timeline_items')
            .select('*')
            .eq('history_page_id', page.id)
            .eq('is_active', true)
            .order('year', { ascending: true });

        return {
            page: {
                id: page.id,
                title: page.title,
                subtitle: page.subtitle,
                contentHtml: page.content_html,
                contentText: page.content_text,
                coverImageUrl: page.cover_image_url,
                videoUrl: page.video_url,
            } as HistoryPage,
            timelineItems: (timeline || []).map((item: any) => ({
                id: item.id,
                year: item.year,
                title: item.title,
                descriptionHtml: item.description_html,
                descriptionText: item.description_text,
                mediaUrl: item.media_url,
            })) as HistoryTimelineItem[],
        };
    } catch (error) {
        console.error('Error fetching history on server:', error);
        return null;
    }
}

const SejarahPage = async () => {
    const data = await getHistoryData();

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50 dark:bg-[#0A0D0B]">
                <div className="text-center">
                    <History size={48} className="mx-auto text-emerald-500/30 mb-4" />
                    <h2 className="text-xl font-bold">Sejarah Belum Tersedia</h2>
                    <p className="text-gray-500 text-sm">Informasi sejarah madrasah sedang disusun.</p>
                </div>
            </div>
        );
    }

    const { page, timelineItems } = data;

    return (
        <div className={`${bodyFont.className} min-h-screen bg-white dark:bg-[#0A0D0B] transition-colors duration-300`}>
            {/* Minimal Subheader */}
            <section className="border-b border-emerald-100/70 bg-white/80 backdrop-blur-xl sticky top-0 z-40 dark:border-white/10 dark:bg-[#0B0F0C]/80">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-emerald-700/70 dark:text-emerald-200/70 mb-1">
                                <span className="h-[2px] w-6 bg-emerald-500/70"></span>
                                PROFIL MADRASAH
                            </div>
                            <h1 className="text-2xl font-black text-emerald-950 dark:text-white tracking-tight uppercase">Jejak Langkah & Sejarah</h1>
                        </div>
                    </div>
                </div>
            </section>

            <main className="container mx-auto px-4 py-16 md:py-24">
                <div className="grid gap-16 lg:grid-cols-[1fr_400px]">
                    {/* Main Story */}
                    <article className="space-y-12">
                        <header>
                            <h2 className={`${headingFont.className} text-4xl md:text-6xl font-black text-emerald-950 dark:text-white mb-6 leading-tight`}>
                                Membangun Masa Depan Sejak <span className="text-emerald-600">Dulu Kala</span>
                            </h2>
                            <p className="text-xl text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                                {page.subtitle || 'Kisah perjalanan kami dalam mencetak generasi hebat dan berakhlakul karimah.'}
                            </p>
                        </header>

                        <div className="bg-emerald-50/50 dark:bg-white/5 rounded-[3rem] p-8 md:p-12 border border-emerald-100 dark:border-white/5">
                            {page.contentHtml ? (
                                <div
                                    className="prose prose-emerald dark:prose-invert max-w-none 
                                    prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:text-lg prose-p:leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: page.contentHtml }}
                                />
                            ) : (
                                <p className="italic text-gray-500">Narasi lengkap sedang diproses.</p>
                            )}
                        </div>

                        {page.videoUrl && (
                            <section className="mt-12">
                                <div className="flex items-center gap-3 mb-6 text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-widest">
                                    <Film size={18} />
                                    DOKUMENTASI VIDEO
                                </div>
                                <div className="rounded-[3rem] overflow-hidden bg-black shadow-2xl aspect-video ring-8 ring-emerald-50 dark:ring-white/5">
                                    <video src={page.videoUrl} controls className="w-full h-full object-cover" />
                                </div>
                            </section>
                        )}
                    </article>

                    {/* Timeline Sidebar */}
                    <aside>
                        <div className="sticky top-32">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-emerald-600 rounded-2xl text-white">
                                    <Calendar size={24} />
                                </div>
                                <h3 className="text-2xl font-black tracking-tight">Timeline</h3>
                            </div>

                            <div className="space-y-0 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-emerald-100 dark:before:bg-emerald-900/30">
                                {timelineItems.length === 0 ? (
                                    <p className="text-sm text-gray-500 opacity-60 ml-12 italic">Data kronologi belum tersedia.</p>
                                ) : (
                                    timelineItems.map((item) => (
                                        <div key={item.id} className="relative pl-12 pb-12 last:pb-0">
                                            {/* Dot */}
                                            <div className="absolute left-0 top-1.5 w-10 h-10 bg-white dark:bg-[#0A0D0B] rounded-full flex items-center justify-center p-1 relative z-10">
                                                <div className="w-full h-full bg-emerald-500 rounded-full border-4 border-emerald-50 dark:border-emerald-900/30"></div>
                                            </div>
                                            
                                            <div className="group bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-xl shadow-emerald-900/5 border border-emerald-50 dark:border-white/5 transition-all hover:border-emerald-500 duration-300">
                                                <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-3">
                                                    TAHUN {item.year}
                                                </span>
                                                <h4 className="text-lg font-black mb-3 text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors tracking-tight">{item.title}</h4>
                                                
                                                {item.descriptionHtml ? (
                                                    <div
                                                        className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4"
                                                        dangerouslySetInnerHTML={{ __html: item.descriptionHtml }}
                                                    />
                                                ) : item.descriptionText ? (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{item.descriptionText}</p>
                                                ) : null}

                                                {item.mediaUrl && (
                                                    <div className="rounded-2xl overflow-hidden shadow-md mt-4 border border-emerald-50 dark:border-white/5">
                                                        {isHostedVideoUrl(item.mediaUrl) ? (
                                                            <video src={item.mediaUrl} controls className="w-full aspect-video object-cover" />
                                                        ) : (
                                                            <img src={item.mediaUrl} alt={item.title} className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-700" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default SejarahPage;
