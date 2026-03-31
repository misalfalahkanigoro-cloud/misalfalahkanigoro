import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminRole } from '@/lib/admin-auth';
import { buildMediaPayload, groupMediaByEntity, mapMediaItem } from '@/lib/content-media';
import { sanitizePlainText, sanitizeRichText } from '@/lib/rich-text';
import { logError } from '@/lib/logger';

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

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const isAdminRequest = Boolean(requireAdminRole(request.cookies, ['admin', 'superadmin']));
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10)));
        const type = (searchParams.get('type') || '').trim();

        const where: Record<string, any> = {};
        if (type) {
            where.type = normalizePublicationType(type);
        }
        if (!isAdminRequest) {
            where.is_published = true;
        }

        const skip = (page - 1) * pageSize;

        const [rows, total] = await Promise.all([
            prisma.publications.findMany({
                where,
                orderBy: [{ is_pinned: 'desc' }, { published_at: 'desc' }],
                skip,
                take: pageSize,
            }),
            prisma.publications.count({ where }),
        ]);

        const ids = rows.map((row) => row.id);
        const mediaRows = ids.length
            ? await prisma.media_items.findMany({
                where: {
                    entity_type: 'publication',
                    entity_id: { in: ids },
                },
                orderBy: [{ display_order: 'asc' }],
            })
            : [];

        const mediaByEntity = groupMediaByEntity(mediaRows as unknown as Array<Record<string, any>>);
        const items = rows.map((row) => mapPublication(row as unknown as Record<string, any>, mediaByEntity[row.id] || []));

        return NextResponse.json({
            items,
            total,
            page,
            pageSize,
        });
    } catch (error) {
        logError('publications.GET', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

