import React from 'react';
import { dbAdmin } from '@/lib/db';
import type { AcademicPage, MediaItem } from '@/lib/types';
import { BookOpen, Sparkles, GraduationCap, CheckCircle2 } from 'lucide-react';
import { AcademicGallery } from '@/components/academic-gallery';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';

const headingFont = Playfair_Display({
    subsets: ['latin'],
    weight: ['500', '600', '700'],
});

const bodyFont = Plus_Jakarta_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
});

async function getAcademicData(): Promise<AcademicPage | null> {
    try {
        const { data: page } = await dbAdmin()
            .from('academic_pages')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (!page) return null;

        const { data: sections } = await dbAdmin()
            .from('academic_sections')
            .select('*')
            .eq('page_id', page.id)
            .order('display_order', { ascending: true });

        const { data: mediaItems } = await dbAdmin()
            .from('media_items')
            .select('*')
            .eq('entity_type', 'academic')
            .eq('entity_id', page.id)
            .order('is_main', { ascending: false })
            .order('display_order', { ascending: true });

        return {
            id: page.id,
            title: page.title,
            subtitle: page.subtitle,
            content: page.content,
            sections: (sections || []).map((s: any) => ({
                id: s.id,
                pageId: s.page_id,
                title: s.title,
                body: s.body,
                displayOrder: s.display_order,
            })),
            media: (mediaItems || []).map((m: any) => ({
                id: m.id,
                entityType: m.entity_type,
                entityId: m.entity_id,
                mediaType: m.media_type,
                mediaUrl: m.media_url,
                thumbnailUrl: m.thumbnail_url,
                caption: m.caption,
                isMain: m.is_main,
                displayOrder: m.display_order,
            })),
            coverUrl: mediaItems?.find((m: any) => m.is_main)?.media_url || mediaItems?.[0]?.media_url || null,
        };
    } catch (error) {
        console.error('Error fetching academic data on server:', error);
        return null;
    }
}

const AkademikPage = async () => {
    const data = await getAcademicData();

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50 dark:bg-[#0A0D0B]">
                <div className="text-center">
                    <BookOpen size={48} className="mx-auto text-emerald-500/30 mb-4" />
                    <h2 className="text-xl font-bold">Data Akademik Belum Tersedia</h2>
                    <p className="text-gray-500 text-sm">Informasi kurikulum dan program sedang diperbarui.</p>
                </div>
            </div>
        );
    }

    const coverImage = data.coverUrl || 'https://images.unsplash.com/photo-1503676260728-1c00da096a0b?auto=format&fit=crop&q=80&w=1200';

    return (
        <div className={`${bodyFont.className} min-h-screen bg-white dark:bg-[#0A0D0B] transition-colors duration-300`}>
            {/* Header Section */}
            <section className="relative h-[60vh] min-h-[400px] flex items-center overflow-hidden">
                <div className="absolute inset-0">
                    <img src={coverImage} alt={data.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-[2px]"></div>
                </div>
                
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em] mb-8">
                            <BookOpen size={12} className="mb-0.5" />
                            KEDALAMAN ILMU
                        </div>
                        <h1 className={`${headingFont.className} text-4xl md:text-7xl text-white font-black tracking-tight leading-tight mb-8`}>
                            {data.title}
                        </h1>
                        <p className="text-emerald-100/70 text-lg md:text-2xl font-medium leading-relaxed italic">
                            "{data.subtitle}"
                        </p>
                    </div>
                </div>
                
                {/* Decorative Wave */}
                <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] transform rotate-180">
                    <svg className="relative block w-full h-12 md:h-24 fill-white dark:fill-[#0A0D0B]" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
                    </svg>
                </div>
            </section>

            <main className="container mx-auto px-4 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 md:gap-20">
                    {/* Left: Narrative & Sections */}
                    <div className="space-y-20">
                        {/* Narrative */}
                        <article>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400">
                                    <Sparkles size={24} />
                                </div>
                                <h2 className="text-2xl md:text-4xl font-black tracking-tight">Visi Akademik</h2>
                            </div>
                            <div className="bg-emerald-50/30 dark:bg-white/5 rounded-[3rem] p-8 md:p-12 border border-emerald-100 dark:border-white/5 shadow-2xl shadow-emerald-900/5">
                                <p className="text-xl md:text-2xl text-emerald-900/80 dark:text-emerald-100/80 font-medium leading-relaxed mb-6">
                                    Kami percaya bahwa setiap anak adalah bintang yang memiliki potensi unik untuk bersinar melalui pendidikan yang tepat.
                                </p>
                                <div className="h-[1px] w-full bg-emerald-200 dark:bg-emerald-800 my-8"></div>
                                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-line">
                                    {data.content}
                                </p>
                            </div>
                        </article>

                        {/* Program Sections */}
                        <section>
                            <div className="flex items-center gap-4 mb-12">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
                                    <GraduationCap size={24} />
                                </div>
                                <h2 className="text-2xl md:text-4xl font-black tracking-tight">Program Unggulan</h2>
                            </div>
                            <div className="grid gap-8">
                                {data?.sections?.length === 0 ? (
                                    <p className="opacity-60 italic text-center py-10">Program sedang dikonfigurasi.</p>
                                ) : (
                                    data?.sections?.map((section, idx) => (
                                        <div key={section.id} className="group relative bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-emerald-900/5 border border-emerald-50 dark:border-white/5 transition-all hover:bg-emerald-950 hover:-translate-y-1">
                                            <div className="flex flex-col md:flex-row gap-8 md:items-start">
                                                <div className="flex-shrink-0 w-16 h-16 rounded-[1.5rem] bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-2xl font-black group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                    {String(idx + 1).padStart(2, '0')}
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black mb-4 group-hover:text-white tracking-tight transition-colors">{section.title}</h3>
                                                    <p className="text-gray-600 dark:text-gray-400 group-hover:text-emerald-100/70 text-lg leading-relaxed transition-colors">
                                                        {section.body}
                                                    </p>
                                                    <div className="mt-6 flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-widest group-hover:text-white transition-colors">
                                                        <CheckCircle2 size={14} />
                                                        Verified Curriculum
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right: Sidebar / Gallery */}
                    <aside className="space-y-12">
                        <div className="sticky top-32">
                            <AcademicGallery items={data?.media || []} />
                            
                            {/* CTA Card */}
                            <div className="mt-12 bg-gradient-to-br from-emerald-600 to-emerald-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <GraduationCap size={160} />
                                </div>
                                <div className="relative z-10">
                                    <h4 className="text-sm font-black text-emerald-200 uppercase tracking-[0.3em] mb-4">DAFTARKAN SEKARANG</h4>
                                    <p className="text-2xl font-black leading-tight mb-6 tracking-tight">Jadilah Bagian dari Generasi Qur'ani Unggul.</p>
                                    <a href="/ppdb" className="inline-flex items-center justify-center w-full px-8 py-3 bg-white text-emerald-900 rounded-2xl font-black text-sm uppercase tracking-widest transition-transform active:scale-95 shadow-lg">
                                        Info PPDB
                                    </a>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default AkademikPage;
