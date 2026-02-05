'use client';

import React, { useState } from 'react';
import { Search, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import SimpleHero from '@/components/SimpleHero';
import { api } from '@/lib/api';
import type { GraduationStudent } from '@/lib/types';

const CekKelulusan: React.FC = () => {
    const [nisn, setNisn] = useState('');
    const [result, setResult] = useState<GraduationStudent | null>(null);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nisn.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);
        setSearched(true);

        try {
            const data = await api.searchGraduation(nisn.trim());
            setResult(data as GraduationStudent);
        } catch (err) {
            const message = err instanceof Error ? err.message : '';
            if (message === 'NOT_FOUND') {
                setResult(null);
            } else {
                setError('Terjadi kesalahan saat mencari data');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <SimpleHero
                title="Cek Kelulusan"
                subtitle="Sistem Informasi Pengumuman Kelulusan Siswa MIS Al-Falah Kanigoro."
                image="https://picsum.photos/id/180/1920/800"
            />

            <section className="py-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                <div className="container mx-auto px-4">
                    {/* Search Form */}
                    <div className="max-w-xl mx-auto mb-12">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-grow">
                                <input
                                    type="text"
                                    value={nisn}
                                    onChange={(e) => setNisn(e.target.value)}
                                    placeholder="Masukkan NISN (10 digit)"
                                    className="w-full px-5 py-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-lg"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-secondary transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                                Cari
                            </button>
                        </form>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="max-w-xl mx-auto">
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                                <XCircle className="mx-auto text-red-500 mb-3" size={48} />
                                <p className="text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Result */}
                    {searched && !loading && !error && (
                        <div className="max-w-xl mx-auto">
                            {result ? (
                                <div className={`rounded-xl p-8 text-center border-2 ${result.status === 'LULUS'
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                                    }`}>
                                    {result.status === 'LULUS' ? (
                                        <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
                                    ) : (
                                        <AlertCircle className="mx-auto text-yellow-500 mb-4" size={64} />
                                    )}
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{result.name}</h2>
                                    <p className="text-gray-600 dark:text-gray-300 mb-4">NISN: {result.nisn} | Kelas: {result.className}</p>
                                    <span className={`inline-block px-6 py-2 rounded-full text-lg font-bold ${result.status === 'LULUS'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-yellow-500 text-white'
                                        }`}>
                                        {result.status === 'LULUS' ? 'LULUS' : 'DITUNDA'}
                                    </span>
                                    {result.status === 'LULUS' && result.averageScore > 0 && (
                                        <p className="mt-4 text-gray-700 dark:text-gray-300">
                                            Nilai Rata-rata: <span className="font-bold text-primary dark:text-green-400">{result.averageScore.toFixed(1)}</span>
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 text-center">
                                    <AlertCircle className="mx-auto text-gray-400 mb-4" size={64} />
                                    <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Data Tidak Ditemukan</h3>
                                    <p className="text-gray-500 dark:text-gray-400">Tidak ada data kelulusan dengan NISN: {nisn}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default CekKelulusan;
