'use client';

import React, { useEffect, useState } from 'react';
import SidebarAdmin from '@/components/sidebar-admin';

type AdminUser = {
    id: string;
    username: string;
    role: string;
    fullName?: string;
    email?: string | null;
    phone?: string | null;
};

const AkunAdminPage: React.FC = () => {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/admin/account', { cache: 'no-store' });
                const json = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error(json.error || 'Gagal memuat akun');
                }
                if (!active) return;

                const account = json as AdminUser;
                setUser(account);
                setForm({
                    fullName: account.fullName || '',
                    email: account.email || '',
                    phone: account.phone || '',
                    password: '',
                });

                const raw = localStorage.getItem('adminUser');
                if (raw) {
                    try {
                        const localUser = JSON.parse(raw) as AdminUser;
                        localStorage.setItem(
                            'adminUser',
                            JSON.stringify({
                                ...localUser,
                                fullName: account.fullName || localUser.fullName || '',
                                email: account.email ?? null,
                                phone: account.phone ?? null,
                            })
                        );
                    } catch {
                        // ignore local storage parse errors
                    }
                }
            } catch (err) {
                if (active) {
                    setError(err instanceof Error ? err.message : 'Gagal memuat akun');
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        load();
        return () => {
            active = false;
        };
    }, []);

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage(null);
        setError(null);
        setSaving(true);
        try {
            const res = await fetch('/api/admin/account', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: form.fullName,
                    email: form.email,
                    phone: form.phone,
                    password: form.password || undefined,
                }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(json.error || 'Gagal menyimpan perubahan');
            }

            const updated = json as AdminUser;
            setUser(updated);
            setForm((prev) => ({ ...prev, password: '' }));
            setMessage('Perubahan akun berhasil disimpan.');

            const raw = localStorage.getItem('adminUser');
            if (raw) {
                try {
                    const localUser = JSON.parse(raw) as AdminUser;
                    localStorage.setItem(
                        'adminUser',
                        JSON.stringify({
                            ...localUser,
                            fullName: updated.fullName || localUser.fullName || '',
                            email: updated.email ?? null,
                            phone: updated.phone ?? null,
                        })
                    );
                } catch {
                    // ignore local storage parse errors
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal menyimpan perubahan');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#0B0F0C] dark:text-white">
            <SidebarAdmin />
            <main className="min-h-screen px-6 py-10 lg:pl-80">
                <section className="mx-auto max-w-3xl rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">Akun</p>
                    <h1 className="mt-2 text-2xl font-bold">Profil</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        Kelola profil akun yang sedang login.
                    </p>

                    {loading ? (
                        <p className="mt-6 text-sm text-gray-600 dark:text-gray-300">Memuat data akun...</p>
                    ) : (
                        <form onSubmit={onSubmit} className="mt-6 grid gap-4 text-sm">
                            <div className="grid gap-1">
                                <label className="font-semibold text-gray-700 dark:text-gray-200">Username</label>
                                <input
                                    value={user?.username || ''}
                                    disabled
                                    className="rounded-xl border border-emerald-900/10 bg-gray-100 px-4 py-3 text-gray-500 outline-none dark:border-white/10 dark:bg-white/10 dark:text-gray-300"
                                />
                            </div>

                            <div className="grid gap-1">
                                <label className="font-semibold text-gray-700 dark:text-gray-200">Role</label>
                                <input
                                    value={(user?.role || '-').toUpperCase()}
                                    disabled
                                    className="rounded-xl border border-emerald-900/10 bg-gray-100 px-4 py-3 text-gray-500 outline-none dark:border-white/10 dark:bg-white/10 dark:text-gray-300"
                                />
                            </div>

                            <div className="grid gap-1">
                                <label htmlFor="fullName" className="font-semibold text-gray-700 dark:text-gray-200">Nama Lengkap</label>
                                <input
                                    id="fullName"
                                    value={form.fullName}
                                    onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                                    className="rounded-xl border border-emerald-900/10 bg-white px-4 py-3 outline-none ring-emerald-500 focus:ring-2 dark:border-white/10 dark:bg-white/5"
                                    required
                                />
                            </div>

                            <div className="grid gap-1">
                                <label htmlFor="email" className="font-semibold text-gray-700 dark:text-gray-200">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                                    className="rounded-xl border border-emerald-900/10 bg-white px-4 py-3 outline-none ring-emerald-500 focus:ring-2 dark:border-white/10 dark:bg-white/5"
                                    placeholder="email@contoh.com"
                                />
                            </div>

                            <div className="grid gap-1">
                                <label htmlFor="phone" className="font-semibold text-gray-700 dark:text-gray-200">No. HP</label>
                                <input
                                    id="phone"
                                    value={form.phone}
                                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                                    className="rounded-xl border border-emerald-900/10 bg-white px-4 py-3 outline-none ring-emerald-500 focus:ring-2 dark:border-white/10 dark:bg-white/5"
                                    placeholder="08xxxxxxxxxx"
                                />
                            </div>

                            <div className="grid gap-1">
                                <label htmlFor="password" className="font-semibold text-gray-700 dark:text-gray-200">Password Baru (opsional)</label>
                                <input
                                    id="password"
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                                    className="rounded-xl border border-emerald-900/10 bg-white px-4 py-3 outline-none ring-emerald-500 focus:ring-2 dark:border-white/10 dark:bg-white/5"
                                    placeholder="Kosongkan jika tidak diubah"
                                />
                            </div>

                            {error && (
                                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200">
                                    {error}
                                </p>
                            )}
                            {message && (
                                <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                                    {message}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={saving}
                                className="mt-2 inline-flex w-fit items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </form>
                    )}
                </section>
            </main>
        </div>
    );
};

export default AkunAdminPage;
