'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Trash2, Trophy } from 'lucide-react';
import SidebarAdmin from '@/components/sidebar-admin';
import { api } from '@/lib/api';
import type { Achievement, AchievementLevel } from '@/lib/types';
import CloudinaryButton from '@/components/admin/CloudinaryButton';
import MediaManager, { MediaForm } from '@/components/admin/MediaManager';

const AdminAchievementEditPage: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const isNew = id === 'create';

    const [form, setForm] = useState<Partial<Achievement>>({
        title: '',
        slug: '',
        eventName: '',
        eventLevel: 'sekolah',
        rank: '',
        description: '',
        achievedAt: new Date().toISOString().split('T')[0],
        isPublished: true,
        isPinned: false,
        coverUrl: '',
        media: [],
    });

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [mediaItems, setMediaItems] = useState<MediaForm[]>([]);
    const [mediaPreviewIndex, setMediaPreviewIndex] = useState(0);
    const [mediaMessage, setMediaMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!isNew && id) {
            const fetchData = async () => {
                try {
                    const res = await api.getAchievementDetail(id);
                    if (res) {
                        setForm({
                            ...res,
                            achievedAt: new Date((res as Achievement).achievedAt).toISOString().split('T')[0],
                        });
                        const mappedMedia = ((res as Achievement).media || [])
                            .filter((m) => !m.isMain)
                            .map((m, idx) => ({
                                id: m.id,
                                mediaType: (m.mediaType as any) || 'image',
                                url: m.mediaUrl || '',
                                embedHtml: '',
                                caption: m.caption || '',
                                displayOrder: m.displayOrder || idx + 1,
                                isActive: true,
                            }));
                        setMediaItems(mappedMedia);
                    }
                } catch (error) {
                    console.error('Failed to fetch achievement:', error);
                    alert('Gagal memuat prestasi');
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [id, isNew]);

    useEffect(() => {
        if (mediaPreviewIndex >= mediaItems.length) {
            setMediaPreviewIndex(Math.max(0, mediaItems.length - 1));
        }
    }, [mediaItems.length, mediaPreviewIndex]);

    const handleSave = async () => {
        if (!form.title) return alert('Nama prestasi wajib diisi');
        setSaving(true);
        try {
            const mediaPayload = mediaItems
                .map((m, idx) => ({
                    mediaType: m.mediaType,
                    mediaUrl: m.mediaType === 'youtube_embed' ? (m.embedHtml || m.url) : m.url,
                    caption: m.caption || '',
                    displayOrder: m.displayOrder || idx + 1,
                }))
                .filter((m) => m.mediaUrl);

            const payload = {
                ...form,
                achievedAt: new Date(form.achievedAt!).toISOString(),
                media: mediaPayload,
            };

            if (isNew) {
                await api.createAchievement(payload as any);
            } else {
                await api.updateAchievement(id, payload as any);
            }
            router.push('/admin/prestasi');
            router.refresh();
        } catch (error) {
            console.error('Failed to save achievement:', error);
            alert('Gagal menyimpan prestasi');
        } finally {
            setSaving(false);
        }
    };

    const handleCoverUpload = (url: string) => {
        setForm(prev => ({
            ...prev,
            coverUrl: url
        }));
    };

    const regenerateSlug = () => {
        if (!form.title) return;
        const slug = form.title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        setForm(prev => ({ ...prev, slug }));
    };

    useEffect(() => {
        if (isNew && form.title && !form.slug) {
            const slug = form.title.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
            setForm(prev => ({ ...prev, slug }));
        }
    }, [form.title, isNew]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-[#0B0F0C] flex items-center justify-center">
                <p className="text-gray-500">Memuat data...</p>
            </div>
        );
    }

    const levels: { value: AchievementLevel, label: string }[] = [
        { value: 'sekolah', label: 'Tingkat Sekolah' },
        { value: 'kecamatan', label: 'Tingkat Kecamatan' },
        { value: 'kabupaten', label: 'Tingkat Kabupaten' },
        { value: 'provinsi', label: 'Tingkat Provinsi' },
        { value: 'nasional', label: 'Tingkat Nasional' },
        { value: 'internasional', label: 'Tingkat Internasional' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors dark:bg-[#0B0F0C] dark:text-gray-100">
            <SidebarAdmin />
            <main className="min-h-screen px-6 py-10 lg:pl-80 space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-400 hover:text-emerald-600 transition shadow-sm"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {isNew ? 'Tambah Prestasi Baru' : 'Edit Prestasi'}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Kelola detail pencapaian siswa</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nama Prestasi / Juara</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-emerald-500 focus:ring-0 transition font-bold text-lg"
                                    placeholder="Contoh: Juara 1 Lomba Pidato"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tingkat</label>
                                    <select
                                        value={form.eventLevel || 'sekolah'}
                                        onChange={e => setForm({ ...form, eventLevel: e.target.value as AchievementLevel })}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-emerald-500 focus:ring-0 transition"
                                    >
                                        {levels.map(l => (
                                            <option key={l.value} value={l.value}>{l.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Peringkat (Opsional)</label>
                                    <input
                                        type="text"
                                        value={form.rank || ''}
                                        onChange={e => setForm({ ...form, rank: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-emerald-500 focus:ring-0 transition"
                                        placeholder="Contoh: Juara 1, Harapan 2, Gold Medal"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nama Event / Kegiatan</label>
                                <input
                                    type="text"
                                    value={form.eventName || ''}
                                    onChange={e => setForm({ ...form, eventName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-emerald-500 focus:ring-0 transition"
                                    placeholder="Contoh: FLS2N Tingkat Kabupaten 2024"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Slug</label>
                                    <button
                                        type="button"
                                        onClick={regenerateSlug}
                                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                                    >
                                        Generate
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={form.slug}
                                    onChange={e => setForm({ ...form, slug: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-emerald-500 focus:ring-0 transition text-sm font-mono text-gray-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Deskripsi / Cerita</label>
                                <textarea
                                    value={form.description || ''}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-emerald-500 focus:ring-0 transition h-32 resize-none"
                                    placeholder="Ceritakan sedikit tentang pencapaian ini..."
                                />
                            </div>
                        </div>

                        <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                            <MediaManager
                                items={mediaItems}
                                onChange={setMediaItems}
                                onMessage={(message) => setMediaMessage(message)}
                            />
                            {mediaMessage && (
                                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {mediaMessage}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Opsi Tampilan</label>
                                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/10 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition mb-2">
                                    <input
                                        type="checkbox"
                                        checked={form.isPublished}
                                        onChange={e => setForm({ ...form, isPublished: e.target.checked })}
                                        className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Publikasikan</span>
                                </label>
                                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/10 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                    <input
                                        type="checkbox"
                                        checked={form.isPinned}
                                        onChange={e => setForm({ ...form, isPinned: e.target.checked })}
                                        className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Highlight di Beranda</span>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tanggal Dicapai</label>
                                <input
                                    type="date"
                                    value={form.achievedAt}
                                    onChange={e => setForm({ ...form, achievedAt: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-emerald-500 focus:ring-0 transition"
                                />
                            </div>

                            <hr className="border-gray-100 dark:border-white/10" />

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Cover Prestasi</label>

                                {form.coverUrl ? (
                                    <div className="relative aspect-video rounded-xl overflow-hidden mb-3 group">
                                        <img src={form.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => setForm({ ...form, coverUrl: '' })}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow-lg"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="aspect-video rounded-xl bg-gray-50 dark:bg-white/5 border-2 border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center text-gray-400 mb-3">
                                        <Trophy size={28} className="mb-2" />
                                        <span className="text-xs">Belum ada cover</span>
                                    </div>
                                )}

                                <CloudinaryButton
                                    folder="mis-al-falah/achievements"
                                    label={uploading ? 'Uploading...' : 'Upload Cover'}
                                    onUploaded={handleCoverUpload}
                                    className={uploading ? 'opacity-50 cursor-not-allowed' : ''}
                                    disabled={uploading}
                                />

                                {mediaItems.length > 0 && (
                                    <div className="mt-6 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Daftar Media</p>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setMediaPreviewIndex((prev) => (prev <= 0 ? mediaItems.length - 1 : prev - 1))}
                                                    className="h-8 w-8 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 dark:border-white/10 dark:text-gray-300"
                                                    title="Sebelumnya"
                                                >
                                                    ‹
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setMediaPreviewIndex((prev) => (prev >= mediaItems.length - 1 ? 0 : prev + 1))}
                                                    className="h-8 w-8 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 dark:border-white/10 dark:text-gray-300"
                                                    title="Selanjutnya"
                                                >
                                                    ›
                                                </button>
                                            </div>
                                        </div>

                                        <div className="rounded-xl overflow-hidden bg-white dark:bg-black/20 border border-gray-100 dark:border-white/10">
                                            {(() => {
                                                const item = mediaItems[mediaPreviewIndex];
                                                if (!item) return null;
                                                if (item.mediaType === 'youtube_embed') {
                                                    if (item.embedHtml?.includes('<iframe')) {
                                                        return (
                                                            <div
                                                                className="aspect-video [&_iframe]:h-full [&_iframe]:w-full"
                                                                dangerouslySetInnerHTML={{ __html: item.embedHtml }}
                                                            />
                                                        );
                                                    }
                                                    return (
                                                        <iframe
                                                            src={item.embedHtml || item.url}
                                                            className="w-full aspect-video"
                                                            allowFullScreen
                                                        />
                                                    );
                                                }
                                                if (item.mediaType === 'video') {
                                                    return (
                                                        <video controls className="w-full aspect-video bg-black">
                                                            <source src={item.url} />
                                                        </video>
                                                    );
                                                }
                                                return (
                                                    <img
                                                        src={item.url || 'https://picsum.photos/800/450'}
                                                        alt={item.caption || 'Media preview'}
                                                        className="w-full aspect-video object-cover"
                                                    />
                                                );
                                            })()}
                                        </div>
                                        <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                            <span>{mediaItems[mediaPreviewIndex]?.caption || 'Tanpa keterangan'}</span>
                                            <span>{mediaPreviewIndex + 1} / {mediaItems.length}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        <Save size={18} /> Simpan Data
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminAchievementEditPage;
