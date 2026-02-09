'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Trash2, FileText, Megaphone, Newspaper, Paperclip, X } from 'lucide-react';
import SidebarAdmin from '@/components/sidebar-admin';
import TiptapEditor from '@/components/tiptap-editor';
import { api } from '@/lib/api';
import type { Publication, PublicationType, MediaItem } from '@/lib/types';
import CloudinaryButton from '@/components/admin/CloudinaryButton';

const AdminPublicationEditPage: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const isNew = id === 'create';

    const [form, setForm] = useState<Partial<Publication>>({
        title: '',
        slug: '',
        type: 'article',
        description: '',
        content: '',
        publishedAt: new Date().toISOString().split('T')[0],
        isPublished: true,
        isPinned: false,
        media: [],
    });

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!isNew && id) {
            const fetchData = async () => {
                try {
                    const res = await api.getPublicationDetail(id);
                    if (res) {
                        setForm({
                            ...res,
                            publishedAt: new Date((res as Publication).publishedAt).toISOString().split('T')[0],
                        });
                    }
                } catch (error) {
                    console.error('Failed to fetch publication:', error);
                    alert('Gagal memuat publikasi');
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [id, isNew]);

    const regenerateSlug = () => {
        if (!form.title) return;
        const slug = form.title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        setForm(prev => ({ ...prev, slug }));
    };

    const handleSave = async () => {
        if (!form.title) return alert('Judul wajib diisi');
        setSaving(true);
        try {
            const payload = {
                ...form,
                publishedAt: new Date(form.publishedAt!).toISOString(),
            };

            if (isNew) {
                await api.createPublication(payload as any);
            } else {
                await api.updatePublication(id, payload as any);
            }
            router.push('/admin/publikasi');
            router.refresh();
        } catch (error) {
            console.error('Failed to save publication:', error);
            alert('Gagal menyimpan publikasi');
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = (url: string, info?: any) => {
        const mediaType = (info?.resource_type === 'image' || info?.format?.match(/jpg|jpeg|png|webp|gif/i)) ? 'image' : 'file';
        const newItem: MediaItem = {
            id: crypto.randomUUID(),
            mediaUrl: url,
            mediaType,
            caption: info?.original_filename || '',
            displayOrder: (form.media?.length || 0) + 1,
            entityType: 'publication',
            entityId: form.id || '',
            thumbnailUrl: null,
            isMain: false,
        } as any;
        setForm(prev => ({
            ...prev,
            media: [...(prev.media || []), newItem]
        }));
    };

    const removeMedia = (index: number) => {
        setForm(prev => ({
            ...prev,
            media: prev.media?.filter((_, i) => i !== index)
        }));
    };

    // Auto-generate slug
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
                                {isNew ? 'Buat Publikasi Baru' : 'Edit Publikasi'}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Kembali ke daftar publikasi</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5 space-y-4">

                            {/* Type Selector */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                {[
                                    { id: 'article', label: 'Artikel', icon: Newspaper },
                                    { id: 'announcement', label: 'Pengumuman', icon: Megaphone },
                                    { id: 'bulletin', label: 'Buletin', icon: FileText }
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setForm({ ...form, type: type.id as PublicationType })}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition ${form.type === type.id
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                            : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200 dark:border-white/5 dark:bg-white/5'}`}
                                    >
                                        <type.icon size={24} className="mb-2" />
                                        <span className="font-bold text-sm">{type.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Judul</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-emerald-500 focus:ring-0 transition font-bold text-lg"
                                    placeholder="Judul Publikasi..."
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
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Deskripsi Singkat</label>
                                <textarea
                                    value={form.description || ''}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-emerald-500 focus:ring-0 transition h-24 resize-none"
                                    placeholder="Deskripsi singkat..."
                                />
                            </div>

                            {form.type !== 'bulletin' && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Konten Lengkap</label>
                                    <TiptapEditor
                                        content={form.content || ''}
                                        onChange={(content) => setForm({ ...form, content })}
                                        placeholder="Isi konten publikasi..."
                                        minHeight="400px"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Media / Files */}
                        <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Paperclip size={20} className="text-emerald-600" />
                                    {form.type === 'bulletin' ? 'File Buletin (PDF)' : 'Lampiran Media'}
                                </h3>
                                <CloudinaryButton
                                    folder="mis-al-falah/publications"
                                    label={uploading ? 'Uploading...' : 'Upload File'}
                                    onUploaded={handleFileUpload}
                                    className={uploading ? 'opacity-60 cursor-not-allowed' : ''}
                                    disabled={uploading}
                                />
                            </div>

                            {(!form.media || form.media.length === 0) ? (
                                <div className="text-center py-8 bg-gray-50 dark:bg-white/5 rounded-xl border border-dashed border-gray-200 dark:border-white/10">
                                    <p className="text-gray-400 text-sm">Belum ada file yang diupload</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {form.media.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 group">
                                            <div className="w-10 h-10 bg-gray-200 dark:bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                                                {item.mediaType === 'image' ? (
                                                    <img src={item.mediaUrl} className="w-full h-full object-cover rounded-lg" />
                                                ) : (
                                                    <FileText size={20} className="text-gray-500" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm truncate">{item.mediaUrl.split('/').pop()}</p>
                                                <p className="text-xs text-gray-500 uppercase">{item.mediaType}</p>
                                            </div>
                                            <button
                                                onClick={() => removeMedia(idx)}
                                                className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Status Publikasi</label>
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
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pin ke Atas</span>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tanggal</label>
                                <input
                                    type="date"
                                    value={form.publishedAt}
                                    onChange={e => setForm({ ...form, publishedAt: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-emerald-500 focus:ring-0 transition"
                                />
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {saving ? 'Processing...' : <><Save size={18} /> Simpan Publikasi</>}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminPublicationEditPage;
