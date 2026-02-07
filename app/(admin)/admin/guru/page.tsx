'use client';

import React, { useEffect, useState } from 'react';
import SidebarAdmin from '@/components/sidebar-admin';
import { Plus, Save, Trash2, Upload } from 'lucide-react';
import { api } from '@/lib/api';

type TeacherForm = {
    id?: number;
    name: string;
    position: string;
    imageUrl?: string | null;
    isActive: boolean;
};

const DEFAULT_FORM: TeacherForm = {
    name: '',
    position: '',
    imageUrl: '',
    isActive: true,
};

const AdminGuruPage: React.FC = () => {
    const [items, setItems] = useState<TeacherForm[]>([]);
    const [form, setForm] = useState<TeacherForm>(DEFAULT_FORM);
    const [editingId, setEditingId] = useState<number | null>(null);

    const fetchItems = async () => {
        const res = await fetch('/api/admin/teachers');
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleSubmit = async () => {
        const payload = { ...form };
        const url = editingId ? `/api/admin/teachers/${editingId}` : '/api/admin/teachers';
        const method = editingId ? 'PUT' : 'POST';
        await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        setForm(DEFAULT_FORM);
        setEditingId(null);
        fetchItems();
    };

    const handleEdit = (item: TeacherForm) => {
        setEditingId(item.id || null);
        setForm(item);
    };

    const handleDelete = async (id?: number) => {
        if (!id) return;
        await fetch(`/api/admin/teachers/${id}`, { method: 'DELETE' });
        fetchItems();
    };

    const handleUpload = async (file: File) => {
        try {
            const res = await api.upload.media(file, 'mis-al-falah/teachers');
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
                        <h2 className="text-2xl font-semibold">Kelola Guru</h2>
                        <button onClick={() => { setForm(DEFAULT_FORM); setEditingId(null); }} className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 px-4 py-2 text-sm text-emerald-600">
                            <Plus size={16} /> Tambah Baru
                        </button>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            placeholder="Nama"
                        />
                        <input
                            value={form.position}
                            onChange={(e) => setForm({ ...form, position: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            placeholder="Jabatan"
                        />
                        <div className="flex items-center gap-3 md:col-span-2">
                            <input
                                value={form.imageUrl || ''}
                                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                placeholder="URL Foto"
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
                                    <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-100">
                                        {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">{item.name}</p>
                                        <p className="text-xs text-gray-500">{item.position}</p>
                                    </div>
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

export default AdminGuruPage;
