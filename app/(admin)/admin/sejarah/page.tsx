'use client';

import React, { useEffect, useMemo, useState } from 'react';
import SidebarAdmin from '@/components/sidebar-admin';
import { CldUploadWidget } from 'next-cloudinary';
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
    Video,
    Plus,
    Trash2,
} from 'lucide-react';

type TimelineItem = {
    id: string;
    year: string;
    title: string;
    descriptionText: string;
    mediaUrl: string;
    isActive: boolean;
};

const KelolaSejarahPage: React.FC = () => {
    const [pageId, setPageId] = useState<string | null>(null);
    const [title, setTitle] = useState('Sejarah Madrasah');
    const [subtitle, setSubtitle] = useState('');
    const [coverImageUrl, setCoverImageUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
    const [initialContent, setInitialContent] = useState<string | object>('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';
    const canUpload = Boolean(uploadPreset);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Image,
            Link.configure({ openOnClick: false }),
        ],
        content: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/admin/history-page');
                if (!res.ok) return;
                const data = await res.json();

                if (data?.page) {
                    setPageId(data.page.id || null);
                    setTitle(data.page.title || 'Sejarah Madrasah');
                    setSubtitle(data.page.subtitle || '');
                    setCoverImageUrl(data.page.coverImageUrl || '');
                    setVideoUrl(data.page.videoUrl || '');
                    setIsActive(data.page.isActive ?? true);
                    setInitialContent(
                        data.page.contentHtml || data.page.contentJson || data.page.contentText || ''
                    );
                }

                if (Array.isArray(data?.timelineItems)) {
                    setTimelineItems(
                        data.timelineItems.map((item: any) => ({
                            id: item.id?.toString() || crypto.randomUUID(),
                            year: item.year || '',
                            title: item.title || '',
                            descriptionText: item.descriptionText || '',
                            mediaUrl: item.mediaUrl || '',
                            isActive: item.isActive ?? true,
                        }))
                    );
                }
            } catch (error) {
                console.error('Failed to load history data', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (editor && initialContent) {
            editor.commands.setContent(initialContent);
        }
    }, [editor, initialContent]);

    const getUploadUrl = (result: any) => {
        if (result?.event !== 'success') return null;
        const info = result.info;
        if (typeof info === 'string') return info;
        if (info && typeof info === 'object') {
            return info.secure_url || info.url || null;
        }
        return null;
    };

    const handleCoverUpload = (result: any) => {
        const secureUrl = getUploadUrl(result);
        if (secureUrl) setCoverImageUrl(secureUrl);
    };

    const handleVideoUpload = (result: any) => {
        const secureUrl = getUploadUrl(result);
        if (secureUrl) setVideoUrl(secureUrl);
    };

    const insertContentImage = (result: any) => {
        if (!editor) return;
        const secureUrl = getUploadUrl(result);
        if (secureUrl) {
            editor.chain().focus().setImage({ src: secureUrl }).run();
        }
    };

    const addTimelineItem = () =>
        setTimelineItems((prev) => [
            ...prev,
            { id: crypto.randomUUID(), year: '', title: '', descriptionText: '', mediaUrl: '', isActive: true },
        ]);

    const removeTimelineItem = (id: string) =>
        setTimelineItems((prev) => prev.filter((item) => item.id !== id));

    const updateTimelineItem = (id: string, field: keyof TimelineItem, value: string | boolean) =>
        setTimelineItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
        );

    const handleTimelineMediaUpload = (id: string, result: any) => {
        const secureUrl = getUploadUrl(result);
        if (secureUrl) {
            updateTimelineItem(id, 'mediaUrl', secureUrl);
        }
    };

    const handleSave = async () => {
        if (!editor) return;
        setSaving(true);
        setMessage(null);
        try {
            const payload = {
                id: pageId,
                title,
                subtitle,
                coverImageUrl,
                videoUrl,
                isActive,
                contentJson: editor.getJSON(),
                contentHtml: editor.getHTML(),
                contentText: editor.getText(),
                timelineItems: timelineItems.map((item, index) => ({
                    id: item.id,
                    year: item.year,
                    title: item.title,
                    descriptionText: item.descriptionText,
                    descriptionHtml: item.descriptionText ? `<p>${item.descriptionText.replace(/\n/g, '<br/>')}</p>` : null,
                    mediaUrl: item.mediaUrl || null,
                    displayOrder: index + 1,
                    isActive: item.isActive,
                })),
            };

            const res = await fetch('/api/admin/history-page', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Gagal menyimpan sejarah');
            }

            setMessage('Sejarah madrasah berhasil disimpan.');
        } catch (error) {
            console.error(error);
            setMessage('Gagal menyimpan sejarah.');
        } finally {
            setSaving(false);
        }
    };

    const toolbarButton = (active: boolean) =>
        `flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
            active
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-700 hover:bg-emerald-50 dark:bg-white/10 dark:text-gray-200'
        }`;

    const timelineCount = useMemo(() => timelineItems.length, [timelineItems]);

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors dark:bg-[#0B0F0C] dark:text-gray-100">
            <SidebarAdmin />
            <main className="min-h-screen px-6 py-10 lg:pl-80 space-y-8">
                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5 space-y-6">
                    <div className="flex flex-wrap items-start justify-between gap-6">
                        <div>
                            <h2 className="text-2xl font-semibold">Sejarah Madrasah</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Kelola narasi dan timeline sejarah madrasah.</p>
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
                        <div className="space-y-4">
                            <label className="text-sm font-semibold">Judul</label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                            />

                            <label className="text-sm font-semibold">Subjudul</label>
                            <input
                                value={subtitle}
                                onChange={(e) => setSubtitle(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-semibold">Cover Image</label>
                            <div className="flex items-center gap-4">
                                <div className="h-24 w-24 rounded-2xl bg-gray-100 dark:bg-white/10 overflow-hidden flex items-center justify-center">
                                    {coverImageUrl ? (
                                        <img src={coverImageUrl} alt="Cover" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-xs text-gray-400">Belum ada</span>
                                    )}
                                </div>
                                {canUpload ? (
                                    <CldUploadWidget
                                        uploadPreset={uploadPreset}
                                        options={{ folder: 'mis-al-falah/history/cover' }}
                                        onSuccess={handleCoverUpload}
                                    >
                                        {({ open }) => (
                                            <button
                                                type="button"
                                                onClick={() => open()}
                                                className="rounded-lg border border-emerald-600 px-4 py-2 text-sm text-emerald-600"
                                            >
                                                Upload Cover
                                            </button>
                                        )}
                                    </CldUploadWidget>
                                ) : (
                                    <button
                                        type="button"
                                        disabled
                                        className="rounded-lg border border-emerald-300 px-4 py-2 text-sm text-emerald-300 cursor-not-allowed"
                                    >
                                        Upload Cover
                                    </button>
                                )}
                            </div>

                            <label className="text-sm font-semibold">Video (Cloudinary)</label>
                            <div className="space-y-3">
                                <input
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                                    placeholder="https://res.cloudinary.com/..."
                                />
                                <div className="flex items-center gap-3">
                                    {canUpload ? (
                                        <CldUploadWidget
                                            uploadPreset={uploadPreset}
                                            options={{ folder: 'mis-al-falah/history/video', resourceType: 'video' }}
                                            onSuccess={handleVideoUpload}
                                        >
                                            {({ open }) => (
                                                <button
                                                    type="button"
                                                    onClick={() => open()}
                                                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 px-4 py-2 text-sm text-emerald-600"
                                                >
                                                    <Video size={16} /> Upload Video
                                                </button>
                                            )}
                                        </CldUploadWidget>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled
                                            className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 px-4 py-2 text-sm text-emerald-300 cursor-not-allowed"
                                        >
                                            <Video size={16} /> Upload Video
                                        </button>
                                    )}
                                </div>
                                {videoUrl && (
                                    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/10">
                                        <video src={videoUrl} controls className="w-full" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <h3 className="text-xl font-semibold mb-4">Narasi Sejarah</h3>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
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
                        {canUpload ? (
                            <CldUploadWidget
                                uploadPreset={uploadPreset}
                                options={{ folder: 'mis-al-falah/history/content' }}
                                onSuccess={insertContentImage}
                            >
                                {({ open }) => (
                                    <button
                                        type="button"
                                        onClick={() => open()}
                                        className={toolbarButton(false)}
                                    >
                                        <ImagePlus size={14} /> Gambar
                                    </button>
                                )}
                            </CldUploadWidget>
                        ) : (
                            <button
                                type="button"
                                disabled
                                className={toolbarButton(false) + ' cursor-not-allowed opacity-60'}
                            >
                                <ImagePlus size={14} /> Gambar
                            </button>
                        )}
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-black/30">
                        <EditorContent editor={editor} className="prose max-w-none dark:prose-invert" />
                    </div>
                </div>

                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-semibold">Timeline Sejarah</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total {timelineCount} item</p>
                        </div>
                        <button
                            type="button"
                            onClick={addTimelineItem}
                            className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 px-4 py-2 text-sm text-emerald-600"
                        >
                            <Plus size={16} /> Tambah Timeline
                        </button>
                    </div>

                    <div className="space-y-4">
                        {timelineItems.map((item, index) => (
                            <div key={item.id} className="rounded-2xl border border-emerald-100 p-4 dark:border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">#{index + 1}</p>
                                    <label className="flex items-center gap-2 text-xs">
                                        <input
                                            type="checkbox"
                                            checked={item.isActive}
                                            onChange={(e) => updateTimelineItem(item.id, 'isActive', e.target.checked)}
                                            className="h-4 w-4"
                                        />
                                        Aktif
                                    </label>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-3">
                                        <label className="text-xs font-semibold">Tahun</label>
                                        <input
                                            value={item.year}
                                            onChange={(e) => updateTimelineItem(item.id, 'year', e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-semibold">Judul</label>
                                        <input
                                            value={item.title}
                                            onChange={(e) => updateTimelineItem(item.id, 'title', e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4 space-y-3">
                                    <label className="text-xs font-semibold">Deskripsi</label>
                                    <textarea
                                        value={item.descriptionText}
                                        onChange={(e) => updateTimelineItem(item.id, 'descriptionText', e.target.value)}
                                        rows={4}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                    />
                                </div>
                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                    <div className="h-20 w-20 rounded-xl bg-gray-100 dark:bg-white/10 overflow-hidden flex items-center justify-center">
                                        {item.mediaUrl ? (
                                            item.mediaUrl.includes('/video/upload/') ? (
                                                <video src={item.mediaUrl} className="h-full w-full object-cover" />
                                            ) : (
                                                <img src={item.mediaUrl} alt={item.title} className="h-full w-full object-cover" />
                                            )
                                        ) : (
                                            <span className="text-[10px] text-gray-400">Media</span>
                                        )}
                                    </div>
                                    {canUpload ? (
                                        <>
                                            <CldUploadWidget
                                                uploadPreset={uploadPreset}
                                                options={{ folder: 'mis-al-falah/history/timeline' }}
                                                onSuccess={(result) => handleTimelineMediaUpload(item.id, result)}
                                            >
                                                {({ open }) => (
                                                    <button
                                                        type="button"
                                                        onClick={() => open()}
                                                        className="rounded-lg border border-emerald-600 px-3 py-2 text-xs text-emerald-600"
                                                    >
                                                        Upload Gambar
                                                    </button>
                                                )}
                                            </CldUploadWidget>
                                            <CldUploadWidget
                                                uploadPreset={uploadPreset}
                                                options={{ folder: 'mis-al-falah/history/timeline', resourceType: 'video' }}
                                                onSuccess={(result) => handleTimelineMediaUpload(item.id, result)}
                                            >
                                                {({ open }) => (
                                                    <button
                                                        type="button"
                                                        onClick={() => open()}
                                                        className="rounded-lg border border-emerald-600 px-3 py-2 text-xs text-emerald-600"
                                                    >
                                                        Upload Video
                                                    </button>
                                                )}
                                            </CldUploadWidget>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled
                                            className="rounded-lg border border-emerald-300 px-3 py-2 text-xs text-emerald-300 cursor-not-allowed"
                                        >
                                            Upload Media
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => removeTimelineItem(item.id)}
                                        className="rounded-lg border border-red-400 px-3 py-2 text-xs text-red-500"
                                    >
                                        <Trash2 size={14} /> Hapus
                                    </button>
                                </div>
                            </div>
                        ))}
                        {!timelineItems.length && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada timeline.</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
                    <button
                        onClick={handleSave}
                        disabled={saving || !editor}
                        className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
                    >
                        {saving ? 'Menyimpan...' : 'Simpan Sejarah'}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default KelolaSejarahPage;
