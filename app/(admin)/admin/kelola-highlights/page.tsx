'use client';

import React, { useEffect, useState } from 'react';
import SidebarAdmin from '@/components/sidebar-admin';
import { Plus, Trash2, Save } from 'lucide-react';

type Highlight = {
    id?: number;
    icon: string;
    title: string;
    description: string;
    order: number;
};

const DEFAULT_FORM: Highlight = { icon: 'Star', title: '', description: '', order: 1 };

const KelolaHighlightsPage: React.FC = () => {
    const [items, setItems] = useState<Highlight[]>([]);
    const [form, setForm] = useState<Highlight>(DEFAULT_FORM);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/highlights');
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch highlights', error);
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
            const url = editingId ? `/api/admin/highlights/${editingId}` : '/api/admin/highlights';
            const method = editingId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Gagal menyimpan highlight');
            }
            resetForm();
            fetchItems();
            setMessage('Highlight tersimpan.');
        } catch (error: any) {
            setMessage(error.message || 'Gagal menyimpan highlight');
        }
    };

    const handleEdit = (item: Highlight) => {
        setEditingId(item.id || null);
        setForm({
            icon: item.icon || 'Star',
            title: item.title || '',
            description: item.description || '',
            order: Number(item.order) || 0,
        });
    };

    const handleDelete = async (id?: number) => {
        if (!id) return;
        if (!confirm('Hapus highlight ini?')) return;
        await fetch(`/api/admin/highlights/${id}`, { method: 'DELETE' });
        fetchItems();
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors dark:bg-[#0B0F0C] dark:text-gray-100">
            <SidebarAdmin />
            <main className="min-h-screen px-6 py-10 lg:pl-80 space-y-8">
                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold">Kelola Highlights</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Konten section “Kenapa Memilih Kami”.</p>
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
                            value={form.icon}
                            onChange={(e) => setForm({ ...form, icon: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            placeholder="Icon (contoh: BookOpen)"
                        />
                        <input
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            placeholder="Judul"
                        />
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm md:col-span-2 dark:border-white/10 dark:bg-black/30"
                            rows={3}
                            placeholder="Deskripsi singkat"
                        />
                        <input
                            type="number"
                            value={form.order}
                            onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                            className="w-32 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            placeholder="Urutan"
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
                                        <p className="text-[11px] text-emerald-600">Icon: {item.icon} · Urutan: {item.order}</p>
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

export default KelolaHighlightsPage;
