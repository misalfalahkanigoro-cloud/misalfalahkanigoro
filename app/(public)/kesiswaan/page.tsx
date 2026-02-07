'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Camera, Music, PenTool, Activity, Loader2, Tent, BookMarked, Paintbrush, Trophy, Sunrise, Heart, BookOpen, SmilePlus } from 'lucide-react';
import SimpleHero from '@/components/SimpleHero';
import { api } from '@/lib/api';
import type { Activity as ActivityItem, CharacterProgram, Extracurricular } from '@/lib/types';

// Helper component for icon
const ZapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;

const iconMap: Record<string, React.ReactNode> = {
    Activity: <Activity size={20} />,
    Music: <Music size={20} />,
    PenTool: <PenTool size={20} />,
    Tent: <Tent size={20} />,
    BookMarked: <BookMarked size={20} />,
    Paintbrush: <Paintbrush size={20} />,
    Trophy: <Trophy size={20} />,
    Sunrise: <Sunrise size={20} />,
    Heart: <Heart size={20} />,
    BookOpen: <BookOpen size={20} />,
    SmilePlus: <SmilePlus size={20} />,
    Zap: <ZapIcon />,
};

const Kesiswaan: React.FC = () => {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [extracurriculars, setExtracurriculars] = useState<Extracurricular[]>([]);
    const [characterPrograms, setCharacterPrograms] = useState<CharacterProgram[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const [activitiesData, extracurricularsData, characterProgramsData] = await Promise.all([
                    api.getActivities(),
                    api.getExtracurriculars(),
                    api.getCharacterPrograms(),
                ]);
                setActivities(activitiesData as ActivityItem[]);
                setExtracurriculars(extracurricularsData as Extracurricular[]);
                setCharacterPrograms(characterProgramsData as CharacterProgram[]);
            } catch (error) {
                console.error('Error fetching activities:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, []);

    const fallbackExtracurriculars: Extracurricular[] = [
        { id: 'fallback-1', name: 'Pramuka', description: 'Melatih kepemimpinan dan kemandirian siswa', icon: 'Tent', displayOrder: 1, isActive: true },
        { id: 'fallback-2', name: 'Drum Band', description: 'Ekspresi seni musik dan kekompakan tim', icon: 'Music', displayOrder: 2, isActive: true },
        { id: 'fallback-3', name: 'Pencak Silat', description: 'Membangun fisik dan mental yang tangguh', icon: 'Activity', displayOrder: 3, isActive: true },
        { id: 'fallback-4', name: 'Kaligrafi', description: 'Mengasah kreativitas seni kaligrafi Arab', icon: 'PenTool', displayOrder: 4, isActive: true },
    ];

    const fallbackCharacterPrograms: CharacterProgram[] = [
        { id: 'cp-1', name: '5S (Senyum, Salam, Sapa, Sopan, Santun)', description: 'Pembiasaan karakter di gerbang madrasah setiap pagi.', icon: 'SmilePlus', frequency: 'Setiap Hari', displayOrder: 1, isActive: true },
        { id: 'cp-2', name: 'Sholat Dhuha & Dzuhur', description: 'Dilakukan berjamaah untuk melatih kedisiplinan ibadah.', icon: 'Sunrise', frequency: 'Setiap Hari', displayOrder: 2, isActive: true },
        { id: 'cp-3', name: 'Murajaah Pagi', description: 'Membaca surat pendek dan Asmaul Husna sebelum KBM dimulai.', icon: 'BookOpen', frequency: 'Setiap Hari', displayOrder: 3, isActive: true },
    ];

    const extracurricularView = useMemo(
        () => (extracurriculars.length ? extracurriculars : fallbackExtracurriculars),
        [extracurriculars]
    );

    const characterProgramView = useMemo(
        () => (characterPrograms.length ? characterPrograms : fallbackCharacterPrograms),
        [characterPrograms]
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 transition-colors duration-200">
            <SimpleHero
                title="Kesiswaan"
                subtitle="Wadah kreativitas, bakat, dan pengembangan karakter siswa melalui berbagai kegiatan positif."
            />

            <div className="container mx-auto px-4 py-12 space-y-16">
                {/* Ekstrakurikuler */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-8 w-1 bg-primary rounded-full"></div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ekstrakurikuler</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {extracurricularView.map((ekskul) => (
                            <div
                                key={ekskul.id}
                                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-start gap-3 hover:border-primary dark:hover:border-green-500 transition"
                            >
                                <div className="text-primary dark:text-green-400 bg-green-50 dark:bg-green-900/30 p-2 rounded-full mt-1">
                                    {ekskul.icon && iconMap[ekskul.icon] ? iconMap[ekskul.icon] : <Activity size={20} />}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-100">{ekskul.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{ekskul.description}</p>
                                    {ekskul.schedule && (
                                        <p className="text-[11px] text-emerald-600 dark:text-emerald-300 mt-2">{ekskul.schedule}</p>
                                    )}
                                    {ekskul.coachName && (
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400">Pembina: {ekskul.coachName}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Pembiasaan Harian */}
                <section className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md transition-colors">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Pembiasaan Karakter</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {characterProgramView.map((program) => (
                            <div key={program.id} className="text-center">
                                <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-300">
                                    {program.icon && iconMap[program.icon] ? iconMap[program.icon] : <Heart size={20} />}
                                </div>
                                <h3 className="font-bold text-lg mb-2 dark:text-gray-100">{program.name}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">{program.description}</p>
                                {program.frequency && (
                                    <p className="text-xs text-emerald-600 dark:text-emerald-300 mt-2">{program.frequency}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Gallery */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-8 w-1 bg-primary rounded-full"></div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Galeri Kegiatan</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {loading && (
                            <div className="col-span-full flex items-center justify-center py-10">
                                <Loader2 className="animate-spin text-primary" size={32} />
                            </div>
                        )}

                        {!loading && activities.map((activity) => (
                            <div key={activity.id} className="group relative overflow-hidden rounded-lg aspect-square bg-gray-200 dark:bg-gray-700">
                                <img
                                    src={activity.imageUrl || 'https://picsum.photos/600/400'}
                                    alt={activity.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                    <span className="text-white font-medium">{activity.title}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Kesiswaan;
