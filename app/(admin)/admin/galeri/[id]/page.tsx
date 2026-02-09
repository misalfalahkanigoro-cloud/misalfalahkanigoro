'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Trash2, Image as ImageIcon, Plus, X } from 'lucide-react';
import SidebarAdmin from '@/components/sidebar-admin';
import { api } from '@/lib/api';
import type { Gallery, MediaItem } from '@/lib/types';
import CloudinaryButton from '@/components/admin/CloudinaryButton';

const AdminGalleryEditPage: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const isNew = id === 'create';

    const [form, setForm] = useState<Partial<Gallery>>({
        title: '',
        slug: '',
        description: '',
        publishedAt: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        isPublished: true,
        media: [],
    });

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!isNew && id) {
            const fetchData = async () => {
                try {
                    const res = await api.getGalleryDetail(id); // Using slug/id fetcher
                    // Note: API might return by slug, but here we assume generic fetch by ID works or we need specific endpoint
                    // Ideally we should use getGalleryById if available, but for now assuming getGalleryDetail can handle ID or we fetch list and find (less efficient)
                    // Let's assume getGalleryDetail works with ID for admin purposes or we fix API later. 
                    // Actually, let's fetch list and find for safety if getGalleryDetail only takes slug

                    if (res) {
                        setForm({
                            ...res,
                            slug: (res as any).slug || '',
                            publishedAt: new Date((res as Gallery).publishedAt).toISOString().split('T')[0],
                        });
                    }
                } catch (error) {
                    console.error('Failed to fetch gallery:', error);
                    alert('Gagal memuat data galeri');
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [id, isNew]);

    const handleSave = async () => {
        if (!form.title) return alert('Judul wajib diisi');
        setSaving(true);
        try {
            const payload = {
                ...form,
                slug: form.slug,
                publishedAt: new Date(form.publishedAt!).toISOString(),
            };

            if (isNew) {
                await api.createGallery(payload as any);
            } else {
                await api.updateGallery(id, payload as any);
            }
            router.push('/admin/galeri');
            router.refresh();
        } catch (error) {
            console.error('Failed to save gallery:', error);
            alert('Gagal menyimpan galeri');
        } finally {
            setSaving(false);
        }
    };

    const handleAddMedia = (url: string, info?: any) => {
        const newItem: MediaItem = {
            id: crypto.randomUUID(),
            mediaUrl: url,
            mediaType: 'image',
            caption: info?.original_filename || '',
            displayOrder: (form.media?.length || 0) + 1,
            entityType: 'gallery',
            entityId: form.id || '',
            thumbnailUrl: null,
            isMain: false,
        } as any;
        setForm(prev => ({
            ...prev,
            media: [...(prev.media || []), newItem]
        }));
    };

    const generateSlug = () => {
        if (!form.title) return;
        const slug = form.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        setForm(prev => ({ ...prev, slug }));
    };

    const removeMedia = (index: number) => {
        setForm(prev => ({
            ...prev,
            media: prev.media?.filter((_, i) => i !== index)
        }));
    };

    const updateCaption = (index: number, caption: string) => {
        setForm(prev => {
            const newMedia = [...(prev.media || [])];
            newMedia[index] = { ...newMedia[index], caption };
            return { ...prev, media: newMedia };
        });
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
                                {isNew ? 'Buat Album Baru' : 'Edit Album'}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Kembali ke galeri sekolah</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Judul Album</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-emerald-500 focus:ring-0 transition"
                                    placeholder="Contoh: Kegiatan Study Tour 2024"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Slug</label>
                                    <button
                                        type="button"
                                        onClick={generateSlug}
                                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                                    >
                                        Generate dari Judul
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={form.slug || ''}
                                    onChange={e => setForm({ ...form, slug: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-emerald-500 focus:ring-0 transition"
                                    placeholder="slug-album"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Deskripsi</label>
                                <textarea
                                    value={form.description || ''}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-emerald-500 focus:ring-0 transition h-32 resize-none"
                                    placeholder="Deskripsi singkat tentang kegiatan ini..."
                                />
                            </div>
                        </div>

                        {/* Media Management */}
                        <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                    <ImageIcon size={20} className="text-emerald-600" />
                                    Galeri Foto ({form.media?.length || 0})
                                </h3>
                                <CloudinaryButton
                                    folder="mis-al-falah/gallery"
                                    label={uploading ? 'Mengupload...' : 'Tambah Foto'}
                                    className={uploading ? 'opacity-60 cursor-not-allowed' : ''}
                                    onUploaded={(url, info) => handleAddMedia(url, info)}
                                    disabled={uploading}
                                />
                            </div>

                            {(!form.media || form.media.length === 0) ? (
                                <div className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-2xl bg-gray-50 dark:bg-white/5">
                                    <p className="text-gray-400 text-sm">Belum ada foto yang diupload</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {form.media.map((media, idx) => (
                                        <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                                            <img src={media.mediaUrl} alt="" className="w-full h-full object-cover" />

                                            {/* Overlay Actions */}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={() => removeMedia(idx)}
                                                        className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={media.caption || ''}
                                                    onChange={(e) => updateCaption(idx, e.target.value)}
                                                    placeholder="Caption..."
                                                    className="w-full text-xs px-2 py-1 rounded bg-white/20 text-white placeholder-white/50 border-none focus:ring-1 focus:ring-white/50"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Controls */}
                    <div className="space-y-6">
                        <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Status Publikasi</label>
                                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/10 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                    <input
                                        type="checkbox"
                                        checked={form.isPublished}
                                        onChange={e => setForm({ ...form, isPublished: e.target.checked })}
                                        className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Publikasikan</span>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tanggal Kegiatan</label>
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
                                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {saving ? 'Processing...' : <><Save size={18} /> Simpan Album</>}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminGalleryEditPage;
