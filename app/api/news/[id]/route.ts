import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminRole } from '@/lib/admin-auth';

type AnyRecord = Record<string, any>;

const isUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const mapNews = (row: AnyRecord, media: AnyRecord[] = []) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    authorName: row.author_name,
    publishedAt: row.published_at,
    isPublished: Boolean(row.is_published),
    isPinned: Boolean(row.is_pinned),
    viewCount: row.view_count || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    media: media.map((m: AnyRecord) => ({
        id: m.id,
        mediaUrl: m.media_url,
        mediaType: m.media_type,
        thumbnailUrl: m.thumbnail_url,
        caption: m.caption,
        isMain: Boolean(m.is_main),
        displayOrder: m.display_order,
        createdAt: m.created_at,
        entityType: m.entity_type,
        entityId: m.entity_id,
    })),
    coverUrl: media.find((m: AnyRecord) => m.is_main)?.media_url || media[0]?.media_url || null,
});

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const isAdminRequest = Boolean(requireAdminRole(request.cookies, ['admin', 'superadmin']));
        const where = isUuid(id) ? { id } : { slug: id };
        const data = await prisma.news_posts.findFirst({ where });

        if (!data || (!isAdminRequest && !data.is_published)) {
            return NextResponse.json({ error: 'News not found' }, { status: 404 });
        }

        const mediaData = await prisma.media_items.findMany({
            where: { entity_type: 'news', entity_id: data.id },
            orderBy: [{ display_order: 'asc' }],
        });

        return NextResponse.json(mapNews(data, mediaData || []));

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
