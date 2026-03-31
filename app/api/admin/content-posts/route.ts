import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { buildMediaPayload, groupMediaByEntity } from '@/lib/content-media';
import { requireAdminRole } from '@/lib/admin-auth';
import { sanitizePlainText, sanitizeRichText } from '@/lib/rich-text';
import { logError } from '@/lib/logger';

type EntityType = 'news' | 'publication' | 'achievement' | 'gallery' | 'download';
type ModelName = 'news_posts' | 'publications' | 'achievements' | 'galleries' | 'downloads';

type TypeConfig = {
    model: ModelName;
    entityType: EntityType;
    publicationSubtype?: 'announcement' | 'article' | 'bulletin';
};

const toDateOrUndefined = (value: unknown) => {
    if (!value) return undefined;
    const parsed = new Date(String(value));
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const normalizePublicationSubtype = (value: unknown): 'announcement' | 'article' | 'bulletin' => {
    const normalized = String(value || '')
        .trim()
        .toLowerCase();

    if (normalized === 'publication') return 'announcement';
    if (normalized === 'announcement' || normalized === 'article' || normalized === 'bulletin') return normalized;
    return 'announcement';
};

const resolveTypeConfig = (type: string): TypeConfig => {
    const normalized = String(type || '')
        .trim()
        .toLowerCase();

    if (normalized === 'news') {
        return { model: 'news_posts', entityType: 'news' };
    }

    if (normalized === 'achievement') {
        return { model: 'achievements', entityType: 'achievement' };
    }

    if (normalized === 'gallery') {
        return { model: 'galleries', entityType: 'gallery' };
    }

    if (normalized === 'download') {
        return { model: 'downloads', entityType: 'download' };
    }

    if (normalized === 'announcement' || normalized === 'article' || normalized === 'bulletin') {
        return {
            model: 'publications',
            entityType: 'publication',
            publicationSubtype: normalized,
        };
    }

    return {
        model: 'publications',
        entityType: 'publication',
        publicationSubtype: normalizePublicationSubtype(type),
    };
};

const prismaAny = prisma as any;

const getEntityTypeFromModel = (model: ModelName): EntityType => {
    if (model === 'news_posts') return 'news';
    if (model === 'publications') return 'publication';
    if (model === 'achievements') return 'achievement';
    if (model === 'galleries') return 'gallery';
    return 'download';
};

export async function GET(request: NextRequest) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || undefined;
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
        const searchQuery = searchParams.get('search') || undefined;
        const skip = (page - 1) * pageSize;

        if (type && type !== 'all') {
            const config = resolveTypeConfig(type);
            const where: Record<string, any> = {};

            if (config.model === 'publications' && config.publicationSubtype) {
                where.type = config.publicationSubtype;
            }

            if (searchQuery) {
                where.OR = [
                    { title: { contains: searchQuery, mode: 'insensitive' } },
                    { slug: { contains: searchQuery, mode: 'insensitive' } },
                ];
            }

            const [rows, total] = await Promise.all([
                prismaAny[config.model].findMany({
                    where,
                    orderBy: [{ is_pinned: 'desc' }, { created_at: 'desc' }],
                    skip,
                    take: pageSize,
                }),
                prismaAny[config.model].count({ where }),
            ]);

            const ids = rows.map((row: Record<string, any>) => row.id);
            const mediaRows = ids.length
                ? await prisma.media_items.findMany({
                      where: {
                          entity_type: config.entityType,
                          entity_id: { in: ids },
                      },
                      orderBy: [{ display_order: 'asc' }],
                  })
                : [];

            const mediaByEntity = groupMediaByEntity(mediaRows as unknown as Array<Record<string, any>>);
            const mapped = rows.map((row: Record<string, any>) => ({
                ...row,
                contentType: config.entityType,
                media_items: mediaByEntity[row.id] || [],
            }));

            return NextResponse.json({
                items: mapped,
                total,
                page,
                pageSize,
            });
        }

        const [news, publications, achievements, galleries, downloads] = await Promise.all([
            prisma.news_posts.findMany(),
            prisma.publications.findMany(),
            prisma.achievements.findMany(),
            prisma.galleries.findMany(),
            prisma.downloads.findMany(),
        ]);

        const groupedEntities: Array<{ id: string; entityType: EntityType }> = [
            ...news.map((row) => ({ id: row.id, entityType: 'news' as const })),
            ...publications.map((row) => ({ id: row.id, entityType: 'publication' as const })),
            ...achievements.map((row) => ({ id: row.id, entityType: 'achievement' as const })),
            ...galleries.map((row) => ({ id: row.id, entityType: 'gallery' as const })),
            ...downloads.map((row) => ({ id: row.id, entityType: 'download' as const })),
        ];

        const groupedIds = groupedEntities.reduce<Record<string, string[]>>((acc, item) => {
            if (!acc[item.entityType]) acc[item.entityType] = [];
            acc[item.entityType].push(item.id);
            return acc;
        }, {});

        const mediaByEntityType: Record<string, Record<string, Record<string, any>[]>> = {
            news: {},
            publication: {},
            achievement: {},
            gallery: {},
            download: {},
        };

        for (const [entityType, ids] of Object.entries(groupedIds)) {
            if (!ids.length) continue;
            const mediaRows = await prisma.media_items.findMany({
                where: {
                    entity_type: entityType,
                    entity_id: { in: ids },
                },
                orderBy: [{ display_order: 'asc' }],
            });

            mediaByEntityType[entityType] = groupMediaByEntity(mediaRows as unknown as Array<Record<string, any>>);
        }

        const all = [
            ...news.map((row) => ({ ...row, type: 'news', media_items: mediaByEntityType.news[row.id] || [] })),
            ...publications.map((row) => ({ ...row, media_items: mediaByEntityType.publication[row.id] || [] })),
            ...achievements.map((row) => ({ ...row, type: 'achievement', media_items: mediaByEntityType.achievement[row.id] || [] })),
            ...galleries.map((row) => ({ ...row, type: 'gallery', media_items: mediaByEntityType.gallery[row.id] || [] })),
            ...downloads.map((row) => ({ ...row, type: 'download', media_items: mediaByEntityType.download[row.id] || [] })),
        ];

        all.sort((a, b) => {
            const left = a.created_at ? new Date(a.created_at as any).getTime() : 0;
            const right = b.created_at ? new Date(b.created_at as any).getTime() : 0;
            return right - left;
        });

        return NextResponse.json(all);
    } catch (error) {
        logError('admin.content_posts.GET', error);
        return NextResponse.json({ error: 'Failed to fetch content posts' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const payload = await request.json();
        const postInput = payload?.post ?? payload;
        const mediaInput = payload?.media;

        if (!postInput?.title || !postInput?.slug || !postInput?.type) {
            return NextResponse.json({ error: 'Judul, slug, dan tipe wajib diisi.' }, { status: 400 });
        }

        const config = resolveTypeConfig(postInput.type);
        const insertPayload: Record<string, any> = {
            title: sanitizePlainText(postInput.title, 220),
            slug: String(postInput.slug).trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
            is_published: postInput.isPublished ?? true,
            is_pinned: postInput.isPinned ?? false,
        };

        if (!insertPayload.title || !insertPayload.slug) {
            return NextResponse.json({ error: 'Judul atau slug tidak valid.' }, { status: 400 });
        }

        if (config.model === 'news_posts') {
            insertPayload.excerpt = sanitizePlainText(postInput.excerpt, 500);
            insertPayload.content = sanitizeRichText(postInput.contentHtml || postInput.content);
            insertPayload.author_name = sanitizePlainText(postInput.authorName, 120) || 'Admin';
            insertPayload.published_at = toDateOrUndefined(postInput.publishedAt) || new Date();
        } else if (config.model === 'publications') {
            insertPayload.type = normalizePublicationSubtype(postInput.type);
            insertPayload.description = sanitizePlainText(postInput.description || postInput.excerpt, 800);
            insertPayload.content = sanitizeRichText(postInput.contentHtml || postInput.content);
            insertPayload.published_at = toDateOrUndefined(postInput.publishedAt) || new Date();
        } else if (config.model === 'achievements') {
            insertPayload.description = sanitizePlainText(postInput.description || postInput.excerpt, 800);
            insertPayload.event_name = sanitizePlainText(postInput.eventName, 150);
            insertPayload.event_level = sanitizePlainText(postInput.eventLevel, 80);
            insertPayload.rank = sanitizePlainText(postInput.rank, 80);
            insertPayload.achieved_at = toDateOrUndefined(postInput.achievedAt) || new Date();
        } else if (config.model === 'galleries') {
            insertPayload.description = sanitizePlainText(postInput.description || postInput.excerpt, 800);
            insertPayload.event_date = toDateOrUndefined(postInput.eventDate || postInput.publishedAt) || new Date();
        } else if (config.model === 'downloads') {
            insertPayload.description = sanitizePlainText(postInput.description || postInput.excerpt, 800);
            insertPayload.file_url = postInput.fileUrl || null;
            insertPayload.file_type = sanitizePlainText(postInput.fileType, 120);
            insertPayload.file_size_kb = postInput.fileSizeKb ?? null;
        }

        const created = await prisma.$transaction(async (tx) => {
            const post = await (tx as any)[config.model].create({ data: insertPayload });
            const mediaRows = buildMediaPayload({
                entityId: post.id,
                entityType: config.entityType,
                mediaInput,
                coverUrlInput: postInput.coverUrl,
            });

            if (mediaRows.length > 0) {
                await tx.media_items.createMany({ data: mediaRows });
            }

            return post;
        });

        return NextResponse.json({ post: created });
    } catch (error) {
        logError('admin.content_posts.POST', error);
        return NextResponse.json({ error: 'Failed to create content post' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const payload = await request.json();
        const postInput = payload?.post ?? payload;
        const mediaInput = payload?.media;

        if (!postInput?.id) {
            return NextResponse.json({ error: 'ID wajib diisi.' }, { status: 400 });
        }
        if (!postInput?.title || !postInput?.slug || !postInput?.type) {
            return NextResponse.json({ error: 'Judul, slug, dan tipe wajib diisi.' }, { status: 400 });
        }

        const config = resolveTypeConfig(postInput.type);

        const updatePayload: Record<string, any> = {
            title: sanitizePlainText(postInput.title, 220),
            slug: String(postInput.slug).trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
            is_published: postInput.isPublished ?? true,
            is_pinned: postInput.isPinned ?? false,
        };
        if (!updatePayload.title || !updatePayload.slug) {
            return NextResponse.json({ error: 'Judul atau slug tidak valid.' }, { status: 400 });
        }

        if (config.model === 'news_posts') {
            updatePayload.excerpt = sanitizePlainText(postInput.excerpt, 500);
            updatePayload.content = sanitizeRichText(postInput.contentHtml || postInput.content);
            updatePayload.author_name = sanitizePlainText(postInput.authorName, 120) || 'Admin';
            updatePayload.published_at = toDateOrUndefined(postInput.publishedAt || postInput.published_at) || new Date();
        } else if (config.model === 'publications') {
            updatePayload.type = normalizePublicationSubtype(postInput.type);
            updatePayload.description = sanitizePlainText(postInput.description || postInput.excerpt, 800);
            updatePayload.content = sanitizeRichText(postInput.contentHtml || postInput.content);
            updatePayload.published_at = toDateOrUndefined(postInput.publishedAt || postInput.published_at) || new Date();
        } else if (config.model === 'achievements') {
            updatePayload.description = sanitizePlainText(postInput.description || postInput.excerpt, 800);
            updatePayload.event_name = sanitizePlainText(postInput.eventName, 150);
            updatePayload.event_level = sanitizePlainText(postInput.eventLevel, 80);
            updatePayload.rank = sanitizePlainText(postInput.rank, 80);
            updatePayload.achieved_at = toDateOrUndefined(postInput.achievedAt) || new Date();
        } else if (config.model === 'galleries') {
            updatePayload.description = sanitizePlainText(postInput.description || postInput.excerpt, 800);
            updatePayload.event_date = toDateOrUndefined(postInput.eventDate || postInput.publishedAt) || new Date();
        } else if (config.model === 'downloads') {
            updatePayload.description = sanitizePlainText(postInput.description || postInput.excerpt, 800);
            updatePayload.file_url = postInput.fileUrl || null;
            updatePayload.file_type = sanitizePlainText(postInput.fileType, 120);
            updatePayload.file_size_kb = postInput.fileSizeKb ?? null;
        }

        const updated = await prisma.$transaction(async (tx) => {
            const post = await (tx as any)[config.model].update({
                where: { id: postInput.id },
                data: updatePayload,
            });

            if (Array.isArray(mediaInput)) {
                await tx.media_items.deleteMany({
                    where: {
                        entity_id: post.id,
                        entity_type: config.entityType,
                    },
                });

                const mediaRows = buildMediaPayload({
                    entityId: post.id,
                    entityType: config.entityType,
                    mediaInput,
                    coverUrlInput: postInput.coverUrl,
                });

                if (mediaRows.length > 0) {
                    await tx.media_items.createMany({ data: mediaRows });
                }
            }

            return post;
        });

        return NextResponse.json({ post: updated });
    } catch (error) {
        logError('admin.content_posts.PUT', error);
        return NextResponse.json({ error: 'Failed to update content post' }, { status: 500 });
    }
}
