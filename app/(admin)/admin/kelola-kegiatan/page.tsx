'use client';

import React, { useEffect, useState } from 'react';
import SidebarAdmin from '@/components/sidebar-admin';
import { Plus, Save, Trash2, Upload } from 'lucide-react';
import { api } from '@/lib/api';

type ActivityForm = {
    id?: number;
    title: string;
    imageUrl?: string | null;
    isActive: boolean;
};

const DEFAULT_FORM: ActivityForm = {
    title: '',
    imageUrl: '',
    isActive: true,
};

const AdminKegiatanPage: React.FC = () => {
    const [items, setItems] = useState<ActivityForm[]>([]);
    const [form, setForm] = useState<ActivityForm>(DEFAULT_FORM);
    const [editingId, setEditingId] = useState<number | null>(null);

    const fetchItems = async () => {
        const res = await fetch('/api/admin/activities');
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleSubmit = async () => {
        const url = editingId ? `/api/admin/activities/${editingId}` : '/api/admin/activities';
        const method = editingId ? 'PUT' : 'POST';
        await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        setForm(DEFAULT_FORM);
        setEditingId(null);
        fetchItems();
    };

    const handleEdit = (item: ActivityForm) => {
        setEditingId(item.id || null);
        setForm(item);
    };

    const handleDelete = async (id?: number) => {
        if (!id) return;
        await fetch(`/api/admin/activities/${id}`, { method: 'DELETE' });
        fetchItems();
    };

    const handleUpload = async (file: File) => {
        const res = await api.upload.media(file, 'mis-al-falah/activities');
        setForm((prev) => ({ ...prev, imageUrl: res.url }));
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors dark:bg-[#0B0F0C] dark:text-gray-100">
            <SidebarAdmin />
            <main className="min-h-screen px-6 py-10 lg:pl-80 space-y-8">
                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">Kelola Kegiatan</h2>
                        <button onClick={() => { setForm(DEFAULT_FORM); setEditingId(null); }} className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 px-4 py-2 text-sm text-emerald-600">
                            <Plus size={16} /> Tambah Baru
                        </button>
                    </div>
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <input
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            placeholder="Judul Kegiatan"
                        />
                        <div className="flex items-center gap-3 md:col-span-2">
                            <input
                                value={form.imageUrl || ''}
                                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                placeholder="URL Gambar"
                            />
                            <label className="flex cursor-pointer items-center justify-center rounded-xl border border-emerald-600 px-3 text-emerald-600">
                                <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                                <Upload size={14} />
                            </label>
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4" />
                            Aktif
                        </label>
                        <button onClick={handleSubmit} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white">
                            <Save size={16} /> Simpan
                        </button>
                    </div>
                </div>

                <div className="rounded-3xl border border-emerald-900/20 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <div className="space-y-3">
                        {items.map((item) => (
                            <div key={item.id} className="flex items-start justify-between gap-4 rounded-2xl border border-emerald-900/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-16 overflow-hidden rounded-xl bg-gray-100">
                                        {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />}
                                    </div>
                                    <p className="text-sm font-semibold">{item.title}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleEdit(item)} className="rounded-lg border border-emerald-600 px-3 py-1 text-xs text-emerald-600">Edit</button>
                                    <button onClick={() => handleDelete(item.id)} className="rounded-lg border border-red-500 px-3 py-1 text-xs text-red-500"><Trash2 size={12} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminKegiatanPage;
