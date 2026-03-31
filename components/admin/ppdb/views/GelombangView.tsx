import React, { useState, useEffect } from 'react';
import { 
    Calendar, Users, Edit2, Trash2, PlusCircle, Activity, 
    Archive, X, CheckSquare, Square, FileText, Plus, Save, Loader2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PPDBWave } from '../types';

interface DocumentRequirement {
    id?: string;
    label: string;
    key: string;
    isRequired: boolean;
}

export const GelombangView: React.FC = () => {
    const [waves, setWaves] = useState<PPDBWave[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
    const [selectedWaveId, setSelectedWaveId] = useState<string | null>(null);
    const [docRequirements, setDocRequirements] = useState<DocumentRequirement[]>([]);
    const [isSavingDocs, setIsSavingDocs] = useState(false);

    const [waveForm, setWaveForm] = useState({
        name: '',
        startDate: '',
        endDate: '',
        quota: '' as string | number,
        isActive: true,
    });
    const [editingWaveId, setEditingWaveId] = useState<string | null>(null);

    const fetchWaves = async () => {
        try {
            const res = await fetch('/api/admin/ppdb-waves');
            const data = await res.json();
            const mapped = (Array.isArray(data) ? data : []).map((w: any) => ({
                id: w.id,
                name: w.name,
                startDate: w.start_date,
                endDate: w.end_date,
                quota: w.quota,
                isActive: w.is_active,
                createdAt: w.created_at,
                updatedAt: w.updated_at,
            }));
            setWaves(mapped);
        } catch (error) {
            console.error('Failed to fetch waves', error);
        }
    };

    useEffect(() => {
        fetchWaves();
    }, []);

    const openCreateModal = () => {
        setEditingWaveId(null);
        setWaveForm({ name: '', startDate: '', endDate: '', quota: '', isActive: true });
        setIsModalOpen(true);
    };

    const saveWave = async () => {
        const payload = {
            name: waveForm.name,
            startDate: waveForm.startDate,
            endDate: waveForm.endDate,
            quota: waveForm.quota === '' ? null : Number(waveForm.quota),
            isActive: waveForm.isActive,
        };

        if (editingWaveId) {
            await fetch(`/api/admin/ppdb-waves/${editingWaveId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
        } else {
            await fetch('/api/admin/ppdb-waves', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
        }

        setIsModalOpen(false);
        setEditingWaveId(null);
        setWaveForm({ name: '', startDate: '', endDate: '', quota: '', isActive: true });
        fetchWaves();
    };

    const editWave = (wave: PPDBWave) => {
        setEditingWaveId(wave.id);
        setWaveForm({
            name: wave.name,
            startDate: wave.startDate.split('T')[0],
            endDate: wave.endDate.split('T')[0],
            quota: wave.quota ?? '',
            isActive: wave.isActive,
        });
        setIsModalOpen(true);
    };

    const deleteWave = async (id: string, name: string) => {
        if (!confirm(`Hapus gelombang "${name}"?`)) return;
        await fetch(`/api/admin/ppdb-waves/${id}`, { method: 'DELETE' });
        fetchWaves();
    };

    // Document Management Functions
    const openDocsModal = async (waveId: string) => {
        setSelectedWaveId(waveId);
        setIsDocsModalOpen(true);
        setDocRequirements([]);
        try {
            const res = await fetch(`/api/admin/ppdb-waves/${waveId}/documents`);
            if (res.ok) {
                const data = await res.json();
                setDocRequirements(data.map((d: any) => ({
                    id: d.id,
                    label: d.label,
                    key: d.key,
                    isRequired: d.is_required
                })));
            }
        } catch (error) {
            console.error('Failed to fetch doc requirements', error);
        }
    };

    const addDocRow = () => {
        setDocRequirements([...docRequirements, { label: '', key: '', isRequired: true }]);
    };

    const removeDocRow = (index: number) => {
        setDocRequirements(docRequirements.filter((_, i) => i !== index));
    };

    const updateDocRow = (index: number, field: keyof DocumentRequirement, value: any) => {
        const next = [...docRequirements];
        next[index] = { ...next[index], [field]: value };
        // Auto-generate key from label if key is empty
        if (field === 'label' && !next[index].key) {
            next[index].key = value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        }
        setDocRequirements(next);
    };

    const saveDocRequirements = async () => {
        if (!selectedWaveId) return;
        setIsSavingDocs(true);
        try {
            const res = await fetch(`/api/admin/ppdb-waves/${selectedWaveId}/documents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(docRequirements),
            });
            if (res.ok) {
                setIsDocsModalOpen(false);
            }
        } catch (error) {
            console.error('Failed to save docs', error);
        } finally {
            setIsSavingDocs(false);
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-[#151b18]/90 border border-gray-200 dark:border-white/10 p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] shadow-sm">
                <div className="flex items-center gap-4 sm:gap-5">
                    <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-2xl sm:rounded-[22px] bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex justify-center items-center shadow-inner shrink-0">
                        <Calendar size={28} className="sm:size-8" />
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black font-fraunces text-slate-900 dark:text-white leading-tight">Gelombang</h3>
                        <p className="text-[10px] sm:text-sm font-medium text-slate-500">Atur periode & kuota pendaftar.</p>
                    </div>
                </div>
                <button 
                    onClick={openCreateModal}
                    className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[10px] sm:text-sm font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 transition-all active:scale-95"
                >
                    <PlusCircle size={18} className="sm:size-5" /> Tambah Gelombang
                </button>
            </div>

            {/* List Grid */}
            {waves.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 rounded-3xl border-2 border-dashed border-gray-100 dark:border-white/5 text-slate-400">
                    <Archive size={40} className="mb-3 opacity-10" />
                    <p className="text-xs font-black uppercase tracking-widest opacity-30">Belum ada data</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                    {waves.map((wave) => (
                        <motion.div 
                            key={wave.id} 
                            layout
                            className="group relative flex flex-col p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-gray-200 bg-white hover:shadow-2xl hover:border-emerald-500/30 transition-all duration-500 dark:border-white/10 dark:bg-[#151b18]/80"
                        >
                            <div className="flex justify-between items-start mb-6 sm:mb-8">
                                <div className={`w-12 sm:w-14 h-12 sm:h-14 rounded-2xl flex items-center justify-center shadow-sm ${wave.isActive ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-white/5 text-slate-400'}`}>
                                    <Activity size={24} className="sm:size-7" />
                                </div>
                                <span className={`px-3 py-1.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest border ${wave.isActive ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10' : 'bg-gray-50 border-gray-200 text-slate-400'}`}>
                                    {wave.isActive ? 'Aktif' : 'Tutup'}
                                </span>
                            </div>

                            <div className="space-y-4 mb-8">
                                <h4 className="text-xl sm:text-2xl font-black font-fraunces text-slate-900 dark:text-white leading-tight">{wave.name}</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">
                                        <Calendar size={14} className="text-emerald-500" />
                                        <span>{new Date(wave.startDate).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">
                                        <Users size={14} className="text-emerald-500" />
                                        <span>Kuota: {wave.quota ?? '∞'} Siswa</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto space-y-3 pt-6 border-t border-gray-100 dark:border-white/5">
                                <button
                                    onClick={() => openDocsModal(wave.id)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-[0.1em] dark:bg-indigo-500/10 dark:text-indigo-400"
                                >
                                    <FileText size={14} /> Manage Documents
                                </button>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => editWave(wave)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-slate-50 text-slate-900 hover:bg-emerald-50 hover:text-emerald-600 transition-all font-bold text-[10px] uppercase tracking-widest dark:bg-white/5 dark:text-slate-300"
                                    >
                                        <Edit2 size={14} /> Edit
                                    </button>
                                    <button
                                        onClick={() => deleteWave(wave.id, wave.name)}
                                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all dark:bg-white/5"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* WAVE MODAL */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 pointer-events-none">
                            <div className="w-full max-w-lg bg-white dark:bg-[#151b18] rounded-[32px] sm:rounded-[40px] shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col pointer-events-auto max-h-[95vh]">
                                <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-black/20 shrink-0">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                                            {editingWaveId ? <Edit2 size={24} /> : <PlusCircle size={24} />}
                                        </div>
                                        <h3 className="text-lg sm:text-2xl font-black font-fraunces text-slate-900 dark:text-white leading-tight">{editingWaveId ? 'Update' : 'Baru'}</h3>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center text-slate-400 transition-colors shrink-0"><X size={20} /></button>
                                </div>
                                <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-6 admin-scrollbar">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Nama Gelombang</label>
                                            <input type="text" value={waveForm.name} onChange={(e) => setWaveForm({ ...waveForm, name: e.target.value })} className="w-full rounded-2xl sm:rounded-[20px] border border-gray-200 bg-slate-50 px-5 sm:px-6 py-3.5 sm:py-4 text-xs sm:text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all dark:border-white/10 dark:bg-black/30 dark:text-white" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Mulai</label>
                                                <input type="date" value={waveForm.startDate} onChange={(e) => setWaveForm({ ...waveForm, startDate: e.target.value })} className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3.5 text-xs font-bold dark:border-white/10 dark:bg-black/30 dark:text-white" />
                                            </div>
                                            <div>
                                                <label className="block text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Berakhir</label>
                                                <input type="date" value={waveForm.endDate} onChange={(e) => setWaveForm({ ...waveForm, endDate: e.target.value })} className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3.5 text-xs font-bold dark:border-white/10 dark:bg-black/30 dark:text-white" />
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => setWaveForm(prev => ({ ...prev, isActive: !prev.isActive }))} className={`flex items-center gap-4 p-5 rounded-[24px] border-2 transition-all ${waveForm.isActive ? 'bg-emerald-50/50 border-emerald-500/30 text-emerald-800' : 'bg-slate-50 border-gray-200 text-slate-400'}`}>
                                            {waveForm.isActive ? <CheckSquare className="text-emerald-600" /> : <Square />}
                                            <div className="flex flex-col text-left"><span className="text-[10px] sm:text-sm font-black uppercase tracking-tight">Aktifkan Sekarang</span></div>
                                        </button>
                                    </div>
                                    <button onClick={saveWave} className="w-full rounded-[24px] bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 sm:py-5 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-3 mt-4"><PlusCircle size={18} /> Simpan Data</button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* DOCUMENTS MODAL */}
            <AnimatePresence>
                {isDocsModalOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDocsModalOpen(false)} className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 pointer-events-none">
                            <div className="w-full max-w-2xl bg-white dark:bg-[#151b18] rounded-[32px] sm:rounded-[40px] shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col pointer-events-auto max-h-[92vh]">
                                <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-black/20 shrink-0">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="w-10 sm:w-14 h-10 sm:h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                                            <FileText size={28} className="sm:size-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg sm:text-2xl font-black font-fraunces text-slate-900 dark:text-white leading-tight">Syarat Dokumen</h3>
                                            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Atur berkas wajib per gelombang</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsDocsModalOpen(false)} className="w-8 sm:w-12 h-8 sm:h-12 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center text-slate-400 transition-colors shrink-0"><X size={24} /></button>
                                </div>

                                <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-6 admin-scrollbar">
                                    <div className="space-y-4">
                                        {docRequirements.length === 0 ? (
                                            <div className="text-center py-12 bg-slate-50 dark:bg-black/20 rounded-3xl border-2 border-dashed border-gray-100 dark:border-white/5">
                                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Belum ada syarat dokumen</p>
                                                <button onClick={addDocRow} className="mt-4 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 mx-auto"><Plus size={14} /> Tambah Pertama</button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {docRequirements.map((doc, idx) => (
                                                    <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-slate-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-white/5">
                                                        <div className="flex-1 w-full">
                                                            <input 
                                                                type="text" 
                                                                value={doc.label} 
                                                                placeholder="Nama Dokumen (mis: Akta Kelahiran)"
                                                                onChange={(e) => updateDocRow(idx, 'label', e.target.value)}
                                                                className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 py-1 text-sm font-bold outline-none focus:border-indigo-500 transition-colors dark:text-white"
                                                            />
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <span className="text-[10px] font-black text-slate-400 uppercase">Key:</span>
                                                                <input 
                                                                    type="text" 
                                                                    value={doc.key} 
                                                                    placeholder="key_dokumen"
                                                                    onChange={(e) => updateDocRow(idx, 'key', e.target.value)}
                                                                    className="bg-transparent text-[10px] font-mono text-indigo-600 dark:text-indigo-400 outline-none"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4 shrink-0 sm:ml-4">
                                                            <button 
                                                                onClick={() => updateDocRow(idx, 'isRequired', !doc.isRequired)}
                                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-widest transition-all ${doc.isRequired ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-gray-50 border-gray-200 text-slate-400'}`}
                                                            >
                                                                {doc.isRequired ? <CheckSquare size={12} /> : <Square size={12} />} Required
                                                            </button>
                                                            <button onClick={() => removeDocRow(idx)} className="text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={18} /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button onClick={addDocRow} className="w-full py-4 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-500/30 transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"><Plus size={16} /> Tambah Baris Syarat</button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6 sm:p-8 border-t border-gray-100 dark:border-white/5 shrink-0">
                                    <button 
                                        disabled={isSavingDocs}
                                        onClick={saveDocRequirements}
                                        className="w-full py-4 sm:py-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-[24px] font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3"
                                    >
                                        {isSavingDocs ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Simpan Konfigurasi Dokumen
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
