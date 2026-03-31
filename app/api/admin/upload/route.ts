export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { buildStoragePath, deleteObjectsFromBucket, extractStorageIdentityFromUrl, getObjectMetadata, uploadObjectToBucket } from '@/lib/r2-storage';
import { requireAdminRole } from '@/lib/admin-auth';
import { validateUploadPolicy } from '@/lib/upload-policy';
import { logError } from '@/lib/logger';
import { checkStorageQuota, updateStorageUsage } from '@/lib/storage-quota';

const allowedEntityTypes = new Set([
    'news',
    'publication',
    'achievement',
    'gallery',
    'download',
    'academic',
    'ppdb',
]);
const isUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export async function POST(request: NextRequest) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const folder = ((formData.get('folder') as string) || 'general').trim();
        const entityType = (formData.get('entityType') as string) || null;
        const entityId = (formData.get('entityId') as string) || null;
        const caption = ((formData.get('caption') as string) || '').trim();
        const isMain = formData.get('isMain') === 'true';
        const replaceUrl = formData.get('replaceUrl') as string | null;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }
        const validation = validateUploadPolicy(file, 'publikweb');
        if (!validation.ok) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }

        // Quota check
        const quotaCheck = await checkStorageQuota(file.size);
        if (!quotaCheck.ok) {
            return NextResponse.json({ error: quotaCheck.error }, { status: 403 });
        }
        if (entityType && !allowedEntityTypes.has(entityType)) {
            return NextResponse.json({ error: 'entityType tidak valid.' }, { status: 400 });
        }
        if (entityId && !isUuid(entityId)) {
            return NextResponse.json({ error: 'entityId tidak valid.' }, { status: 400 });
        }

        const safeName = (file.name || 'upload.bin').replace(/[^a-zA-Z0-9._-]/g, '_');
        const customPath = formData.get('path') as string | null;
        const path = customPath ? customPath : buildStoragePath(folder || 'general', safeName);
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
                logError('admin.upload.replaceUrlCleanup', err);
            }
        }

        // Update database quota with new file size
        await updateStorageUsage(metadata.sizeBytes);

        let mediaItem: { id: string } | null = null;
        if (entityType && entityId) {
            const mediaType = file.type?.startsWith('video/') ? 'video' : 'image';
            mediaItem = await prisma.media_items.create({
                data: {
                    entity_type: entityType,
                    entity_id: entityId,
                    media_type: mediaType,
                    media_url: metadata.url,
                    storage_provider: metadata.provider,
                    storage_bucket: metadata.bucket,
                    storage_path: metadata.path,
                    thumbnail_url: mediaType === 'image' ? metadata.url : null,
                    caption: caption || file.name || null,
                    is_main: isMain,
                    display_order: 0,
                },
                select: { id: true },
            });
        }

        return NextResponse.json({
            id: mediaItem?.id ?? null,
            url: metadata.url,
            mediaUrl: metadata.url,
            mediaType: file.type?.startsWith('video/') ? 'video' : 'image',
            caption: caption || file.name || '',
            storageProvider: metadata.provider,
            storageBucket: metadata.bucket,
            storagePath: metadata.path,
            metadata,
        });
    } catch (error) {
        logError('admin.upload.POST', error);
        return NextResponse.json({ error: 'Upload gagal.' }, { status: 500 });
    }
}
