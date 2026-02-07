'use client';

import React, { useEffect, useState } from 'react';
import SidebarAdmin from '@/components/sidebar-admin';
import { Plus, Save, Trash2 } from 'lucide-react';

type AcademicPageForm = {
    heroTitle: string;
    heroSubtitle: string;
    heroImageUrl?: string | null;
    curriculumTitle: string;
    curriculumIntro1: string;
    curriculumIntro2: string;
    subjectsTitle: string;
    programsTitle: string;
};

type AcademicSubjectForm = { name: string; order: number };
type AcademicProgramForm = { title: string; description: string; icon?: string | null; order: number };

const DEFAULT_PAGE: AcademicPageForm = {
    heroTitle: '',
    heroSubtitle: '',
    heroImageUrl: '',
    curriculumTitle: '',
    curriculumIntro1: '',
    curriculumIntro2: '',
    subjectsTitle: '',
    programsTitle: '',
};

const AdminAkademikPage: React.FC = () => {
    const [page, setPage] = useState<AcademicPageForm>(DEFAULT_PAGE);
    const [subjects, setSubjects] = useState<AcademicSubjectForm[]>([]);
    const [programs, setPrograms] = useState<AcademicProgramForm[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/academic-page');
            const data = await res.json();
            if (data?.page) {
                setPage({
                    heroTitle: data.page.heroTitle || '',
                    heroSubtitle: data.page.heroSubtitle || '',
                    heroImageUrl: data.page.heroImageUrl || '',
                    curriculumTitle: data.page.curriculumTitle || '',
                    curriculumIntro1: data.page.curriculumIntro1 || '',
                    curriculumIntro2: data.page.curriculumIntro2 || '',
                    subjectsTitle: data.page.subjectsTitle || '',
                    programsTitle: data.page.programsTitle || '',
                });
            }
            setSubjects(Array.isArray(data?.subjects) ? data.subjects : []);
            setPrograms(Array.isArray(data?.programs) ? data.programs : []);
        } catch (error) {
            console.error('Failed to fetch academic page', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const savePage = async () => {
        setMessage(null);
        const payload = {
            page,
            subjects,
            programs,
        };
        const res = await fetch('/api/admin/academic-page', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (res.ok) {
            setMessage('Data akademik tersimpan.');
            fetchData();
        } else {
            const err = await res.json().catch(() => ({}));
            setMessage(err.error || 'Gagal menyimpan data akademik.');
        }
    };

    const addSubject = () => {
        setSubjects([...subjects, { name: '', order: subjects.length + 1 }]);
    };

    const addProgram = () => {
        setPrograms([...programs, { title: '', description: '', icon: '', order: programs.length + 1 }]);
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors dark:bg-[#0B0F0C] dark:text-gray-100">
            <SidebarAdmin />
            <main className="min-h-screen px-6 py-10 lg:pl-80 space-y-8">
                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <h2 className="text-2xl font-semibold">Kelola Akademik</h2>
                    {loading ? (
                        <p className="text-sm text-gray-500">Memuat data...</p>
                    ) : (
                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                            <input
                                value={page.heroTitle}
                                onChange={(e) => setPage({ ...page, heroTitle: e.target.value })}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                placeholder="Judul Hero"
                            />
                            <input
                                value={page.heroSubtitle}
                                onChange={(e) => setPage({ ...page, heroSubtitle: e.target.value })}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                placeholder="Subjudul Hero"
                            />
                            <input
                                value={page.heroImageUrl || ''}
                                onChange={(e) => setPage({ ...page, heroImageUrl: e.target.value })}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm md:col-span-2 dark:border-white/10 dark:bg-black/30"
                                placeholder="URL Gambar Hero"
                            />
                            <input
                                value={page.curriculumTitle}
                                onChange={(e) => setPage({ ...page, curriculumTitle: e.target.value })}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                placeholder="Judul Kurikulum"
                            />
                            <input
                                value={page.subjectsTitle}
                                onChange={(e) => setPage({ ...page, subjectsTitle: e.target.value })}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                placeholder="Judul Mata Pelajaran"
                            />
                            <input
                                value={page.programsTitle}
                                onChange={(e) => setPage({ ...page, programsTitle: e.target.value })}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                placeholder="Judul Program"
                            />
                            <textarea
                                value={page.curriculumIntro1}
                                onChange={(e) => setPage({ ...page, curriculumIntro1: e.target.value })}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm md:col-span-2 dark:border-white/10 dark:bg-black/30"
                                rows={3}
                                placeholder="Intro Kurikulum 1"
                            />
                            <textarea
                                value={page.curriculumIntro2}
                                onChange={(e) => setPage({ ...page, curriculumIntro2: e.target.value })}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm md:col-span-2 dark:border-white/10 dark:bg-black/30"
                                rows={3}
                                placeholder="Intro Kurikulum 2"
                            />
                        </div>
                    )}
                </div>

                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Mata Pelajaran</h3>
                        <button type="button" onClick={addSubject} className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 px-3 py-1 text-xs text-emerald-600">
                            <Plus size={14} /> Tambah
                        </button>
                    </div>
                    <div className="mt-4 space-y-3">
                        {subjects.map((subject, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <input
                                    value={subject.name}
                                    onChange={(e) => {
                                        const next = [...subjects];
                                        next[idx] = { ...subject, name: e.target.value };
                                        setSubjects(next);
                                    }}
                                    className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                    placeholder="Nama mapel"
                                />
                                <input
                                    type="number"
                                    value={subject.order}
                                    onChange={(e) => {
                                        const next = [...subjects];
                                        next[idx] = { ...subject, order: Number(e.target.value) };
                                        setSubjects(next);
                                    }}
                                    className="w-24 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                    placeholder="Urutan"
                                />
                                <button
                                    onClick={() => setSubjects(subjects.filter((_, i) => i !== idx))}
                                    className="rounded-lg border border-red-500 px-3 py-1 text-xs text-red-500"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Program Unggulan</h3>
                        <button type="button" onClick={addProgram} className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 px-3 py-1 text-xs text-emerald-600">
                            <Plus size={14} /> Tambah
                        </button>
                    </div>
                    <div className="mt-4 space-y-4">
                        {programs.map((program, idx) => (
                            <div key={idx} className="rounded-2xl border border-emerald-900/10 p-4 dark:border-white/10">
                                <div className="grid gap-3 md:grid-cols-2">
                                    <input
                                        value={program.title}
                                        onChange={(e) => {
                                            const next = [...programs];
                                            next[idx] = { ...program, title: e.target.value };
                                            setPrograms(next);
                                        }}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                        placeholder="Judul Program"
                                    />
                                    <input
                                        value={program.icon || ''}
                                        onChange={(e) => {
                                            const next = [...programs];
                                            next[idx] = { ...program, icon: e.target.value };
                                            setPrograms(next);
                                        }}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                        placeholder="Icon (Book, Award, Zap)"
                                    />
                                    <textarea
                                        value={program.description}
                                        onChange={(e) => {
                                            const next = [...programs];
                                            next[idx] = { ...program, description: e.target.value };
                                            setPrograms(next);
                                        }}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm md:col-span-2 dark:border-white/10 dark:bg-black/30"
                                        rows={3}
                                        placeholder="Deskripsi"
                                    />
                                </div>
                                <div className="mt-3 flex items-center gap-3">
                                    <input
                                        type="number"
                                        value={program.order}
                                        onChange={(e) => {
                                            const next = [...programs];
                                            next[idx] = { ...program, order: Number(e.target.value) };
                                            setPrograms(next);
                                        }}
                                        className="w-24 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                        placeholder="Urutan"
                                    />
                                    <button
                                        onClick={() => setPrograms(programs.filter((_, i) => i !== idx))}
                                        className="rounded-lg border border-red-500 px-3 py-1 text-xs text-red-500"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">{message}</p>
                    <button onClick={savePage} className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white">
                        <Save size={16} /> Simpan Semua
                    </button>
                </div>
            </main>
        </div>
    );
};

export default AdminAkademikPage;
