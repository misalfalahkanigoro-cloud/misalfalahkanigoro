'use client';

import React, { useEffect, useState } from 'react';
import SidebarAdmin from '@/components/sidebar-admin';
import { Plus, Save, Trash2, Upload } from 'lucide-react';
import { api } from '@/lib/api';

type DownloadForm = {
    id?: number;
    title: string;
    category: string;
    date: string;
    size: string;
    fileType: string;
    fileUrl: string;
    isActive: boolean;
};

const DEFAULT_FORM: DownloadForm = {
    title: '',
    category: 'Umum',
    date: new Date().toISOString().slice(0, 10),
    size: '',
    fileType: 'PDF',
    fileUrl: '',
    isActive: true,
};

const AdminDownloadPage: React.FC = () => {
    const [items, setItems] = useState<DownloadForm[]>([]);
    const [form, setForm] = useState<DownloadForm>(DEFAULT_FORM);
    const [editingId, setEditingId] = useState<number | null>(null);

    const fetchItems = async () => {
        const res = await fetch('/api/admin/download-files');
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
        const url = editingId ? `/api/admin/download-files/${editingId}` : '/api/admin/download-files';
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
            category: item.category || 'Umum',
            date: item.date ? item.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
            size: item.size || '',
            fileType: item.fileType || 'PDF',
            fileUrl: item.fileUrl || '',
            isActive: item.isActive ?? true,
        });
    };

    const handleDelete = async (id?: number) => {
        if (!id) return;
        await fetch(`/api/admin/download-files/${id}`, { method: 'DELETE' });
        fetchItems();
    };

    const handleUpload = async (file: File) => {
        const res = await api.upload.file(file, 'downloads');
        setForm((prev) => ({ ...prev, fileUrl: res.url }));
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors dark:bg-[#0B0F0C] dark:text-gray-100">
            <SidebarAdmin />
            <main className="min-h-screen px-6 py-10 lg:pl-80 space-y-8">
                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">Kelola Download</h2>
                        <button onClick={() => { setForm(DEFAULT_FORM); setEditingId(null); }} className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 px-4 py-2 text-sm text-emerald-600">
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
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            placeholder="Kategori"
                        />
                        <input
                            type="date"
                            value={form.date}
                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                        />
                        <input
                            value={form.size}
                            onChange={(e) => setForm({ ...form, size: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            placeholder="Ukuran (contoh: 1.2 MB)"
                        />
                        <select
                            value={form.fileType}
                            onChange={(e) => setForm({ ...form, fileType: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                        >
                            <option value="PDF">PDF</option>
                            <option value="DOCX">DOCX</option>
                            <option value="XLSX">XLSX</option>
                        </select>
                        <div className="flex items-center gap-3 md:col-span-2">
                            <input
                                value={form.fileUrl}
                                onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                placeholder="URL File"
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
                                <div>
                                    <p className="text-sm font-semibold">{item.title}</p>
                                    <p className="text-xs text-gray-500">{item.category} · {item.fileType}</p>
                                    <p className="text-[11px] text-emerald-600">{item.fileUrl}</p>
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

export default AdminDownloadPage;
