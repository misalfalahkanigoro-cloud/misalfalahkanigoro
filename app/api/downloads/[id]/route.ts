import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminRole } from '@/lib/admin-auth';
import { mapMediaItem } from '@/lib/content-media';
import { deleteObjectsFromBucket } from '@/lib/r2-storage';

const isUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const resolveWhere = (idOrSlug: string) => (isUuid(idOrSlug) ? { id: idOrSlug } : { slug: idOrSlug });

const mapDownload = (
    row: Record<string, any>,
    mediaRows: Array<Record<string, any>> = [],
    files: Array<Record<string, any>> = []
) => {
    const media = mediaRows.map(mapMediaItem);
    const cover = media.find((item) => item.isMain) || media[0];

    return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        description: row.description,
        fileUrl: row.file_url,
        fileStorageProvider: row.file_storage_provider,
        fileStorageBucket: row.file_storage_bucket,
        fileStoragePath: row.file_storage_path,
        fileSizeKb: row.file_size_kb,
        fileType: row.file_type,
        downloadCount: row.download_count,
        isPublished: Boolean(row.is_published),
        isPinned: Boolean(row.is_pinned),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        coverUrl: cover ? cover.mediaUrl : null,
        media,
        files: files.map((file) => ({
            id: file.id,
            downloadId: file.download_id,
            fileName: file.file_name,
            fileType: file.file_type,
            fileSizeKb: file.file_size_kb,
            storageProvider: file.storage_provider,
            storageBucket: file.storage_bucket,
            storagePath: file.storage_path,
            publicUrl: file.public_url,
            displayOrder: file.display_order,
            createdAt: file.created_at,
        })),
    };
};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const isAdminRequest = Boolean(requireAdminRole(request.cookies, ['admin', 'superadmin']));

        const download = await prisma.downloads.findFirst({
            where: resolveWhere(id),
            include: {
                download_files: {
                    orderBy: [{ display_order: 'asc' }],
                },
            },
        });

        if (!download || (!isAdminRequest && !download.is_published)) {
            return NextResponse.json({ error: 'Download not found' }, { status: 404 });
        }

        const mediaRows = await prisma.media_items.findMany({
            where: {
                entity_type: 'download',
                entity_id: download.id,
            },
            orderBy: [{ display_order: 'asc' }],
        });

        return NextResponse.json(
            mapDownload(
                download as unknown as Record<string, any>,
                mediaRows as unknown as Array<Record<string, any>>,
                download.download_files as unknown as Array<Record<string, any>>
            )
        );
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

