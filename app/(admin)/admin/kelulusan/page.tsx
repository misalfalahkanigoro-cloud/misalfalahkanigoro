'use client';

import React, { useEffect, useState } from 'react';
import SidebarAdmin from '@/components/sidebar-admin';
import { Plus, Save, Trash2 } from 'lucide-react';

type GraduationForm = {
    id?: number;
    nisn: string;
    name: string;
    className: string;
    status: 'LULUS' | 'DITUNDA';
    averageScore: number;
    year: string;
};

const DEFAULT_FORM: GraduationForm = {
    nisn: '',
    name: '',
    className: '',
    status: 'LULUS',
    averageScore: 0,
    year: new Date().getFullYear().toString(),
};

const AdminKelulusanPage: React.FC = () => {
    const [items, setItems] = useState<GraduationForm[]>([]);
    const [form, setForm] = useState<GraduationForm>(DEFAULT_FORM);
    const [editingId, setEditingId] = useState<number | null>(null);

    const fetchItems = async () => {
        const res = await fetch('/api/admin/graduation-students');
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleSubmit = async () => {
        const url = editingId ? `/api/admin/graduation-students/${editingId}` : '/api/admin/graduation-students';
        const method = editingId ? 'PUT' : 'POST';
        await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        setForm(DEFAULT_FORM);
        setEditingId(null);
        fetchItems();
    };

    const handleEdit = (item: any) => {
        setEditingId(item.id || null);
        setForm({
            id: item.id,
            nisn: item.nisn || '',
            name: item.name || '',
            className: item.className || '',
            status: item.status || 'LULUS',
            averageScore: item.averageScore || 0,
            year: item.year || new Date().getFullYear().toString(),
        });
    };

    const handleDelete = async (id?: number) => {
        if (!id) return;
        await fetch(`/api/admin/graduation-students/${id}`, { method: 'DELETE' });
        fetchItems();
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors dark:bg-[#0B0F0C] dark:text-gray-100">
            <SidebarAdmin />
            <main className="min-h-screen px-6 py-10 lg:pl-80 space-y-8">
                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">Kelola Kelulusan</h2>
                        <button onClick={() => { setForm(DEFAULT_FORM); setEditingId(null); }} className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 px-4 py-2 text-sm text-emerald-600">
                            <Plus size={16} /> Tambah Baru
                        </button>
                    </div>
                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                        <input value={form.nisn} onChange={(e) => setForm({ ...form, nisn: e.target.value })} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30" placeholder="NISN" />
                        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30" placeholder="Nama" />
                        <input value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30" placeholder="Kelas" />
                        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as GraduationForm['status'] })} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30">
                            <option value="LULUS">LULUS</option>
                            <option value="DITUNDA">DITUNDA</option>
                        </select>
                        <input type="number" value={form.averageScore} onChange={(e) => setForm({ ...form, averageScore: Number(e.target.value) })} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30" placeholder="Nilai Rata-rata" />
                        <input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30" placeholder="Tahun" />
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
                                    <p className="text-sm font-semibold">{item.name} · {item.className}</p>
                                    <p className="text-xs text-gray-500">NISN: {item.nisn} · {item.year}</p>
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

export default AdminKelulusanPage;
