'use client';

import type { PPDBWave, } from '@/lib/types';
import type { PPDBWaveFormValue } from '@/lib/admin-ppdb';

type Props = {
    waves: PPDBWave[];
    waveForm: PPDBWaveFormValue;
    editingWaveId: string | null;
    onWaveFormChange: (value: PPDBWaveFormValue) => void;
    onSaveWave: () => void;
    onEditWave: (wave: PPDBWave) => void;
    onDeleteWave: (id: string) => void;
};

export default function PpdbWavesTab({ waves, waveForm, editingWaveId, onWaveFormChange, onSaveWave, onEditWave, onDeleteWave }: Props) {
    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="rounded-3xl border border-emerald-900/20 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 lg:col-span-1">
                <h3 className="mb-4 text-lg font-semibold">{editingWaveId ? 'Edit Gelombang' : 'Tambah Gelombang'}</h3>
                <div className="space-y-4">
                    <input
                        type="text"
                        value={waveForm.name}
                        onChange={(event) => onWaveFormChange({ ...waveForm, name: event.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                        placeholder="Nama Gelombang"
                    />
                    <input
                        type="date"
                        value={waveForm.startDate}
                        onChange={(event) => onWaveFormChange({ ...waveForm, startDate: event.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                    />
                    <input
                        type="date"
                        value={waveForm.endDate}
                        onChange={(event) => onWaveFormChange({ ...waveForm, endDate: event.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                    />
                    <input
                        type="number"
                        value={waveForm.quota}
                        onChange={(event) => onWaveFormChange({ ...waveForm, quota: event.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                        placeholder="Kuota"
                    />
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={waveForm.isActive}
                            onChange={(event) => onWaveFormChange({ ...waveForm, isActive: event.target.checked })}
                        />
                        Aktif
                    </label>
                    <button onClick={onSaveWave} className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                        {editingWaveId ? 'Simpan Perubahan' : 'Tambah Gelombang'}
                    </button>
                </div>
            </div>

            <div className="rounded-3xl border border-emerald-900/20 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 lg:col-span-2">
                <h3 className="mb-4 text-lg font-semibold">Daftar Gelombang</h3>
                <div className="space-y-3">
                    {waves.map((wave) => (
                        <div key={wave.id} className="flex flex-col gap-2 rounded-2xl border border-emerald-900/10 p-4 dark:border-white/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold">{wave.name}</p>
                                    <p className="text-xs text-gray-500">{wave.startDate} - {wave.endDate}</p>
                                </div>
                                <span className={`rounded-full px-2 py-1 text-[11px] ${wave.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {wave.isActive ? 'Aktif' : 'Nonaktif'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500">Kuota: {wave.quota ?? '-'}</p>
                            <div className="flex gap-2">
                                <button onClick={() => onEditWave(wave)} className="text-xs text-emerald-600">Edit</button>
                                <button onClick={() => onDeleteWave(wave.id)} className="text-xs text-red-500">Hapus</button>
                            </div>
                        </div>
                    ))}
                    {waves.length === 0 && <p className="text-sm text-gray-500">Belum ada gelombang.</p>}
                </div>
            </div>
        </div>
    );
}
