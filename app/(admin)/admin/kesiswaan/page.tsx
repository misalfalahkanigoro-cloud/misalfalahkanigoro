'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Save, Trash2, X, Loader2, ArrowUp, ArrowDown, 
    Zap, Sparkles, Activity, Music, PenTool, Tent, 
    BookMarked, Paintbrush, Trophy, Sunrise, Heart, 
    BookOpen, SmilePlus, Edit3, MoreVertical, CheckCircle2,
    Layout
} from 'lucide-react';
import SidebarAdmin from '@/components/sidebar-admin';
import HeaderAdmin from '@/components/header-admin';

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
    icon: 'Activity',
    schedule: '',
    coach_name: '',
    display_order: 1,
    is_active: true,
};

const DEFAULT_CHARACTER: CharacterProgram = {
    name: '',
    description: '',
    icon: 'Sparkles',
    frequency: '',
    display_order: 1,
    is_active: true,
};

const ICON_MAP: Record<string, any> = {
    Activity, Music, PenTool, Tent, BookMarked, Paintbrush, 
    Trophy, Sunrise, Heart, BookOpen, SmilePlus, Zap, Sparkles
};

const ICON_OPTIONS = Object.keys(ICON_MAP);

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
        setLoading(true);
        try {
            const [ekskulRes, characterRes] = await Promise.all([
                fetch('/api/admin/extracurriculars'),
                fetch('/api/admin/character-programs'),
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
        setFormEkskul({ ...DEFAULT_EXTRACURRICULAR, display_order: extracurriculars.length + 1 });
        setModal('ekskul');
    };

    const openEditEkskul = (item: Extracurricular) => {
        setEditingEkskul(item.id || null);
        setFormEkskul({ ...item });
        setModal('ekskul');
    };

    const openEditCharacter = (item: CharacterProgram) => {
        setEditingCharacter(item.id || null);
        setFormCharacter({ ...item });
        setModal('character');
    };

    const openCreateCharacter = () => {
        setEditingCharacter(null);
        setFormCharacter({ ...DEFAULT_CHARACTER, display_order: characterPrograms.length + 1 });
        setModal('character');
    };

    const saveEkskul = async () => {
        setSaving(true);
        try {
            const url = editingEkskul ? `/api/admin/extracurriculars/${editingEkskul}` : '/api/admin/extracurriculars';
            const method = editingEkskul ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formEkskul.name,
                    description: formEkskul.description,
                    icon: formEkskul.icon,
                    schedule: formEkskul.schedule,
                    coachName: formEkskul.coach_name,
                    displayOrder: formEkskul.display_order,
                    isActive: formEkskul.is_active,
                }),
            });
            if (res.ok) {
                setModal(null);
                fetchData();
                setMessage({ type: 'success', text: 'Data ekstrakurikuler disimpan.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Gagal menyimpan data.' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const saveCharacter = async () => {
        setSaving(true);
        try {
            const url = editingCharacter ? `/api/admin/character-programs/${editingCharacter}` : '/api/admin/character-programs';
            const method = editingCharacter ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formCharacter.name,
                    description: formCharacter.description,
                    icon: formCharacter.icon,
                    frequency: formCharacter.frequency,
                    displayOrder: formCharacter.display_order,
                    isActive: formCharacter.is_active,
                }),
            });
            if (res.ok) {
                setModal(null);
                fetchData();
                setMessage({ type: 'success', text: 'Data pembiasaan karakter disimpan.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Gagal menyimpan data.' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleDelete = async (type: 'ekskul' | 'character', id?: string | number) => {
        if (!id || !confirm('Hapus data ini?')) return;
        const url = type === 'ekskul' ? `/api/admin/extracurriculars/${id}` : `/api/admin/character-programs/${id}`;
        try {
            const res = await fetch(url, { method: 'DELETE' });
            if (res.ok) fetchData();
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const moveItem = async (type: 'ekskul' | 'character', id: any, direction: 'up' | 'down') => {
        const list = type === 'ekskul' ? extracurriculars : characterPrograms;
        const sorted = [...list].sort((a, b) => a.display_order - b.display_order);
        const idx = sorted.findIndex(i => String(i.id) === String(id));
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= sorted.length) return;

        setSaving(true);
        try {
            const itemA = sorted[idx];
            const itemB = sorted[targetIdx];
            const url1 = type === 'ekskul' ? `/api/admin/extracurriculars/${itemA.id}` : `/api/admin/character-programs/${itemA.id}`;
            const url2 = type === 'ekskul' ? `/api/admin/extracurriculars/${itemB.id}` : `/api/admin/character-programs/${itemB.id}`;

            await Promise.all([
                fetch(url1, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...itemA, displayOrder: itemB.display_order, isActive: itemA.is_active }),
                }),
                fetch(url2, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...itemB, displayOrder: itemA.display_order, isActive: itemB.is_active }),
                })
            ]);
            fetchData();
        } catch (error) {
            console.error('Reorder failed', error);
        } finally {
            setSaving(false);
        }
    };

    const renderIcon = (iconName?: string | null) => {
        const Icon = ICON_MAP[iconName || 'Activity'] || Activity;
        return <Icon size={24} />;
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080B09] text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <SidebarAdmin />
            
            <main className="min-h-screen lg:pl-64 pb-20">
                <HeaderAdmin 
                    title="Modul Kesiswaan"
                    subtitle="Kelola program ekstrakurikuler dan pembentukan karakter siswa"
                />

                <div className="px-4 sm:px-8 mt-10 max-w-7xl mx-auto space-y-12">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-48 bg-white/50 dark:bg-white/5 rounded-[4rem] backdrop-blur-xl">
                            <div className="w-16 h-16 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
                            <p className="mt-6 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-[0.3em] animate-pulse">Menghubungkan Server Kesiswaan...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                            {/* EKSTRAKURIKULER SECTION */}
                            <section className="space-y-8">
                                <div className="flex items-center justify-between px-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-emerald-100 dark:bg-emerald-500/10 rounded-2xl text-emerald-600"><Trophy size={24} /></div>
                                        <h2 className="text-2xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight">Ekstrakurikuler</h2>
                                    </div>
                                    <button 
                                        onClick={openCreateEkskul}
                                        className="p-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                                    ><Plus size={20} /></button>
                                </div>

                                <div className="space-y-4">
                                    <AnimatePresence mode="popLayout">
                                        {extracurriculars.sort((a,b) => a.display_order - b.display_order).map((item, idx, list) => (
                                            <motion.div 
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="group relative bg-white/80 dark:bg-[#151b18]/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-xl hover:border-emerald-500/20 transition-all"
                                            >
                                                <div className="flex items-start gap-6">
                                                    <div className="w-14 h-14 bg-gray-50 dark:bg-black/30 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                                                        {renderIcon(item.icon)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-3 mb-1">
                                                            <h4 className="font-black font-fraunces text-lg uppercase tracking-tight text-gray-950 dark:text-white truncate">{item.name}</h4>
                                                            <div className="flex items-center gap-1">
                                                                <button onClick={() => moveItem('ekskul', item.id, 'up')} disabled={idx === 0} className="p-1.5 text-gray-400 hover:text-emerald-500 disabled:opacity-0 transition-all"><ArrowUp size={14}/></button>
                                                                <button onClick={() => moveItem('ekskul', item.id, 'down')} disabled={idx === list.length-1} className="p-1.5 text-gray-400 hover:text-emerald-500 disabled:opacity-0 transition-all"><ArrowDown size={14}/></button>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-4">{item.description}</p>
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-500/5 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest">{item.schedule || 'Jadwal Fleksibel'}</div>
                                                            <div className="px-3 py-1.5 bg-purple-50 dark:bg-purple-500/5 text-purple-600 rounded-xl text-[10px] font-black uppercase tracking-widest">{item.coach_name || 'Tanpa Pembina'}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                    <button onClick={() => openEditEkskul(item)} className="p-2.5 bg-white dark:bg-white/10 text-emerald-600 rounded-xl shadow-lg border border-emerald-50"><Edit3 size={16} /></button>
                                                    <button onClick={() => handleDelete('ekskul', item.id)} className="p-2.5 bg-white dark:bg-white/10 text-red-500 rounded-xl shadow-lg border border-red-50"><Trash2 size={16} /></button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </section>

                            {/* CHARACTER PROGRAMS SECTION */}
                            <section className="space-y-8">
                                <div className="flex items-center justify-between px-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-amber-100 dark:bg-amber-500/10 rounded-2xl text-amber-600"><Sparkles size={24} /></div>
                                        <h2 className="text-2xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight">Pembiasaan Karakter</h2>
                                    </div>
                                    <button 
                                        onClick={openCreateCharacter}
                                        className="p-3.5 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl transition-all shadow-xl shadow-amber-500/20 active:scale-95"
                                    ><Plus size={20} /></button>
                                </div>

                                <div className="space-y-4">
                                    <AnimatePresence mode="popLayout">
                                        {characterPrograms.sort((a,b) => a.display_order - b.display_order).map((item, idx, list) => (
                                            <motion.div 
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="group relative bg-white/80 dark:bg-[#151b18]/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-xl hover:border-amber-500/20 transition-all"
                                            >
                                                <div className="flex items-start gap-6">
                                                    <div className="w-14 h-14 bg-gray-50 dark:bg-black/30 rounded-2xl flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all duration-500">
                                                        {renderIcon(item.icon)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-3 mb-1">
                                                            <h4 className="font-black font-fraunces text-lg uppercase tracking-tight text-gray-950 dark:text-white truncate">{item.name}</h4>
                                                            <div className="flex items-center gap-1">
                                                                <button onClick={() => moveItem('character', item.id, 'up')} disabled={idx === 0} className="p-1.5 text-gray-400 hover:text-amber-500 disabled:opacity-0 transition-all"><ArrowUp size={14}/></button>
                                                                <button onClick={() => moveItem('character', item.id, 'down')} disabled={idx === list.length-1} className="p-1.5 text-gray-400 hover:text-amber-500 disabled:opacity-0 transition-all"><ArrowDown size={14}/></button>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-4">{item.description}</p>
                                                        <div className="flex items-center gap-3">
                                                            <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-500/5 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest">{item.frequency || 'Setiap Saat'}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                    <button onClick={() => openEditCharacter(item)} className="p-2.5 bg-white dark:bg-white/10 text-amber-600 rounded-xl shadow-lg border border-amber-50"><Edit3 size={16} /></button>
                                                    <button onClick={() => handleDelete('character', item.id)} className="p-2.5 bg-white dark:bg-white/10 text-red-500 rounded-xl shadow-lg border border-red-50"><Trash2 size={16} /></button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </section>
                        </div>
                    )}
                </div>

                {/* MODALS */}
                <AnimatePresence>
                    {modal && (
                        <>
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setModal(null)}
                                className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl"
                            />
                            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
                                    className="relative w-full max-w-2xl bg-white dark:bg-[#0F1411] rounded-[3.5rem] border border-white/20 dark:border-white/10 shadow-3xl overflow-hidden pointer-events-auto"
                                >
                                    <div className="p-10">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-2xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight">
                                                {modal === 'ekskul' ? (editingEkskul ? 'Update Ekskul' : 'Ekskul Baru') : (editingCharacter ? 'Update Karakter' : 'Program Karakter')}
                                            </h3>
                                            <button onClick={() => setModal(null)} className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl"><X size={20}/></button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Nama Program</label>
                                                <input 
                                                    value={modal === 'ekskul' ? formEkskul.name : formCharacter.name}
                                                    onChange={e => modal === 'ekskul' ? setFormEkskul({...formEkskul, name: e.target.value}) : setFormCharacter({...formCharacter, name: e.target.value})}
                                                    className="w-full bg-gray-50 dark:bg-black/20 p-4 rounded-2xl border border-transparent focus:border-emerald-500 outline-none transition-all font-bold"
                                                    placeholder="Nama program..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Identitas Visual (Icon)</label>
                                                <select 
                                                    value={modal === 'ekskul' ? (formEkskul.icon || '') : (formCharacter.icon || '')}
                                                    onChange={e => modal === 'ekskul' ? setFormEkskul({...formEkskul, icon: e.target.value}) : setFormCharacter({...formCharacter, icon: e.target.value})}
                                                    className="w-full bg-gray-50 dark:bg-black/20 p-4 rounded-2xl border border-transparent focus:border-emerald-500 outline-none transition-all font-bold appearance-none"
                                                >
                                                    {ICON_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            </div>
                                            {modal === 'ekskul' ? (
                                                <>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Jadwal Pelaksanaan</label>
                                                        <input value={formEkskul.schedule || ''} onChange={e => setFormEkskul({...formEkskul, schedule: e.target.value})} className="w-full bg-gray-50 dark:bg-black/20 p-4 rounded-2xl border border-transparent focus:border-emerald-500 outline-none transition-all font-bold" placeholder="Misal: Jumat, 14:00..." />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Pembina / Pelatih</label>
                                                        <input value={formEkskul.coach_name || ''} onChange={e => setFormEkskul({...formEkskul, coach_name: e.target.value})} className="w-full bg-gray-50 dark:bg-black/20 p-4 rounded-2xl border border-transparent focus:border-emerald-500 outline-none transition-all font-bold" placeholder="Nama pengampu..." />
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="space-y-2 md:col-span-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Frekuensi Pelaksanaan</label>
                                                    <input value={formCharacter.frequency || ''} onChange={e => setFormCharacter({...formCharacter, frequency: e.target.value})} className="w-full bg-gray-50 dark:bg-black/20 p-4 rounded-2xl border border-transparent focus:border-emerald-500 outline-none transition-all font-bold" placeholder="Misal: Setiap Hari Senin..." />
                                                </div>
                                            )}
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Deskripsi Singkat</label>
                                                <textarea 
                                                    value={modal === 'ekskul' ? formEkskul.description : formCharacter.description}
                                                    onChange={e => modal === 'ekskul' ? setFormEkskul({...formEkskul, description: e.target.value}) : setFormCharacter({...formCharacter, description: e.target.value})}
                                                    rows={3}
                                                    className="w-full bg-gray-50 dark:bg-black/20 p-5 rounded-[2rem] border border-transparent focus:border-emerald-500 outline-none transition-all font-medium"
                                                    placeholder="Uraian singkat tujuan program..."
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-10 flex items-center justify-end gap-5">
                                            <button onClick={() => setModal(null)} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">Batal</button>
                                            <button 
                                                onClick={modal === 'ekskul' ? saveEkskul : saveCharacter}
                                                disabled={saving}
                                                className="px-10 py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-3"
                                            >
                                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                                SIMPAN DATA
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </>
                    )}
                </AnimatePresence>

                {/* NOTIFICATION */}
                <AnimatePresence>
                    {message && (
                        <motion.div 
                            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                            className={`fixed bottom-10 right-10 z-[200] px-8 py-5 rounded-[2rem] shadow-2xl backdrop-blur-xl border border-white/20 flex items-center gap-4 ${message.type === 'success' ? 'bg-emerald-600/90 text-white' : 'bg-red-600/90 text-white'}`}
                        >
                            <CheckCircle2 size={24} />
                            <p className="text-sm font-black uppercase tracking-tight">{message.text}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default AdminKesiswaanPage;

