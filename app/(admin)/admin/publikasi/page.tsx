'use client';

import React, { useEffect, useMemo, useState } from 'react';
import SidebarAdmin from '@/components/sidebar-admin';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import {
    Bold,
    Italic,
    Heading2,
    List,
    ListOrdered,
    Quote,
    Undo2,
    Redo2,
    Link2,
    Unlink2,
    ImagePlus,
    Plus,
    Trash2,
    Save,
    Sparkles,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { ContentMediaType, ContentPost, ContentType } from '@/lib/types';

type ContentForm = {
    id?: number;
    type: ContentType;
    title: string;
    slug: string;
    excerpt: string;
    coverUrl: string;
    category: string;
    publishedAt: string;
    isPublished: boolean;
    meta: string;
};

type MediaForm = {
    id?: number;
    mediaType: ContentMediaType;
    url: string;
    embedHtml: string;
    caption: string;
    displayOrder: number;
    isActive: boolean;
};

const TYPE_OPTIONS: Array<{ label: string; value: ContentType }> = [
    { label: 'Berita', value: 'news' },
    { label: 'Pengumuman', value: 'announcement' },
    { label: 'Artikel', value: 'article' },
    { label: 'Galeri', value: 'gallery' },
    { label: 'Unduhan', value: 'download' },
];

const MEDIA_OPTIONS: Array<{ label: string; value: ContentMediaType }> = [
    { label: 'Gambar', value: 'image' },
    { label: 'File', value: 'file' },
    { label: 'Embed', value: 'embed' },
];

const emptyForm: ContentForm = {
    type: 'news',
    title: '',
    slug: '',
    excerpt: '',
    coverUrl: '',
    category: '',
    publishedAt: '',
    isPublished: true,
    meta: '',
};

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

const PublikasiAdminPage: React.FC = () => {
    const [posts, setPosts] = useState<ContentPost[]>([]);
    const [filterType, setFilterType] = useState<ContentType | 'all'>('all');
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [form, setForm] = useState<ContentForm>(emptyForm);
    const [mediaItems, setMediaItems] = useState<MediaForm[]>([]);
    const [initialContent, setInitialContent] = useState<string | object>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [uploadingMediaIndex, setUploadingMediaIndex] = useState<number | null>(null);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Image,
            Link.configure({ openOnClick: false }),
        ],
        content: '',
    });

    const fetchPosts = async (type?: ContentType | 'all') => {
        setLoading(true);
        try {
            const qs = type && type !== 'all' ? `?type=${type}` : '';
            const res = await fetch(`/api/admin/content-posts${qs}`);
            const data = await res.json();
            setPosts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load content posts', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts(filterType);
    }, [filterType]);

    useEffect(() => {
        if (editor) {
            editor.commands.setContent(initialContent || '');
        }
    }, [editor, initialContent]);

    const loadDetail = async (id: number) => {
        setMessage(null);
        try {
            const res = await fetch(`/api/admin/content-posts/${id}`);
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                setMessage(err?.error || 'Gagal memuat detail publikasi.');
                return;
            }
            const data = await res.json();
            const post = data.post as ContentPost;
            const media = (data.media || []) as any[];

            setSelectedId(post.id);
            setForm({
                id: post.id,
                type: post.type,
                title: post.title || '',
                slug: post.slug || '',
                excerpt: post.excerpt || '',
                coverUrl: post.coverUrl || '',
                category: post.category || '',
                publishedAt: formatDateForInput(post.publishedAt || null),
                isPublished: post.isPublished ?? true,
                meta: post.meta ? JSON.stringify(post.meta, null, 2) : '',
            });
            setInitialContent(post.contentHtml || post.contentText || '');
            setMediaItems(
                media.map((item) => ({
                    id: item.id,
                    mediaType: item.mediaType,
                    url: item.url || '',
                    embedHtml: item.embedHtml || '',
                    caption: item.caption || '',
                    displayOrder: Number(item.displayOrder) || 0,
                    isActive: item.isActive ?? true,
                }))
            );
        } catch (error) {
            console.error('Failed to load content detail', error);
            setMessage(error instanceof Error ? error.message : 'Gagal memuat detail publikasi.');
        }
    };

    const resetForm = () => {
        setSelectedId(null);
        setForm(emptyForm);
        setMediaItems([]);
        setInitialContent('');
        setMessage(null);
    };

    const handleSave = async () => {
        if (!editor) return;
        setSaving(true);
        setMessage(null);
        try {
            let metaValue: any = null;
            if (form.meta.trim()) {
                metaValue = JSON.parse(form.meta);
            }

            const payload = {
                post: {
                    id: form.id,
                    type: form.type,
                    title: form.title,
                    slug: form.slug,
                    excerpt: form.excerpt,
                    contentHtml: editor.getHTML(),
                    contentText: editor.getText(),
                    coverUrl: form.coverUrl,
                    category: form.category,
                    publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
                    isPublished: form.isPublished,
                    meta: metaValue,
                },
                media: mediaItems.map((item, index) => ({
                    id: item.id,
                    mediaType: item.mediaType,
                    url: item.url,
                    embedHtml: item.embedHtml,
                    caption: item.caption,
                    displayOrder: Number(item.displayOrder) || index + 1,
                    isActive: item.isActive,
                })),
            };

            const method = form.id ? 'PUT' : 'POST';
            const res = await fetch('/api/admin/content-posts', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Gagal menyimpan publikasi');
            }

            const data = await res.json();
            const savedId = data?.post?.id ?? form.id;
            setMessage('Publikasi berhasil disimpan.');
            await fetchPosts(filterType);
            if (savedId) {
                await loadDetail(savedId);
            }
        } catch (error) {
            console.error(error);
            setMessage(error instanceof Error ? error.message : 'Gagal menyimpan publikasi.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id?: number | null) => {
        const targetId = id ?? selectedId;
        if (!targetId) return;
        const confirmDelete = window.confirm('Hapus publikasi ini?');
        if (!confirmDelete) return;
        try {
            const res = await fetch(`/api/admin/content-posts/${targetId}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Gagal menghapus publikasi');
            }
            setMessage('Publikasi berhasil dihapus.');
            if (targetId === selectedId) {
                resetForm();
            }
            await fetchPosts(filterType);
        } catch (error) {
            console.error(error);
            setMessage(error instanceof Error ? error.message : 'Gagal menghapus publikasi.');
        }
    };

    const addMedia = () => {
        setMediaItems((prev) => [
            ...prev,
            {
                mediaType: 'image',
                url: '',
                embedHtml: '',
                caption: '',
                displayOrder: prev.length + 1,
                isActive: true,
            },
        ]);
    };

    const updateMedia = (index: number, field: keyof MediaForm, value: string | number | boolean) => {
        setMediaItems((prev) =>
            prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
        );
    };

    const updateMediaType = (index: number, value: ContentMediaType) => {
        setMediaItems((prev) =>
            prev.map((item, idx) =>
                idx === index
                    ? {
                          ...item,
                          mediaType: value,
                          url: value === 'embed' ? '' : item.url,
                          embedHtml: value === 'embed' ? item.embedHtml : '',
                      }
                    : item
            )
        );
    };

    const uploadCover = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setMessage('Thumbnail harus berupa gambar.');
            return;
        }

        setUploadingCover(true);
        setMessage(null);
        try {
            const result = await api.upload.media(file, 'mis-al-falah/publikasi/cover');
            if (result?.url) {
                setForm((prev) => ({ ...prev, coverUrl: result.url }));
            }
        } catch (error) {
            console.error('Cover upload failed', error);
            setMessage('Gagal upload thumbnail.');
        } finally {
            setUploadingCover(false);
        }
    };

    const uploadMediaFile = async (index: number, file: File) => {
        const item = mediaItems[index];
        if (!item) return;

        setUploadingMediaIndex(index);
        setMessage(null);

        try {
            if (item.mediaType === 'image') {
                if (!file.type.startsWith('image/')) {
                    throw new Error('File harus berupa gambar.');
                }
                const result = await api.upload.media(file, 'mis-al-falah/publikasi/media');
                if (result?.url) {
                    updateMedia(index, 'url', result.url);
                }
            } else if (item.mediaType === 'file') {
                const result = await api.upload.file(file, 'downloads');
                if (result?.url) {
                    updateMedia(index, 'url', result.url);
                }
            }
        } catch (error) {
            console.error('Media upload failed', error);
            setMessage(error instanceof Error ? error.message : 'Gagal upload media.');
        } finally {
            setUploadingMediaIndex(null);
        }
    };

    const insertImage = async (file: File) => {
        if (!editor) return;
        if (!file.type.startsWith('image/')) {
            setMessage('Gambar editor harus berupa file image.');
            return;
        }

        try {
            const result = await api.upload.media(file, 'mis-al-falah/publikasi/content');
            if (result?.url) {
                editor.chain().focus().setImage({ src: result.url }).run();
            }
        } catch (error) {
            console.error('Editor image upload failed', error);
            setMessage('Gagal upload gambar ke editor.');
        }
    };

    const toolbarButton = (active: boolean) =>
        `flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
            active
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-700 hover:bg-emerald-50 dark:bg-white/10 dark:text-gray-200'
        }`;

    const removeMedia = (index: number) => {
        setMediaItems((prev) => prev.filter((_, idx) => idx !== index));
    };

    const filteredPosts = useMemo(() => posts, [posts]);

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors dark:bg-[#0B0F0C] dark:text-gray-100">
            <SidebarAdmin />
            <main className="min-h-screen px-6 py-10 lg:pl-80 space-y-8">
                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold">Publikasi</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Kelola berita, pengumuman, artikel, galeri, dan unduhan.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as ContentType | 'all')}
                                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 dark:border-white/10 dark:bg-black/30 dark:text-gray-200"
                            >
                                <option value="all">Semua</option>
                                {TYPE_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 px-4 py-2 text-sm text-emerald-600"
                            >
                                <Plus size={16} /> Publikasi Baru
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
                    <div className="rounded-3xl border border-emerald-900/20 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                        <h3 className="text-lg font-semibold mb-4">Daftar Publikasi</h3>
                        {loading ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Memuat...</p>
                        ) : (
                            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                                {filteredPosts.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`rounded-xl border px-4 py-3 transition ${selectedId === item.id
                                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                                                : 'border-gray-200 hover:border-emerald-300 dark:border-white/10'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <button
                                                type="button"
                                                onClick={() => loadDetail(item.id)}
                                                className="flex-1 text-left"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-semibold">{item.title}</span>
                                                    <span className="text-[11px] text-gray-500 dark:text-gray-400">{item.type}</span>
                                                </div>
                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                                    {item.excerpt || item.contentText || 'Tanpa ringkasan'}
                                                </p>
                                            </button>
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => loadDetail(item.id)}
                                                    className="text-xs rounded-lg border border-emerald-500 px-2 py-1 text-emerald-600"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(item.id)}
                                                    className="text-xs rounded-lg border border-red-500 px-2 py-1 text-red-500"
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {!filteredPosts.length && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada publikasi.</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-3xl border border-emerald-900/20 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Detail Publikasi</h3>
                                <label className="flex items-center gap-2 text-xs">
                                    <input
                                        type="checkbox"
                                        checked={form.isPublished}
                                        onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
                                        className="h-4 w-4"
                                    />
                                    Tampilkan
                                </label>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold">Tipe</label>
                                    <select
                                        value={form.type}
                                        onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as ContentType }))}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                    >
                                        {TYPE_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold">Kategori</label>
                                    <input
                                        value={form.category}
                                        onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                        placeholder="Misal: Kegiatan"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold">Judul</label>
                                <input
                                    value={form.title}
                                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold">Slug</label>
                                    <input
                                        value={form.slug}
                                        onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold">Publish</label>
                                    <input
                                        type="datetime-local"
                                        value={form.publishedAt}
                                        onChange={(e) => setForm((prev) => ({ ...prev, publishedAt: e.target.value }))}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setForm((prev) => ({ ...prev, slug: slugify(prev.title || prev.slug) }))}
                                className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 px-3 py-2 text-xs text-emerald-600"
                            >
                                <Sparkles size={14} /> Buat slug otomatis
                            </button>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold">Ringkasan</label>
                                <textarea
                                    value={form.excerpt}
                                    onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
                                    rows={3}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-semibold">Konten Publikasi</label>
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => editor?.chain().focus().toggleBold().run()}
                                        className={toolbarButton(editor?.isActive('bold') || false)}
                                    >
                                        <Bold size={14} /> Bold
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                                        className={toolbarButton(editor?.isActive('italic') || false)}
                                    >
                                        <Italic size={14} /> Italic
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                                        className={toolbarButton(editor?.isActive('heading', { level: 2 }) || false)}
                                    >
                                        <Heading2 size={14} /> Heading
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => editor?.chain().focus().toggleBulletList().run()}
                                        className={toolbarButton(editor?.isActive('bulletList') || false)}
                                    >
                                        <List size={14} /> Bullet
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                                        className={toolbarButton(editor?.isActive('orderedList') || false)}
                                    >
                                        <ListOrdered size={14} /> Ordered
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                                        className={toolbarButton(editor?.isActive('blockquote') || false)}
                                    >
                                        <Quote size={14} /> Quote
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => editor?.chain().focus().undo().run()}
                                        className={toolbarButton(false)}
                                    >
                                        <Undo2 size={14} /> Undo
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => editor?.chain().focus().redo().run()}
                                        className={toolbarButton(false)}
                                    >
                                        <Redo2 size={14} /> Redo
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const url = window.prompt('Masukkan URL tautan');
                                            if (url) {
                                                editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
                                            }
                                        }}
                                        className={toolbarButton(editor?.isActive('link') || false)}
                                    >
                                        <Link2 size={14} /> Link
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => editor?.chain().focus().unsetLink().run()}
                                        className={toolbarButton(false)}
                                    >
                                        <Unlink2 size={14} /> Unlink
                                    </button>
                                    <label className={toolbarButton(false)}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) insertImage(file);
                                                e.currentTarget.value = '';
                                            }}
                                        />
                                        <ImagePlus size={14} /> Gambar
                                    </label>
                                </div>

                                <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-black/30">
                                    <EditorContent editor={editor} className="prose max-w-none dark:prose-invert" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold">Cover URL</label>
                                <div className="flex flex-col gap-3">
                                    {form.coverUrl ? (
                                        <div className="h-40 w-full overflow-hidden rounded-xl border border-gray-200 dark:border-white/10">
                                            <img src={form.coverUrl} alt="Thumbnail" className="h-full w-full object-cover" />
                                        </div>
                                    ) : null}
                                    <input
                                        value={form.coverUrl}
                                        onChange={(e) => setForm((prev) => ({ ...prev, coverUrl: e.target.value }))}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                        placeholder="https://..."
                                    />
                                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) uploadCover(file);
                                                e.currentTarget.value = '';
                                            }}
                                        />
                                        <span className="rounded-lg border border-emerald-600 px-3 py-2 text-emerald-600">
                                            {uploadingCover ? 'Mengunggah...' : 'Upload Thumbnail'}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold">Meta JSON (opsional)</label>
                                <textarea
                                    value={form.meta}
                                    onChange={(e) => setForm((prev) => ({ ...prev, meta: e.target.value }))}
                                    rows={3}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                    placeholder='{"tags":["kegiatan"]}'
                                />
                            </div>
                        </div>

                        <div className="rounded-3xl border border-emerald-900/20 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Media Publikasi</h3>
                                <button
                                    type="button"
                                    onClick={addMedia}
                                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 px-3 py-2 text-xs text-emerald-600"
                                >
                                    <Plus size={14} /> Tambah Media
                                </button>
                            </div>

                            <div className="space-y-4">
                                {mediaItems.map((item, index) => (
                                    <div key={`${item.mediaType}-${index}`} className="rounded-2xl border border-gray-200 p-4 dark:border-white/10 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Media #{index + 1}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeMedia(index)}
                                                className="text-xs text-red-500"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <div className="grid gap-3 md:grid-cols-2">
                                            <select
                                                value={item.mediaType}
                                                onChange={(e) => updateMediaType(index, e.target.value as ContentMediaType)}
                                                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                            >
                                                {MEDIA_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                            <input
                                                value={item.displayOrder}
                                                onChange={(e) => updateMedia(index, 'displayOrder', Number(e.target.value))}
                                                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                                type="number"
                                                min={0}
                                                placeholder="Urutan"
                                            />
                                        </div>
                                        {item.mediaType === 'embed' ? (
                                            <textarea
                                                value={item.embedHtml}
                                                onChange={(e) => updateMedia(index, 'embedHtml', e.target.value)}
                                                rows={3}
                                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                                placeholder="<iframe ...>"
                                            />
                                        ) : (
                                            <div className="space-y-2">
                                                <input
                                                    value={item.url}
                                                    onChange={(e) => updateMedia(index, 'url', e.target.value)}
                                                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                                    placeholder="https://"
                                                />
                                                <label className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700">
                                                    <input
                                                        type="file"
                                                        accept={item.mediaType === 'image' ? 'image/*' : undefined}
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) uploadMediaFile(index, file);
                                                            e.currentTarget.value = '';
                                                        }}
                                                    />
                                                    <span className="rounded-lg border border-emerald-600 px-3 py-2 text-emerald-600">
                                                        {uploadingMediaIndex === index ? 'Mengunggah...' : 'Upload File'}
                                                    </span>
                                                </label>
                                            </div>
                                        )}
                                        <input
                                            value={item.caption}
                                            onChange={(e) => updateMedia(index, 'caption', e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                            placeholder="Caption"
                                        />
                                        <label className="flex items-center gap-2 text-xs">
                                            <input
                                                type="checkbox"
                                                checked={item.isActive}
                                                onChange={(e) => updateMedia(index, 'isActive', e.target.checked)}
                                                className="h-4 w-4"
                                            />
                                            Aktif
                                        </label>
                                    </div>
                                ))}
                                {!mediaItems.length && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada media.</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
                            <div className="flex items-center gap-3">
                                {selectedId ? (
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(selectedId)}
                                        className="inline-flex items-center gap-2 rounded-lg border border-red-500 px-4 py-2 text-sm text-red-500"
                                    >
                                        <Trash2 size={16} /> Hapus
                                    </button>
                                ) : null}
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={saving || !editor}
                                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm text-white disabled:opacity-60"
                                >
                                    <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Publikasi'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PublikasiAdminPage;
