'use client';

import React, { useEffect, useMemo, useState } from 'react';
import SidebarAdmin from '@/components/sidebar-admin';
import { Plus, Save, Trash2, Search, Users, Edit, X } from 'lucide-react';
import CloudinaryButton from '@/components/admin/CloudinaryButton';

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
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/teachers');
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleSubmit = async () => {
        if (!form.name.trim()) return alert('Nama guru wajib diisi');
        setSaving(true);
        try {
            const payload = { ...form, name: form.name.trim(), position: form.position.trim() };
            const url = editingId ? `/api/admin/teachers/${editingId}` : '/api/admin/teachers';
            const method = editingId ? 'PUT' : 'POST';
            await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            setForm(DEFAULT_FORM);
            setEditingId(null);
            setModalOpen(false);
            fetchItems();
        } finally {
            setSaving(false);
        }
    };

    const openCreate = () => {
        setForm(DEFAULT_FORM);
        setEditingId(null);
        setModalOpen(true);
    };

    const openEdit = (item: TeacherForm) => {
        setEditingId(item.id || null);
        setForm(item);
        setModalOpen(true);
    };

    const handleDelete = async (id?: number) => {
        if (!id) return;
        if (!confirm('Apakah Anda yakin ingin menghapus data guru ini?')) return;
        await fetch(`/api/admin/teachers/${id}`, { method: 'DELETE' });
        fetchItems();
    };

    const handleUpload = (url: string) => {
        setForm((prev) => ({ ...prev, imageUrl: url }));
    };

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return items.filter((item) =>
            item.name.toLowerCase().includes(q) || item.position.toLowerCase().includes(q)
        );
    }, [items, search]);

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors dark:bg-[#0B0F0C] dark:text-gray-100">
            <SidebarAdmin />
            <main className="min-h-screen px-6 py-10 lg:pl-80 space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kelola Guru</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Data tenaga pengajar</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20"
                    >
                        <Plus size={18} /> Tambah Guru
                    </button>
                </div>

                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Cari guru..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition"
                        />
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-gray-500">Memuat data...</div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-2xl">
                            <Users className="mx-auto text-gray-300 mb-2" size={32} />
                            <p className="text-gray-500 font-medium">Belum ada data guru</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-4 md:hidden">
                                {filtered.map((item) => (
                                    <div key={item.id} className="rounded-2xl border border-emerald-900/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                                        <div className="flex items-start gap-3">
                                            <div className="h-14 w-14 rounded-xl bg-gray-100 overflow-hidden dark:bg-white/10">
                                                {item.imageUrl ? (
                                                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                        <Users size={18} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-bold text-gray-900 dark:text-white line-clamp-1">{item.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{item.position}</p>
                                                <div className="mt-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.isActive
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                                        {item.isActive ? 'Aktif' : 'Nonaktif'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-end gap-2">
                                            <button onClick={() => openEdit(item)} className="p-2 text-blue-400 hover:text-blue-600 transition" title="Edit">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2 text-red-400 hover:text-red-600 transition" title="Hapus">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-white/5 text-gray-500">
                                            <th className="px-4 py-3 font-semibold">Guru</th>
                                            <th className="px-4 py-3 font-semibold">Jabatan</th>
                                            <th className="px-4 py-3 font-semibold">Status</th>
                                            <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                        {filtered.map((item) => (
                                            <tr key={item.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-12 w-12 rounded-xl bg-gray-100 overflow-hidden dark:bg-white/10">
                                                            {item.imageUrl ? (
                                                                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                                    <Users size={18} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="font-bold text-gray-900 dark:text-white line-clamp-1">{item.name}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-gray-600 dark:text-gray-300">{item.position}</td>
                                                <td className="px-4 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${item.isActive
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                                        {item.isActive ? 'Aktif' : 'Nonaktif'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => openEdit(item)} className="p-2 text-blue-400 hover:text-blue-600 transition" title="Edit">
                                                            <Edit size={16} />
                                                        </button>
                                                        <button onClick={() => handleDelete(item.id)} className="p-2 text-red-400 hover:text-red-600 transition" title="Hapus">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </main>

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-[#0B0F0C]">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{editingId ? 'Edit Guru' : 'Tambah Guru'}</p>
                                <h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">{editingId ? 'Perbarui Data Guru' : 'Data Guru Baru'}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Lengkapi data guru dengan benar.</p>
                            </div>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="h-10 w-10 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300"
                                title="Tutup"
                            >
                                <X size={18} className="mx-auto" />
                            </button>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nama</label>
                                <input
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                    placeholder="Nama lengkap"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Jabatan</label>
                                <input
                                    value={form.position}
                                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                    placeholder="Contoh: Wali Kelas 1A"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Foto</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        value={form.imageUrl || ''}
                                        onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                                        className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                        placeholder="URL foto"
                                    />
                                    <CloudinaryButton folder="mis-al-falah/teachers" label="Upload Foto" onUploaded={handleUpload} />
                                </div>
                                {form.imageUrl && (
                                    <div className="mt-3 h-24 w-24 overflow-hidden rounded-2xl border border-gray-100 dark:border-white/10">
                                        <img src={form.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                                    </div>
                                )}
                            </div>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-emerald-600"
                                />
                                Aktifkan tampil di publik
                            </label>
                        </div>

                        <div className="mt-6 flex flex-col gap-3">
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-70"
                            >
                                <Save size={16} /> {saving ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Simpan Guru')}
                            </button>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminGuruPage;
