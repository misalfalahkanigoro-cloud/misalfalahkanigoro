'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Download as DownloadIcon, Calendar, File, FileSpreadsheet, FileCode } from 'lucide-react';
import { api } from '@/lib/api';
import type { Download } from '@/lib/types';

const Downloads: React.FC = () => {
    const [downloads, setDownloads] = useState<Download[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFiles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.getDownloads();
            let items: Download[] = [];
            if (Array.isArray(res)) {
                items = res;
            } else if ((res as any).items) {
                items = (res as any).items;
            }
            setDownloads(items);
        } catch (err) {
            console.error('Error fetching downloads:', err);
            setError('Gagal memuat data unduhan');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    const getFileIcon = (mimeType?: string | null) => {
        if (!mimeType) return <FileText className="text-gray-500" size={24} />;

        if (mimeType.includes('pdf')) return <FileText className="text-red-500" size={24} />;
        if (mimeType.includes('word') || mimeType.includes('document')) return <FileText className="text-blue-500" size={24} />;
        if (mimeType.includes('sheet') || mimeType.includes('excel')) return <FileSpreadsheet className="text-green-500" size={24} />;
        if (mimeType.includes('archive') || mimeType.includes('zip')) return <FileCode className="text-yellow-500" size={24} />;

        return <File className="text-gray-500" size={24} />;
    };

    const pickPrimaryFile = (d: Download) => d.files?.[0];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <section className="bg-gradient-to-r from-emerald-50 via-white to-emerald-50 dark:from-[#0B0F0C] dark:via-[#0F1511] dark:to-[#0B0F0C] border-b border-emerald-100/70 dark:border-white/10">
                <div className="container mx-auto px-4 py-8 md:py-10">
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-emerald-700/70 dark:text-emerald-200/70">
                        <span className="h-[2px] w-8 bg-emerald-500/70"></span>
                        Halaman
                    </div>
                    <h1 className="mt-3 text-2xl md:text-4xl font-bold text-emerald-950 dark:text-white">Download</h1>
                </div>
            </section>

            <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                <div className="container mx-auto px-4">
                    <div className="bg-white dark:bg-[#151B16] rounded-[2rem] shadow-xl shadow-emerald-900/5 p-6 md:p-10 border border-emerald-900/5 dark:border-white/5">
                        {/* Loading State */}
                        {loading && (
                            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-gray-400 text-sm font-medium">Menyiapkan berkas...</p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="text-center py-12 bg-red-50 dark:bg-red-900/10 rounded-3xl">
                                <p className="text-red-500 font-bold mb-2">{error}</p>
                                <button onClick={fetchFiles} className="text-sm underline text-red-400 hover:text-red-600">Coba lagi</button>
                            </div>
                        )}

                        {/* Files Grid */}
                        {!loading && !error && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {downloads.length === 0 ? (
                                    <div className="col-span-full text-center py-20 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[2rem]">
                                        <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FileText className="text-gray-300" size={32} />
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 font-bold">Tidak ada berkas untuk kategori ini.</p>
                                    </div>
                                ) : (
                                    downloads.map((item) => {
                                        const primary = pickPrimaryFile(item);
                                        const href = primary?.publicUrl || item.fileUrl || '#';
                                        const fileType = primary?.fileType || item.fileType;
                                        return (
                                            <div key={item.id} className="group bg-white dark:bg-white/5 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-emerald-900/10 border border-emerald-900/5 dark:border-white/5 overflow-hidden hover:-translate-y-1 transition-all duration-300">
                                                <div className="relative w-full aspect-[4/3] bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                                    {item.coverUrl ? (
                                                        <img src={item.coverUrl} alt="cover" className="absolute inset-0 w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="flex items-center justify-center">
                                                            {getFileIcon(fileType || undefined)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-6 space-y-4">
                                                    <h3 className="font-bold text-gray-900 dark:text-white leading-tight group-hover:text-emerald-600 transition-colors line-clamp-2" title={item.title}>
                                                        {item.title}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-3 text-[10px] sm:text-xs font-medium text-gray-400">
                                                        <span className="flex items-center gap-1 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-lg">
                                                            <Calendar size={12} />
                                                            {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <a
                                                        href={href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 group-hover:shadow-emerald-600/40 w-full justify-center"
                                                    >
                                                        <DownloadIcon size={14} /> Download
                                                    </a>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Downloads;
