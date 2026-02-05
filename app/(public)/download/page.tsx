'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Filter, Loader2 } from 'lucide-react';
import SimpleHero from '@/components/SimpleHero';
import { api } from '@/lib/api';
import type { DownloadFile } from '@/lib/types';

const CATEGORIES = ['Semua', 'Akademik', 'Administrasi', 'E-Book'];

const Downloads: React.FC = () => {
    const [filter, setFilter] = useState<string>('Semua');
    const [files, setFiles] = useState<DownloadFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFiles = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await api.getDownloads(filter === 'Semua' ? undefined : filter);
                setFiles(data as DownloadFile[]);
            } catch (err) {
                console.error('Error fetching downloads:', err);
                setError('Gagal memuat data unduhan');
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
    }, [filter]);

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'PDF': return <FileText className="text-red-500" size={24} />;
            case 'DOCX': return <FileText className="text-blue-500" size={24} />;
            case 'XLSX': return <FileText className="text-green-500" size={24} />;
            default: return <FileText className="text-gray-500" size={24} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <SimpleHero
                title="Download Area"
                subtitle="Pusat unduhan dokumen pendaftaran, kalender akademik, dan berkas sekolah lainnya."
                image="https://picsum.photos/id/119/1920/800"
            />

            <section className="py-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                <div className="container mx-auto px-4">
                    {/* Filter */}
                    <div className="flex flex-wrap items-center gap-3 mb-8">
                        <Filter size={20} className="text-gray-500 dark:text-gray-400" />
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${filter === cat
                                    ? 'bg-primary text-white shadow-md'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-primary" size={32} />
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="text-center py-12 text-red-500">
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Files Grid */}
                    {!loading && !error && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {files.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 col-span-full text-center py-8">Tidak ada berkas untuk kategori ini.</p>
                            ) : (
                                files.map((file) => (
                                    <div key={file.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700 flex items-start gap-4 hover:shadow-lg transition-shadow">
                                        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                                            {getFileIcon(file.fileType)}
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-bold text-gray-800 dark:text-white mb-1">{file.title}</h3>
                                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {new Date(file.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </span>
                                                <span>{file.size}</span>
                                                <span className="bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded text-xs">{file.fileType}</span>
                                            </div>
                                            <a
                                                href={file.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-primary dark:text-green-400 font-semibold text-sm hover:underline"
                                            >
                                                <Download size={16} /> Unduh
                                            </a>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Downloads;
