'use client';

import React, { useEffect, useState } from 'react';
import SidebarAdmin from '@/components/sidebar-admin';
import { Plus, Save, Trash2, Upload } from 'lucide-react';
import { api } from '@/lib/api';

type NewsForm = {
    id?: number;
    title: string;
    slug: string;
    date: string;
    excerpt: string;
    content: string;
    thumbnailUrl?: string | null;
    category: string;
    isPublished: boolean;
};

const DEFAULT_FORM: NewsForm = {
    title: '',
    slug: '',
    date: new Date().toISOString().slice(0, 10),
    excerpt: '',
    content: '',
    thumbnailUrl: '',
    category: 'Umum',
    isPublished: true,
};

const AdminBeritaPage: React.FC = () => {
    const [items, setItems] = useState<NewsForm[]>([]);
    const [form, setForm] = useState<NewsForm>(DEFAULT_FORM);
    const [editingId, setEditingId] = useState<number | null>(null);

    const fetchItems = async () => {
        const res = await fetch('/api/admin/news');
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleSubmit = async () => {
        const payload = {
            ...form,
            date: form.date ? new Date(form.date).toISOString() : new Date().toISOString(),
        };
        const url = editingId ? `/api/admin/news/${editingId}` : '/api/admin/news';
        const method = editingId ? 'PUT' : 'POST';
        await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        setForm(DEFAULT_FORM);
        setEditingId(null);
        fetchItems();
    };

    const handleEdit = (item: any) => {
        setEditingId(item.id || null);
        setForm({
            id: item.id,
            title: item.title || '',
            slug: item.slug || '',
            date: item.date ? item.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
            excerpt: item.excerpt || '',
            content: item.content || '',
            thumbnailUrl: item.thumbnailUrl || '',
            category: item.category || 'Umum',
            isPublished: item.isPublished ?? true,
        });
    };

    const handleDelete = async (id?: number) => {
        if (!id) return;
        await fetch(`/api/admin/news/${id}`, { method: 'DELETE' });
        fetchItems();
    };

    const handleUpload = async (file: File) => {
        const res = await api.upload.media(file, 'mis-al-falah/news');
        setForm((prev) => ({ ...prev, thumbnailUrl: res.url }));
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors dark:bg-[#0B0F0C] dark:text-gray-100">
            <SidebarAdmin />
            <main className="min-h-screen px-6 py-10 lg:pl-80 space-y-8">
                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">Kelola Berita</h2>
                        <button onClick={() => { setForm(DEFAULT_FORM); setEditingId(null); }} className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 px-4 py-2 text-sm text-emerald-600">
                            <Plus size={16} /> Tambah Baru
                        </button>
                    </div>
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30" placeholder="Judul" />
                        <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30" placeholder="slug-berita" />
                        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30" />
                        <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30" placeholder="Kategori" />
                        <div className="flex items-center gap-3 md:col-span-2">
                            <input value={form.thumbnailUrl || ''} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30" placeholder="URL Thumbnail" />
                            <label className="flex cursor-pointer items-center justify-center rounded-xl border border-emerald-600 px-3 text-emerald-600">
                                <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                                <Upload size={14} />
                            </label>
                        </div>
                        <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm md:col-span-2 dark:border-white/10 dark:bg-black/30" rows={3} placeholder="Ringkasan" />
                        <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm md:col-span-2 dark:border-white/10 dark:bg-black/30" rows={6} placeholder="Konten berita" />
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} className="h-4 w-4" />
                            Publikasikan
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
                                <div>
                                    <p className="text-sm font-semibold">{item.title}</p>
                                    <p className="text-xs text-gray-500">{item.category} · {item.slug}</p>
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

export default AdminBeritaPage;
