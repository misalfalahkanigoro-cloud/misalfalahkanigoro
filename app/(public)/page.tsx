'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowRight,
    Calendar,
    Shield,
    Award,
    Heart,
    Star,
    BookOpen,
    Users,
    Sparkles,
    GraduationCap,
    Landmark,
    Trophy,
    Flame,
    CheckCircle,
    TrendingUp,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { NewsPost, HeadmasterGreeting } from '@/lib/types';
import PublicHero from '@/components/PublicHero';

const HIGHLIGHTS = [
    {
        id: 1,
        title: 'Akreditasi A',
        description: 'Mutu pendidikan terjamin dengan standar nasional yang kuat.',
        icon: <Star className="w-7 h-7 text-amber-500" />,
        accent: 'from-amber-50 via-amber-100/50 to-white dark:from-amber-500/10 dark:to-transparent',
        glow: 'group-hover:shadow-amber-500/20',
    },
    {
        id: 2,
        title: 'Tahfidz & Adab',
        description: 'Pembiasaan ibadah dan pembinaan karakter sejak dini.',
        icon: <BookOpen className="w-7 h-7 text-emerald-600" />,
        accent: 'from-emerald-50 via-emerald-100/50 to-white dark:from-emerald-500/10 dark:to-transparent',
        glow: 'group-hover:shadow-emerald-500/20',
    },
    {
        id: 3,
        title: 'Ekstrakurikuler',
        description: 'Bakat siswa diasah melalui kegiatan kreatif dan sportif.',
        icon: <Users className="w-7 h-7 text-sky-500" />,
        accent: 'from-sky-50 via-sky-100/50 to-white dark:from-sky-500/10 dark:to-transparent',
        glow: 'group-hover:shadow-sky-500/20',
    },
    {
        id: 4,
        title: 'Prestasi Konsisten',
        description: 'Kompetisi akademik dan non-akademik terus bertumbuh.',
        icon: <Trophy className="w-7 h-7 text-rose-500" />,
        accent: 'from-rose-50 via-rose-100/50 to-white dark:from-rose-500/10 dark:to-transparent',
        glow: 'group-hover:shadow-rose-500/20',
    },
];

const PROGRAMS = [
    {
        title: 'Kurikulum Islami Terpadu',
        description: 'Sinergi ilmu umum dan diniyah dengan pembiasaan harian.',
        icon: <Shield className="w-6 h-6" />,
        color: 'emerald',
    },
    {
        title: 'Guru Berpengalaman',
        description: 'Tenaga pendidik profesional dengan pendekatan humanis.',
        icon: <Award className="w-6 h-6" />,
        color: 'blue',
    },
    {
        title: 'Fasilitas Nyaman',
        description: 'Ruang belajar, perpustakaan, dan sarana pendukung yang representatif.',
        icon: <Landmark className="w-6 h-6" />,
        color: 'purple',
    },
    {
        title: 'Pembinaan Akhlak',
        description: 'Pendampingan karakter dan adab dalam setiap kegiatan.',
        icon: <Heart className="w-6 h-6" />,
        color: 'rose',
    },
    {
        title: 'Literasi & Numerasi',
        description: 'Program penguatan dasar untuk capaian akademik optimal.',
        icon: <GraduationCap className="w-6 h-6" />,
        color: 'amber',
    },
    {
        title: 'Kegiatan Inovatif',
        description: 'Kelas proyek, expo siswa, dan pembelajaran berbasis praktik.',
        icon: <Sparkles className="w-6 h-6" />,
        color: 'cyan',
    },
];

const STATS = [
    { 
        label: 'Siswa Aktif', 
        value: '420+', 
        caption: 'Belajar dalam lingkungan positif',
        icon: <Users className="w-8 h-8" />,
        color: 'emerald'
    },
    { 
        label: 'Guru & Staf', 
        value: '38', 
        caption: 'Tenaga profesional dan berdedikasi',
        icon: <Award className="w-8 h-8" />,
        color: 'blue'
    },
    { 
        label: 'Prestasi', 
        value: '65+', 
        caption: 'Kejuaraan dalam 3 tahun terakhir',
        icon: <Trophy className="w-8 h-8" />,
        color: 'amber'
    },
    { 
        label: 'Alumni', 
        value: '1.200+', 
        caption: 'Jejak lulusan di berbagai bidang',
        icon: <GraduationCap className="w-8 h-8" />,
        color: 'rose'
    },
];

