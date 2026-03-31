import React from 'react';
import prisma from '@/lib/prisma';
import type { Teacher } from '@/lib/types';
import { User, GraduationCap, Briefcase, Mail } from 'lucide-react';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';

const headingFont = Playfair_Display({
    subsets: ['latin'],
    weight: ['500', '600', '700'],
});

const bodyFont = Plus_Jakarta_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
});

async function getTeachers(): Promise<Teacher[]> {
    try {
        const teachers = await prisma.teachers.findMany({
            orderBy: { name: 'asc' },
        });
        return teachers as any as Teacher[];
    } catch (error) {
        console.error('Error fetching teachers on server:', error);
        return [];
    }
}

const GuruPage = async () => {
    const teachers = await getTeachers();

    return (
        <div className={`${bodyFont.className} min-h-screen bg-gray-50 dark:bg-[#0A0D0B] text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
            {/* Minimal Subheader */}
            <section className="border-b border-emerald-100/70 bg-white/80 backdrop-blur-xl sticky top-0 z-40 dark:border-white/10 dark:bg-[#0B0F0C]/80">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-emerald-700/70 dark:text-emerald-200/70 mb-1 font-black">
                                <span className="h-[2px] w-6 bg-emerald-500/70"></span>
                                AKADEMIK
                            </div>
                            <h1 className="text-2xl font-black text-emerald-950 dark:text-white tracking-tight uppercase">Direktori Guru & Staf</h1>
                        </div>
                    </div>
                </div>
            </section>

            <section className="container mx-auto px-4 py-16 md:py-24">
                <div className="max-w-2xl mb-16">
                    <h2 className={`${headingFont.className} text-3xl md:text-5xl font-black text-emerald-950 dark:text-white mb-6 leading-tight`}>
                        Pendidik Profesional dan <span className="text-emerald-600">Berdedikasi</span>
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                        Dibimbing oleh para asatidz dan asatidzah yang ahli di bidangnya, berkomitmen membina karakter dan kompetensi siswa.
                    </p>
                </div>

                {teachers.length === 0 ? (
                    <div className="rounded-[3rem] border border-dashed border-emerald-200 dark:border-white/10 bg-white/50 dark:bg-white/5 p-20 text-center">
                        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <User className="text-emerald-600 dark:text-emerald-400" size={40} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Data Belum Tersedia</h3>
                        <p className="text-gray-500 dark:text-gray-400">Daftar guru dan staf saat ini sedang diperbarui oleh administrator.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
                        {teachers.map((teacher) => (
                            <div 
                                key={teacher.id} 
                                className="group relative bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl shadow-emerald-900/5 dark:shadow-black/20 border border-emerald-100 dark:border-white/5 overflow-hidden transition-all hover:-translate-y-2 duration-500"
                            >
                                {/* Image Container */}
                                <div className="aspect-[4/5] overflow-hidden bg-emerald-50 dark:bg-white/5 relative">
                                    {teacher.imageUrl ? (
                                        <img
                                            src={teacher.imageUrl}
                                            alt={teacher.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-emerald-900/10 dark:text-white/10">
                                            <User size={120} strokeWidth={1} />
                                        </div>
                                    )}
                                    
                                    {/* Overlay Info on Hover */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                                        <div className="space-y-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                                                <GraduationCap size={14} />
                                                Education Specialist
                                            </div>
                                            <p className="text-white text-xs leading-relaxed opacity-80">
                                                Berkomitmen penuh dalam memberikan pendidikan terbaik bagi seluruh santri MIS Al-Falah.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Base Info */}
                                <div className="p-8">
                                    <h3 className="font-black text-xl text-gray-900 dark:text-white mb-2 tracking-tight line-clamp-1">{teacher.name}</h3>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                                        <Briefcase size={10} />
                                        {teacher.position}
                                    </div>
                                    
                                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5 flex gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer">
                                            <Mail size={14} />
                                        </div>
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer text-[10px] font-black italic">
                                            CV
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default GuruPage;