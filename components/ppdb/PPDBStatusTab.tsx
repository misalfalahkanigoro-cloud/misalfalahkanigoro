'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import type { PPDBStatusResponse } from '@/lib/types';

const PPDBStatusTab: React.FC = () => {
    const [nisn, setNisn] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<PPDBStatusResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCheck = async () => {
        setLoading(true);
        setError(null);
        setData(null);
        try {
            const response = await api.checkPPDBStatus(nisn.trim());
            setData(response as PPDBStatusResponse);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal mengecek status');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-10 space-y-6">
            <div>
                <h3 className="text-2xl font-semibold text-emerald-900 dark:text-white">Cek Status Pendaftaran</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Masukkan NISN untuk melihat status terbaru pendaftaran Anda.</p>
            </div>
            <div className="flex flex-col md:flex-row gap-3">
                <input
                    type="text"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                    placeholder="Masukkan NISN"
                />
                <button
                    onClick={handleCheck}
                    className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white"
                    disabled={loading || nisn.length === 0}
                >
                    {loading ? 'Memeriksa...' : 'Cek Status'}
                </button>
            </div>
            {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}
            {data && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 text-sm text-emerald-900/80 dark:border-white/10 dark:bg-white/5 dark:text-white">
                    <p><span className="font-semibold">Tanggal Daftar:</span> {data.tanggalDaftar}</p>
                    <p><span className="font-semibold">Status:</span> {data.status}</p>
                    {data.pesan && <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-200">{data.pesan}</p>}
                    <p className="mt-4 rounded-xl border border-emerald-200 bg-white/70 px-4 py-3 text-xs text-emerald-800 dark:border-white/10 dark:bg-white/10 dark:text-emerald-100">
                        {data.summaryMessage}
                    </p>
                </div>
            )}
        </div>
    );
};

export default PPDBStatusTab;
