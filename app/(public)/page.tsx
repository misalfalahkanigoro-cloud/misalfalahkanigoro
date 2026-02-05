'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, CheckCircle, Shield, Award, Heart, Star, BookOpen, Users, Camera } from 'lucide-react';
import PublicHero from '@/components/PublicHero';
import { api } from '@/lib/api';
import type { Highlight, NewsItem, Activity, NewsListResponse } from '@/lib/types';

// Icon mapping for highlights
const iconMap: Record<string, React.ReactNode> = {
    Star: <Star className="w-8 h-8 text-yellow-500" />,
    BookOpen: <BookOpen className="w-8 h-8 text-primary" />,
    Users: <Users className="w-8 h-8 text-blue-500" />,
};

const Home: React.FC = () => {
    const [highlights, setHighlights] = useState<Highlight[]>([]);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [schoolName] = useState('MIS Al-Falah Kanigoro');
    const [loading, setLoading] = useState(true);

    // Fetch data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [highlightsData, newsData, activitiesData] = await Promise.all([
                    api.getHighlights(),
                    api.getNews({ page: 1, pageSize: 3 }),
                    api.getActivities(),
                ]);

                setHighlights(highlightsData as Highlight[]);
                setNews(((newsData as NewsListResponse).items || []));
                setActivities(activitiesData as Activity[]);
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <>
            <PublicHero />

            {/* Highlights / Stats */}
            <section className="py-20 bg-white dark:bg-gray-900 relative z-20 transition-colors duration-200">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {highlights.map((item) => (
                            <div key={item.id} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl border-t-4 border-primary hover:-translate-y-1 transition-all duration-300">
                                <div className="mb-4 bg-green-50 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center">
                                    {iconMap[item.icon] || <Star className="w-8 h-8 text-primary" />}
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{item.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-16 bg-green-50 dark:bg-gray-950 transition-colors duration-200">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-primary dark:text-green-400 font-bold tracking-wide uppercase mb-2">Keunggulan</h2>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Kenapa Memilih {schoolName}?</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { title: "Kurikulum Islami", desc: "Integrasi kurikulum nasional dengan nilai-nilai agama yang kuat.", icon: <Shield size={32} /> },
                            { title: "Guru Berkompeten", desc: "Dididik oleh tenaga pengajar profesional and berpengalaman.", icon: <Award size={32} /> },
                            { title: "Fasilitas Nyaman", desc: "Lingkungan belajar yang kondusif, bersih, dan representatif.", icon: <CheckCircle size={32} /> },
                            { title: "Pembinaan Akhlak", desc: "Fokus utama pada pembentukan karakter dan adab siswa.", icon: <Heart size={32} /> },
                        ].map((feature, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition text-center group">
                                <div className="mx-auto w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                                    {feature.icon}
                                </div>
                                <h4 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">{feature.title}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Sambutan Kepala Sekolah */}
            <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-200">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="w-full md:w-1/3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 transform translate-x-4 translate-y-4 rounded-xl"></div>
                                <img
                                    src="https://picsum.photos/id/1005/600/800"
                                    alt="Kepala Madrasah"
                                    className="rounded-xl shadow-lg relative z-10 w-full object-cover aspect-[3/4]"
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-2/3">
                            <h4 className="text-primary dark:text-green-400 font-bold uppercase tracking-wider mb-2">Sambutan Kepala Madrasah</h4>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">Mewujudkan Generasi Islami yang Kompetitif</h2>
                            <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                                <p>
                                    "Assalamu'alaikum Warahmatullahi Wabarakatuh. Puji syukur kita panjatkan ke hadirat Allah SWT. {schoolName} hadir sebagai lembaga pendidikan yang berkomitmen mencetak generasi yang tidak hanya cerdas secara intelektual, namun juga matang secara spiritual."
                                </p>
                                <p>
                                    "Kami memadukan kurikulum nasional dengan nilai-nilai pesantren untuk membentuk karakter siswa yang berakhlak karimah, mandiri, dan siap menghadapi tantangan zaman."
                                </p>
                            </div>
                            <div className="mt-8">
                                <p className="font-bold text-gray-900 dark:text-white">Drs. H. Ahmad Fauzi, M.Pd</p>
                                <p className="text-gray-500 dark:text-gray-400">Kepala Madrasah</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Galeri Singkat */}
            <section className="py-12 bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Galeri Kegiatan</h2>
                        <Link href="/kesiswaan" className="text-primary dark:text-green-400 font-semibold text-sm hover:underline">Lihat Semua</Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {activities.slice(0, 4).map((act) => (
                            <div key={act.id} className="relative rounded-lg overflow-hidden group aspect-square">
                                <img src={act.imageUrl || 'https://picsum.photos/600/400'} alt={act.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Camera className="text-white" size={24} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Berita Terbaru */}
            <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-200">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Kabar Madrasah</h2>
                            <p className="text-gray-500 dark:text-gray-400">Berita, prestasi, dan agenda terbaru.</p>
                        </div>
                        <Link href="/berita" className="hidden md:flex items-center text-primary dark:text-green-400 font-semibold hover:underline">
                            Lihat Semua <ArrowRight size={16} className="ml-2" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {news.map((item) => (
                            <article key={item.id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col h-full">
                                <div className="relative h-48 overflow-hidden">
                                    <img src={item.thumbnailUrl || 'https://picsum.photos/800/600'} alt={item.title} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                                    <span className="absolute top-4 left-4 bg-primary text-white text-xs px-3 py-1 rounded-full">{item.category}</span>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-center text-gray-400 text-xs mb-3">
                                        <Calendar size={14} className="mr-2" />
                                        {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 hover:text-primary dark:hover:text-green-400 transition-colors line-clamp-2">
                                        <Link href={`/berita/${item.slug}`}>{item.title}</Link>
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 flex-grow">
                                        {item.excerpt}
                                    </p>
                                    <Link href={`/berita/${item.slug}`} className="text-primary dark:text-green-400 font-medium text-sm hover:underline mt-auto inline-block">
                                        Baca Selengkapnya
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="mt-8 text-center md:hidden">
                        <Link href="/berita" className="inline-flex items-center text-primary dark:text-green-400 font-semibold">
                            Lihat Semua Berita <ArrowRight size={16} className="ml-2" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* PPDB CTA Section */}
            <section className="py-20 bg-primary dark:bg-green-800 text-white relative overflow-hidden transition-colors duration-200">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/5"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 rounded-full bg-white/5"></div>

                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Penerimaan Peserta Didik Baru</h2>
                    <p className="text-green-100 text-lg md:text-xl max-w-2xl mx-auto mb-10">
                        Bergabunglah bersama keluarga besar {schoolName}. Mari wujudkan generasi Qur'ani yang cerdas dan berakhlak mulia.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/ppdb"
                            className="px-8 py-4 bg-white text-primary rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-lg"
                        >
                            Daftar Sekarang
                        </Link>
                        <Link
                            href="/kontak"
                            className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white/10 transition"
                        >
                            Hubungi Panitia
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Home;
