import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminRole } from '@/lib/admin-auth';
import { buildMediaPayload, groupMediaByEntity, mapMediaItem } from '@/lib/content-media';

const toDateOrUndefined = (value: unknown) => {
    if (!value) return undefined;
    const parsed = new Date(String(value));
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const mapGallery = (row: Record<string, any>, mediaRows: Array<Record<string, any>> = []) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    eventDate: row.event_date,
    publishedAt: row.created_at,
    isPublished: Boolean(row.is_published),
    isPinned: Boolean(row.is_pinned),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    media: mediaRows.map(mapMediaItem),
});

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const isAdminRequest = Boolean(requireAdminRole(request.cookies, ['admin', 'superadmin']));
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10)));

        const skip = (page - 1) * pageSize;
        const where = !isAdminRequest ? { is_published: true } : undefined;

        const [rows, total] = await Promise.all([
            prisma.galleries.findMany({
                where,
                orderBy: [{ is_pinned: 'desc' }, { event_date: 'desc' }],
                skip,
                take: pageSize,
            }),
            prisma.galleries.count({ where }),
        ]);

        const ids = rows.map((row) => row.id);
        const mediaRows = ids.length
            ? await prisma.media_items.findMany({
                where: {
                    entity_type: 'gallery',
                    entity_id: { in: ids },
                },
                orderBy: [{ display_order: 'asc' }],
            })
            : [];

        const mediaByEntity = groupMediaByEntity(mediaRows as unknown as Array<Record<string, any>>);
        const items = rows.map((row) => mapGallery(row as unknown as Record<string, any>, mediaByEntity[row.id] || []));

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


