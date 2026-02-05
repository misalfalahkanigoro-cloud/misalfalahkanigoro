'use client';

import React, { useEffect, useState } from 'react';
import SidebarAdmin from '@/components/sidebar-admin';
import { CldUploadWidget } from 'next-cloudinary';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { ImagePlus, Link2, Unlink2, Bold, Italic, Heading2, List, ListOrdered, Quote, Undo2, Redo2, Video } from 'lucide-react';

const ProfilSekolahPage: React.FC = () => {
    const [videoUrl, setVideoUrl] = useState('');
    const [schoolName, setSchoolName] = useState('');
    const [npsn, setNpsn] = useState('');
    const [schoolAddress, setSchoolAddress] = useState('');
    const [village, setVillage] = useState('');
    const [district, setDistrict] = useState('');
    const [city, setCity] = useState('');
    const [province, setProvince] = useState('');
    const [schoolStatus, setSchoolStatus] = useState('');
    const [educationForm, setEducationForm] = useState('');
    const [educationLevel, setEducationLevel] = useState('');
    const [initialDescription, setInitialDescription] = useState<string | object>('');
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
                const res = await fetch('/api/admin/profile-page');
                if (!res.ok) return;
                const data = await res.json();

                setVideoUrl(data.videoUrl || '');
                setSchoolName(data.schoolName || '');
                setNpsn(data.npsn || '');
                setSchoolAddress(data.schoolAddress || '');
                setVillage(data.village || '');
                setDistrict(data.district || '');
                setCity(data.city || '');
                setProvince(data.province || '');
                setSchoolStatus(data.schoolStatus || '');
                setEducationForm(data.educationForm || '');
                setEducationLevel(data.educationLevel || '');

                setInitialDescription(
                    data.descriptionHtml || data.descriptionJson || data.descriptionText || ''
                );
            } catch (error) {
                console.error('Failed to load profile data', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (editor && initialDescription) {
            editor.commands.setContent(initialDescription);
        }
    }, [editor, initialDescription]);

    const getUploadUrl = (result: any) => {
        if (result?.event !== 'success') return null;
        const info = result.info;
        if (typeof info === 'string') return info;
        if (info && typeof info === 'object') {
            return info.secure_url || info.url || null;
        }
        return null;
    };

    const handleVideoUpload = (result: any) => {
        const secureUrl = getUploadUrl(result);
        if (secureUrl) setVideoUrl(secureUrl);
    };

    const insertDescriptionImage = (result: any) => {
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
                videoUrl,
                descriptionJson: editor.getJSON(),
                descriptionHtml: editor.getHTML(),
                descriptionText: editor.getText(),
                schoolName,
                npsn,
                schoolAddress,
                village,
                district,
                city,
                province,
                schoolStatus,
                educationForm,
                educationLevel,
            };

            const res = await fetch('/api/admin/profile-page', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Gagal menyimpan profil');
            }

            setMessage('Profil sekolah berhasil disimpan.');
        } catch (error) {
            console.error(error);
            setMessage('Gagal menyimpan profil sekolah.');
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
                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5 space-y-6">
                    <div>
                        <h2 className="text-2xl font-semibold">Profil Madrasah</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Kelola informasi utama, deskripsi, dan media profil.</p>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-semibold">Video Profil (Cloudinary)</label>
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
                                            options={{ folder: 'mis-al-falah/profile/video', resourceType: 'video' }}
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

                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <h3 className="text-xl font-semibold mb-4">Deskripsi Profil</h3>
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
                                options={{ folder: 'mis-al-falah/profile/description' }}
                                onSuccess={insertDescriptionImage}
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
                    <h3 className="text-xl font-semibold">Identitas Madrasah</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Nama</label>
                            <input
                                value={schoolName}
                                onChange={(e) => setSchoolName(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">NPSN</label>
                            <input
                                value={npsn}
                                onChange={(e) => setNpsn(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-semibold">Alamat</label>
                            <input
                                value={schoolAddress}
                                onChange={(e) => setSchoolAddress(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Desa/Kelurahan</label>
                            <input
                                value={village}
                                onChange={(e) => setVillage(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Kecamatan/Kota (LN)</label>
                            <input
                                value={district}
                                onChange={(e) => setDistrict(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Kab.-Kota/Negara (LN)</label>
                            <input
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Propinsi/Luar Negeri (LN)</label>
                            <input
                                value={province}
                                onChange={(e) => setProvince(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Status Sekolah</label>
                            <input
                                value={schoolStatus}
                                onChange={(e) => setSchoolStatus(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Bentuk Pendidikan</label>
                            <input
                                value={educationForm}
                                onChange={(e) => setEducationForm(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Jenjang Pendidikan</label>
                            <input
                                value={educationLevel}
                                onChange={(e) => setEducationLevel(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
                    <button
                        onClick={handleSave}
                        disabled={saving || !editor}
                        className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
                    >
                        {saving ? 'Menyimpan...' : 'Simpan Profil'}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default ProfilSekolahPage;
