'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SidebarAdmin from '@/components/sidebar-admin';
import HeaderAdmin from '@/components/header-admin';
import { 
    Plus, Save, Shield, Trash2, UserRound, 
    Edit2, X, RefreshCcw, CheckCircle2, AlertCircle,
    User, Mail, Phone, Lock, KeyRound, ServerCrash
} from 'lucide-react';

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
    const [saving, setSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

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
        try {
            const res = await fetch('/api/admin/admin-users');
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json.error || 'Gagal memuat data admin');
            }
            const data = await res.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (err: any) {
             setMessage({ text: err.message || 'Gagal memuat data admin', type: 'error' });
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

    const openAddModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (user: AdminUser) => {
        setEditingId(user.id);
        setForm({
            username: user.username || '',
            fullName: user.fullName || '',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role || 'admin',
            password: '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        setSaving(true);
        setMessage(null);
        if (!form.username.trim() || !form.fullName.trim()) {
            setMessage({ text: 'Username dan nama lengkap wajib diisi.', type: 'error' });
            setSaving(false);
            return;
        }
        if (!editingId && !form.password.trim()) {
            setMessage({ text: 'Password wajib diisi untuk akun baru.', type: 'error' });
            setSaving(false);
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
            setIsModalOpen(false);
            setMessage({ text: isEditing ? 'Akun berhasil diperbarui.' : 'Akun berhasil dibuat.', type: 'success' });
            setTimeout(() => setMessage(null), 4000);
        } catch (err: any) {
            setMessage({ text: err.message || 'Gagal menyimpan akun', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, rolex: string) => {
        if (rolex === 'superadmin') {
            alert('Aksi ditolak: Superadmin principal tidak dapat dicabut hak aksesnya.');
            return;
        }
        if (!window.confirm('Hapus akses admin ini secara permanen?')) return;
        try {
            const res = await fetch(`/api/admin/admin-users/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json.error || 'Gagal menghapus akun');
            }
            await fetchUsers();
            setMessage({ text: 'Protokol eliminasi akun berhasil.', type: 'success' });
        } catch (err: any) {
            setMessage({ text: err.message || 'Gagal menghapus akun', type: 'error' });
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080B09] text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">
            <SidebarAdmin />
            <main className="min-h-screen lg:pl-64 pb-24">
                <HeaderAdmin 
                    title="Access Control Room"
                    subtitle="Manajemen hak akses, autentikasi, dan otorisasi kontrol panel"
                    action={
                        <div className="bg-rose-500/10 dark:bg-rose-500/10 px-8 py-3 rounded-2xl flex items-center gap-4 border border-rose-500/20 shadow-inner group overflow-hidden relative text-rose-600">
                             <div className="absolute inset-0 bg-rose-500/5 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            <Shield size={18} className="animate-pulse" />
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black tracking-[0.2em] uppercase leading-none mb-1">Security Level</span>
                                <span className="text-[8px] font-black tracking-widest uppercase leading-none italic">ROOT ACCESS</span>
                            </div>
                        </div>
                    }
                />

                <section className="px-4 sm:px-10 mt-12 max-w-7xl mx-auto space-y-10">
                    {role && role !== 'superadmin' ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-32 text-center bg-white/70 dark:bg-[#151b18]/80 backdrop-blur-3xl rounded-[4rem] border border-red-500/20 shadow-3xl overflow-hidden"
                        >
                            <div className="w-32 h-32 bg-red-50 dark:bg-red-500/10 rounded-[3rem] flex items-center justify-center text-red-500 mb-8 shadow-inner ring-4 ring-red-500/5">
                                <ServerCrash size={56} className="animate-pulse" />
                            </div>
                            <h4 className="text-2xl font-black font-fraunces text-gray-900 dark:text-white uppercase tracking-tight mb-2">Akses Ditolak</h4>
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest max-w-md leading-relaxed">
                                Terminal ini memerlukan otorisasi <span className="text-red-500">Superadmin</span>. Endpoint administrasi lokal tidak memiliki yurisdiksi.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/70 dark:bg-[#151b18]/80 backdrop-blur-3xl rounded-[4rem] border border-white dark:border-white/10 shadow-3xl overflow-hidden"
                        >
                            <div className="p-10 lg:p-14 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-white/50 dark:bg-transparent">
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-[1.75rem] text-emerald-600 shadow-inner ring-4 ring-emerald-500/5">
                                        <KeyRound size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none mb-2">Administrator Nodes</h2>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] italic">
                                            Daftar entitas otonom ({users.length})
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={openAddModal}
                                    className="inline-flex items-center gap-4 bg-emerald-600 text-white px-8 py-4 rounded-[1.75rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-500/30 hover:bg-emerald-500 hover:-translate-y-1 active:scale-95 group"
                                >
                                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" /> ATTACH NEW ADMIN
                                </button>
                            </div>

                            <div className="p-10 lg:p-14">
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    <AnimatePresence mode="popLayout">
                                        {loading ? (
                                            <div className="col-span-full flex flex-col items-center justify-center py-20 animate-pulse">
                                                <RefreshCcw size={48} className="text-emerald-500 animate-spin mb-4" />
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scanning Authorization Nodes...</p>
                                            </div>
                                        ) : users.length === 0 ? (
                                             <div className="col-span-full text-center py-20">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Directory Empty</p>
                                             </div>
                                        ) : (
                                            users.map((user, idx) => (
                                                <motion.div 
                                                    key={user.id}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className={`group/card relative overflow-hidden rounded-[3rem] border border-gray-100 dark:border-white/5 p-8 transition-all hover:shadow-2xl hover:-translate-y-1 shadow-xl shadow-gray-200/20 flex flex-col justify-between ${user.role === 'superadmin' ? 'bg-amber-50/50 dark:bg-amber-500/5' : 'bg-white dark:bg-white/5'}`}
                                                >
                                                    <div>
                                                        <div className="flex items-center justify-between mb-8">
                                                            <div className={`p-4 rounded-[1.75rem] shadow-inner ${user.role === 'superadmin' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10'}`}>
                                                                {user.role === 'superadmin' ? <Shield size={24} /> : <UserRound size={24} />}
                                                            </div>
                                                            <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${user.role === 'superadmin' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>
                                                                {user.role}
                                                            </span>
                                                        </div>

                                                        <h3 className="text-xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-tight mb-2 line-clamp-1">{user.fullName}</h3>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">@{user.username}</p>

                                                        <div className="space-y-3 mb-8">
                                                            <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                                                                <Mail size={14} className="opacity-50" /> {user.email || 'NO_MAIL_ROUTING'}
                                                            </div>
                                                            <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                                                                <Phone size={14} className="opacity-50" /> {user.phone || 'NO_COMMLINK'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/5">
                                                        <button 
                                                            onClick={() => openEditModal(user)}
                                                            className="flex-1 py-3 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white"
                                                        >
                                                            <Edit2 size={14} /> CONFIGURE
                                                        </button>
                                                        <button 
                                                             onClick={() => handleDelete(user.id, user.role)}
                                                             disabled={user.role === 'superadmin'}
                                                            className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </section>
            </main>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-[#080B09]/80 backdrop-blur-xl"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-4xl bg-white/90 dark:bg-[#151b18]/90 backdrop-blur-3xl rounded-[4rem] border border-white dark:border-white/10 shadow-3xl overflow-hidden font-sans"
                        >
                            <div className="p-10 lg:p-14 overflow-y-auto max-h-[90vh] custom-scrollbar">
                                <div className="flex items-center justify-between mb-16">
                                     <div className="flex items-center gap-6">
                                        <div className="p-4 bg-emerald-600 rounded-3xl text-white shadow-2xl shadow-emerald-600/20">
                                            <Shield size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none mb-2">
                                                {editingId ? 'Modify User Privilege' : 'Initialize Administrator'}
                                            </h3>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none px-1">Registrasi identitas kontrol panel</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-50 dark:bg-black/40 hover:bg-red-500 hover:text-white transition-all border border-gray-100 dark:border-white/5 active:scale-90"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="grid lg:grid-cols-2 gap-12">
                                    <div className="space-y-10">
                                        <div className="space-y-4 group">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4 flex items-center gap-3 transition-colors group-focus-within:text-emerald-500">
                                                <User size={12} /> FULL IDENTITY NAME
                                            </label>
                                            <input
                                                value={form.fullName}
                                                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                                className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/40 px-6 py-5 text-sm font-black text-gray-950 dark:text-white focus:ring-4 focus:ring-emerald-500/5 outline-none shadow-inner transition-all border-emerald-500/0 focus:border-emerald-500"
                                                placeholder="Nama Lengkap Operator"
                                            />
                                        </div>
                                        <div className="space-y-4 group">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4 flex items-center gap-3 transition-colors group-focus-within:text-emerald-500">
                                                <UserRound size={12} /> USERNAME (LOGIN ID)
                                            </label>
                                            <input
                                                value={form.username}
                                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                                className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/40 px-6 py-5 text-sm font-black text-gray-950 dark:text-white focus:ring-4 focus:ring-emerald-500/5 outline-none shadow-inner transition-all border-emerald-500/0 focus:border-emerald-500"
                                                placeholder="admin.utama"
                                            />
                                        </div>
                                        <div className="space-y-4 group">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4 flex items-center gap-3 transition-colors group-focus-within:text-emerald-500">
                                                <Lock size={12} /> ENCRYPTED PASSWORD
                                            </label>
                                            <input
                                                type="password"
                                                value={form.password}
                                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                                className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/40 px-6 py-5 text-sm font-black text-gray-950 dark:text-white focus:ring-4 focus:ring-emerald-500/5 outline-none shadow-inner transition-all border-emerald-500/0 focus:border-emerald-500"
                                                placeholder={editingId ? 'Biarkan kosong jika tidak ingin diubah' : 'Kata Sandi Kuat'}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-10">
                                        <div className="grid grid-cols-2 gap-6 p-6 bg-gray-50/50 dark:bg-black/40 rounded-[2.5rem] border border-gray-100 dark:border-white/5">
                                            <button
                                                type="button"
                                                onClick={() => setForm({ ...form, role: 'admin' })}
                                                className={`p-6 rounded-2xl flex flex-col items-center gap-4 transition-all ${form.role === 'admin' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'bg-white dark:bg-white/5 text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'}`}
                                            >
                                                <UserRound size={24} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">ADMIN TIER</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setForm({ ...form, role: 'superadmin' })}
                                                className={`p-6 rounded-2xl flex flex-col items-center gap-4 transition-all ${form.role === 'superadmin' ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/20' : 'bg-white dark:bg-white/5 text-gray-400 hover:bg-amber-50 dark:hover:bg-amber-500/10'}`}
                                            >
                                                <Shield size={24} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">ROOT LEVEL</span>
                                            </button>
                                        </div>

                                        <div className="space-y-4 group">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4 flex items-center gap-3 transition-colors group-focus-within:text-emerald-500">
                                                <Mail size={12} /> MAIL ROUTING ID
                                            </label>
                                            <input
                                                value={form.email}
                                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/40 px-6 py-5 text-sm font-black text-gray-950 dark:text-white focus:ring-4 focus:ring-emerald-500/5 outline-none shadow-inner transition-all border-emerald-500/0 focus:border-emerald-500"
                                                placeholder="admin@mialfalah.sch.id (opsional)"
                                            />
                                        </div>
                                        <div className="space-y-4 group">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4 flex items-center gap-3 transition-colors group-focus-within:text-emerald-500">
                                                <Phone size={12} /> SECURE COMMLINK
                                            </label>
                                            <input
                                                value={form.phone}
                                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                                className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/40 px-6 py-5 text-sm font-black text-gray-950 dark:text-white focus:ring-4 focus:ring-emerald-500/5 outline-none shadow-inner transition-all border-emerald-500/0 focus:border-emerald-500"
                                                placeholder="08xxxxxxxx (opsional)"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-20 flex flex-col sm:flex-row items-center justify-end gap-6 border-t border-gray-100 dark:border-white/5 pt-12">
                                    <button 
                                        onClick={() => setIsModalOpen(false)}
                                        className="w-full sm:w-auto px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-100 dark:hover:bg-black/40 transition-all font-sans"
                                    >
                                        ABORT
                                    </button>
                                    <button 
                                        onClick={handleSubmit}
                                        disabled={saving}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-4 bg-emerald-600 text-white px-14 py-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-emerald-500/30 hover:bg-emerald-500 hover:-translate-y-1 active:scale-95 disabled:opacity-50 transition-all font-sans"
                                    >
                                        {saving ? (
                                            <>
                                                <RefreshCcw size={18} className="animate-spin" />
                                                SYNCHRONIZING...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 size={18} />
                                                DEPLOY USER
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {message && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md px-4"
                    >
                        <div className={`p-6 rounded-[2rem] border shadow-3xl backdrop-blur-3xl flex items-center gap-4 ${message.type === 'success' ? 'bg-emerald-600/90 border-emerald-400/50 text-white' : 'bg-red-600/90 border-red-400/50 text-white'}`}>
                            {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                            <p className="text-[11px] font-black uppercase tracking-widest">{message.text}</p>
                            <button onClick={() => setMessage(null)} className="ml-auto p-2 rounded-lg hover:bg-white/10">
                                <X size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default KontrolAkunPage;
