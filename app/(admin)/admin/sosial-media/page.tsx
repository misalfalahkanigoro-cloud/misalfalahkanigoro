'use client';

import React, { useEffect, useState } from 'react';
import SidebarAdmin from '@/components/sidebar-admin';

type SocialItem = {
    platform: 'facebook' | 'instagram' | 'youtube' | 'twitter' | 'tiktok' | 'linkedin';
    url: string;
};

const DEFAULT_SOCIAL: SocialItem[] = [
    { platform: 'facebook', url: '' },
    { platform: 'instagram', url: '' },
    { platform: 'youtube', url: '' },
];

const SosialMediaPage: React.FC = () => {
    const [socialLinks, setSocialLinks] = useState<SocialItem[]>(DEFAULT_SOCIAL);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/admin/social-media-links');
                if (!res.ok) return;
                const data = await res.json();
                if (Array.isArray(data) && data.length) {
                    setSocialLinks(
                        data.map((item: any) => ({
                            platform: item.platform as SocialItem['platform'],
                            url: item.url || '',
                        }))
                    );
                }
            } catch (error) {
                console.error('Failed to load social media links', error);
            }
        };

        fetchData();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const res = await fetch('/api/admin/social-media-links', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: socialLinks }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Gagal menyimpan sosial media');
            }

            setMessage('Sosial media berhasil disimpan.');
        } catch (error) {
            console.error(error);
            setMessage('Gagal menyimpan sosial media.');
        } finally {
            setSaving(false);
        }
    };

    const addSocial = () => {
        setSocialLinks((prev) => [...prev, { platform: 'facebook', url: '' }]);
    };

    const updateSocial = (index: number, field: keyof SocialItem, value: string) => {
        setSocialLinks((prev) => prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)));
    };

    const removeSocial = (index: number) => {
        setSocialLinks((prev) => prev.filter((_, idx) => idx !== index));
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors dark:bg-[#0B0F0C] dark:text-gray-100">
            <SidebarAdmin />
            <main className="min-h-screen px-6 py-10 lg:pl-80 space-y-8">
                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-start justify-between gap-6 flex-wrap">
                        <div>
                            <h2 className="text-2xl font-semibold">Sosial Media</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Atur tautan sosial media untuk ditampilkan di header, footer, dan halaman kontak.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={addSocial}
                            className="rounded-xl border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-600"
                        >
                            + Tambah Sosial Media
                        </button>
                    </div>

                    <div className="mt-6 space-y-3">
                        {socialLinks.map((link, index) => (
                            <div key={index} className="flex flex-col gap-2 md:flex-row md:items-center">
                                <select
                                    value={link.platform}
                                    onChange={(e) => updateSocial(index, 'platform', e.target.value)}
                                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                >
                                    <option value="facebook">Facebook</option>
                                    <option value="instagram">Instagram</option>
                                    <option value="youtube">Youtube</option>
                                    <option value="twitter">Twitter</option>
                                    <option value="tiktok">TikTok</option>
                                    <option value="linkedin">LinkedIn</option>
                                </select>
                                <input
                                    value={link.url}
                                    onChange={(e) => updateSocial(index, 'url', e.target.value)}
                                    className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                    placeholder="https://..."
                                />
                                <button
                                    onClick={() => removeSocial(index)}
                                    className="rounded-lg border border-red-500 px-3 py-2 text-xs text-red-500"
                                >
                                    Hapus
                                </button>
                            </div>
                        ))}
                        {!socialLinks.length && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada sosial media.</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
                    >
                        {saving ? 'Menyimpan...' : 'Simpan Sosial Media'}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default SosialMediaPage;
