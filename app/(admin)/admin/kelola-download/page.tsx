'use client';

import React, { useEffect, useState } from 'react';
import SidebarAdmin from '@/components/sidebar-admin';
import { Plus, Save, Trash2, Upload } from 'lucide-react';
import { api } from '@/lib/api';
import type { Download } from '@/lib/types';

type DownloadFileForm = {
    id?: string;
    downloadId: string;
    fileName: string;
    fileType: string;
    fileSizeKb: number | null;
    publicUrl: string;
    storagePath?: string;
    displayOrder: number;
};

const DEFAULT_FORM: DownloadFileForm = {
    downloadId: '',
    fileName: '',
    fileType: 'application/pdf',
    fileSizeKb: null,
    publicUrl: '',
    storagePath: '',
    displayOrder: 0,
};

const AdminDownloadPage: React.FC = () => {
    const [items, setItems] = useState<DownloadFileForm[]>([]);
    const [downloads, setDownloads] = useState<Download[]>([]);
    const [form, setForm] = useState<DownloadFileForm>(DEFAULT_FORM);
    const [editingId, setEditingId] = useState<string | null>(null);

    const fetchItems = async () => {
        const res = await fetch('/api/admin/download-files');
        const data = await res.json();
        const mapped = (Array.isArray(data) ? data : []).map((item: any) => ({
            id: item.id,
            downloadId: item.download_id ?? item.downloadId ?? '',
            fileName: item.file_name ?? item.fileName ?? '',
            fileType: item.file_type ?? item.fileType ?? '',
            fileSizeKb: item.file_size_kb ?? item.fileSizeKb ?? null,
            publicUrl: item.public_url ?? item.publicUrl ?? '',
            storagePath: item.storage_path ?? item.storagePath ?? '',
            displayOrder: item.display_order ?? item.displayOrder ?? 0,
        }));
        setItems(mapped);
    };

    const fetchDownloads = async () => {
        try {
            const res = await api.getDownloads();
            const list = Array.isArray((res as any).items) ? (res as any).items : res;
            setDownloads(list || []);
            if (!form.downloadId && list?.[0]) {
                setForm((prev) => ({ ...prev, downloadId: list[0].id }));
            }
        } catch (e) {
            console.error('Failed to fetch downloads', e);
        }
    };

    useEffect(() => {
        fetchItems();
        fetchDownloads();
    }, []);

    const handleSubmit = async () => {
        if (!form.downloadId) return alert('Pilih item download');
        if (!form.publicUrl) return alert('Upload atau isi URL file');
        if (!form.fileName) return alert('Nama file wajib diisi');

        const url = editingId ? `/api/admin/download-files/${editingId}` : '/api/admin/download-files';
        const method = editingId ? 'PUT' : 'POST';
        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        setForm((prev) => ({ ...DEFAULT_FORM, downloadId: prev.downloadId || downloads[0]?.id || '' }));
        setEditingId(null);
        fetchItems();
    };

    const handleEdit = (item: DownloadFileForm) => {
        setEditingId(item.id || null);
        setForm({
            id: item.id,
            downloadId: item.downloadId || '',
            fileName: item.fileName || '',
            fileType: item.fileType || 'application/pdf',
            fileSizeKb: item.fileSizeKb ?? null,
            publicUrl: item.publicUrl || '',
            storagePath: item.storagePath || '',
            displayOrder: item.displayOrder ?? 0,
        });
    };

    const handleDelete = async (id?: string) => {
        if (!id) return;
        await fetch(`/api/admin/download-files/${id}`, { method: 'DELETE' });
        fetchItems();
    };

    const handleUpload = async (file: File) => {
        const res = await api.upload.file(file, 'downloads');
        setForm((prev) => ({
            ...prev,
            publicUrl: res.fileUrl,
            storagePath: res.path,
            fileType: res.fileType,
            fileSizeKb: res.fileSizeKb,
            fileName: prev.fileName || file.name,
        }));
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors dark:bg-[#0B0F0C] dark:text-gray-100">
            <SidebarAdmin />
            <main className="min-h-screen px-6 py-10 lg:pl-80 space-y-8">
                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">Kelola Lampiran Download</h2>
                        <button onClick={() => { setForm({ ...DEFAULT_FORM, downloadId: downloads[0]?.id || '' }); setEditingId(null); }} className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 px-4 py-2 text-sm text-emerald-600">
                            <Plus size={16} /> Tambah Baru
                        </button>
                    </div>
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Pilih Download</label>
                            <select
                                value={form.downloadId}
                                onChange={(e) => setForm({ ...form, downloadId: e.target.value })}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            >
                                {downloads.map((d) => (
                                    <option key={d.id} value={d.id}>{d.title}</option>
                                ))}
                            </select>
                        </div>
                        <input
                            value={form.fileName}
                            onChange={(e) => setForm({ ...form, fileName: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            placeholder="Nama file (tampilan)"
                        />
                        <select
                            value={form.fileType}
                            onChange={(e) => setForm({ ...form, fileType: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                        >
                            <option value="application/pdf">PDF</option>
                            <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">DOCX</option>
                            <option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">XLSX</option>
                            <option value="application/zip">ZIP</option>
                            <option value="application/octet-stream">Lainnya</option>
                        </select>
                        <input
                            type="number"
                            value={form.fileSizeKb || ''}
                            onChange={(e) => setForm({ ...form, fileSizeKb: Number(e.target.value) || null })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            placeholder="Ukuran (KB)"
                        />
                        <input
                            type="number"
                            value={form.displayOrder}
                            onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) || 0 })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            placeholder="Urutan"
                        />
                        <div className="flex items-center gap-3 md:col-span-2">
                            <input
                                value={form.publicUrl}
                                onChange={(e) => setForm({ ...form, publicUrl: e.target.value })}
                                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                placeholder="Public URL file"
                            />
                            <label className="flex cursor-pointer items-center justify-center rounded-xl border border-emerald-600 px-3 text-emerald-600">
                                <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                                <Upload size={14} />
                            </label>
                        </div>
                        <button onClick={handleSubmit} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white">
                            <Save size={16} /> Simpan
                        </button>
                    </div>
                </div>

                <div className="rounded-3xl border border-emerald-900/20 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <div className="space-y-3">
                        {items.map((item) => (
                            <div key={item.id} className="flex items-start justify-between gap-4 rounded-2xl border border-emerald-900/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
                                <div>
                                    <p className="text-sm font-semibold">{item.fileName}</p>
                                    <p className="text-xs text-gray-500">Download ID: {item.downloadId}</p>
                                    <p className="text-[11px] text-emerald-600 break-all">{item.publicUrl}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleEdit(item)} className="rounded-lg border border-emerald-600 px-3 py-1 text-xs text-emerald-600">Edit</button>
                                    <button onClick={() => handleDelete(item.id)} className="rounded-lg border border-red-500 px-3 py-1 text-xs text-red-500"><Trash2 size={12} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDownloadPage;
