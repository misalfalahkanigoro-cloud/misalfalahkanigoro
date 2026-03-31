export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { buildStoragePath, uploadObjectToBucket } from '@/lib/r2-storage';
import { logError } from '@/lib/logger';
import { checkStorageQuota, updateStorageUsage } from '@/lib/storage-quota';

const MAX_PPDB_UPLOAD_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_MIME = new Set(['image/jpeg', 'image/png']);
const ALLOWED_IMAGE_EXT = new Set(['jpg', 'jpeg', 'png']);

const getFileExtension = (fileName: string) => {
    const normalized = String(fileName || '').trim().toLowerCase();
    if (!normalized.includes('.')) return '';
    return normalized.split('.').pop() || '';
};

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (file.size <= 0 || file.size > MAX_PPDB_UPLOAD_BYTES) {
            return NextResponse.json({ error: 'Ukuran file maksimal 2 MB.' }, { status: 400 });
        }

        const mimeType = (file.type || '').toLowerCase();
        const extension = getFileExtension(file.name);
        if (!ALLOWED_IMAGE_MIME.has(mimeType) && !ALLOWED_IMAGE_EXT.has(extension)) {
            return NextResponse.json({ error: 'Hanya file JPG atau PNG yang diizinkan.' }, { status: 400 });
        }

        const quotaCheck = await checkStorageQuota(file.size);
        if (!quotaCheck.ok) {
            return NextResponse.json({ error: quotaCheck.error }, { status: 403 });
        }

        const safeName = (file.name || 'ppdb-upload.bin').replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = buildStoragePath('ppdb', safeName);
        const metadata = await uploadObjectToBucket({
            bucket: 'publikweb',
            path,
            file,
            contentType: mimeType || 'application/octet-stream',
        });

        await updateStorageUsage(metadata.sizeBytes);

        return NextResponse.json({
            success: true,
            url: metadata.url,
            publicId: metadata.path,
            path: metadata.path,
            storageProvider: metadata.provider,
            storageBucket: metadata.bucket,
            storagePath: metadata.path,
            metadata,
        });
    } catch (error) {
        logError('ppdb.upload.POST', error);
        return NextResponse.json({ error: 'Gagal upload file.' }, { status: 500 });
    }
}
