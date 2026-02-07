'use client';

import React, { useEffect, useState } from 'react';
import SidebarAdmin from '@/components/sidebar-admin';
import { Plus, Save, Trash2 } from 'lucide-react';

type Extracurricular = {
    id?: string;
    name: string;
    description: string;
    icon?: string | null;
    schedule?: string | null;
    coach_name?: string | null;
    display_order: number;
    is_active: boolean;
};

type CharacterProgram = {
    id?: string;
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

const AdminKesiswaanPage: React.FC = () => {
    const [extracurriculars, setExtracurriculars] = useState<Extracurricular[]>([]);
    const [characterPrograms, setCharacterPrograms] = useState<CharacterProgram[]>([]);
    const [formEkskul, setFormEkskul] = useState<Extracurricular>(DEFAULT_EXTRACURRICULAR);
    const [formCharacter, setFormCharacter] = useState<CharacterProgram>(DEFAULT_CHARACTER);
    const [editingEkskul, setEditingEkskul] = useState<string | null>(null);
    const [editingCharacter, setEditingCharacter] = useState<string | null>(null);

    const fetchData = async () => {
        const [ekskulRes, characterRes] = await Promise.all([
            fetch('/api/admin/extracurriculars'),
            fetch('/api/admin/character-programs'),
        ]);
        const ekskulData = await ekskulRes.json();
        const characterData = await characterRes.json();
        setExtracurriculars(Array.isArray(ekskulData) ? ekskulData : []);
        setCharacterPrograms(Array.isArray(characterData) ? characterData : []);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const saveEkskul = async () => {
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
        await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        setFormEkskul(DEFAULT_EXTRACURRICULAR);
        setEditingEkskul(null);
        fetchData();
    };

    const saveCharacter = async () => {
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
        await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        setFormCharacter(DEFAULT_CHARACTER);
        setEditingCharacter(null);
        fetchData();
    };

    const deleteEkskul = async (id?: string) => {
        if (!id) return;
        await fetch(`/api/admin/extracurriculars/${id}`, { method: 'DELETE' });
        fetchData();
    };

    const deleteCharacter = async (id?: string) => {
        if (!id) return;
        await fetch(`/api/admin/character-programs/${id}`, { method: 'DELETE' });
        fetchData();
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors dark:bg-[#0B0F0C] dark:text-gray-100">
            <SidebarAdmin />
            <main className="min-h-screen px-6 py-10 lg:pl-80 space-y-10">
                <section className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <h2 className="text-2xl font-semibold">Ekstrakurikuler</h2>
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <input
                            value={formEkskul.name}
                            onChange={(e) => setFormEkskul({ ...formEkskul, name: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            placeholder="Nama"
                        />
                        <input
                            value={formEkskul.icon || ''}
                            onChange={(e) => setFormEkskul({ ...formEkskul, icon: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            placeholder="Icon (misal: Tent)"
                        />
                        <input
                            value={formEkskul.schedule || ''}
                            onChange={(e) => setFormEkskul({ ...formEkskul, schedule: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            placeholder="Jadwal"
                        />
                        <input
                            value={formEkskul.coach_name || ''}
                            onChange={(e) => setFormEkskul({ ...formEkskul, coach_name: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            placeholder="Pembina"
                        />
                        <textarea
                            value={formEkskul.description}
                            onChange={(e) => setFormEkskul({ ...formEkskul, description: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm md:col-span-2 dark:border-white/10 dark:bg-black/30"
                            rows={3}
                            placeholder="Deskripsi"
                        />
                        <input
                            type="number"
                            value={formEkskul.display_order}
                            onChange={(e) => setFormEkskul({ ...formEkskul, display_order: Number(e.target.value) })}
                            className="w-32 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            placeholder="Urutan"
                        />
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={formEkskul.is_active}
                                onChange={(e) => setFormEkskul({ ...formEkskul, is_active: e.target.checked })}
                                className="h-4 w-4"
                            />
                            Aktif
                        </label>
                        <button
                            type="button"
                            onClick={saveEkskul}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white"
                        >
                            <Save size={16} /> Simpan
                        </button>
                    </div>

                    <div className="mt-6 space-y-3">
                        {extracurriculars.map((item) => (
                            <div key={item.id} className="flex items-start justify-between gap-4 rounded-2xl border border-emerald-900/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
                                <div>
                                    <p className="text-sm font-semibold">{item.name}</p>
                                    <p className="text-xs text-gray-500">{item.description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => { setEditingEkskul(item.id || null); setFormEkskul(item); }} className="rounded-lg border border-emerald-600 px-3 py-1 text-xs text-emerald-600">Edit</button>
                                    <button onClick={() => deleteEkskul(item.id)} className="rounded-lg border border-red-500 px-3 py-1 text-xs text-red-500"><Trash2 size={12} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <h2 className="text-2xl font-semibold">Pembiasaan Karakter</h2>
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <input
                            value={formCharacter.name}
                            onChange={(e) => setFormCharacter({ ...formCharacter, name: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            placeholder="Nama"
                        />
                        <input
                            value={formCharacter.icon || ''}
                            onChange={(e) => setFormCharacter({ ...formCharacter, icon: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            placeholder="Icon (misal: SmilePlus)"
                        />
                        <input
                            value={formCharacter.frequency || ''}
                            onChange={(e) => setFormCharacter({ ...formCharacter, frequency: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            placeholder="Frekuensi"
                        />
                        <textarea
                            value={formCharacter.description}
                            onChange={(e) => setFormCharacter({ ...formCharacter, description: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm md:col-span-2 dark:border-white/10 dark:bg-black/30"
                            rows={3}
                            placeholder="Deskripsi"
                        />
                        <input
                            type="number"
                            value={formCharacter.display_order}
                            onChange={(e) => setFormCharacter({ ...formCharacter, display_order: Number(e.target.value) })}
                            className="w-32 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            placeholder="Urutan"
                        />
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={formCharacter.is_active}
                                onChange={(e) => setFormCharacter({ ...formCharacter, is_active: e.target.checked })}
                                className="h-4 w-4"
                            />
                            Aktif
                        </label>
                        <button
                            type="button"
                            onClick={saveCharacter}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white"
                        >
                            <Save size={16} /> Simpan
                        </button>
                    </div>

                    <div className="mt-6 space-y-3">
                        {characterPrograms.map((item) => (
                            <div key={item.id} className="flex items-start justify-between gap-4 rounded-2xl border border-emerald-900/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
                                <div>
                                    <p className="text-sm font-semibold">{item.name}</p>
                                    <p className="text-xs text-gray-500">{item.description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => { setEditingCharacter(item.id || null); setFormCharacter(item); }} className="rounded-lg border border-emerald-600 px-3 py-1 text-xs text-emerald-600">Edit</button>
                                    <button onClick={() => deleteCharacter(item.id)} className="rounded-lg border border-red-500 px-3 py-1 text-xs text-red-500"><Trash2 size={12} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AdminKesiswaanPage;
