'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Image as ImageIcon, FileText, Code, Upload } from 'lucide-react';
import { api } from '@/lib/api';
import type { ContentMediaType } from '@/lib/types';

export type MediaForm = {
    id?: number;
    mediaType: ContentMediaType;
    url: string;
    embedHtml: string;
    caption: string;
    displayOrder: number;
    isActive: boolean;
};

interface MediaManagerProps {
    items: MediaForm[];
    onChange: (items: MediaForm[]) => void;
    onMessage?: (message: string) => void;
}

const MEDIA_OPTIONS: Array<{ label: string; value: ContentMediaType; icon: any }> = [
    { label: 'Gambar', value: 'image', icon: ImageIcon },
    { label: 'File', value: 'file', icon: FileText },
    { label: 'Embed', value: 'embed', icon: Code },
];

const MediaManager: React.FC<MediaManagerProps> = ({ items, onChange, onMessage }) => {
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

    const addItem = () => {
        onChange([
            ...items,
            {
                mediaType: 'image',
                url: '',
                embedHtml: '',
                caption: '',
                displayOrder: items.length + 1,
                isActive: true,
            },
        ]);
    };

    const removeItem = (index: number) => {
        onChange(items.filter((_, idx) => idx !== index));
    };

    const updateItem = (index: number, field: keyof MediaForm, value: any) => {
        onChange(items.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)));
    };

    const handleUpload = async (index: number, file: File) => {
        const item = items[index];
        setUploadingIndex(index);
        try {
            if (item.mediaType === 'image') {
                if (!file.type.startsWith('image/')) throw new Error('Harus berupa gambar');
                const res = await api.upload.media(file, 'mis-al-falah/publikasi/media');
                updateItem(index, 'url', res.url);
            } else if (item.mediaType === 'file') {
                const res = await api.upload.file(file, 'downloads');
                updateItem(index, 'url', res.url);
            }
        } catch (error: any) {
            onMessage?.(error.message || 'Upload gagal');
        } finally {
            setUploadingIndex(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Media Galeri / Lampiran</h3>
                <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                >
                    <Plus size={14} /> Tambah Media
                </button>
            </div>

            {items.length === 0 && (
                <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center dark:border-white/10">
                    <p className="text-sm text-gray-500">Belum ada media tambahan.</p>
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="relative rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5 space-y-3"
                    >
                        <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="absolute top-2 right-2 rounded-full p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
                        >
                            <Trash2 size={14} />
                        </button>

                        <div className="flex items-center gap-3">
                            <select
                                value={item.mediaType}
                                onChange={(e) => updateItem(index, 'mediaType', e.target.value)}
                                className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold dark:border-white/10 dark:bg-black/30"
                            >
                                {MEDIA_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                value={item.displayOrder}
                                onChange={(e) => updateItem(index, 'displayOrder', parseInt(e.target.value))}
                                className="w-16 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs dark:border-white/10 dark:bg-black/30"
                                placeholder="Urutan"
                            />
                            <label className="flex items-center gap-1.5 text-xs">
                                <input
                                    type="checkbox"
                                    checked={item.isActive}
                                    onChange={(e) => updateItem(index, 'isActive', e.target.checked)}
                                    className="h-3.5 w-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                Aktif
                            </label>
                        </div>

                        {item.mediaType === 'embed' ? (
                            <textarea
                                value={item.embedHtml}
                                onChange={(e) => updateItem(index, 'embedHtml', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-black/30"
                                rows={3}
                                placeholder="Paste iframe embed code di sini..."
                            />
                        ) : (
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={item.url}
                                        onChange={(e) => updateItem(index, 'url', e.target.value)}
                                        className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-black/30"
                                        placeholder="URL Media / File"
                                    />
                                    <label className="flex cursor-pointer items-center justify-center rounded-xl border border-emerald-600 px-3 text-emerald-600 hover:bg-emerald-50 transition">
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleUpload(index, file);
                                            }}
                                        />
                                        {uploadingIndex === index ? (
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                                        ) : (
                                            <Upload size={14} />
                                        )}
                                    </label>
                                </div>
                                {item.mediaType === 'image' && item.url && (
                                    <div className="h-24 w-full overflow-hidden rounded-lg border border-gray-100 dark:border-white/10">
                                        <img src={item.url} alt="Preview" className="h-full w-full object-cover" />
                                    </div>
                                )}
                            </div>
                        )}

                        <input
                            type="text"
                            value={item.caption}
                            onChange={(e) => updateItem(index, 'caption', e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-black/30"
                            placeholder="Keterangan / Caption"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MediaManager;
