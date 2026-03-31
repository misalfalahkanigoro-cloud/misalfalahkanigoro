import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Flame } from 'lucide-react';
import { HIGHLIGHTS } from '@/components/home/home-constants';

type HomeHeroSectionProps = {
    schoolName: string;
};

const HomeHeroSection: React.FC<HomeHeroSectionProps> = ({ schoolName }) => (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-amber-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950/20">
        <div className="absolute -top-24 -right-16 h-96 w-96 rounded-full bg-gradient-to-br from-emerald-300/30 to-emerald-500/20 blur-3xl animate-pulse dark:from-emerald-500/10 dark:to-emerald-600/5"></div>
        <div className="absolute top-1/2 -left-20 h-80 w-80 rounded-full bg-gradient-to-tr from-amber-200/40 to-amber-400/30 blur-3xl animate-pulse delay-700 dark:from-amber-500/10 dark:to-amber-600/5"></div>
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-gradient-to-tl from-sky-200/30 to-sky-400/20 blur-3xl animate-pulse delay-1000 dark:from-sky-500/10 dark:to-sky-600/5"></div>

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
            <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl space-y-6 animate-fadeInUp">
                    <div className="inline-flex items-center gap-3 rounded-full bg-white/80 dark:bg-white/10 px-4 py-2 shadow-lg backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-500/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                            Selamat Datang
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-800 dark:from-emerald-300 dark:via-emerald-200 dark:to-emerald-400 leading-tight">
                        {schoolName}
                    </h1>

                    <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                        Madrasah yang menumbuhkan <span className="font-bold text-emerald-700 dark:text-emerald-400">iman</span>, <span className="font-bold text-emerald-700 dark:text-emerald-400">ilmu</span>, dan <span className="font-bold text-emerald-700 dark:text-emerald-400">akhlak</span> dengan pembelajaran yang modern serta menyenangkan.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <Link
                            href="/ppdb"
                            className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-4 text-base font-bold text-white shadow-xl shadow-emerald-600/30 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-600/40 hover:-translate-y-1 hover:scale-105"
                        >
                            Daftar PPDB
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/profil"
                            className="group inline-flex items-center gap-3 rounded-full border-2 border-emerald-600/30 dark:border-emerald-400/30 bg-white/80 dark:bg-white/5 backdrop-blur-sm px-8 py-4 text-base font-bold text-emerald-800 dark:text-emerald-300 transition-all duration-300 hover:border-emerald-600 dark:hover:border-emerald-400 hover:shadow-lg hover:-translate-y-1"
                        >
                            Profil Madrasah
                            <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </Link>
                    </div>

                    <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-500/20 dark:to-amber-600/10 px-5 py-3 shadow-lg border border-amber-200/50 dark:border-amber-500/30 animate-bounce-subtle">
                        <Flame className="h-5 w-5 text-amber-600 dark:text-amber-400 animate-pulse" />
                        <span className="text-sm font-bold text-amber-800 dark:text-amber-200">Akreditasi A - Standar Nasional</span>
                    </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:w-[480px]">
                    {HIGHLIGHTS.map((item, index) => (
                        <div
                            key={item.id}
                            className={`group rounded-3xl border border-gray-200/50 dark:border-white/10 bg-gradient-to-br ${item.accent} p-6 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${item.glow} backdrop-blur-sm animate-fadeInUp`}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 dark:bg-white/10 shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                {item.icon}
                            </div>
                            <h3 className="mt-5 text-xl font-extrabold text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                                {item.title}
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </section>
);

export default HomeHeroSection;
