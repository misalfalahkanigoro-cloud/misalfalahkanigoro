'use client';

import React from 'react';
import { StorageUploadWidget } from '@/components/r2-upload-widget';
import { Upload } from 'lucide-react';

type Props = {
    folder?: string;
    replaceUrl?: string; // URL file lama untuk dihapus
    label?: string;
    className?: string;
    onUploaded: (url: string, info?: any) => void;
    disabled?: boolean;
};

const MediaUploadButton: React.FC<Props> = ({ folder = 'media', replaceUrl, label = 'Upload', className = '', onUploaded, disabled }) => {
    const canUpload = !disabled;

    if (!canUpload) {
        return (
            <button
                type="button"
                disabled
                className={`inline-flex items-center gap-2 rounded-lg border border-emerald-300 px-3 py-2 text-sm text-emerald-300 cursor-not-allowed ${className}`}
                title="Upload tidak tersedia"
            >
                <Upload size={14} /> {label}
            </button>
        );
    }

    return (
        <StorageUploadWidget
            options={{ folder, replaceUrl }}
            onSuccess={(result: any) => {
                const info = (result as any)?.info;
                const url = info?.secure_url || info?.url;
                if (url) onUploaded(url, info);
            }}
        >
            {({ open }) => (
                <button
                    type="button"
                    onClick={() => open()}
                    className={`inline-flex items-center gap-2 rounded-lg border border-emerald-600 px-3 py-2 text-sm text-emerald-600 ${className}`}
                >
                    <Upload size={14} /> {label}
                </button>
            )}
        </StorageUploadWidget>
    );
};

export default MediaUploadButton;
