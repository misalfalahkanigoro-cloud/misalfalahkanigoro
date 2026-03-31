'use client';

import React from 'react';
import { Upload } from 'lucide-react';
import { StorageUploadWidget } from '@/components/r2-upload-widget';

export const SectionTitle: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
    <div>
        <h3 className="text-lg font-semibold text-emerald-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-xs text-emerald-700/70">{subtitle}</p>}
    </div>
);

export const InputField: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
    type?: string;
    multiline?: boolean;
    onBlur?: () => void;
}> = ({ label, value, onChange, placeholder, error, type = 'text', multiline, onBlur }) => (
    <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-emerald-900">{label} *</label>
        {multiline ? (
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                className="rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
                rows={3}
                placeholder={placeholder}
            />
        ) : (
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                className="rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
                placeholder={placeholder}
            />
        )}
        {error && <span className="text-[11px] text-red-600">{error}</span>}
    </div>
);

export const SelectField: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    error?: string;
}> = ({ label, value, onChange, options, error }) => (
    <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-emerald-900">{label} *</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
        {error && <span className="text-[11px] text-red-600">{error}</span>}
    </div>
);

export const FileUploadCard: React.FC<{
    label: string;
    value: string;
    error?: string;
    onUploaded: (url: string) => void;
}> = ({ label, value, error, onUploaded }) => {
    const canUpload = true;

    return (
        <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-emerald-900 mb-3">{label}</p>
            {value ? (
                <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-emerald-50 mb-3">
                    <img src={value} alt={label} className="h-full w-full object-cover" />
                </div>
            ) : (
                <div className="flex items-center justify-center rounded-xl border border-dashed border-emerald-200 bg-emerald-50/50 p-6 text-xs text-emerald-700 mb-3">
                    Belum ada berkas
                </div>
            )}
            {canUpload ? (
                <StorageUploadWidget
                    endpoint="/api/ppdb/upload"
                    options={{
                        folder: 'ppdb',
                        sources: ['local'],
                        clientAllowedFormats: ['png', 'jpg', 'jpeg'],
                        maxFileSize: 2000000,
                        multiple: false,
                    }}
                    onSuccess={(result: any) => {
                        const info = result?.info as any;
                        const url = info?.secure_url || info?.url;
                        if (url) onUploaded(url);
                    }}
                >
                    {({ open }) => (
                        <button
                            type="button"
                            onClick={() => open?.()}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white"
                        >
                            <Upload size={14} /> Upload
                        </button>
                    )}
                </StorageUploadWidget>
            ) : (
                <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl bg-gray-300 px-4 py-2 text-xs font-semibold text-gray-600"
                    disabled
                >
                    <Upload size={14} /> Upload belum aktif
                </button>
            )}
            {error && <p className="mt-2 text-[11px] text-red-600">{error}</p>}
        </div>
    );
};
