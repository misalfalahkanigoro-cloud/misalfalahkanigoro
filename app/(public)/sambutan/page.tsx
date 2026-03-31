import React from 'react';
import { Quote } from 'lucide-react';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import { dbAdmin } from '@/lib/db';
import type { HeadmasterGreeting } from '@/lib/types';

const headingFont = Playfair_Display({
    subsets: ['latin'],
    weight: ['500', '600', '700'],
});

const bodyFont = Plus_Jakarta_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
});

async function getGreeting(): Promise<HeadmasterGreeting | null> {
    try {
        const { data } = await dbAdmin()
            .from('headmaster_greeting')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        
        if (!data) return null;
        
        return {
            id: data.id,
            title: data.title,
            subtitle: data.subtitle,
            contentJson: data.content_json,
            contentHtml: data.content_html,
            contentText: data.content_text,
            headmasterName: data.headmaster_name,
            headmasterTitle: data.headmaster_title,
            photoUrl: data.photo_url,
            isActive: data.is_active,
        };
    } catch (error) {
        console.error('Error fetching headmaster greeting on server:', error);
        return null;
    }
}

const SambutanPage = async () => {
    const greeting = await getGreeting();

    if (!greeting) {
        return (
            <div className={`${bodyFont.className} min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4`}>
                <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl p-10 border border-emerald-100 dark:border-white/10 text-center shadow-xl">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Quote className="text-emerald-600 dark:text-emerald-400" size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Belum Tersedia</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Sambutan kepala madrasah saat ini belum tersedia di sistem.</p>
                </div>
            </div>
        );
    }

    const { headmasterName, headmasterTitle, photoUrl, contentHtml, subtitle } = greeting;

    return (
        <div className={`${bodyFont.className} min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-[#0A0F0B] dark:via-[#0B120E] dark:to-[#111A14] transition-colors duration-200`}>
            {/* Minimal Subheader */}
            <section className="border-b border-emerald-100/70 bg-white/80 backdrop-blur-xl sticky top-0 z-40 dark:border-white/10 dark:bg-[#0B0F0C]/80">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-emerald-700/70 dark:text-emerald-200/70 mb-1">
                                <span className="h-[2px] w-6 bg-emerald-500/70"></span>
                                PROFIL MADRASAH
                            </div>
                            <h1 className="text-2xl font-black text-emerald-950 dark:text-white tracking-tight">Sambutan Kepala Madrasah</h1>
                        </div>
                    </div>
                </div>
            </section>

            <section className="container mx-auto px-4 py-12 md:py-20">
                <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
                    {/* Content Column */}
                    <article className="order-2 lg:order-1">
                        <div className="bg-white/40 dark:bg-white/5 backdrop-blur-sm rounded-[2.5rem] border border-white/50 dark:border-white/10 p-8 md:p-12 shadow-2xl shadow-emerald-900/5">
                            {contentHtml ? (
                                <div
                                    className="prose prose-emerald dark:prose-invert max-w-none 
                                    prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-emerald-950 dark:prose-headings:text-white
                                    prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:text-lg
                                    prose-blockquote:border-emerald-500 prose-blockquote:bg-emerald-50/50 dark:prose-blockquote:bg-emerald-900/10 
                                    prose-blockquote:rounded-2xl prose-blockquote:px-8 prose-blockquote:py-2 prose-blockquote:italic
                                    prose-li:text-gray-700 dark:prose-li:text-gray-300"
                                    dangerouslySetInnerHTML={{ __html: contentHtml }}
                                />
                            ) : (
                                <p className="text-gray-500 italic">Konten sambutan belum diisi.</p>
                            )}
                            
                            <div className="mt-16 pt-8 border-t border-emerald-900/10 dark:border-white/10 flex items-center justify-between opacity-60">
                                <p className="text-sm font-medium tracking-wide">MIS AL-FALAH</p>
                                <p className="text-xs uppercase tracking-widest font-bold">Terakhir diupdate: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                        </div>
                    </article>

                    {/* Sidebar/Identity Column */}
                    <aside className="order-1 lg:order-2 space-y-8">
                        <div className="sticky top-32">
                            {/* Card Identity */}
                            <div className="group relative rounded-[3rem] bg-white dark:bg-gray-900 p-3 shadow-2xl shadow-emerald-900/20 dark:shadow-black/50 overflow-hidden border border-emerald-100 dark:border-white/5 transition-transform hover:-translate-y-1 duration-500">
                                <div className="aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-emerald-50 dark:bg-emerald-900/20 relative">
                                    {photoUrl ? (
                                        <img
                                            src={photoUrl}
                                            alt={headmasterName}
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center">
                                            <Quote className="text-emerald-900/10 dark:text-white/10" size={120} />
                                        </div>
                                    )}
                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8">
                                        <h2 className="text-xl font-bold text-white mb-1">{headmasterName}</h2>
                                        <p className="text-sm text-emerald-300 font-medium uppercase tracking-widest">{headmasterTitle || 'Kepala Madrasah'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Quote Card */}
                            <div className="mt-8 relative overflow-hidden rounded-[2rem] bg-emerald-900 dark:bg-emerald-800 p-8 shadow-xl">
                                <Quote className="absolute -top-4 -left-4 text-white/10" size={100} />
                                <div className="relative z-10">
                                    <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <div className="w-4 h-[1px] bg-emerald-300"></div>
                                        PESAN UTAMA
                                    </h3>
                                    <p className={`${headingFont.className} text-xl text-white italic leading-relaxed`}>
                                        "{subtitle || 'Mari bersama-sama membangun generasi yang unggul dan berakhlakul karimah.'}"
                                    </p>
                                </div>
                                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                            </div>
                        </div>
                    </aside>
                </div>
            </section>
        </div>
    );
};

export default SambutanPage;
