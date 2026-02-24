'use client';

import React, { useMemo, useRef, useState } from 'react';

type UploadOptions = {
    folder?: string;
    resourceType?: string;
    sources?: string[];
    clientAllowedFormats?: string[];
    maxFileSize?: number;
    multiple?: boolean;
};

type UploadSuccessPayload = {
    event: 'success';
    info: {
        secure_url: string;
        url: string;
        public_id: string;
    };
};

type UploadErrorPayload = {
    event: 'error';
    error: {
        message: string;
    };
};

type CldUploadWidgetProps = {
    uploadPreset?: string;
    options?: UploadOptions;
    onSuccess?: (result: UploadSuccessPayload) => void;
    onError?: (error: UploadErrorPayload) => void;
    children: (args: { open: () => void; isUploading: boolean }) => React.ReactNode;
};

const extensionAcceptList = (formats?: string[]) => {
    if (!formats || formats.length === 0) return '';
    return formats
        .map((format) => format.trim().toLowerCase())
        .filter(Boolean)
        .map((format) => `.${format}`)
        .join(',');
};

const buildAcceptAttribute = (options?: UploadOptions) => {
    const extList = extensionAcceptList(options?.clientAllowedFormats);
    if (extList) return extList;
    if (options?.resourceType === 'image') return 'image/*';
    if (options?.resourceType === 'video') return 'video/*';
    return '';
};

const normalizeFolder = (folder?: string) => {
    const raw = (folder || 'general').trim().replace(/^\/+|\/+$/g, '');
    return raw || 'general';
};

export const CldUploadWidget: React.FC<CldUploadWidgetProps> = ({
    options,
    onSuccess,
    onError,
    children,
}) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const accept = useMemo(() => buildAcceptAttribute(options), [options]);
    const multiple = Boolean(options?.multiple);
    const maxFileSize = options?.maxFileSize;
    const folder = normalizeFolder(options?.folder);

    const emitError = (message: string) => {
        onError?.({
            event: 'error',
            error: { message },
        });
    };

    const uploadSingleFile = async (file: File) => {
        if (maxFileSize && file.size > maxFileSize) {
            throw new Error(`Ukuran file melebihi batas ${Math.round(maxFileSize / (1024 * 1024))}MB`);
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const response = await fetch('/api/upload/media', {
            method: 'POST',
            body: formData,
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok || !payload?.url) {
            throw new Error(payload?.error || 'Gagal upload file');
        }

        onSuccess?.({
            event: 'success',
            info: {
                secure_url: payload.url,
                url: payload.url,
                public_id: payload.publicId || payload.url,
            },
        });
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        setIsUploading(true);
        try {
            if (multiple) {
                for (const file of files) {
                    await uploadSingleFile(file);
                }
            } else {
                await uploadSingleFile(files[0]);
            }
        } catch (error) {
            emitError(error instanceof Error ? error.message : 'Gagal upload file');
        } finally {
            setIsUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    const open = () => {
        if (isUploading) return;
        inputRef.current?.click();
    };

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleFileChange}
                className="hidden"
            />
            {children({ open, isUploading })}
        </>
    );
};

export default CldUploadWidget;
