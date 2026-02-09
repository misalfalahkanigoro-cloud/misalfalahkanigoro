'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Trash2, Image as ImageIcon, Plus, X, Globe, User, Calendar } from 'lucide-react';
import SidebarAdmin from '@/components/sidebar-admin';
import TiptapEditor from '@/components/tiptap-editor';
import { api } from '@/lib/api';
import type { NewsPost, MediaItem } from '@/lib/types';
import CloudinaryButton from '@/components/admin/CloudinaryButton';
import MediaManager, { MediaForm } from '@/components/admin/MediaManager';

const AdminNewsEditPage: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const isNew = id === 'create';

    const [form, setForm] = useState<Partial<NewsPost>>({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        authorName: 'Admin', // Default
        publishedAt: new Date().toISOString().split('T')[0],
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
                    const res = await api.getNewsDetail(id);
                    if (res) {
                        setForm({
                            ...res,
                            publishedAt: new Date((res as NewsPost).publishedAt).toISOString().split('T')[0],
                        });
                        const mappedMedia = ((res as NewsPost).media || [])
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
                    console.error('Failed to fetch news:', error);
                    alert('Gagal memuat berita');
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        } else {
            // Try to get current user for author name
            const stored = localStorage.getItem('adminUser');
            if (stored) {
                const user = JSON.parse(stored);
                setForm(prev => ({ ...prev, authorName: user.fullName || user.username || 'Admin' }));
            }
        }
    }, [id, isNew]);

    useEffect(() => {
        if (mediaPreviewIndex >= mediaItems.length) {
            setMediaPreviewIndex(Math.max(0, mediaItems.length - 1));
        }
    }, [mediaItems.length, mediaPreviewIndex]);

    const handleSave = async () => {
        if (!form.title) return alert('Judul wajib diisi');
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
                publishedAt: new Date(form.publishedAt!).toISOString(),
                media: mediaPayload,
            };

            if (isNew) {
                await api.createNews(payload);
            } else {
                await api.updateNews(id, payload);
            }
            router.push('/admin/berita');
            router.refresh();
        } catch (error) {
            console.error('Failed to save news:', error);
            alert('Gagal menyimpan berita');
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

    // Auto-generate slug from title if new and slug empty
    useEffect(() => {
        if (isNew && form.title && !form.slug) {
            const slug = form.title.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
            setForm(prev => ({ ...prev, slug }));
        }
    }, [form.title, isNew]);

    const regenerateSlug = () => {
        if (!form.title) return;
        const slug = form.title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        setForm(prev => ({ ...prev, slug }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-[#0B0F0C] flex items-center justify-center">
                <p className="text-gray-500">Memuat data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors dark:bg-[#0B0F0C] dark:text-gray-100">
            <SidebarAdmin />
            <main className="min-h-screen px-6 py-10 lg:pl-80 space-y-8">
                {/* Header */}
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
                                {isNew ? 'Tulis Berita Baru' : 'Edit Berita'}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Kembali ke daftar berita</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Editor */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Judul Berita</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-emerald-500 focus:ring-0 transition font-bold text-lg"
                                    placeholder="Judul Berita yang Menarik..."
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Slug (URL)</label>
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
                                    placeholder="judul-berita-yang-menarik"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Ringkasan (Excerpt)</label>
                                <textarea
                                    value={form.excerpt || ''}
                                    onChange={e => setForm({ ...form, excerpt: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-emerald-500 focus:ring-0 transition h-24 resize-none"
                                    placeholder="Ringkasan singkat untuk ditampilkan di kartu..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Konten Lengkap</label>
                                <TiptapEditor
                                    content={form.content || ''}
                                    onChange={(content) => setForm({ ...form, content })}
                                    placeholder="Tulis konten berita di sini..."
                                    minHeight="500px"
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

                    {/* Sidebar Controls */}
                    <div className="space-y-6">
                        <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5 space-y-6">
                            {/* Publish Status */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Status Publikasi</label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/10 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition">
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
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pin ke Atas (Unggulan)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Date & Author */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tanggal Publish</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="date"
                                            value={form.publishedAt}
                                            onChange={e => setForm({ ...form, publishedAt: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-emerald-500 focus:ring-0 transition text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Penulis</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            value={form.authorName}
                                            onChange={e => setForm({ ...form, authorName: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-emerald-500 focus:ring-0 transition text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-100 dark:border-white/10" />

                            {/* Cover Image */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Cover Image</label>

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
                                        <ImageIcon size={32} className="mb-2" />
                                        <span className="text-xs">No cover image</span>
                                    </div>
                                )}

                                <CloudinaryButton
                                    folder="mis-al-falah/news"
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
                                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                            >
                                {saving ? 'Processing...' : <><Save size={18} /> Simpan Berita</>}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminNewsEditPage;
