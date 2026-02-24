'use client';

import React, { useEffect, useState } from 'react';
import SidebarAdmin from '@/components/sidebar-admin';
import { Plus, Save, Shield, Trash2, UserRound } from 'lucide-react';

type AdminUser = {
    id: string;
    username: string;
    role: 'admin' | 'superadmin';
    fullName: string;
    email?: string | null;
    phone?: string | null;
    createdAt?: string;
    updatedAt?: string;
};

type AdminForm = {
    username: string;
    fullName: string;
    email: string;
    phone: string;
    role: 'admin' | 'superadmin';
    password: string;
};

const DEFAULT_FORM: AdminForm = {
    username: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'admin',
    password: '',
};

const KontrolAkunPage: React.FC = () => {
    const [role, setRole] = useState<string | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [form, setForm] = useState<AdminForm>(DEFAULT_FORM);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('adminUser');
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as { role?: string };
                setRole(parsed.role || null);
            } catch {
                setRole(null);
            }
        }
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch('/api/admin/admin-users');
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json.error || 'Gagal memuat data admin');
            }
            const data = await res.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setMessage(err.message || 'Gagal memuat data admin');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (role === 'superadmin') {
            fetchUsers();
        }
    }, [role]);

    const resetForm = () => {
        setForm(DEFAULT_FORM);
        setEditingId(null);
    };

    const handleSubmit = async () => {
        setMessage(null);
        if (!form.username.trim() || !form.fullName.trim()) {
            setMessage('Username dan nama lengkap wajib diisi.');
            return;
        }
        if (!editingId && !form.password.trim()) {
            setMessage('Password wajib diisi untuk akun baru.');
            return;
        }

        const isEditing = Boolean(editingId);
        const payload = {
            username: form.username.trim(),
            fullName: form.fullName.trim(),
            email: form.email.trim() || null,
            phone: form.phone.trim() || null,
            role: form.role,
            password: form.password.trim(),
        };

        const url = editingId ? `/api/admin/admin-users/${editingId}` : '/api/admin/admin-users';
        const method = editingId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json.error || 'Gagal menyimpan akun');
            }
            await fetchUsers();
            resetForm();
            setMessage(isEditing ? 'Akun berhasil diperbarui.' : 'Akun berhasil dibuat.');
        } catch (err: any) {
            setMessage(err.message || 'Gagal menyimpan akun');
        }
    };

    const handleEdit = (user: AdminUser) => {
        setEditingId(user.id);
        setForm({
            username: user.username || '',
            fullName: user.fullName || '',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role || 'admin',
            password: '',
        });
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Hapus akun ini?')) return;
        try {
            const res = await fetch(`/api/admin/admin-users/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json.error || 'Gagal menghapus akun');
            }
            await fetchUsers();
        } catch (err: any) {
            setMessage(err.message || 'Gagal menghapus akun');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors dark:bg-[#0B0F0C] dark:text-gray-100">
            <SidebarAdmin />
            <main className="min-h-screen px-6 py-10 lg:pl-80 space-y-8">
                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-emerald-600/80">Superadmin</p>
                            <h1 className="mt-2 text-2xl font-semibold">Kontrol Akun</h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                                Kelola akun admin dan superadmin dari tabel `admin_publicweb`.
                            </p>
                        </div>
                        <button
                            onClick={resetForm}
                            className="inline-flex items-center gap-2 rounded-xl border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-600"
                        >
                            <Plus size={16} /> Tambah Baru
                        </button>
                    </div>
                </div>

                {role && role !== 'superadmin' ? (
                    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-700 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-100">
                        Halaman ini hanya bisa diakses oleh superadmin.
                    </div>
                ) : (
                    <>
                        <div className="rounded-3xl border border-emerald-900/20 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                            <div className="grid gap-4 md:grid-cols-2">
                                <input
                                    value={form.username}
                                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                    placeholder="Username"
                                />
                                <input
                                    value={form.fullName}
                                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                    placeholder="Nama Lengkap"
                                />
                                <input
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                    placeholder="Email"
                                />
                                <input
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                    placeholder="Nomor HP"
                                />
                                <select
                                    value={form.role}
                                    onChange={(e) => setForm({ ...form, role: e.target.value as 'admin' | 'superadmin' })}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="superadmin">Superadmin</option>
                                </select>
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                    placeholder={editingId ? 'Password baru (opsional)' : 'Password'}
                                />
                            </div>

                            <div className="mt-4 flex items-center gap-3">
                                <button
                                    onClick={handleSubmit}
                                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white"
                                >
                                    <Save size={16} /> {editingId ? 'Update' : 'Simpan'}
                                </button>
                                {message && (
                                    <span className="text-sm text-emerald-700">{message}</span>
                                )}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-emerald-900/20 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold">Daftar Akun</h2>
                                {loading && <span className="text-xs text-emerald-600">Memuat...</span>}
                            </div>
                            <div className="mt-4 space-y-3">
                                {users.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex flex-col gap-3 rounded-2xl border border-emerald-900/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5 md:flex-row md:items-center md:justify-between"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-0.5 rounded-xl p-2 ${user.role === 'superadmin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {user.role === 'superadmin' ? <Shield size={18} /> : <UserRound size={18} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                                    {user.fullName}
                                                </p>
                                                <p className="text-[11px] text-gray-500">@{user.username}</p>
                                                <p className="text-[11px] text-gray-400">
                                                    {user.email || '-'} · {user.phone || '-'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.role === 'superadmin' ? 'bg-amber-200/60 text-amber-800' : 'bg-emerald-100 text-emerald-700'}`}>
                                                {user.role.toUpperCase()}
                                            </span>
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="rounded-lg border border-emerald-600 px-3 py-1 text-xs text-emerald-600"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1 text-xs text-red-500"
                                            >
                                                <Trash2 size={12} /> Hapus
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {users.length === 0 && !loading && (
                                    <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                                        Belum ada akun admin.
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default KontrolAkunPage;
