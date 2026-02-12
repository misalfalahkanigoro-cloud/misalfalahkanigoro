'use client';

import React, { useEffect, useState } from 'react';
import SidebarAdmin from '@/components/sidebar-admin';
import { ArrowDown, ArrowUp, Loader2, PencilLine, Plus, Save, Trash2, X } from 'lucide-react';

type Extracurricular = {
    id?: string | number;
    name: string;
    description: string;
    icon?: string | null;
    schedule?: string | null;
    coach_name?: string | null;
    display_order: number;
    is_active: boolean;
};

type CharacterProgram = {
    id?: string | number;
    name: string;
    description: string;
    icon?: string | null;
    frequency?: string | null;
    display_order: number;
    is_active: boolean;
};

const DEFAULT_EXTRACURRICULAR: Extracurricular = {
    name: '',
    description: '',
    icon: '',
    schedule: '',
    coach_name: '',
    display_order: 1,
    is_active: true,
};

const DEFAULT_CHARACTER: CharacterProgram = {
    name: '',
    description: '',
    icon: '',
    frequency: '',
    display_order: 1,
    is_active: true,
};

const ICON_OPTIONS = [
    'Activity',
    'Music',
    'PenTool',
    'Tent',
    'BookMarked',
    'Paintbrush',
    'Trophy',
    'Sunrise',
    'Heart',
    'BookOpen',
    'SmilePlus',
    'Zap',
];