const Home: React.FC = () => {
    const [news, setNews] = useState<NewsPost[]>([]);
    const [greeting, setGreeting] = useState<HeadmasterGreeting | null>(null);
    const [schoolName] = useState('MIS Al-Falah Kanigoro');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [newsData, greetingData] = await Promise.all([
                    api.getNews({ page: 1, pageSize: 3 }),
                    api.getHeadmasterGreeting(),
                ]);

                const newsItems = (newsData as any).items || newsData || [];
                setNews(newsItems);
                setGreeting(greetingData as HeadmasterGreeting || null);
            } catch (error) {
                console.error('Error fetching homepage data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <>
                <PublicHero />
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 dark:border-emerald-800 dark:border-t-emerald-400 mx-auto"></div>
                        <p className="mt-4 text-emerald-700 dark:text-emerald-300 font-medium">Memuat...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <PublicHero />
            
            {/* Hero Section - Enhanced */}
            <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-amber-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950/20">
                {/* Animated Background Elements */}
                <div className="absolute -top-24 -right-16 h-96 w-96 rounded-full bg-gradient-to-br from-emerald-300/30 to-emerald-500/20 blur-3xl animate-pulse dark:from-emerald-500/10 dark:to-emerald-600/5"></div>
                <div className="absolute top-1/2 -left-20 h-80 w-80 rounded-full bg-gradient-to-tr from-amber-200/40 to-amber-400/30 blur-3xl animate-pulse delay-700 dark:from-amber-500/10 dark:to-amber-600/5"></div>
                <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-gradient-to-tl from-sky-200/30 to-sky-400/20 blur-3xl animate-pulse delay-1000 dark:from-sky-500/10 dark:to-sky-600/5"></div>
                
                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                
                <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
                    <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
                        {/* Left Content */}
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
                        
                        {/* Right Highlights Grid */}
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

            {/* Programs Section - Enhanced */}
            <section className="relative py-24 bg-white dark:bg-gray-950 overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-20 right-0 w-72 h-72 bg-emerald-100/30 dark:bg-emerald-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-0 w-96 h-96 bg-amber-100/30 dark:bg-amber-500/5 rounded-full blur-3xl"></div>
                
                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid gap-16 lg:grid-cols-[1.2fr_1fr] lg:items-center">
                        {/* Left Content */}
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
                        
                        {/* Right Programs Grid */}
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

            {/* Headmaster Greeting - Enhanced */}
            <section className="py-24 bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 dark:from-gray-900 dark:via-emerald-950/20 dark:to-gray-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>
                
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        {/* Photo */}
                        <div className="w-full lg:w-2/5 animate-fadeInUp">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 dark:from-emerald-500/30 dark:to-emerald-600/20 transform translate-x-6 translate-y-6 rounded-3xl group-hover:translate-x-8 group-hover:translate-y-8 transition-transform duration-500"></div>
                                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400/20 to-amber-400/20 dark:from-emerald-500/20 dark:to-amber-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <img
                                    src={greeting?.photoUrl || 'https://picsum.photos/id/1005/600/800'}
                                    alt={greeting?.headmasterName || 'Kepala Madrasah'}
                                    className="rounded-3xl shadow-2xl relative z-10 w-full object-cover aspect-[3/4] border-4 border-white dark:border-gray-800 group-hover:scale-[1.02] transition-transform duration-500"
                                />
                            </div>
                        </div>
                        
                        {/* Content */}
                        <div className="w-full lg:w-3/5 space-y-6 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
                            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-500/10 px-4 py-2">
                                <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                                    Sambutan Kepala Madrasah
                                </span>
                            </div>
                            
                            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
                                {greeting?.subtitle || 'Mewujudkan Generasi Islami yang Kompetitif'}
                            </h2>
                            
                            <div className="space-y-5 text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                                {greeting?.contentText ? (
                                    greeting.contentText.split('\n').filter(Boolean).slice(0, 2).map((line, idx) => (
                                        <p key={idx} className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-3 before:w-2 before:h-2 before:bg-emerald-500 before:rounded-full">
                                            {line}
                                        </p>
                                    ))
                                ) : (
                                    <>
                                        <p className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-3 before:w-2 before:h-2 before:bg-emerald-500 before:rounded-full">
                                            Assalamu'alaikum Warahmatullahi Wabarakatuh. Selamat datang di website resmi {schoolName}.
                                        </p>
                                        <p className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-3 before:w-2 before:h-2 before:bg-emerald-500 before:rounded-full">
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

            {/* Stats Section - Enhanced */}
            <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 py-20 text-white">
                {/* Animated Background */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/40 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-400/30 rounded-full blur-3xl animate-pulse delay-700"></div>
                    <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-sky-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>
                
                {/* Pattern Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]"></div>
                
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-16 animate-fadeInUp">
                        <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
                            Madrasah dalam Angka
                        </h2>
                        <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
                            Komitmen kami untuk memberikan pendidikan berkualitas tercermin dalam pencapaian yang konsisten
                        </p>
                    </div>
                    
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {STATS.map((stat, index) => (
                            <div 
                                key={stat.label} 
                                className="group relative rounded-3xl border border-white/20 bg-white/5 backdrop-blur-sm p-8 shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:bg-white/10 hover:shadow-emerald-500/20 animate-fadeInUp"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="absolute -top-6 left-8 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                    {stat.icon}
                                </div>
                                
                                <div className="mt-4">
                                    <p className="text-5xl font-extrabold bg-gradient-to-br from-white to-emerald-100 bg-clip-text text-transparent">
                                        {stat.value}
                                    </p>
                                    <p className="mt-3 text-base font-bold uppercase tracking-wider text-emerald-100">
                                        {stat.label}
                                    </p>
                                    <p className="mt-3 text-sm text-emerald-200/80 leading-relaxed">
                                        {stat.caption}
                                    </p>
                                </div>
                                
                                {/* Hover Effect Line */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-amber-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-3xl"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* News Section - Enhanced */}
            <section className="py-24 bg-white dark:bg-gray-950 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/20 dark:bg-emerald-500/5 rounded-full blur-3xl"></div>
                
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-12 animate-fadeInUp">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-500/10 px-4 py-2">
                                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                                    Kabar Madrasah
                                </span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
                                Berita & Kegiatan Terbaru
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-lg">
                                Ikuti kegiatan, prestasi, dan informasi terbaru dari madrasah kami
                            </p>
                        </div>
                        <Link 
                            href="/berita" 
                            className="hidden md:inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold hover:gap-4 transition-all group"
                        >
                            Lihat Semua Berita
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {news.length > 0 ? (
                            news.map((item, index) => (
                                <article 
                                    key={item.id} 
                                    className="group bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-800 flex flex-col h-full hover:-translate-y-2 animate-fadeInUp"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="relative h-56 overflow-hidden">
                                        <img
                                            src={item.coverUrl || 'https://picsum.photos/800/600'}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <span className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                                            Berita
                                        </span>
                                    </div>
                                    <div className="p-7 flex flex-col flex-grow">
                                        <div className="flex items-center text-gray-400 dark:text-gray-500 text-xs font-medium mb-4">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            {new Date(item.publishedAt).toLocaleDateString('id-ID', { 
                                                day: 'numeric', 
                                                month: 'long', 
                                                year: 'numeric' 
                                            })}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-tight">
                                            <Link href={`/berita/${item.slug}`}>
                                                {item.title}
                                            </Link>
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-3 flex-grow leading-relaxed">
                                            {item.excerpt || item.content?.substring(0, 120) + '...'}
                                        </p>
                                        <Link 
                                            href={`/berita/${item.slug}`} 
                                            className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm hover:gap-4 transition-all group mt-auto"
                                        >
                                            Baca Selengkapnya
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                                <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400 text-lg">Belum ada berita terbaru.</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-12 text-center md:hidden">
                        <Link 
                            href="/berita" 
                            className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold hover:gap-4 transition-all group"
                        >
                            Lihat Semua Berita
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* PPDB CTA - Enhanced */}
            <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 py-28 text-white">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-amber-400 to-amber-600 rounded-full blur-3xl animate-pulse delay-700"></div>
                </div>
                
                {/* Pattern Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                
                {/* Floating Shapes */}
                <div className="absolute top-20 right-20 w-20 h-20 border-2 border-white/20 rounded-2xl rotate-45 animate-bounce-subtle"></div>
                <div className="absolute bottom-32 left-32 w-16 h-16 border-2 border-white/20 rounded-full animate-pulse"></div>

                <div className="container mx-auto px-4 text-center relative z-10">
                    <div className="max-w-4xl mx-auto space-y-8 animate-fadeInUp">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-5 py-2.5 border border-white/20">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                            <span className="text-sm font-bold uppercase tracking-wider text-white">
                                PPDB 2026 Dibuka
                            </span>
                        </div>
                        
                        <h2 className="text-4xl md:text-6xl font-extrabold leading-tight">
                            Penerimaan Peserta Didik Baru
                        </h2>
                        
                        <p className="text-emerald-50 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
                            Bergabunglah bersama keluarga besar <span className="font-bold text-white">{schoolName}</span>. 
                            Mari wujudkan generasi cerdas, berakhlak, dan siap masa depan.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-5 justify-center pt-6">
                            <Link
                                href="/ppdb"
                                className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-emerald-800 rounded-full font-bold text-lg hover:bg-emerald-50 transition-all duration-300 shadow-2xl hover:shadow-white/20 hover:scale-105"
                            >
                                Daftar Sekarang
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/kontak"
                                className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                            >
                                Hubungi Panitia
                                <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </Link>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 justify-center pt-8 text-sm">
                            <div className="flex items-center gap-2 text-emerald-100">
                                <CheckCircle className="w-5 h-5" />
                                <span>Pendaftaran Online</span>
                            </div>
                            <div className="flex items-center gap-2 text-emerald-100">
                                <CheckCircle className="w-5 h-5" />
                                <span>Proses Mudah & Cepat</span>
                            </div>
                            <div className="flex items-center gap-2 text-emerald-100">
                                <CheckCircle className="w-5 h-5" />
                                <span>Konsultasi Gratis</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Home;