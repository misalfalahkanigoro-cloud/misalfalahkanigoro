import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminRole } from '@/lib/admin-auth';
import { buildMediaPayload, mapMediaItem } from '@/lib/content-media';

const isUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

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

const resolveWhere = (idOrSlug: string) => (isUuid(idOrSlug) ? { id: idOrSlug } : { slug: idOrSlug });

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const isAdminRequest = Boolean(requireAdminRole(request.cookies, ['admin', 'superadmin']));
        const gallery = await prisma.galleries.findFirst({ where: resolveWhere(id) });

        if (!gallery || (!isAdminRequest && !gallery.is_published)) {
            return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });
        }

        const mediaRows = await prisma.media_items.findMany({
            where: {
                entity_type: 'gallery',
                entity_id: gallery.id,
            },
            orderBy: [{ display_order: 'asc' }],
        });

        return NextResponse.json(
            mapGallery(gallery as unknown as Record<string, any>, mediaRows as unknown as Array<Record<string, any>>)
        );
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


