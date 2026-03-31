import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Award } from 'lucide-react';
import type { HeadmasterGreeting } from '@/lib/types';

type HomeGreetingSectionProps = {
    greeting: HeadmasterGreeting | null;
    schoolName: string;
};

const HomeGreetingSection: React.FC<HomeGreetingSectionProps> = ({ greeting, schoolName }) => (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 dark:from-gray-900 dark:via-emerald-950/20 dark:to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>

        <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
                <div className="w-full lg:w-2/5 animate-fadeInUp">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 dark:from-emerald-500/30 dark:to-emerald-600/20 transform translate-x-6 translate-y-6 rounded-3xl group-hover:translate-x-8 group-hover:translate-y-8 transition-transform duration-500"></div>
                        <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400/20 to-amber-400/20 dark:from-emerald-500/20 dark:to-amber-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10 w-full aspect-[3/4] overflow-hidden rounded-3xl border-4 border-white dark:border-gray-800 shadow-2xl">
                            <Image
                                src={greeting?.photoUrl || 'https://picsum.photos/id/1005/600/800'}
                                alt={greeting?.headmasterName || 'Kepala Madrasah'}
                                fill
                                sizes="(max-width: 1024px) 100vw, 40vw"
                                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-3/5 space-y-6 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-500/10 px-4 py-2">
                        <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-semibold font-serif uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                            Sambutan Kepala Madrasah
                        </span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
                        {greeting?.subtitle || 'Mewujudkan Generasi Islami yang Kompetitif'}
                    </h2>

                    <div className="space-y-5 text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                        {greeting?.contentText ? (
                            greeting.contentText.split('\n').filter(Boolean).slice(0, 2).map((line, idx) => (
                                <p key={idx}>
                                    {line}
                                </p>
                            ))
                        ) : (
                            <>
                                <p>
                                    Assalamu'alaikum Warahmatullahi Wabarakatuh. Selamat datang di website resmi {schoolName}.
                                </p>
                                <p>
                                    Kami berkomitmen mencetak generasi yang cerdas, berakhlak mulia, dan siap menghadapi tantangan zaman.
                                </p>
                            </>
                        )}
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {greeting?.headmasterName || 'Kepala Madrasah'}
                        </p>
                        <p className="text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                            {greeting?.headmasterTitle || 'Kepala Madrasah'}
                        </p>
                    </div>

                    <Link
                        href="/sambutan"
                        className="inline-flex items-center gap-2 text-base font-bold text-emerald-700 dark:text-emerald-300 hover:gap-4 transition-all group pt-2"
                    >
                        Baca Sambutan Lengkap
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    </section>
);

export default HomeGreetingSection;
