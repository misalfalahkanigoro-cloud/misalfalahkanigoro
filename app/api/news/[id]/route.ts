import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
        const where = isUuid(id) ? { id } : { slug: id };
        const data = await prisma.news_posts.findFirst({ where });

        if (!data) {
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

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await request.json();
        const { id } = await params;
        const where = isUuid(id) ? { id } : { slug: id };
        const existing = await prisma.news_posts.findFirst({ where });
        if (!existing) {
            return NextResponse.json({ error: 'News not found' }, { status: 404 });
        }

        const updated = await prisma.news_posts.update({
            where: { id: existing.id },
            data: {
                title: body.title,
                slug: body.slug,
                excerpt: body.excerpt ?? null,
                content: body.content ?? null,
                author_name: body.authorName ?? 'Admin',
                published_at: body.publishedAt ? new Date(body.publishedAt) : undefined,
                is_published: typeof body.isPublished === 'boolean' ? body.isPublished : undefined,
                is_pinned: typeof body.isPinned === 'boolean' ? body.isPinned : undefined,
                updated_at: new Date(),
            },
        });

        await prisma.$transaction(async (tx) => {
            if (Array.isArray(body.media)) {
                await tx.media_items.deleteMany({
                    where: {
                        entity_id: existing.id,
                        entity_type: 'news',
                        is_main: false,
                    },
                });

                const normalized = body.media
                    .filter((m: AnyRecord) => m?.mediaUrl)
                    .map((m: AnyRecord, idx: number) => ({
                        entity_id: existing.id,
                        entity_type: 'news',
                        media_type: m.mediaType || 'image',
                        storage_provider: m.storageProvider ?? null,
                        storage_bucket: m.storageBucket ?? null,
                        storage_path: m.storagePath ?? null,
                        media_url: m.mediaUrl,
                        thumbnail_url: m.thumbnailUrl ?? null,
                        caption: m.caption ?? null,
                        is_main: Boolean(m.isMain),
                        display_order: m.displayOrder ?? idx + 1,
                    }));

                if (normalized.length > 0) {
                    await tx.media_items.createMany({ data: normalized });
                }
            }

            if (body.coverUrl) {
                await tx.media_items.deleteMany({
                    where: {
                        entity_id: existing.id,
                        entity_type: 'news',
                        is_main: true,
                    },
                });

                await tx.media_items.create({
                    data: {
                        entity_id: existing.id,
                        entity_type: 'news',
                        media_type: 'image',
                        media_url: body.coverUrl,
                        is_main: true,
                        display_order: 0,
                    },
                });
            }
        });

        const mediaData = await prisma.media_items.findMany({
            where: { entity_type: 'news', entity_id: existing.id },
            orderBy: [{ display_order: 'asc' }],
        });

        return NextResponse.json(mapNews(updated, mediaData || []));

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const where = isUuid(id) ? { id } : { slug: id };
        const existing = await prisma.news_posts.findFirst({ where, select: { id: true } });
        if (!existing) {
            return NextResponse.json({ error: 'News not found' }, { status: 404 });
        }

        await prisma.$transaction([
            prisma.media_items.deleteMany({
                where: { entity_id: existing.id, entity_type: 'news' },
            }),
            prisma.news_posts.delete({
                where: { id: existing.id },
            }),
        ]);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