const AdminKesiswaanPage: React.FC = () => {
    const [extracurriculars, setExtracurriculars] = useState<Extracurricular[]>([]);
    const [characterPrograms, setCharacterPrograms] = useState<CharacterProgram[]>([]);
    const [formEkskul, setFormEkskul] = useState<Extracurricular>(DEFAULT_EXTRACURRICULAR);
    const [formCharacter, setFormCharacter] = useState<CharacterProgram>(DEFAULT_CHARACTER);
    const [editingEkskul, setEditingEkskul] = useState<string | number | null>(null);
    const [editingCharacter, setEditingCharacter] = useState<string | number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [modal, setModal] = useState<'ekskul' | 'character' | null>(null);

    const fetchData = async () => {
        try {
            const [ekskulRes, characterRes] = await Promise.all([
                fetch('/api/admin/extracurriculars', { cache: 'no-store' }),
                fetch('/api/admin/character-programs', { cache: 'no-store' }),
            ]);
            const ekskulData = await ekskulRes.json();
            const characterData = await characterRes.json();
            setExtracurriculars(Array.isArray(ekskulData) ? ekskulData : []);
            setCharacterPrograms(Array.isArray(characterData) ? characterData : []);
        } catch (error) {
            console.error('Failed to fetch kesiswaan data:', error);
            setMessage({ type: 'error', text: 'Gagal memuat data kesiswaan.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openCreateEkskul = () => {
        setEditingEkskul(null);
        const nextOrder = extracurriculars.length + 1;
        setFormEkskul({ ...DEFAULT_EXTRACURRICULAR, display_order: nextOrder });
        setModal('ekskul');
    };

    const openEditEkskul = (item: Extracurricular) => {
        setEditingEkskul(item.id || null);
        setFormEkskul({ ...DEFAULT_EXTRACURRICULAR, ...item });
        setModal('ekskul');
    };

    const openCreateCharacter = () => {
        setEditingCharacter(null);
        const nextOrder = characterPrograms.length + 1;
        setFormCharacter({ ...DEFAULT_CHARACTER, display_order: nextOrder });
        setModal('character');
    };

    const openEditCharacter = (item: CharacterProgram) => {
        setEditingCharacter(item.id || null);
        setFormCharacter({ ...DEFAULT_CHARACTER, ...item });
        setModal('character');
    };

    const closeModal = () => {
        setModal(null);
    };

    const saveEkskul = async () => {
        setSaving(true);
        setMessage(null);
        const payload = {
            name: formEkskul.name,
            description: formEkskul.description,
            icon: formEkskul.icon,
            schedule: formEkskul.schedule,
            coachName: formEkskul.coach_name,
            displayOrder: formEkskul.display_order,
            isActive: formEkskul.is_active,
        };
        const url = editingEkskul ? `/api/admin/extracurriculars/${editingEkskul}` : '/api/admin/extracurriculars';
        const method = editingEkskul ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: 'Gagal menyimpan data ekskul.' }));
                throw new Error(err.error || 'Gagal menyimpan data ekskul.');
            }

            setFormEkskul(DEFAULT_EXTRACURRICULAR);
            setEditingEkskul(null);
            setModal(null);
            setMessage({ type: 'success', text: 'Data ekstrakurikuler berhasil disimpan.' });
            await fetchData();
        } catch (error) {
            const text = error instanceof Error ? error.message : 'Gagal menyimpan data ekskul.';
            setMessage({ type: 'error', text });
        } finally {
            setSaving(false);
        }
    };

    const saveCharacter = async () => {
        setSaving(true);
        setMessage(null);
        const payload = {
            name: formCharacter.name,
            description: formCharacter.description,
            icon: formCharacter.icon,
            frequency: formCharacter.frequency,
            displayOrder: formCharacter.display_order,
            isActive: formCharacter.is_active,
        };
        const url = editingCharacter ? `/api/admin/character-programs/${editingCharacter}` : '/api/admin/character-programs';
        const method = editingCharacter ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: 'Gagal menyimpan data karakter.' }));
                throw new Error(err.error || 'Gagal menyimpan data karakter.');
            }

            setFormCharacter(DEFAULT_CHARACTER);
            setEditingCharacter(null);
            setModal(null);
            setMessage({ type: 'success', text: 'Data pembiasaan karakter berhasil disimpan.' });
            await fetchData();
        } catch (error) {
            const text = error instanceof Error ? error.message : 'Gagal menyimpan data karakter.';
            setMessage({ type: 'error', text });
        } finally {
            setSaving(false);
        }
    };

    const deleteEkskul = async (id?: string | number) => {
        if (!id) return;
        if (!confirm('Hapus data ekstrakurikuler ini?')) return;
        try {
            const res = await fetch(`/api/admin/extracurriculars/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                throw new Error('Gagal menghapus data ekstrakurikuler.');
            }
            setMessage({ type: 'success', text: 'Data ekstrakurikuler berhasil dihapus.' });
            await fetchData();
        } catch (error) {
            const text = error instanceof Error ? error.message : 'Gagal menghapus data ekstrakurikuler.';
            setMessage({ type: 'error', text });
        }
    };

    const deleteCharacter = async (id?: string | number) => {
        if (!id) return;
        if (!confirm('Hapus data pembiasaan karakter ini?')) return;
        try {
            const res = await fetch(`/api/admin/character-programs/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                throw new Error('Gagal menghapus data pembiasaan karakter.');
            }
            setMessage({ type: 'success', text: 'Data pembiasaan karakter berhasil dihapus.' });
            await fetchData();
        } catch (error) {
            const text = error instanceof Error ? error.message : 'Gagal menghapus data pembiasaan karakter.';
            setMessage({ type: 'error', text });
        }
    };

    const moveEkskul = async (id: string | number | undefined, direction: 'up' | 'down') => {
        if (id === undefined || saving) return;
        const sorted = [...extracurriculars].sort((a, b) => a.display_order - b.display_order);
        const currentIndex = sorted.findIndex((item) => String(item.id) === String(id));
        if (currentIndex < 0) return;
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (targetIndex < 0 || targetIndex >= sorted.length) return;

        const current = sorted[currentIndex];
        const target = sorted[targetIndex];

        const currentPayload = {
            name: current.name,
            description: current.description,
            icon: current.icon,
            schedule: current.schedule,
            coachName: current.coach_name,
            displayOrder: target.display_order,
            isActive: current.is_active,
        };
        const targetPayload = {
            name: target.name,
            description: target.description,
            icon: target.icon,
            schedule: target.schedule,
            coachName: target.coach_name,
            displayOrder: current.display_order,
            isActive: target.is_active,
        };

        setSaving(true);
        setMessage(null);
        try {
            const [resA, resB] = await Promise.all([
                fetch(`/api/admin/extracurriculars/${current.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(currentPayload),
                }),
                fetch(`/api/admin/extracurriculars/${target.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(targetPayload),
                }),
            ]);

            if (!resA.ok || !resB.ok) {
                throw new Error('Gagal mengubah urutan ekstrakurikuler.');
            }
            setMessage({ type: 'success', text: 'Urutan ekstrakurikuler diperbarui.' });
            await fetchData();
        } catch (error) {
            const text = error instanceof Error ? error.message : 'Gagal mengubah urutan ekstrakurikuler.';
            setMessage({ type: 'error', text });
        } finally {
            setSaving(false);
        }
    };

    const moveCharacter = async (id: string | number | undefined, direction: 'up' | 'down') => {
        if (id === undefined || saving) return;
        const sorted = [...characterPrograms].sort((a, b) => a.display_order - b.display_order);
        const currentIndex = sorted.findIndex((item) => String(item.id) === String(id));
        if (currentIndex < 0) return;
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (targetIndex < 0 || targetIndex >= sorted.length) return;

        const current = sorted[currentIndex];
        const target = sorted[targetIndex];

        const currentPayload = {
            name: current.name,
            description: current.description,
            icon: current.icon,
            frequency: current.frequency,
            displayOrder: target.display_order,
            isActive: current.is_active,
        };
        const targetPayload = {
            name: target.name,
            description: target.description,
            icon: target.icon,
            frequency: target.frequency,
            displayOrder: current.display_order,
            isActive: target.is_active,
        };

        setSaving(true);
        setMessage(null);
        try {
            const [resA, resB] = await Promise.all([
                fetch(`/api/admin/character-programs/${current.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(currentPayload),
                }),
                fetch(`/api/admin/character-programs/${target.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(targetPayload),
                }),
            ]);

            if (!resA.ok || !resB.ok) {
                throw new Error('Gagal mengubah urutan pembiasaan karakter.');
            }
            setMessage({ type: 'success', text: 'Urutan pembiasaan karakter diperbarui.' });
            await fetchData();
        } catch (error) {
            const text = error instanceof Error ? error.message : 'Gagal mengubah urutan pembiasaan karakter.';
            setMessage({ type: 'error', text });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors dark:bg-[#0B0F0C] dark:text-gray-100">
            <SidebarAdmin />
            <main className="min-h-screen px-6 py-10 lg:pl-80">
                <section className="rounded-3xl border border-emerald-900/20 bg-gradient-to-br from-white to-emerald-50/70 p-8 shadow-sm dark:border-white/10 dark:from-white/10 dark:to-emerald-950/20">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-semibold">Kesiswaan</h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Kelola data ekstrakurikuler dan pembiasaan karakter.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={openCreateEkskul}
                                className="inline-flex items-center gap-2 rounded-xl border border-emerald-600 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-400/60 dark:bg-transparent dark:text-emerald-300"
                            >
                                <Plus size={16} /> Tambah Ekskul
                            </button>
                            <button
                                type="button"
                                onClick={openCreateCharacter}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
                            >
                                <Plus size={16} /> Tambah Karakter
                            </button>
                        </div>
                    </div>

                    {message && (
                        <div
                            className={`mt-6 rounded-xl border px-4 py-3 text-sm ${message.type === 'success'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                                : 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300'
                                }`}
                        >
                            {message.text}
                        </div>
                    )}
                </section>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="animate-spin text-emerald-600" size={28} />
                    </div>
                ) : (
                    <div className="mt-8 grid gap-8 xl:grid-cols-2">
                        <section className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                            <h2 className="text-xl font-semibold">Ekstrakurikuler</h2>
                            <div className="mt-5 space-y-3">
                                {[...extracurriculars].sort((a, b) => a.display_order - b.display_order).map((item, index, list) => (
                                    <div key={item.id} className="rounded-2xl border border-emerald-900/10 bg-white/80 p-4 dark:border-white/10 dark:bg-black/20">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold">{item.name}</p>
                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                                                <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                                                    {item.schedule || '-'} | {item.coach_name || '-'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => moveEkskul(item.id, 'up')}
                                                    disabled={saving || index === 0}
                                                    className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs disabled:opacity-40 dark:border-white/20"
                                                    title="Naikkan"
                                                >
                                                    <ArrowUp size={12} />
                                                </button>
                                                <button
                                                    onClick={() => moveEkskul(item.id, 'down')}
                                                    disabled={saving || index === list.length - 1}
                                                    className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs disabled:opacity-40 dark:border-white/20"
                                                    title="Turunkan"
                                                >
                                                    <ArrowDown size={12} />
                                                </button>
                                                <button
                                                    onClick={() => openEditEkskul(item)}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-600 px-3 py-1.5 text-xs text-emerald-600 dark:border-emerald-400 dark:text-emerald-300"
                                                >
                                                    <PencilLine size={12} /> Edit
                                                </button>
                                                <button onClick={() => deleteEkskul(item.id)} className="rounded-lg border border-red-500 px-3 py-1.5 text-xs text-red-500">
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {!extracurriculars.length && (
                                    <p className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-white/20 dark:text-gray-400">
                                        Belum ada data ekstrakurikuler.
                                    </p>
                                )}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                            <h2 className="text-xl font-semibold">Pembiasaan Karakter</h2>
                            <div className="mt-5 space-y-3">
                                {[...characterPrograms].sort((a, b) => a.display_order - b.display_order).map((item, index, list) => (
                                    <div key={item.id} className="rounded-2xl border border-emerald-900/10 bg-white/80 p-4 dark:border-white/10 dark:bg-black/20">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold">{item.name}</p>
                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                                                <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">{item.frequency || '-'}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => moveCharacter(item.id, 'up')}
                                                    disabled={saving || index === 0}
                                                    className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs disabled:opacity-40 dark:border-white/20"
                                                    title="Naikkan"
                                                >
                                                    <ArrowUp size={12} />
                                                </button>
                                                <button
                                                    onClick={() => moveCharacter(item.id, 'down')}
                                                    disabled={saving || index === list.length - 1}
                                                    className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs disabled:opacity-40 dark:border-white/20"
                                                    title="Turunkan"
                                                >
                                                    <ArrowDown size={12} />
                                                </button>
                                                <button
                                                    onClick={() => openEditCharacter(item)}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-600 px-3 py-1.5 text-xs text-emerald-600 dark:border-emerald-400 dark:text-emerald-300"
                                                >
                                                    <PencilLine size={12} /> Edit
                                                </button>
                                                <button onClick={() => deleteCharacter(item.id)} className="rounded-lg border border-red-500 px-3 py-1.5 text-xs text-red-500">
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {!characterPrograms.length && (
                                    <p className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-white/20 dark:text-gray-400">
                                        Belum ada data pembiasaan karakter.
                                    </p>
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </main>

            {modal === 'ekskul' && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-2xl border border-white/20 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0f1511]">
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-lg font-semibold">{editingEkskul ? 'Edit Ekstrakurikuler' : 'Tambah Ekstrakurikuler'}</h3>
                            <button onClick={closeModal} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="space-y-1">
                                <span className="text-sm font-medium">Nama Ekskul</span>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Nama kegiatan, contoh: Pramuka.</p>
                                <input
                                    value={formEkskul.name}
                                    onChange={(e) => setFormEkskul({ ...formEkskul, name: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                    placeholder="Masukkan nama ekskul"
                                />
                            </label>
                            <label className="space-y-1">
                                <span className="text-sm font-medium">Icon</span>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Pilih icon yang akan tampil di halaman publik.</p>
                                <select
                                    value={formEkskul.icon || ''}
                                    onChange={(e) => setFormEkskul({ ...formEkskul, icon: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                >
                                    <option value="">Pilih icon</option>
                                    {ICON_OPTIONS.map((icon) => (
                                        <option key={icon} value={icon}>{icon}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="space-y-1">
                                <span className="text-sm font-medium">Jadwal</span>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Contoh: Jumat, 14:00 - 16:00.</p>
                                <input
                                    value={formEkskul.schedule || ''}
                                    onChange={(e) => setFormEkskul({ ...formEkskul, schedule: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                    placeholder="Masukkan jadwal ekskul"
                                />
                            </label>
                            <label className="space-y-1">
                                <span className="text-sm font-medium">Pembina</span>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Nama guru pembina ekskul.</p>
                                <input
                                    value={formEkskul.coach_name || ''}
                                    onChange={(e) => setFormEkskul({ ...formEkskul, coach_name: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                    placeholder="Masukkan nama pembina"
                                />
                            </label>
                            <label className="space-y-1 md:col-span-2">
                                <span className="text-sm font-medium">Deskripsi</span>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Ringkasan kegiatan ekskul untuk pengunjung website.</p>
                                <textarea
                                    value={formEkskul.description}
                                    onChange={(e) => setFormEkskul({ ...formEkskul, description: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                    rows={3}
                                    placeholder="Tulis deskripsi ekskul"
                                />
                            </label>
                            <div className="flex items-end gap-4 md:col-span-2">
                                <label className="mb-1 flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={formEkskul.is_active}
                                        onChange={(e) => setFormEkskul({ ...formEkskul, is_active: e.target.checked })}
                                        className="h-4 w-4"
                                    />
                                    Aktifkan item ini
                                </label>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-2">
                            <button onClick={closeModal} className="rounded-xl border border-gray-300 px-4 py-2 text-sm dark:border-white/20">
                                Batal
                            </button>
                            <button
                                onClick={saveEkskul}
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
                            >
                                {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modal === 'character' && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-2xl border border-white/20 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0f1511]">
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-lg font-semibold">{editingCharacter ? 'Edit Pembiasaan Karakter' : 'Tambah Pembiasaan Karakter'}</h3>
                            <button onClick={closeModal} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="space-y-1">
                                <span className="text-sm font-medium">Nama Program</span>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Contoh: 5S, Murajaah Pagi, Sholat Dhuha.</p>
                                <input
                                    value={formCharacter.name}
                                    onChange={(e) => setFormCharacter({ ...formCharacter, name: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                    placeholder="Masukkan nama program karakter"
                                />
                            </label>
                            <label className="space-y-1">
                                <span className="text-sm font-medium">Icon</span>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Pilih icon agar tampilan program lebih jelas.</p>
                                <select
                                    value={formCharacter.icon || ''}
                                    onChange={(e) => setFormCharacter({ ...formCharacter, icon: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                >
                                    <option value="">Pilih icon</option>
                                    {ICON_OPTIONS.map((icon) => (
                                        <option key={icon} value={icon}>{icon}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="space-y-1">
                                <span className="text-sm font-medium">Frekuensi</span>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Contoh: Setiap hari, Setiap Jumat.</p>
                                <input
                                    value={formCharacter.frequency || ''}
                                    onChange={(e) => setFormCharacter({ ...formCharacter, frequency: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                    placeholder="Masukkan frekuensi"
                                />
                            </label>
                            <label className="space-y-1 md:col-span-2">
                                <span className="text-sm font-medium">Deskripsi</span>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Penjelasan singkat program pembiasaan karakter.</p>
                                <textarea
                                    value={formCharacter.description}
                                    onChange={(e) => setFormCharacter({ ...formCharacter, description: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                    rows={3}
                                    placeholder="Tulis deskripsi program"
                                />
                            </label>
                            <div className="flex items-end gap-4 md:col-span-2">
                                <label className="mb-1 flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={formCharacter.is_active}
                                        onChange={(e) => setFormCharacter({ ...formCharacter, is_active: e.target.checked })}
                                        className="h-4 w-4"
                                    />
                                    Aktifkan item ini
                                </label>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-2">
                            <button onClick={closeModal} className="rounded-xl border border-gray-300 px-4 py-2 text-sm dark:border-white/20">
                                Batal
                            </button>
                            <button
                                onClick={saveCharacter}
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
                            >
                                {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminKesiswaanPage;
