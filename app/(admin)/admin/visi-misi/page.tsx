'use client';

import React, { useEffect, useState } from 'react';
import SidebarAdmin from '@/components/sidebar-admin';

type VisionMissionPayload = {
    id?: string;
    visionText?: string;
    missionText?: string;
    isActive?: boolean;
};

const VisiMisiAdminPage: React.FC = () => {
    const [id, setId] = useState<string | null>(null);
    const [visionText, setVisionText] = useState('');
    const [missionText, setMissionText] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/admin/vision-mission');
                if (!res.ok) return;
                const data = (await res.json()) as VisionMissionPayload | null;
                if (!data) return;

                setId(data.id || null);
                setVisionText(data.visionText || '');
                setMissionText(data.missionText || '');
                setIsActive(data.isActive ?? true);
            } catch (error) {
                console.error('Failed to load vision mission data', error);
            }
        };

        fetchData();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const payload = {
                id,
                visionText,
                missionText,
                isActive,
            };

            const res = await fetch('/api/admin/vision-mission', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Gagal menyimpan visi dan misi');
            }

            const data = (await res.json()) as VisionMissionPayload;
            if (data?.id) setId(data.id);
            setMessage('Visi dan misi berhasil disimpan.');
        } catch (error) {
            console.error(error);
            setMessage('Gagal menyimpan visi dan misi.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors dark:bg-[#0B0F0C] dark:text-gray-100">
            <SidebarAdmin />
            <main className="min-h-screen px-6 py-10 lg:pl-80 space-y-8">
                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5 space-y-6">
                    <div className="flex items-start justify-between gap-6 flex-wrap">
                        <div>
                            <h2 className="text-2xl font-semibold">Visi &amp; Misi Madrasah</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Kelola teks visi dan misi yang tampil di halaman publik.
                            </p>
                        </div>
                        <label className="flex items-center gap-2 text-sm font-medium">
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className="h-4 w-4"
                            />
                            Aktif
                        </label>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="space-y-3">
                            <label className="text-sm font-semibold">Visi</label>
                            <textarea
                                value={visionText}
                                onChange={(e) => setVisionText(e.target.value)}
                                rows={6}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                                placeholder="Tuliskan visi madrasah..."
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-semibold">Misi</label>
                            <textarea
                                value={missionText}
                                onChange={(e) => setMissionText(e.target.value)}
                                rows={8}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                                placeholder="Tuliskan misi madrasah, pisahkan tiap poin dengan baris baru..."
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Tips: pisahkan tiap misi dengan baris baru agar tampil sebagai poin.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
                    >
                        {saving ? 'Menyimpan...' : 'Simpan Visi & Misi'}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default VisiMisiAdminPage;
