'use client';

import React, { useEffect, useState } from 'react';
import SidebarAdmin from '@/components/sidebar-admin';
import { Plus, Save, Trash2, Image as ImageIcon } from 'lucide-react';
import CloudinaryButton from '@/components/admin/CloudinaryButton';
import MediaManager, { MediaForm } from '@/components/admin/MediaManager';

type AcademicPageForm = {
    id?: string | null;
    title: string;
    subtitle: string;
    content: string;
    isActive: boolean;
};

type AcademicSectionForm = {
    id?: string;
    title: string;
    body: string;
    displayOrder: number;
};

const DEFAULT_PAGE: AcademicPageForm = {
    id: null,
    title: '',
    subtitle: '',
    content: '',
    isActive: true,
};

const AdminAkademikPage: React.FC = () => {
    const [page, setPage] = useState<AcademicPageForm>(DEFAULT_PAGE);
    const [sections, setSections] = useState<AcademicSectionForm[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [coverUrl, setCoverUrl] = useState<string>('');
    const [mediaItems, setMediaItems] = useState<MediaForm[]>([]);
    const [mediaPreviewIndex, setMediaPreviewIndex] = useState(0);
    const [mediaMessage, setMediaMessage] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/academic-page');
            const data = await res.json();
            if (data?.page) {
                setPage({
                    id: data.page.id || null,
                    title: data.page.title || '',
                    subtitle: data.page.subtitle || '',
                    content: data.page.content || '',
                    isActive: data.page.isActive ?? true,
                });
            } else {
                setPage(DEFAULT_PAGE);
            }

            setSections(Array.isArray(data?.sections) ? data.sections : []);
            const cover = data?.coverUrl || '';
            setCoverUrl(cover);

            const mappedMedia = (Array.isArray(data?.media) ? data.media : [])
                .filter((item: any) => !item.isMain)
                .map((item: any, idx: number) => ({
                    id: item.id,
                    mediaType: item.mediaType || 'image',
                    url: item.mediaUrl || '',
                    embedHtml: item.mediaType === 'youtube_embed' ? (item.mediaUrl || '') : '',
                    caption: item.caption || '',
                    displayOrder: item.displayOrder || idx + 1,
                    isActive: true,
                }));
            setMediaItems(mappedMedia);
        } catch (error) {
            console.error('Failed to fetch academic page', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (mediaPreviewIndex >= mediaItems.length) {
            setMediaPreviewIndex(Math.max(0, mediaItems.length - 1));
        }
    }, [mediaItems.length, mediaPreviewIndex]);

    const savePage = async () => {
        setMessage(null);
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
                page,
                sections,
                media: mediaPayload,
                coverUrl: coverUrl || null,
            };

            const res = await fetch('/api/admin/academic-page', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                setMessage('Data akademik tersimpan.');
                fetchData();
            } else {
                const err = await res.json().catch(() => ({}));
                setMessage(err.error || 'Gagal menyimpan data akademik.');
            }
        } finally {
            setSaving(false);
        }
    };

    const addSection = () => {
        setSections([
            ...sections,
            {
                title: '',
                body: '',
                displayOrder: sections.length + 1,
            },
        ]);
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors dark:bg-[#0B0F0C] dark:text-gray-100">
            <SidebarAdmin />
            <main className="min-h-screen px-6 py-10 lg:pl-80 space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kelola Akademik</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Perbarui konten akademik dan media pendukung.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                            <h2 className="text-lg font-semibold mb-4">Ringkasan Halaman</h2>
                            {loading ? (
                                <p className="text-sm text-gray-500">Memuat data...</p>
                            ) : (
                                <div className="grid gap-4">
                                    <input
                                        value={page.title}
                                        onChange={(e) => setPage({ ...page, title: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                        placeholder="Judul Halaman"
                                    />
                                    <input
                                        value={page.subtitle}
                                        onChange={(e) => setPage({ ...page, subtitle: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                        placeholder="Subjudul"
                                    />
                                    <textarea
                                        value={page.content}
                                        onChange={(e) => setPage({ ...page, content: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                        rows={4}
                                        placeholder="Deskripsi singkat akademik..."
                                    />
                                </div>
                            )}
                        </div>

                        <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Bagian Akademik</h3>
                                <button type="button" onClick={addSection} className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 px-3 py-1 text-xs text-emerald-600">
                                    <Plus size={14} /> Tambah
                                </button>
                            </div>
                            <div className="space-y-4">
                                {sections.map((section, idx) => (
                                    <div key={section.id || idx} className="rounded-2xl border border-emerald-900/10 p-4 dark:border-white/10">
                                        <div className="grid gap-3 md:grid-cols-2">
                                            <input
                                                value={section.title}
                                                onChange={(e) => {
                                                    const next = [...sections];
                                                    next[idx] = { ...section, title: e.target.value };
                                                    setSections(next);
                                                }}
                                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                                placeholder="Judul Bagian"
                                            />
                                            <input
                                                type="number"
                                                value={section.displayOrder}
                                                onChange={(e) => {
                                                    const next = [...sections];
                                                    next[idx] = { ...section, displayOrder: Number(e.target.value) };
                                                    setSections(next);
                                                }}
                                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                                placeholder="Urutan"
                                            />
                                            <textarea
                                                value={section.body}
                                                onChange={(e) => {
                                                    const next = [...sections];
                                                    next[idx] = { ...section, body: e.target.value };
                                                    setSections(next);
                                                }}
                                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm md:col-span-2 dark:border-white/10 dark:bg-black/30"
                                                rows={3}
                                                placeholder="Deskripsi singkat"
                                            />
                                        </div>
                                        <div className="mt-3 flex items-center justify-end">
                                            <button
                                                onClick={() => setSections(sections.filter((_, i) => i !== idx))}
                                                className="rounded-lg border border-red-500 px-3 py-1 text-xs text-red-500"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {sections.length === 0 && (
                                    <div className="rounded-2xl border border-dashed border-emerald-900/10 p-6 text-sm text-gray-500 dark:border-white/10">
                                        Belum ada bagian akademik. Tambahkan untuk tampil di halaman publik.
                                    </div>
                                )}
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
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Status Halaman</label>
                                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/10 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                    <input
                                        type="checkbox"
                                        checked={page.isActive}
                                        onChange={(e) => setPage({ ...page, isActive: e.target.checked })}
                                        className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tampilkan di publik</span>
                                </label>
                            </div>

                            <hr className="border-gray-100 dark:border-white/10" />

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Cover Akademik</label>

                                {coverUrl ? (
                                    <div className="relative aspect-video rounded-xl overflow-hidden mb-3 group">
                                        <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => setCoverUrl('')}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow-lg"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="aspect-video rounded-xl bg-gray-50 dark:bg-white/5 border-2 border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center text-gray-400 mb-3">
                                        <ImageIcon size={32} className="mb-2" />
                                        <span className="text-xs">No cover image</span>
                                    </div>
                                )}

                                <CloudinaryButton
                                    folder="mis-al-falah/academic"
                                    label="Upload Cover"
                                    onUploaded={(url) => setCoverUrl(url)}
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
                                                    {'<'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setMediaPreviewIndex((prev) => (prev >= mediaItems.length - 1 ? 0 : prev + 1))}
                                                    className="h-8 w-8 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 dark:border-white/10 dark:text-gray-300"
                                                    title="Selanjutnya"
                                                >
                                                    {'>'}
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
                                onClick={savePage}
                                disabled={saving}
                                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                            >
                                {saving ? 'Menyimpan...' : <><Save size={18} /> Simpan Akademik</>}
                            </button>
                            {message && <p className="text-sm text-gray-500">{message}</p>}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminAkademikPage;
