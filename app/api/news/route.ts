import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

type AnyRecord = Record<string, any>;

const isUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const mapMediaItem = (item: AnyRecord) => ({
    id: item.id,
    mediaUrl: item.media_url,
    mediaType: item.media_type,
    thumbnailUrl: item.thumbnail_url,
    caption: item.caption,
    isMain: Boolean(item.is_main),
    displayOrder: item.display_order,
    createdAt: item.created_at,
    entityType: item.entity_type,
    entityId: item.entity_id,
});

const mapNewsItem = (row: AnyRecord, media: AnyRecord[] = []) => {
    const mappedMedia = media.map(mapMediaItem);
    const cover = mappedMedia.find((item) => item.isMain)?.mediaUrl || mappedMedia[0]?.mediaUrl || null;
    return {
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
        media: mappedMedia,
        coverUrl: cover,
    };
};

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10)));
        const slug = (searchParams.get('slug') || '').trim();
        const publishedOnly = searchParams.get('publishedOnly') === 'true';
        const skip = (page - 1) * pageSize;

        const where: AnyRecord = {};
        if (slug) where.slug = slug;
        if (publishedOnly) where.is_published = true;

        const [rows, total] = await Promise.all([
            prisma.news_posts.findMany({
                where,
                orderBy: [{ is_pinned: 'desc' }, { published_at: 'desc' }],
                skip,
                take: pageSize,
            }),
            prisma.news_posts.count({ where }),
        ]);

        const ids = rows.map((row) => row.id);
        const mediaRows = ids.length
            ? await prisma.media_items.findMany({
                where: {
                    entity_type: 'news',
                    entity_id: { in: ids },
                },
                orderBy: [{ display_order: 'asc' }],
            })
            : [];

        const mediaByEntity = mediaRows.reduce<Record<string, AnyRecord[]>>((acc, item: AnyRecord) => {
            if (!acc[item.entity_id]) acc[item.entity_id] = [];
            acc[item.entity_id].push(item);
            return acc;
        }, {});

        const items = rows.map((row) => mapNewsItem(row, mediaByEntity[row.id] || []));

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

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const created = await prisma.news_posts.create({
            data: {
                title: body.title,
                slug: body.slug,
                excerpt: body.excerpt ?? null,
                content: body.content ?? null,
                author_name: body.authorName ?? 'Admin',
                published_at: body.publishedAt ? new Date(body.publishedAt) : undefined,
                is_published: typeof body.isPublished === 'boolean' ? body.isPublished : undefined,
                is_pinned: typeof body.isPinned === 'boolean' ? body.isPinned : undefined,
            },
        });

        const mediaRows: Prisma.media_itemsCreateManyInput[] = [];

        if (body.coverUrl) {
            mediaRows.push({
                entity_id: created.id,
                entity_type: 'news',
                media_type: 'image',
                media_url: body.coverUrl,
                is_main: true,
                display_order: 0,
            });
        }

        if (Array.isArray(body.media)) {
            const normalized = body.media
                .filter((item: AnyRecord) => item?.mediaUrl)
                .map((item: AnyRecord, index: number) => ({
                    entity_id: created.id,
                    entity_type: 'news',
                    media_type: item.mediaType || 'image',
                    storage_provider: item.storageProvider ?? null,
                    storage_bucket: item.storageBucket ?? null,
                    storage_path: item.storagePath ?? null,
                    media_url: item.mediaUrl,
                    thumbnail_url: item.thumbnailUrl ?? null,
                    caption: item.caption ?? null,
                    is_main: Boolean(item.isMain),
                    display_order: item.displayOrder ?? index + 1,
                }));
            mediaRows.push(...normalized);
        }

        if (mediaRows.length > 0) {
            await prisma.media_items.createMany({ data: mediaRows });
        }

        return NextResponse.json(created);

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
