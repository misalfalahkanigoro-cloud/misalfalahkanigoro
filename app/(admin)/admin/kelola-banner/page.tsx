'use client';

import React, { useEffect, useState } from 'react';
import SidebarAdmin from '@/components/sidebar-admin';
import { Plus, Save, Trash2 } from 'lucide-react';

type SiteBanner = {
    id?: string;
    title: string;
    description?: string | null;
    button_text: string;
    button_link: string;
    background_color: string;
    text_color: string;
    placement: 'home' | 'all' | 'custom';
    display_order: number;
    is_active: boolean;
};

const DEFAULT_FORM: SiteBanner = {
    title: '',
    description: '',
    button_text: 'Daftar Sekarang',
    button_link: '/ppdb',
    background_color: '#10b981',
    text_color: '#ffffff',
    placement: 'home',
    display_order: 1,
    is_active: true,
};

const KelolaBannerPage: React.FC = () => {
    const [items, setItems] = useState<SiteBanner[]>([]);
    const [form, setForm] = useState<SiteBanner>(DEFAULT_FORM);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/site-banners');
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch banners', error);
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
                title: form.title,
                description: form.description,
                buttonText: form.button_text,
                buttonLink: form.button_link,
                backgroundColor: form.background_color,
                textColor: form.text_color,
                placement: form.placement,
                displayOrder: Number(form.display_order) || 0,
                isActive: form.is_active,
            };
            const url = editingId ? `/api/admin/site-banners/${editingId}` : '/api/admin/site-banners';
            const method = editingId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Gagal menyimpan banner');
            }
            resetForm();
            fetchItems();
            setMessage('Banner tersimpan.');
        } catch (error: any) {
            setMessage(error.message || 'Gagal menyimpan banner');
        }
    };

    const handleEdit = (item: SiteBanner) => {
        setEditingId(item.id || null);
        setForm(item);
    };

    const handleDelete = async (id?: string) => {
        if (!id) return;
        if (!confirm('Hapus banner ini?')) return;
        await fetch(`/api/admin/site-banners/${id}`, { method: 'DELETE' });
        fetchItems();
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors dark:bg-[#0B0F0C] dark:text-gray-100">
            <SidebarAdmin />
            <main className="min-h-screen px-6 py-10 lg:pl-80 space-y-8">
                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold">Kelola Banner CTA</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Banner ajakan di beranda.</p>
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
                            value={form.button_text}
                            onChange={(e) => setForm({ ...form, button_text: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            placeholder="Teks tombol"
                        />
                        <input
                            value={form.button_link}
                            onChange={(e) => setForm({ ...form, button_link: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            placeholder="/ppdb"
                        />
                        <select
                            value={form.placement}
                            onChange={(e) => setForm({ ...form, placement: e.target.value as SiteBanner['placement'] })}
                            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                        >
                            <option value="home">Home</option>
                            <option value="all">Semua Halaman</option>
                            <option value="custom">Custom</option>
                        </select>
                        <input
                            value={form.background_color}
                            onChange={(e) => setForm({ ...form, background_color: e.target.value })}
                            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            placeholder="#10b981"
                        />
                        <input
                            value={form.text_color}
                            onChange={(e) => setForm({ ...form, text_color: e.target.value })}
                            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            placeholder="#ffffff"
                        />
                        <input
                            type="number"
                            value={form.display_order}
                            onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                            className="w-32 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            placeholder="Urutan"
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
                        <textarea
                            value={form.description || ''}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm md:col-span-2 dark:border-white/10 dark:bg-black/30"
                            rows={3}
                            placeholder="Deskripsi"
                        />
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
                                        <p className="text-xs text-gray-500">{item.description}</p>
                                        <p className="text-[11px] text-emerald-600">Tombol: {item.button_text} → {item.button_link}</p>
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

export default KelolaBannerPage;
