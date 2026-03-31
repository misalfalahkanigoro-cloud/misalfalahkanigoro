export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { buildStoragePath, deleteObjectsFromBucket, extractStorageIdentityFromUrl, getObjectMetadata, uploadObjectToBucket } from '@/lib/r2-storage';
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
        const folder = ((formData.get('folder') as string) || 'publikweb').trim();
        const replaceUrl = formData.get('replaceUrl') as string | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }
        const validation = validateUploadPolicy(file, 'media');
        if (!validation.ok) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }

        // Quota check
        const quotaCheck = await checkStorageQuota(file.size);
        if (!quotaCheck.ok) {
            return NextResponse.json({ error: quotaCheck.error }, { status: 403 });
        }

        const safeName = (file.name || 'upload.bin').replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = buildStoragePath(folder || 'publikweb', safeName);
        const metadata = await uploadObjectToBucket({
            bucket: 'publikweb',
            path,
            file,
            contentType: file.type || 'application/octet-stream',
        });

        // Delete old file if provided
        if (replaceUrl) {
            try {
                const identity = extractStorageIdentityFromUrl(replaceUrl);
                if (identity && identity.path) {
                    const oldMetadata = await getObjectMetadata(identity.bucket, identity.path);
                    await deleteObjectsFromBucket(identity.bucket, [identity.path]);
                    if (oldMetadata?.ContentLength) {
                        await updateStorageUsage(-oldMetadata.ContentLength);
                    }
                }
            } catch (err) {
                logError('upload.media.replaceUrlCleanup', err);
            }
        }

        // Update database quota with new file size
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
        logError('upload.media.POST', error);
        return NextResponse.json({ error: 'Gagal upload file.' }, { status: 500 });
    }
}
