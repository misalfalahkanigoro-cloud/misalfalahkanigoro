import React from 'react';
import { Music, PenTool, Activity, Tent, BookMarked, Paintbrush, Trophy, Sunrise, Heart, BookOpen, SmilePlus, Zap, Users, Star } from 'lucide-react';
import prisma from '@/lib/prisma';
import type { Activity as ActivityItem, CharacterProgram, Extracurricular } from '@/lib/types';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';

const headingFont = Playfair_Display({
    subsets: ['latin'],
    weight: ['500', '600', '700'],
});

const bodyFont = Plus_Jakarta_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
});

const iconMap: Record<string, React.ReactNode> = {
    Activity: <Activity size={24} />,
    Music: <Music size={24} />,
    PenTool: <PenTool size={24} />,
    Tent: <Tent size={24} />,
    BookMarked: <BookMarked size={24} />,
    Paintbrush: <Paintbrush size={24} />,
    Trophy: <Trophy size={24} />,
    Sunrise: <Sunrise size={24} />,
    Heart: <Heart size={24} />,
    BookOpen: <BookOpen size={24} />,
    SmilePlus: <SmilePlus size={24} />,
    Zap: <Zap size={24} />,
};

async function getData() {
    try {
        const [activities, extracurriculars, characterPrograms] = await Promise.all([
            prisma.activities.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
            prisma.extracurriculars.findMany({ where: { isactive: true }, orderBy: { displayorder: 'asc' } }),
            prisma.character_programs.findMany({ where: { isactive: true }, orderBy: { displayorder: 'asc' } }),
        ]);
        return {
            activities: activities as any as ActivityItem[],
            extracurriculars: extracurriculars as any as Extracurricular[],
            characterPrograms: characterPrograms as any as CharacterProgram[],
        };
    } catch (error) {
        console.error('Error fetching kesiswaan data on server:', error);
        return { activities: [], extracurriculars: [], characterPrograms: [] };
    }
}

const KesiswaanPage = async () => {
    const { activities, extracurriculars, characterPrograms } = await getData();

    return (
        <div className={`${bodyFont.className} min-h-screen bg-gray-50 dark:bg-[#0A0D0B] text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
            {/* Header Section */}
            <section className="relative overflow-hidden bg-emerald-950 pt-20 pb-40">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,_#10b981_0%,_transparent_40%)]"></div>
                </div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em] mb-8">
                        <Users size={12} className="mb-0.5" />
                        PENGEMBANGAN DIRI
                    </div>
                    <h1 className={`${headingFont.className} text-4xl md:text-7xl text-white font-black tracking-tight leading-tight mb-8`}>
                        Ekosistem <span className="text-emerald-400">Kesiswaan</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-emerald-100/60 text-lg md:text-xl font-medium leading-relaxed">
                        Membangun potensi, mengasah kreativitas, dan membentuk karakter yang kokoh melalui beragam kegiatan inspiratif.
                    </p>
                </div>
            </section>

            <main className="container mx-auto px-4">
                {/* Pembiasaan Karakter */}
                <section className="-mt-20 relative z-20 mb-20">
                    <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 md:p-16 shadow-2xl shadow-emerald-900/10 dark:shadow-black/50 border border-emerald-100 dark:border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-5">
                            <Heart size={200} />
                        </div>
                        <div className="text-center mb-16 relative z-10">
                            <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-4">Pembiasaan Karakter</h2>
                            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto font-medium">Nilai-nilai luhur yang ditanamkan melalui rutinitas harian santri MIS Al-Falah.</p>
                        </div>
                        
                        {characterPrograms.length === 0 ? (
                            <div className="text-center py-10 opacity-60">
                                <p className="italic">Data pembiasaan sedang diperbarui.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
                                {characterPrograms.map((program) => (
                                    <div key={program.id} className="group p-8 rounded-[2rem] bg-emerald-50/50 dark:bg-white/5 hover:bg-emerald-600 transition-all duration-500 hover:-translate-y-2">
                                        <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-500">
                                            {program.icon && iconMap[program.icon] ? iconMap[program.icon] : <Star size={24} />}
                                        </div>
                                        <h3 className="text-xl font-black mb-3 group-hover:text-white transition-colors tracking-tight">{program.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-emerald-50 transition-colors leading-relaxed mb-6">
                                            {program.description}
                                        </p>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-widest group-hover:bg-white/20 group-hover:text-white transition-colors">
                                            <Sunrise size={10} />
                                            {program.frequency || 'Harian'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Ekstrakurikuler */}
                <section className="mb-24">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div className="max-w-xl">
                            <div className="flex items-center gap-3 text-emerald-600 font-bold text-[10px] uppercase tracking-[0.4em] mb-4">
                                <span className="h-[2px] w-12 bg-emerald-500"></span>
                                EXTRA CURRICULAR
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">Wadah Minat dan Bakat</h2>
                        </div>
                    </div>

                    {extracurriculars.length === 0 ? (
                        <div className="rounded-[3rem] border-2 border-dashed border-emerald-100 dark:border-white/5 p-20 text-center opacity-60">
                            <p className="italic">Daftar ekstrakurikuler sedang disiapkan.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {extracurriculars.map((ekskul) => (
                                <div key={ekskul.id} className="group relative bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-xl shadow-emerald-900/5 dark:shadow-black/20 border border-emerald-50 dark:border-white/5 transition-all hover:bg-emerald-950">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-emerald-50 dark:bg-white/5 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 transform group-hover:rotate-12">
                                        {ekskul.icon && iconMap[ekskul.icon] ? iconMap[ekskul.icon] : <Activity size={24} />}
                                    </div>
                                    <h3 className="text-lg font-black mb-3 group-hover:text-white transition-colors">{ekskul.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-emerald-100/70 transition-colors leading-relaxed mb-6 line-clamp-2">
                                        {ekskul.description}
                                    </p>
                                    <div className="space-y-2">
                                        {ekskul.schedule && (
                                            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-300 uppercase tracking-widest">{ekskul.schedule}</p>
                                        )}
                                        {ekskul.coachName && (
                                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 group-hover:text-white/40 uppercase tracking-widest">PEMBINA: {ekskul.coachName}</p>
                                        )}
                                    </div>
                                    <div className="absolute top-8 right-8 w-2 h-2 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Galeri Kegiatan */}
                <section className="mb-24">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/5 border border-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4">
                            MOMENTS
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight">Keseruan Siswa</h2>
                    </div>

                    {activities.length === 0 ? (
                        <div className="text-center py-20 opacity-40 italic">
                            Belum ada foto kegiatan baru.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {activities.map((activity, idx) => (
                                <div 
                                    key={activity.id} 
                                    className={`group relative overflow-hidden rounded-[2rem] aspect-square bg-gray-200 dark:bg-gray-800 ${
                                        idx === 0 || idx === 5 ? 'md:col-span-2 md:row-span-1 md:aspect-auto' : ''
                                    }`}
                                >
                                    {activity.imageUrl ? (
                                        <img
                                            src={activity.imageUrl}
                                            alt={activity.title}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-white/5">
                                            <Activity className="text-gray-300 dark:text-white/10" size={48} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                                        <p className="text-white font-black tracking-tight text-lg mb-1 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{activity.title}</p>
                                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">Documentation</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default KesiswaanPage;
