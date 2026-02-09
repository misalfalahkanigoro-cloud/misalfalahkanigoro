'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Upload, Trash2, File, AlertCircle } from 'lucide-react';
import { CldUploadWidget } from 'next-cloudinary';
import SidebarAdmin from '@/components/sidebar-admin';
import { api } from '@/lib/api';
import type { Download } from '@/lib/types';

const AdminDownloadEditPage: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const isNew = id === 'create';

    const [form, setForm] = useState<Partial<Download>>({
        title: '',
        slug: '',
        description: '',
        fileUrl: '',
        coverUrl: '',
        isPublished: true,
        downloadCount: 0,
    });

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';

    useEffect(() => {
        if (!isNew && id) {
            const fetchData = async () => {
                try {
                    const res = await api.getDownloadDetail(id);
                    if (res) {
                        setForm(res);
                    }
                } catch (error) {
                    console.error('Failed to fetch download:', error);
                    alert('Gagal memuat data download');
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [id, isNew]);

    const handleSave = async () => {
        if (!form.title) return alert('Nama file wajib diisi');
        if (!form.fileUrl) return alert('File wajib diupload');

        setSaving(true);
        try {
            if (isNew) {
                await api.createDownload(form as any);
            } else {
                await api.updateDownload(id, form as any);
            }
            router.push('/admin/download');
            router.refresh();
        } catch (error) {
            console.error('Failed to save download:', error);
            alert('Gagal menyimpan download');
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setUploading(true);
        try {
            const file = e.target.files[0];
            const res = await api.upload.file(file, 'downloads');

            setForm(prev => ({
                ...prev,
                fileUrl: res.fileUrl,
                fileType: res.fileType || file.name.split('.').pop(),
                fileSizeKb: res.fileSizeKb
            }));
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Gagal mengupload file');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleCoverUpload = (result: any) => {
        if (result?.event !== 'success') return;
        const info = result.info as any;
        const url = info?.secure_url || info?.url;
        if (url) setForm((prev) => ({ ...prev, coverUrl: url }));
    };

    // Auto-generate slug
    useEffect(() => {
        if (isNew && form.title && !form.slug) {
            const slug = form.title.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
            setForm(prev => ({ ...prev, slug }));
        }
    }, [form.title, isNew]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-[#0B0F0C] flex items-center justify-center">
                <p className="text-gray-500">Memuat data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors dark:bg-[#0B0F0C] dark:text-gray-100">
            <SidebarAdmin />
            <main className="min-h-screen px-6 py-10 lg:pl-80 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-400 hover:text-emerald-600 transition shadow-sm"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {isNew ? 'Upload File Baru' : 'Edit File Download'}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Kembali ke daftar download</p>
                        </div>
                    </div>
                </div>

                <div className="max-w-3xl">
                    <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5 space-y-6">

                        {/* File Upload Area */}
                        <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 text-center">
                            {form.fileUrl ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-2">
                                        <File size={32} />
                                    </div>
                                    <p className="font-bold text-gray-900 dark:text-white break-all max-w-full px-4">
                                        {form.fileUrl.split('/').pop()}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {form.fileType?.toUpperCase()} • {form.fileSizeKb ? `${(form.fileSizeKb / 1024).toFixed(2)} MB` : ''}
                                    </p>
                                    <button
                                        onClick={() => setForm({ ...form, fileUrl: '', fileSizeKb: null, fileType: '' })}
                                        className="mt-2 text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                                    >
                                        <Trash2 size={14} /> Ganti File
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Upload size={32} />
                                    </div>
                                    <p className="text-gray-900 dark:text-white font-medium mb-1">Upload File Anda</p>
                                    <p className="text-gray-500 text-sm mb-4">PDF, DOCX, XLSX, ZIP, atau Gambar (Max 50MB)</p>
                                    <label className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition cursor-pointer ${uploading ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                                        {uploading ? 'Mengupload...' : 'Pilih File'}
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={handleFileUpload}
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nama File</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-emerald-500 focus:ring-0 transition font-bold"
                                    placeholder="Contoh: Jadwal Pelajaran 2024"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Slug</label>
                                <input
                                    type="text"
                                    value={form.slug}
                                    onChange={e => setForm({ ...form, slug: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-emerald-500 focus:ring-0 transition text-sm font-mono text-gray-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Status</label>
                                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/10 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                    <input
                                        type="checkbox"
                                        checked={form.isPublished}
                                        onChange={e => setForm({ ...form, isPublished: e.target.checked })}
                                        className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Publikasikan</span>
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Cover (Opsional)</label>
                                <div className="flex items-center gap-3">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                                        {form.coverUrl ? (
                                            <img src={form.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xs text-gray-400">No cover</span>
                                        )}
                                    </div>
                                    {uploadPreset ? (
                                        <CldUploadWidget
                                            uploadPreset={uploadPreset}
                                            options={{ folder: 'mis-al-falah/downloads/cover' }}
                                            onSuccess={handleCoverUpload}
                                        >
                                            {({ open }) => (
                                                <button
                                                    type="button"
                                                    onClick={() => open()}
                                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-600 text-emerald-600"
                                                >
                                                    <Upload size={14} /> Upload
                                                </button>
                                            )}
                                        </CldUploadWidget>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled
                                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-300 text-emerald-300 cursor-not-allowed"
                                            title="Set NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET"
                                        >
                                            <Upload size={14} /> Upload
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Deskripsi (Opsional)</label>
                            <textarea
                                value={form.description || ''}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-emerald-500 focus:ring-0 transition h-24 resize-none"
                                placeholder="Keterangan tambahan tentang file ini..."
                            />
                        </div>

                        <hr className="border-gray-100 dark:border-white/10" />

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {saving ? 'Processing...' : <><Save size={18} /> Simpan File</>}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDownloadEditPage;
