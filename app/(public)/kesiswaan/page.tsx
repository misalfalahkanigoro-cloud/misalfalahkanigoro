'use client';

import React, { useEffect, useState } from 'react';
import { Camera, Music, PenTool, Activity, Loader2 } from 'lucide-react';
import SimpleHero from '@/components/SimpleHero';
import { api } from '@/lib/api';
import type { Activity as ActivityItem } from '@/lib/types';

// Helper component for icon
const ZapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;

const Kesiswaan: React.FC = () => {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const data = await api.getActivities();
                setActivities(data as ActivityItem[]);
            } catch (error) {
                console.error('Error fetching activities:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, []);

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

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { name: "Pramuka", icon: <Activity /> },
                            { name: "Drum Band", icon: <Music /> },
                            { name: "Pencak Silat", icon: <Activity /> },
                            { name: "Kaligrafi", icon: <PenTool /> },
                            { name: "Qiro'ah", icon: <Music /> },
                            { name: "Dokter Kecil", icon: <Activity /> },
                            { name: "Robotika", icon: <ZapIcon /> },
                            { name: "Futsal", icon: <Activity /> }
                        ].map((ekskul, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-3 hover:border-primary dark:hover:border-green-500 transition cursor-default">
                                <div className="text-primary dark:text-green-400 bg-green-50 dark:bg-green-900/30 p-2 rounded-full">{ekskul.icon}</div>
                                <span className="font-semibold text-gray-700 dark:text-gray-200">{ekskul.name}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Pembiasaan Harian */}
                <section className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md transition-colors">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Pembiasaan Karakter</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="text-4xl mb-2">🤝</div>
                            <h3 className="font-bold text-lg mb-2 dark:text-gray-100">5S (Senyum, Salam, Sapa, Sopan, Santun)</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Dilakukan setiap pagi saat penyambutan siswa di gerbang.</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-2">🤲</div>
                            <h3 className="font-bold text-lg mb-2 dark:text-gray-100">Sholat Dhuha & Dzuhur</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Dilakukan secara berjamaah untuk melatih kedisiplinan ibadah.</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-2">📖</div>
                            <h3 className="font-bold text-lg mb-2 dark:text-gray-100">Murajaah Pagi</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Membaca surat pendek dan Asmaul Husna sebelum KBM dimulai.</p>
                        </div>
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
