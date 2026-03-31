'use client';

import MediaUploadButton from '@/components/admin/MediaUploadButton';
import type { PPDBBrochureFormValue, PPDBBrochureItem } from '@/lib/admin-ppdb';
import type { PPDBWave } from '@/lib/types';

type Props = {
    brochures: PPDBBrochureItem[];
    brochureForm: PPDBBrochureFormValue;
    editingBrochureId: string | null;
    waves: PPDBWave[];
    waveNameMap: Map<string, string>;
    onBrochureFormChange: (value: PPDBBrochureFormValue) => void;
    onSaveBrochure: () => void;
    onEditBrochure: (item: PPDBBrochureItem) => void;
    onDeleteBrochure: (id: string) => void;
};

export default function PpdbBrochuresTab({
    brochures,
    brochureForm,
    editingBrochureId,
    waves,
    waveNameMap,
    onBrochureFormChange,
    onSaveBrochure,
    onEditBrochure,
    onDeleteBrochure,
}: Props) {
    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="rounded-3xl border border-emerald-900/20 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 lg:col-span-1">
                <h3 className="mb-4 text-lg font-semibold">{editingBrochureId ? 'Edit Brosur' : 'Tambah Brosur'}</h3>
                <div className="space-y-4">
                    <select
                        value={brochureForm.waveId}
                        onChange={(event) => onBrochureFormChange({ ...brochureForm, waveId: event.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                    >
                        <option value="">Pilih Gelombang</option>
                        {waves.map((wave) => (
                            <option key={wave.id} value={wave.id}>
                                {wave.name}
                            </option>
                        ))}
                    </select>
                    <input
                        type="text"
                        value={brochureForm.caption}
                        onChange={(event) => onBrochureFormChange({ ...brochureForm, caption: event.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                        placeholder="Caption brosur"
                    />
                    <input
                        type="number"
                        value={brochureForm.displayOrder}
                        onChange={(event) => onBrochureFormChange({ ...brochureForm, displayOrder: Number(event.target.value) })}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                        placeholder="Urutan tampil"
                    />
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={brochureForm.isMain}
                            onChange={(event) => onBrochureFormChange({ ...brochureForm, isMain: event.target.checked })}
                        />
                        Jadikan Utama
                    </label>
                    <div className="space-y-2">
                        <MediaUploadButton
                            folder="mis-al-falah/ppdb/brosur"
                            label="Upload Brosur"
                            onUploaded={(url) => onBrochureFormChange({ ...brochureForm, mediaUrl: url })}
                        />
                        {brochureForm.mediaUrl && <img src={brochureForm.mediaUrl} alt="Preview" className="w-full rounded-xl border border-emerald-100" />}
                    </div>
                    <button onClick={onSaveBrochure} className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                        {editingBrochureId ? 'Simpan Perubahan' : 'Tambah Brosur'}
                    </button>
                </div>
            </div>

            <div className="rounded-3xl border border-emerald-900/20 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 lg:col-span-2">
                <h3 className="mb-4 text-lg font-semibold">Daftar Brosur</h3>
                <div className="space-y-3">
                    {brochures.map((item) => (
                        <div key={item.id} className="flex flex-col gap-3 rounded-2xl border border-emerald-900/10 p-4 dark:border-white/10">
                            <div className="flex items-start gap-3">
                                <img src={item.mediaUrl} alt={item.caption || 'Brosur'} className="h-20 w-28 rounded-lg object-cover" />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold">{item.caption || 'Tanpa judul'}</p>
                                    <p className="text-xs text-gray-500">Gelombang: {waveNameMap.get(item.entityId) || '-'}</p>
                                    <p className="text-xs text-gray-500">Urutan: {item.displayOrder}</p>
                                    {item.isMain && <span className="text-[11px] text-emerald-600">Utama</span>}
                                </div>
                            </div>
                            <div className="flex gap-2 text-xs">
                                <button onClick={() => onEditBrochure(item)} className="text-emerald-600">Edit</button>
                                <button onClick={() => onDeleteBrochure(item.id)} className="text-red-500">Hapus</button>
                            </div>
                        </div>
                    ))}
                    {brochures.length === 0 && <p className="text-sm text-gray-500">Belum ada brosur.</p>}
                </div>
            </div>
        </div>
    );
}
