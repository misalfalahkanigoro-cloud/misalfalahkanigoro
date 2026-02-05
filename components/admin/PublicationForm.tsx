'use client';

import React, { useState, useEffect } from 'react';
import { Save, Trash2, Sparkles, AlertCircle, CheckCircle2, ChevronLeft, ExternalLink, RefreshCcw } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import MediaManager, { MediaForm } from './MediaManager';
import { api } from '@/lib/api';
import type { ContentPost, ContentType } from '@/lib/types';

interface PublicationFormProps {
    post: ContentPost | null;
    onSaveSuccess: (id: number) => void;
    onDeleteSuccess: () => void;
    onCancel: () => void;
}

const TYPE_OPTIONS: { label: string; value: ContentType }[] = [
    { label: 'Berita', value: 'news' },
    { label: 'Pengumuman', value: 'announcement' },
    { label: 'Artikel', value: 'article' },
    { label: 'Galeri', value: 'gallery' },
    { label: 'Unduhan', value: 'download' },
];

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

const formatDateForInput = (value?: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 16);
};

const PublicationForm: React.FC<PublicationFormProps> = ({
    post,
    onSaveSuccess,
    onDeleteSuccess,
    onCancel,
}) => {
    const [formData, setFormData] = useState<Partial<ContentPost>>({
        type: 'news',
        title: '',
        slug: '',
        excerpt: '',
        contentHtml: '',
        contentText: '',
        coverUrl: '',
        category: '',
        publishedAt: formatDateForInput(new Date().toISOString()),
        isPublished: true,
        isPinned: false,
        meta: {},
    });
    const [mediaItems, setMediaItems] = useState<MediaForm[]>([]);
    const [saving, setSaving] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; content: string } | null>(null);

    useEffect(() => {
        if (post) {
            setFormData({
                ...post,
                publishedAt: formatDateForInput(post.publishedAt || post.createdAt || null),
            });
            setMediaItems(post.media?.map(m => ({
                id: m.id,
                mediaType: m.mediaType,
                url: m.url || '',
                embedHtml: m.embedHtml || '',
                caption: m.caption || '',
                displayOrder: m.displayOrder,
                isActive: m.isActive
            })) || []);
        } else {
            setFormData({
                type: 'news',
                title: '',
                slug: '',
                excerpt: '',
                contentHtml: '',
                contentText: '',
                coverUrl: '',
                category: '',
                publishedAt: formatDateForInput(new Date().toISOString()),
                isPublished: true,
                isPinned: false,
                meta: {},
            });
            setMediaItems([]);
        }
        setMessage(null);
    }, [post]);

    const handleChange = (field: keyof ContentPost, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAutoSlug = () => {
        if (formData.title) {
            handleChange('slug', slugify(formData.title));
        }
    };

    const handleUploadCover = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setMessage({ type: 'error', content: 'Thumbnail harus berupa gambar.' });
            return;
        }

        setUploadingCover(true);
        try {
            const result = await api.upload.media(file, 'mis-al-falah/publikasi/cover');
            if (result?.url) {
                handleChange('coverUrl', result.url);
            }
        } catch (error) {
            setMessage({ type: 'error', content: 'Gagal upload thumbnail.' });
        } finally {
            setUploadingCover(false);
        }
    };

    const handleSave = async () => {
        if (!formData.title || !formData.slug) {
            setMessage({ type: 'error', content: 'Judul dan Slug wajib diisi.' });
            return;
        }

        setSaving(true);
        setMessage(null);
        try {
            const payload = {
                post: {
                    ...formData,
                    publishedAt: formData.publishedAt ? new Date(formData.publishedAt).toISOString() : null,
                },
                media: mediaItems,
            };

            const method = formData.id ? 'PUT' : 'POST';
            const res = await fetch('/api/admin/content-posts', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Gagal menyimpan publikasi');
            }

            const result = await res.json();
            setMessage({ type: 'success', content: 'Publikasi berhasil disimpan.' });
            setTimeout(() => {
                onSaveSuccess(result.post.id);
            }, 500);
        } catch (error: any) {
            setMessage({ type: 'error', content: error.message || 'Gagal menyimpan publikasi.' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!formData.id) return;
        if (!confirm('Yakin ingin menghapus publikasi ini?')) return;

        try {
            const res = await fetch(`/api/admin/content-posts/${formData.id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                throw new Error('Gagal menghapus publikasi');
            }

            onDeleteSuccess();
        } catch (error: any) {
            setMessage({ type: 'error', content: error.message });
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-white/5 border border-emerald-900/20 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10 sticky top-0 bg-white/80 dark:bg-black/60 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onCancel}
                        className="lg:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                            {formData.id ? 'Edit Publikasi' : 'Publikasi Baru'}
                        </h2>
                        {formData.id && (
                            <div className="flex items-center gap-2">
                                <a
                                    href={`/publikasi/${formData.slug}`}
                                    target="_blank"
                                    className="text-[10px] text-emerald-600 hover:underline flex items-center gap-1"
                                >
                                    Lihat di Website <ExternalLink size={10} />
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {formData.id && (
                        <button
                            onClick={handleDelete}
                            className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                            title="Hapus"
                        >
                            <Trash2 size={20} />
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition shadow-lg ${saving
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                            }`}
                    >
                        {saving ? (
                            <>
                                <RefreshCcw size={18} className="animate-spin" /> Menyimpan...
                            </>
                        ) : (
                            <>
                                <Save size={18} /> Simpan
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                {message && (
                    <div className={`p-4 rounded-2xl flex items-start gap-3 ${message.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                        : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                        {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <p className="text-sm font-medium">{message.content}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <section className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tipe Konten</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => handleChange('type', e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm dark:border-white/10 dark:bg-black/30 transition focus:ring-2 focus:ring-emerald-500"
                                    >
                                        {TYPE_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Kategori</label>
                                    <input
                                        type="text"
                                        value={formData.category || ''}
                                        onChange={(e) => handleChange('category', e.target.value)}
                                        placeholder="Contoh: Kegiatan, Prestasi..."
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm dark:border-white/10 dark:bg-black/30 transition focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Judul Publikasi</label>
                                <input
                                    type="text"
                                    value={formData.title || ''}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                    placeholder="Masukkan judul yang menarik..."
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-base font-bold dark:border-white/10 dark:bg-black/30 transition focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                                        Slug (URL)
                                        <button
                                            onClick={handleAutoSlug}
                                            className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-[10px]"
                                        >
                                            <Sparkles size={10} /> Otomatis
                                        </button>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.slug || ''}
                                        onChange={(e) => handleChange('slug', e.target.value)}
                                        placeholder="judul-publikasi-anda"
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm dark:border-white/10 dark:bg-black/30 transition focus:ring-2 focus:ring-emerald-500 font-mono"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tanggal Publish</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.publishedAt || ''}
                                        onChange={(e) => handleChange('publishedAt', e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm dark:border-white/10 dark:bg-black/30 transition focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ringkasan Pendek</label>
                            <textarea
                                value={formData.excerpt || ''}
                                onChange={(e) => handleChange('excerpt', e.target.value)}
                                rows={2}
                                placeholder="Tulis ringkasan singkat untuk tampilan daftar..."
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm dark:border-white/10 dark:bg-black/30 transition focus:ring-2 focus:ring-emerald-500"
                            />
                        </section>

                        <section className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Konten Lengkap</label>
                            <RichTextEditor
                                content={formData.contentHtml || ''}
                                onChange={(html, text) => {
                                    handleChange('contentHtml', html);
                                    handleChange('contentText', text);
                                }}
                                onMessage={(msg) => setMessage({ type: 'error', content: msg })}
                            />
                        </section>

                        <section className="pt-4 border-t border-gray-100 dark:border-white/10">
                            <MediaManager
                                items={mediaItems}
                                onChange={setMediaItems}
                                onMessage={(msg) => setMessage({ type: 'error', content: msg })}
                            />
                        </section>
                    </div>

                    <aside className="space-y-6">
                        <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50 dark:border-white/10 dark:bg-white/5 space-y-4">
                            <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <AlertCircle size={16} /> Pengaturan
                            </h3>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={formData.isPublished}
                                        onChange={(e) => handleChange('isPublished', e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-10 h-5 rounded-full transition ${formData.isPublished ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${formData.isPublished ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                </div>
                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Publikasikan ke Website</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group pt-2 border-t border-gray-100 dark:border-white/5">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={formData.isPinned}
                                        onChange={(e) => handleChange('isPinned', e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-10 h-5 rounded-full transition ${formData.isPinned ? 'bg-amber-500' : 'bg-gray-300'}`}></div>
                                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${formData.isPinned ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                </div>
                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Sematkan (Pin) di Atas</span>
                            </label>
                        </div>

                        <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50 dark:border-white/10 dark:bg-white/5 space-y-4">
                            <h3 className="text-sm font-bold text-gray-800 dark:text-white">Thumbnail / Cover</h3>
                            <div className="space-y-3">
                                {formData.coverUrl ? (
                                    <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-emerald-500/20 group">
                                        <img src={formData.coverUrl} className="w-full h-full object-cover" alt="Cover" />
                                        <button
                                            onClick={() => handleChange('coverUrl', '')}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow-lg"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="aspect-video rounded-xl border-2 border-dashed border-gray-300 dark:border-white/10 flex flex-col items-center justify-center text-gray-400 bg-white dark:bg-black/20">
                                        <AlertCircle size={32} strokeWidth={1} />
                                        <p className="text-[10px] mt-2 font-medium">Belum ada thumbnail</p>
                                    </div>
                                )}
                                <label className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 font-bold text-xs transition cursor-pointer ${uploadingCover
                                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10'
                                    }`}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        disabled={uploadingCover}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleUploadCover(file);
                                        }}
                                    />
                                    {uploadingCover ? (
                                        <RefreshCcw size={14} className="animate-spin" />
                                    ) : (
                                        <Sparkles size={14} />
                                    )}
                                    {uploadingCover ? 'Mengunggah...' : 'Upload Thumbnail'}
                                </label>
                                <input
                                    type="text"
                                    value={formData.coverUrl || ''}
                                    onChange={(e) => handleChange('coverUrl', e.target.value)}
                                    placeholder="Atau tempel URL gambar..."
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[10px] dark:border-white/10 dark:bg-black/30 transition focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50 dark:border-white/10 dark:bg-white/5 space-y-4">
                            <h3 className="text-sm font-bold text-gray-800 dark:text-white">Informasi Tambahan</h3>
                            <p className="text-[10px] text-gray-400">
                                Dibuat: {formData.createdAt ? new Date(formData.createdAt).toLocaleString('id-ID') : '-'}<br />
                                Terakhir Update: {formData.updatedAt ? new Date(formData.updatedAt).toLocaleString('id-ID') : '-'}
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default PublicationForm;
