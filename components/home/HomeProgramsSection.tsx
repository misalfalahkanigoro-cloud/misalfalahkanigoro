import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, CheckCircle, Sparkles } from 'lucide-react';
import { PROGRAMS } from '@/components/home/home-constants';

type HomeProgramsSectionProps = {
    schoolName: string;
};

const HomeProgramsSection: React.FC<HomeProgramsSectionProps> = ({ schoolName }) => (
    <section className="relative py-24 bg-white dark:bg-gray-950 overflow-hidden">
        <div className="absolute top-20 right-0 w-72 h-72 bg-emerald-100/30 dark:bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-amber-100/30 dark:bg-amber-500/5 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
            <div className="grid gap-16 lg:grid-cols-[1.2fr_1fr] lg:items-center">
                <div className="space-y-6 animate-fadeInUp">
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-500/10 px-4 py-2">
                        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                            Program Unggulan
                        </span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
                        Kenapa Memilih <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-800 dark:from-emerald-400 dark:to-emerald-300">{schoolName}</span>?
                    </h2>

                    <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                        Kami menghadirkan pengalaman belajar yang seimbang antara akademik, karakter, dan keterampilan hidup untuk mempersiapkan generasi yang unggul.
                    </p>

                    <div className="flex flex-wrap gap-3 pt-2">
                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-500/10 px-5 py-2.5 text-sm font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20">
                            <CheckCircle className="w-4 h-4" />
                            Pembelajaran Aktif
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 dark:bg-amber-500/10 px-5 py-2.5 text-sm font-bold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20">
                            <BookOpen className="w-4 h-4" />
                            Bimbingan Tahfidz
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 dark:bg-sky-500/10 px-5 py-2.5 text-sm font-bold text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/20">
                            <Sparkles className="w-4 h-4" />
                            Kegiatan Kreatif
                        </span>
                    </div>

                    <div className="pt-4">
                        <Link
                            href="/profil"
                            className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold hover:gap-4 transition-all group"
                        >
                            Pelajari Lebih Lanjut
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    {PROGRAMS.map((program, index) => (
                        <div
                            key={program.title}
                            className="group rounded-3xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 p-6 shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:border-emerald-300 dark:hover:border-emerald-600 animate-fadeInUp"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${program.color}-100 dark:bg-${program.color}-500/10 text-${program.color}-700 dark:text-${program.color}-300 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md`}>
                                {program.icon}
                            </div>
                            <h3 className="mt-5 text-lg font-bold text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                                {program.title}
                            </h3>
                            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                {program.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </section>
);

export default HomeProgramsSection;
