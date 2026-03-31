import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminRole } from '@/lib/admin-auth';
import { groupMediaByEntity, mapMediaItem } from '@/lib/content-media';

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

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const isAdminRequest = Boolean(requireAdminRole(request.cookies, ['admin', 'superadmin']));
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));

        const skip = (page - 1) * pageSize;
        const where = !isAdminRequest ? { is_published: true } : undefined;

        const [rows, total] = await Promise.all([
            prisma.downloads.findMany({
                where,
                orderBy: [{ created_at: 'desc' }],
                skip,
                take: pageSize,
                include: {
                    download_files: {
                        orderBy: [{ display_order: 'asc' }],
                    },
                },
            }),
            prisma.downloads.count({ where }),
        ]);

        const ids = rows.map((row) => row.id);
        const mediaRows = ids.length
            ? await prisma.media_items.findMany({
                where: {
                    entity_type: 'download',
                    entity_id: { in: ids },
                },
                orderBy: [{ display_order: 'asc' }],
            })
            : [];

        const mediaByEntity = groupMediaByEntity(mediaRows as unknown as Array<Record<string, any>>);
        const items = rows.map((row) =>
            mapDownload(
                row as unknown as Record<string, any>,
                mediaByEntity[row.id] || [],
                (row.download_files || []) as unknown as Array<Record<string, any>>
            )
        );

        return NextResponse.json({
            items,
            total,
            page,
            pageSize,
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


