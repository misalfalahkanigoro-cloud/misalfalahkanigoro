export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { buildStoragePath, uploadObjectToBucket } from '@/lib/r2-storage';
import { requireAdminRole } from '@/lib/admin-auth';
import { validateUploadPolicy } from '@/lib/upload-policy';
import { logError } from '@/lib/logger';
import { checkStorageQuota, updateStorageUsage } from '@/lib/storage-quota';

export async function POST(request: NextRequest) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const bucket = ((formData.get('bucket') as string) || 'downloads').trim();
        const folder = ((formData.get('folder') as string) || '').trim();
        const allowedBuckets = new Set(['downloads', 'publikweb']);

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }
        if (!allowedBuckets.has(bucket)) {
            return NextResponse.json({ error: 'Bucket tidak valid.' }, { status: 400 });
        }
        const validation = validateUploadPolicy(file, 'document');
        if (!validation.ok) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }

        // Quota check
        const quotaCheck = await checkStorageQuota(file.size);
        if (!quotaCheck.ok) {
            return NextResponse.json({ error: quotaCheck.error }, { status: 403 });
        }

        const safeName = (file.name || 'upload.bin').replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = buildStoragePath(folder || bucket || 'uploads', safeName);

        const metadata = await uploadObjectToBucket({
            bucket: bucket === 'downloads' ? 'publikweb' : (bucket || 'publikweb'),
            path,
            file,
            contentType: file.type || 'application/octet-stream',
        });

        // Update database quota with new file size
        await updateStorageUsage(metadata.sizeBytes);

        return NextResponse.json({
            success: true,
            url: metadata.url,
            path: metadata.path,
            fileType: metadata.mimeType,
            fileName: metadata.fileName,
            fileSizeKb: Math.round((metadata.sizeBytes || 0) / 1024),
            storageProvider: metadata.provider,
            storageBucket: metadata.bucket,
            storagePath: metadata.path,
            metadata,
        });
    } catch (error) {
        logError('upload.file.POST', error);
        return NextResponse.json({ error: 'Gagal upload file.' }, { status: 500 });
    }
}
