import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminRole } from '@/lib/admin-auth';
import { logError } from '@/lib/logger';

type EntityType = 'news' | 'publication' | 'achievement' | 'gallery' | 'download';
type ModelName = 'news_posts' | 'publications' | 'achievements' | 'galleries' | 'downloads';

const TABLES: Array<{ model: ModelName; entityType: EntityType }> = [
    { model: 'news_posts', entityType: 'news' },
    { model: 'publications', entityType: 'publication' },
    { model: 'achievements', entityType: 'achievement' },
    { model: 'galleries', entityType: 'gallery' },
    { model: 'downloads', entityType: 'download' },
];

const prismaAny = prisma as any;

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;

        let post: Record<string, any> | null = null;
        let foundEntityType: EntityType | null = null;

        for (const table of TABLES) {
            const row = await prismaAny[table.model].findUnique({ where: { id } });
            if (row) {
                post = row;
                foundEntityType = table.entityType;
                break;
            }
        }

        if (!post || !foundEntityType) {
            return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
        }

        const media = await prisma.media_items.findMany({
            where: {
                entity_id: id,
                entity_type: foundEntityType,
            },
            orderBy: [{ display_order: 'asc' }],
        });

        const mediaItems = media as unknown as Array<Record<string, any>>;
        const coverUrl = mediaItems.find((item) => item.is_main)?.media_url || mediaItems[0]?.media_url || null;
        const downloadFiles =
            foundEntityType === 'download'
                ? await prisma.download_files.findMany({
                      where: { download_id: id },
                      orderBy: [{ display_order: 'asc' }],
                  })
                : [];

        return NextResponse.json({
            post: {
                ...post,
                type: foundEntityType === 'publication' ? post.type : foundEntityType,
                contentType: foundEntityType,
                coverUrl,
                download_files: downloadFiles,
            },
            media: mediaItems,
        });
    } catch (error) {
        logError('admin.content_posts.id.GET', error);
        return NextResponse.json({ error: 'Failed to fetch content post' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;

        let deleted = false;

        for (const table of TABLES) {
            try {
                await prismaAny[table.model].delete({ where: { id } });
                deleted = true;
                break;
            } catch {
                continue;
            }
        }

        await prisma.media_items.deleteMany({ where: { entity_id: id } });

        return NextResponse.json({ success: deleted });
    } catch (error) {
        logError('admin.content_posts.id.DELETE', error);
        return NextResponse.json({ error: 'Failed to delete content post' }, { status: 500 });
    }
}
