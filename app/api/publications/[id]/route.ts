import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminRole } from '@/lib/admin-auth';
import { buildMediaPayload, mapMediaItem } from '@/lib/content-media';

const isUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const normalizePublicationType = (value: unknown): 'announcement' | 'article' | 'bulletin' => {
    const type = String(value || '')
        .trim()
        .toLowerCase();

    if (type === 'publication') return 'announcement';
    if (type === 'announcement' || type === 'article' || type === 'bulletin') return type;
    return 'article';
};

const toDateOrUndefined = (value: unknown) => {
    if (!value) return undefined;
    const parsed = new Date(String(value));
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const mapPublication = (row: Record<string, any>, mediaRows: Array<Record<string, any>> = []) => {
    const media = mediaRows.map(mapMediaItem);
    return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        type: row.type,
        excerpt: row.description,
        description: row.description,
        content: row.content,
        authorName: 'Admin',
        publishedAt: row.published_at,
        isPublished: Boolean(row.is_published),
        isPinned: Boolean(row.is_pinned),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        media,
        coverUrl: media.find((item) => item.isMain)?.mediaUrl || media[0]?.mediaUrl || null,
    };
};

const resolveWhere = (idOrSlug: string) => (isUuid(idOrSlug) ? { id: idOrSlug } : { slug: idOrSlug });

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const isAdminRequest = Boolean(requireAdminRole(request.cookies, ['admin', 'superadmin']));
        const publication = await prisma.publications.findFirst({ where: resolveWhere(id) });

        if (!publication || (!isAdminRequest && !publication.is_published)) {
            return NextResponse.json({ error: 'Publication not found' }, { status: 404 });
        }

        const mediaRows = await prisma.media_items.findMany({
            where: {
                entity_type: 'publication',
                entity_id: publication.id,
            },
            orderBy: [{ display_order: 'asc' }],
        });

        return NextResponse.json(
            mapPublication(publication as unknown as Record<string, any>, mediaRows as unknown as Array<Record<string, any>>)
        );
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


