'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { ProfilePage } from '@/lib/types';
import { Loader2, IdCard, BadgeCheck, GraduationCap, Building2, MapPin, School } from 'lucide-react';

const Profil: React.FC = () => {
    const [page, setPage] = useState<ProfilePage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const data = await api.pages.getProfile();
                setPage(data as ProfilePage);
            } catch (err) {
                console.error('Error fetching profile page:', err);
                setError('Gagal memuat profil');
            } finally {
                setLoading(false);
            }
        };

        fetchPage();
    }, []);

    const fallback: ProfilePage = {
        id: 'main',
        descriptionHtml: '',
        descriptionText: '',
        descriptionJson: null,
        videoUrl: null,
        schoolName: '',
        npsn: '',
        schoolAddress: '',
        village: '',
        district: '',
        city: '',
        province: '',
        schoolStatus: '',
        educationForm: '',
        educationLevel: '',
    };

    const view = page ?? fallback;

    const identityRows = [
        { label: 'Nama', value: view.schoolName },
        { label: 'NPSN', value: view.npsn },
        { label: 'Alamat', value: view.schoolAddress },
        { label: 'Desa/Kelurahan', value: view.village },
        { label: 'Kecamatan/Kota (LN)', value: view.district },
        { label: 'Kab.-Kota/Negara (LN)', value: view.city },
        { label: 'Propinsi/Luar Negeri (LN)', value: view.province },
        { label: 'Status Sekolah', value: view.schoolStatus },
        { label: 'Bentuk Pendidikan', value: view.educationForm },
        { label: 'Jenjang Pendidikan', value: view.educationLevel },
    ].filter((row) => row.value);

    const highlightCards = [
        { label: 'NPSN', value: view.npsn || 'Belum diisi', icon: IdCard },
        { label: 'Status', value: view.schoolStatus || 'Belum diisi', icon: BadgeCheck },
        { label: 'Bentuk', value: view.educationForm || 'Belum diisi', icon: Building2 },
        { label: 'Jenjang', value: view.educationLevel || 'Belum diisi', icon: GraduationCap },
    ];

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-16 transition-colors duration-200">
            <div className="relative z-30">
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-[#0A0F0B] dark:via-[#0B120E] dark:to-[#111A14]" />
                <div className="container mx-auto px-4 py-10">
                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.9fr)] gap-8">

                    {/* Main Content */}
                    <div className="space-y-8">
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
                        <>
                            <section className="rounded-3xl border border-emerald-100 bg-white/90 p-8 shadow-lg shadow-emerald-100/40 backdrop-blur dark:border-white/10 dark:bg-white/5">
                                <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-200">
                                    <School size={20} />
                                    <span className="text-xs font-semibold uppercase tracking-[0.3em]">Profil Singkat</span>
                                </div>
                                <h2 className="mt-3 text-2xl font-semibold text-emerald-900 dark:text-white">Deskripsi Madrasah</h2>
                                <div className="mt-4">
                                    {view.descriptionHtml ? (
                                        <div
                                            className="prose max-w-none text-gray-600 dark:text-gray-300 dark:prose-invert"
                                            dangerouslySetInnerHTML={{ __html: view.descriptionHtml }}
                                        />
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">Deskripsi belum tersedia.</p>
                                    )}
                                </div>
                                <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                                    {highlightCards.map((card) => {
                                        const Icon = card.icon;
                                        return (
                                            <div
                                                key={card.label}
                                                className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-emerald-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-white"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                                                        <Icon size={18} />
                                                    </span>
                                                    <div>
                                                        <p className="text-xs uppercase tracking-[0.25em] text-emerald-600/70 dark:text-emerald-100/70">{card.label}</p>
                                                        <p className="mt-1 text-sm font-semibold">{card.value}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        </>
                        )}

                        {/* Video Profil */}
                        {!loading && !error && view.videoUrl && (
                        <section className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                            <h2 className="text-2xl font-bold text-primary dark:text-green-400 mb-4 border-b dark:border-gray-700 pb-2">Video Profil</h2>
                            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                                <video
                                    src={view.videoUrl}
                                    controls
                                    className="w-full h-auto"
                                />
                            </div>
                        </section>
                        )}
                        
                    </div>

                    {/* Sidebar Data */}
                    <div>
                        <div className="sticky top-24 space-y-6">
                            <div className="rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-lg shadow-emerald-100/40 backdrop-blur dark:border-white/10 dark:bg-white/5">
                                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-200">
                                    <MapPin size={18} />
                                    <span className="text-xs font-semibold uppercase tracking-[0.3em]">Identitas</span>
                                </div>
                                <h3 className="mt-3 text-xl font-bold text-gray-900 dark:text-white">Identitas Madrasah</h3>
                            {!loading && !error && (
                                <ul className="mt-4 space-y-4 text-sm">
                                    {identityRows.map((item) => (
                                        <li key={item.label} className="rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                                            <span className="block text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">{item.label}</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{item.value}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            </div>
                            <div className="rounded-3xl border border-amber-100 bg-white/90 p-6 text-sm text-amber-900/70 shadow-lg shadow-amber-100/40 dark:border-white/10 dark:bg-white/5 dark:text-amber-100/80">
                                <p className="text-xs uppercase tracking-[0.3em]">Highlight Lokasi</p>
                                <p className="mt-3 text-base font-semibold text-amber-900 dark:text-amber-100">
                                    {view.schoolAddress || 'Alamat belum diisi'}
                                </p>
                                <p className="mt-2 text-sm">
                                    {view.village || 'Desa/Kelurahan'} · {view.district || 'Kecamatan'} · {view.city || 'Kabupaten'}
                                </p>
                            </div>
                        </div>
                    </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profil;
