'use client';

import React, { useEffect, useState } from 'react';
import SidebarAdmin from '@/components/sidebar-admin';
import { Plus, Save, Trash2, Upload } from 'lucide-react';
import { api } from '@/lib/api';

type PageHeroForm = {
    id?: string;
    page_slug: string;
    title: string;
    subtitle?: string | null;
    image_url: string;
    overlay_opacity: number;
    is_active: boolean;
};

const DEFAULT_FORM: PageHeroForm = {
    page_slug: '',
    title: '',
    subtitle: '',
    image_url: '',
    overlay_opacity: 0.5,
    is_active: true,
};

const KelolaHeroPagesPage: React.FC = () => {
    const [items, setItems] = useState<PageHeroForm[]>([]);
    const [form, setForm] = useState<PageHeroForm>(DEFAULT_FORM);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/page-heroes');
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch page heroes', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const resetForm = () => {
        setForm(DEFAULT_FORM);
        setEditingId(null);
    };

    const handleSubmit = async () => {
        setMessage(null);
        try {
            const payload = {
                pageSlug: form.page_slug,
                title: form.title,
                subtitle: form.subtitle,
                imageUrl: form.image_url,
                overlayOpacity: Number(form.overlay_opacity) || 0.5,
                isActive: form.is_active,
            };
            const url = editingId ? `/api/admin/page-heroes/${editingId}` : '/api/admin/page-heroes';
            const method = editingId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Gagal menyimpan hero page');
            }
            resetForm();
            fetchItems();
            setMessage('Hero page tersimpan.');
        } catch (error: any) {
            setMessage(error.message || 'Gagal menyimpan hero page');
        }
    };

    const handleEdit = (item: PageHeroForm) => {
        setEditingId(item.id || null);
        setForm(item);
    };

    const handleDelete = async (id?: string) => {
        if (!id) return;
        if (!confirm('Hapus hero page ini?')) return;
        await fetch(`/api/admin/page-heroes/${id}`, { method: 'DELETE' });
        fetchItems();
    };

    const handleUpload = async (file: File) => {
        try {
            const res = await api.upload.media(file, 'mis-al-falah/page-heroes');
            setForm((prev) => ({ ...prev, image_url: res.url }));
        } catch (error) {
            console.error('Upload failed', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors dark:bg-[#0B0F0C] dark:text-gray-100">
            <SidebarAdmin />
            <main className="min-h-screen px-6 py-10 lg:pl-80 space-y-8">
                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold">Kelola Hero Pages</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Hero image per halaman (kelulusan, kontak, dll).</p>
                        </div>
                        <button
                            type="button"
                            onClick={resetForm}
                            className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 px-4 py-2 text-sm text-emerald-600"
                        >
                            <Plus size={16} /> Tambah Baru
                        </button>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <input
                            value={form.page_slug}
                            onChange={(e) => setForm({ ...form, page_slug: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            placeholder="Slug halaman (misal: kelulusan)"
                        />
                        <input
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            placeholder="Judul"
                        />
                        <input
                            value={form.subtitle || ''}
                            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            placeholder="Subjudul"
                        />
                        <div className="flex items-center gap-3 md:col-span-2">
                            <input
                                value={form.image_url}
                                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                placeholder="URL gambar"
                            />
                            <label className="flex cursor-pointer items-center justify-center rounded-xl border border-emerald-600 px-3 text-emerald-600">
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleUpload(file);
                                    }}
                                />
                                <Upload size={14} />
                            </label>
                        </div>
                        <input
                            type="number"
                            step="0.05"
                            value={form.overlay_opacity}
                            onChange={(e) => setForm({ ...form, overlay_opacity: Number(e.target.value) })}
                            className="w-32 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            placeholder="Opacity"
                        />
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.is_active}
                                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                className="h-4 w-4"
                            />
                            Aktif
                        </label>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white"
                        >
                            <Save size={16} /> Simpan
                        </button>
                    </div>
                    {message && <p className="mt-4 text-sm text-emerald-600">{message}</p>}
                </div>

                <div className="rounded-3xl border border-emerald-900/20 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                    {loading ? (
                        <p className="text-sm text-gray-500">Memuat data...</p>
                    ) : (
                        <div className="space-y-3">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-start justify-between gap-4 rounded-2xl border border-emerald-900/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5"
                                >
                                    <div>
                                        <p className="text-sm font-semibold">{item.title}</p>
                                        <p className="text-xs text-gray-500">{item.page_slug}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="rounded-lg border border-emerald-600 px-3 py-1 text-xs text-emerald-600"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="rounded-lg border border-red-500 px-3 py-1 text-xs text-red-500"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default KelolaHeroPagesPage;
