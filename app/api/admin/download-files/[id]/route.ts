import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
    deleteObjectsFromBucket,
    extractStorageIdentityFromUrl,
    getPublicUrl,
    resolveBucketName,
} from '@/lib/r2-storage';
import { requireAdminRole } from '@/lib/admin-auth';
import { logError } from '@/lib/logger';

const normalizeStoragePath = (value: string) => value.replace(/^\/+/, '').replace(/\/+$/, '');

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const payload = await request.json();

        const publicUrlInput = payload.publicUrl || payload.url || null;
        const storageFromUrl = extractStorageIdentityFromUrl(publicUrlInput);
        const storageProvider = payload.storageProvider || 'r2';
        const storageBucket = resolveBucketName(payload.storageBucket || payload.bucket || storageFromUrl?.bucket || 'downloads', 'downloads');
        const storagePath = payload.storagePath || payload.path || storageFromUrl?.path || null;
        const normalizedPath = storagePath ? normalizeStoragePath(String(storagePath)) : null;

        let publicUrl = publicUrlInput;
        if (!publicUrl && normalizedPath) {
            publicUrl = getPublicUrl(storageBucket, normalizedPath);
        }

        const fileName =
            payload.fileName ||
            (normalizedPath && normalizedPath.includes('/') ? normalizedPath.split('/').pop() : normalizedPath) ||
            null;

        if (!payload.downloadId || !fileName || !normalizedPath) {
            return NextResponse.json(
                { error: 'downloadId, fileName, dan storagePath wajib diisi.' },
                { status: 400 }
            );
        }

        const existing = await prisma.download_files.findUnique({
            where: { id },
            select: {
                storage_provider: true,
                storage_bucket: true,
                storage_path: true,
            },
        });

        if (!existing) {
            return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
        }

        const updated = await prisma.download_files.update({
            where: { id },
            data: {
                download_id: payload.downloadId,
                file_name: fileName,
                file_type: payload.fileType || null,
                file_size_kb: typeof payload.fileSizeKb === 'number' ? payload.fileSizeKb : null,
                storage_provider: storageProvider,
                storage_bucket: storageBucket,
                storage_path: normalizedPath,
                public_url: publicUrl,
                display_order: typeof payload.displayOrder === 'number' ? payload.displayOrder : 0,
            },
        });

        if (
            existing.storage_path &&
            existing.storage_provider?.toLowerCase() === 'r2' &&
            (existing.storage_path !== normalizedPath || existing.storage_bucket !== storageBucket)
        ) {
            try {
                await deleteObjectsFromBucket(existing.storage_bucket || 'downloads', [existing.storage_path]);
            } catch (cleanupError) {
                console.error('Failed to cleanup replaced download file object', cleanupError);
            }
        }

        return NextResponse.json(updated);
    } catch (error) {
        logError('admin.download_files.id.PUT', error);
        return NextResponse.json({ error: 'Failed to update download file' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const existing = await prisma.download_files.findUnique({
            where: { id },
            select: {
                id: true,
                storage_provider: true,
                storage_bucket: true,
                storage_path: true,
            },
        });

        if (!existing) {
            return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
        }

        await prisma.download_files.delete({ where: { id } });

        if (existing.storage_path && (!existing.storage_provider || existing.storage_provider.toLowerCase() === 'r2')) {
            try {
                await deleteObjectsFromBucket(existing.storage_bucket || 'downloads', [existing.storage_path]);
            } catch (cleanupError) {
                console.error('Failed to cleanup deleted download file object', cleanupError);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        logError('admin.download_files.id.DELETE', error);
        return NextResponse.json({ error: 'Failed to delete download file' }, { status: 500 });
    }
}
