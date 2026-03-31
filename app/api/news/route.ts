import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAdminRole } from '@/lib/admin-auth';
import { sanitizePlainText, sanitizeRichText } from '@/lib/rich-text';
import { logError } from '@/lib/logger';

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
        const isAdminRequest = Boolean(requireAdminRole(request.cookies, ['admin', 'superadmin']));
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10)));
        const slug = (searchParams.get('slug') || '').trim();
        const publishedOnly = searchParams.get('publishedOnly') === 'true';
        const skip = (page - 1) * pageSize;

        const where: AnyRecord = {};
        if (slug) where.slug = slug;
        if (!isAdminRequest || publishedOnly) where.is_published = true;

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
        logError('news.GET', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

