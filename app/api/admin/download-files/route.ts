import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { extractStorageIdentityFromUrl, getPublicUrl, resolveBucketName } from '@/lib/r2-storage';
import { requireAdminRole } from '@/lib/admin-auth';
import { logError } from '@/lib/logger';

const normalizeStoragePath = (value: string) => value.replace(/^\/+/, '').replace(/\/+$/, '');

export async function GET(request: NextRequest) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const rows = await prisma.download_files.findMany({
            orderBy: [{ display_order: 'asc' }],
        });

        return NextResponse.json(rows);
    } catch (error) {
        logError('admin.download_files.GET', error);
        return NextResponse.json({ error: 'Failed to fetch download files' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const payload = await request.json();
        const publicUrlInput = payload.publicUrl || payload.url || null;
        const storageFromUrl = extractStorageIdentityFromUrl(publicUrlInput);
        const storageProvider = payload.storageProvider || 'r2';
        const storageBucket = resolveBucketName(payload.storageBucket || payload.bucket || storageFromUrl?.bucket || 'downloads', 'downloads');
        const storagePath =
            payload.storagePath || payload.path || storageFromUrl?.path || null;

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

        const created = await prisma.download_files.create({
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

        return NextResponse.json(created);
    } catch (error) {
        logError('admin.download_files.POST', error);
        return NextResponse.json({ error: 'Failed to create download file' }, { status: 500 });
    }
}
