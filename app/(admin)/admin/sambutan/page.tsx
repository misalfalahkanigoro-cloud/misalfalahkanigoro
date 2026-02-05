'use client';

import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';

const KelolaSambutanPage: React.FC = () => {
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [headmasterName, setHeadmasterName] = useState('');
    const [headmasterTitle, setHeadmasterTitle] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    const [isActive, setIsActive] = useState(true);
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
        const fetchGreeting = async () => {
            try {
                const res = await fetch('/api/admin/headmaster-greeting');
                const data = await res.json();

                if (data) {
                    setTitle(data.title || '');
                    setSubtitle(data.subtitle || '');
                    setHeadmasterName(data.headmaster_name || '');
                    setHeadmasterTitle(data.headmaster_title || '');
                    setPhotoUrl(data.photo_url || '');
                    setIsActive(data.is_active ?? true);
                    setInitialContent(
                        data.content_html || data.content_json || data.content_text || ''
                    );
                }
            } catch (error) {
                console.error('Failed to load greeting', error);
            }
        };

        fetchGreeting();
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

    const handlePhotoUpload = (result: any) => {
        const secureUrl = getUploadUrl(result);
        if (secureUrl) {
            setPhotoUrl(secureUrl);
        }
    };

    const insertImage = (result: any) => {
        if (!editor) return;
        const secureUrl = getUploadUrl(result);
        if (secureUrl) {
            editor.chain().focus().setImage({ src: secureUrl }).run();
        }
    };

    const handleSave = async () => {
        if (!editor) return;
        setSaving(true);
        setMessage(null);
        try {
            const payload = {
                title,
                subtitle,
                headmasterName,
                headmasterTitle,
                photoUrl,
                isActive,
                contentJson: editor.getJSON(),
                contentHtml: editor.getHTML(),
                contentText: editor.getText(),
            };

            const res = await fetch('/api/admin/headmaster-greeting', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Gagal menyimpan sambutan');
            }

            setMessage('Sambutan kepala madrasah berhasil disimpan.');
        } catch (error) {
            console.error(error);
            setMessage('Gagal menyimpan sambutan.');
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

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors dark:bg-[#0B0F0C] dark:text-gray-100">
            <SidebarAdmin />
            <main className="min-h-screen px-6 py-10 lg:pl-80 space-y-8">
                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-start justify-between gap-6 flex-wrap">
                        <div>
                            <h2 className="text-2xl font-semibold">Sambutan Kepala Madrasah</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Kelola teks sambutan dan identitas kepala madrasah.</p>
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

                    <div className="mt-8 grid gap-6 lg:grid-cols-2">
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

                            <label className="text-sm font-semibold">Nama Kepala Madrasah</label>
                            <input
                                value={headmasterName}
                                onChange={(e) => setHeadmasterName(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                            />

                            <label className="text-sm font-semibold">Jabatan / Gelar</label>
                            <input
                                value={headmasterTitle}
                                onChange={(e) => setHeadmasterTitle(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-semibold">Foto Kepala Madrasah</label>
                            <div className="flex items-center gap-4">
                                <div className="h-28 w-24 rounded-2xl bg-gray-100 dark:bg-white/10 overflow-hidden flex items-center justify-center">
                                    {photoUrl ? (
                                        <img src={photoUrl} alt="Kepala Madrasah" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-xs text-gray-400">Belum ada</span>
                                    )}
                                </div>
                                {canUpload ? (
                                    <CldUploadWidget
                                        uploadPreset={uploadPreset}
                                        options={{ folder: 'mis-al-falah/headmaster' }}
                                        onSuccess={handlePhotoUpload}
                                    >
                                        {({ open }) => (
                                            <button
                                                type="button"
                                                onClick={() => open()}
                                                className="rounded-lg border border-emerald-600 px-4 py-2 text-sm text-emerald-600"
                                            >
                                                Upload Foto
                                            </button>
                                        )}
                                    </CldUploadWidget>
                                ) : (
                                    <button
                                        type="button"
                                        disabled
                                        className="rounded-lg border border-emerald-300 px-4 py-2 text-sm text-emerald-300 cursor-not-allowed"
                                        title="Upload belum aktif"
                                    >
                                        Upload Foto
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
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
                                options={{ folder: 'mis-al-falah/headmaster-content' }}
                                onSuccess={insertImage}
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
                                title="Upload belum aktif"
                            >
                                <ImagePlus size={14} /> Gambar
                            </button>
                        )}
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-black/30">
                        <EditorContent editor={editor} className="prose max-w-none dark:prose-invert" />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
                    <button
                        onClick={handleSave}
                        disabled={saving || !editor}
                        className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
                    >
                        {saving ? 'Menyimpan...' : 'Simpan Sambutan'}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default KelolaSambutanPage;
