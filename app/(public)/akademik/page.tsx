'use client';

import React, { useEffect, useState } from 'react';
import { Book, Zap, Layers, Award, Loader2 } from 'lucide-react';
import SimpleHero from '@/components/SimpleHero';
import { api } from '@/lib/api';
import type { AcademicPage } from '@/lib/types';

const iconMap: Record<string, React.ReactNode> = {
    Book: <Book size={24} />,
    Award: <Award size={24} />,
    Zap: <Zap size={24} />,
};

const Akademik: React.FC = () => {
    const [page, setPage] = useState<AcademicPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const data = await api.pages.getAcademic();
                setPage(data as AcademicPage);
            } catch (err) {
                console.error('Error fetching academic page:', err);
                setError('Gagal memuat akademik');
            } finally {
                setLoading(false);
            }
        };

        fetchPage();
    }, []);

    const fallback: AcademicPage = {
        id: 'main',
        heroTitle: 'Akademik & Kurikulum',
        heroSubtitle: 'Memadukan ilmu pengetahuan umum dan nilai-nilai keislaman untuk mencetak generasi cerdas.',
        heroImageUrl: 'https://picsum.photos/id/20/1920/800',
        curriculumTitle: 'Kurikulum Terintegrasi',
        curriculumIntro1: 'MIS Al-Falah Kanigoro menerapkan kurikulum yang memadukan Kurikulum Nasional (K13 & Merdeka) dari Kemdikbud dengan Kurikulum Madrasah dari Kemenag.',
        curriculumIntro2: 'Tujuannya adalah membekali siswa dengan kompetensi sains dan teknologi yang mumpuni, sekaligus pondasi agama yang kokoh.',
        subjectsTitle: 'Mata Pelajaran Khas',
        programsTitle: 'Program Unggulan',
        subjects: [],
        programs: [],
    };

    const view = page ?? fallback;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <SimpleHero
                title={view.heroTitle}
                subtitle={view.heroSubtitle}
                image={view.heroImageUrl || 'https://picsum.photos/id/20/1920/800'}
            />

            <div className="container mx-auto px-4 py-12 relative z-30 -mt-8">
                {/* Kurikulum Section */}
                <section className="mb-16">
                    {loading && (
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center">
                            <Loader2 className="animate-spin text-primary" size={28} />
                        </div>
                    )}
                    {!loading && error && (
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-red-500">
                            {error}
                        </div>
                    )}
                    {!loading && !error && (
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            <div className="w-full md:w-1/2">
                                <h2 className="text-2xl font-bold text-primary dark:text-green-400 mb-4 flex items-center gap-2">
                                    <Layers className="text-gold" /> {view.curriculumTitle}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                    {view.curriculumIntro1}
                                </p>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {view.curriculumIntro2}
                                </p>
                            </div>
                            <div className="w-full md:w-1/2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-primary dark:border-green-500 transition-colors">
                                <h3 className="font-bold text-gray-800 dark:text-white mb-3">{view.subjectsTitle}:</h3>
                                <ul className="grid grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300">
                                    {view.subjects.map((subject) => (
                                        <li key={subject.id} className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-primary rounded-full"></div> {subject.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </section>

                {/* Program Unggulan */}
                <section>
                    {!loading && !error && (
                        <>
                            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-10">{view.programsTitle}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                {view.programs.map((program, index) => (
                                    <div key={program.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-all">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${index % 3 === 0 ? 'bg-green-100 text-primary' : index % 3 === 1 ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'} dark:bg-green-900/30 dark:text-green-400`}>
                                            {program.icon && iconMap[program.icon] ? iconMap[program.icon] : <Book size={24} />}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">{program.title}</h3>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                                            {program.description}
                                        </p>
                                    </div>
                                ))}

                            </div>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Akademik;
