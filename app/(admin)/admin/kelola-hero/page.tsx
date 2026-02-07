'use client';

import React, { useEffect, useState } from 'react';
import SidebarAdmin from '@/components/sidebar-admin';
import { Upload, Trash2, Save, Plus } from 'lucide-react';
import { api } from '@/lib/api';

type HeroSlide = {
    id?: number;
    imageUrl: string;
    title: string;
    subtitle: string;
    order: number;
    isActive: boolean;
};

const DEFAULT_FORM: HeroSlide = {
    imageUrl: '',
    title: '',
    subtitle: '',
    order: 1,
    isActive: true,
};

const KelolaHeroSlidesPage: React.FC = () => {
    const [items, setItems] = useState<HeroSlide[]>([]);
    const [form, setForm] = useState<HeroSlide>(DEFAULT_FORM);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/hero-slides');
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch hero slides', error);
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
            const payload = { ...form, order: Number(form.order) || 0 };
            const url = editingId ? `/api/admin/hero-slides/${editingId}` : '/api/admin/hero-slides';
            const method = editingId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Gagal menyimpan hero slide');
            }
            resetForm();
            fetchItems();
            setMessage('Hero slide tersimpan.');
        } catch (error: any) {
            setMessage(error.message || 'Gagal menyimpan hero slide');
        }
    };

    const handleEdit = (item: HeroSlide) => {
        setEditingId(item.id || null);
        setForm({
            imageUrl: item.imageUrl || '',
            title: item.title || '',
            subtitle: item.subtitle || '',
            order: Number(item.order) || 0,
            isActive: item.isActive ?? true,
        });
    };

    const handleDelete = async (id?: number) => {
        if (!id) return;
        if (!confirm('Hapus hero slide ini?')) return;
        await fetch(`/api/admin/hero-slides/${id}`, { method: 'DELETE' });
        fetchItems();
    };

    const handleUpload = async (file: File) => {
        try {
            const res = await api.upload.media(file, 'mis-al-falah/hero');
            setForm((prev) => ({ ...prev, imageUrl: res.url }));
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
                            <h2 className="text-2xl font-semibold">Kelola Hero Slides</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Slider utama di beranda.</p>
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
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            placeholder="Judul"
                        />
                        <input
                            value={form.subtitle}
                            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            placeholder="Subjudul"
                        />
                        <div className="flex items-center gap-3 md:col-span-2">
                            <input
                                value={form.imageUrl}
                                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
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
                            value={form.order}
                            onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                            className="w-32 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            placeholder="Urutan"
                        />
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.isActive}
                                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
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
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-24 overflow-hidden rounded-xl bg-gray-100">
                                            {item.imageUrl && (
                                                <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{item.title}</p>
                                            <p className="text-xs text-gray-500">{item.subtitle}</p>
                                            <p className="text-[11px] text-emerald-600">Urutan: {item.order}</p>
                                        </div>
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

export default KelolaHeroSlidesPage;
