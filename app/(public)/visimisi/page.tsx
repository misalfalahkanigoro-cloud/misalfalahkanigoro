'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Loader2, Target } from 'lucide-react';

type VisionMission = {
    id: string;
    visionText: string;
    missionText: string;
};

const splitLines = (text: string) =>
    text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

const VisiMisiPage: React.FC = () => {
    const [data, setData] = useState<VisionMission | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/vision-mission');
                if (res.status === 404) {
                    setError('Visi dan misi belum tersedia.');
                    setData(null);
                    return;
                }
                if (!res.ok) {
                    throw new Error('Gagal memuat visi dan misi');
                }
                const payload = await res.json();
                setData(payload || null);
            } catch (err) {
                console.error(err);
                setError('Visi dan misi belum tersedia.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const missionLines = useMemo(() => splitLines(data?.missionText || ''), [data?.missionText]);
    const showMissionList = missionLines.length > 1;

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-[#0A0F0B] dark:via-[#0B120E] dark:to-[#111A14] transition-colors duration-200 pb-16">
            <section className="relative overflow-hidden">
                <div className="absolute -top-16 right-12 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-500/10" />
                <div className="absolute top-20 -left-16 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl dark:bg-amber-500/10" />
                <div className="container mx-auto px-4 py-14">
                    <div className="max-w-3xl">
                        <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-200">Profil Madrasah</p>
                        <h1 className="mt-3 text-4xl font-semibold text-emerald-900 dark:text-white">Visi &amp; Misi Madrasah</h1>
                        <p className="mt-4 text-lg text-emerald-900/70 dark:text-emerald-100/70">
                            Arah, tujuan, dan komitmen kami dalam membangun generasi berakhlak serta berprestasi.
                        </p>
                    </div>
                </div>
            </section>

            <section className="container mx-auto px-4">
                {loading && (
                    <div className="rounded-3xl border border-emerald-100 bg-white/80 p-10 text-center text-sm text-emerald-900/70 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-emerald-100/70">
                        <Loader2 className="mx-auto mb-3 animate-spin text-emerald-600" size={24} />
                        Memuat visi dan misi...
                    </div>
                )}

                {!loading && error && (
                    <div className="rounded-3xl border border-dashed border-emerald-200 bg-white/80 p-10 text-center text-sm text-emerald-900/70 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-emerald-100/70">
                        {error}
                    </div>
                )}

                {!loading && !error && data && (
                    <div className="grid gap-8 lg:grid-cols-2">
                        <div className="rounded-3xl border border-emerald-100 bg-white/90 p-8 shadow-lg shadow-emerald-100/40 backdrop-blur dark:border-white/10 dark:bg-white/5">
                            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-200">
                                <Target size={18} />
                                <span className="text-xs font-semibold uppercase tracking-[0.3em]">Visi</span>
                            </div>
                            <h2 className="mt-3 text-2xl font-semibold text-emerald-900 dark:text-white">Visi Madrasah</h2>
                            <p className="mt-4 text-gray-600 dark:text-gray-300 whitespace-pre-line">
                                {data.visionText || 'Visi belum tersedia.'}
                            </p>
                        </div>

                        <div className="rounded-3xl border border-amber-100 bg-white/90 p-8 shadow-lg shadow-amber-100/40 backdrop-blur dark:border-white/10 dark:bg-white/5">
                            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-200">
                                <CheckCircle2 size={18} />
                                <span className="text-xs font-semibold uppercase tracking-[0.3em]">Misi</span>
                            </div>
                            <h2 className="mt-3 text-2xl font-semibold text-amber-900 dark:text-white">Misi Madrasah</h2>
                            {showMissionList ? (
                                <ul className="mt-4 space-y-3 text-gray-600 dark:text-gray-300">
                                    {missionLines.map((line, index) => (
                                        <li key={`${index}-${line}`} className="flex items-start gap-3">
                                            <span className="mt-2 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                            <span className="flex-1">{line}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="mt-4 text-gray-600 dark:text-gray-300 whitespace-pre-line">
                                    {data.missionText || 'Misi belum tersedia.'}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

export default VisiMisiPage;
