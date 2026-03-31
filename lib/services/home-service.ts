import prisma from '@/lib/prisma';
import type { HeadmasterGreeting, HeroItem } from '@/lib/types';

const toIso = (value?: Date | string | null) => {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
};

export async function getCoverMap(entityType: string, ids: string[]) {
    if (!ids.length) return {} as Record<string, string>;
    const media = await prisma.media_items.findMany({
        where: {
            entity_type: entityType,
            entity_id: { in: ids },
        },
        orderBy: [{ is_main: 'desc' }, { display_order: 'asc' }],
        select: {
            entity_id: true,
            media_url: true,
        },
    });

    return media.reduce<Record<string, string>>((acc, item) => {
        if (!acc[item.entity_id]) {
            acc[item.entity_id] = item.media_url;
        }
        return acc;
    }, {});
}

export async function getHeroItems(): Promise<HeroItem[]> {
    const [news, publications, achievements, galleries, downloads] = await Promise.all([
        prisma.news_posts.findMany({
            where: { is_published: true, is_pinned: true },
            select: { id: true, title: true, slug: true, excerpt: true, published_at: true, created_at: true },
        }),
        prisma.publications.findMany({
            where: { is_published: true, is_pinned: true },
            select: { id: true, title: true, slug: true, description: true, published_at: true, created_at: true },
        }),
        prisma.achievements.findMany({
            where: { is_published: true, is_pinned: true },
            select: { id: true, title: true, slug: true, description: true, achieved_at: true, created_at: true },
        }),
        prisma.galleries.findMany({
            where: { is_published: true, is_pinned: true },
            select: { id: true, title: true, slug: true, description: true, event_date: true, created_at: true },
        }),
        prisma.downloads.findMany({
            where: { is_published: true, is_pinned: true },
            select: { id: true, title: true, slug: true, description: true, created_at: true },
        }),
    ]);

    const baseItems: Array<Omit<HeroItem, 'coverUrl'>> = [
        ...news.map((row) => ({
            id: row.id,
            type: 'news' as const,
            title: row.title,
            slug: row.slug,
            description: row.excerpt,
            date: toIso(row.published_at || row.created_at) || '',
            isPinned: true,
        })),
        ...publications.map((row) => ({
            id: row.id,
            type: 'publication' as const,
            title: row.title,
            slug: row.slug,
            description: row.description,
            date: toIso(row.published_at || row.created_at) || '',
            isPinned: true,
        })),
        ...achievements.map((row) => ({
            id: row.id,
            type: 'achievement' as const,
            title: row.title,
            slug: row.slug,
            description: row.description,
            date: toIso(row.achieved_at || row.created_at) || '',
            isPinned: true,
        })),
        ...galleries.map((row) => ({
            id: row.id,
            type: 'gallery' as const,
            title: row.title,
            slug: row.slug,
            description: row.description,
            date: toIso(row.event_date || row.created_at) || '',
            isPinned: true,
        })),
        ...downloads.map((row) => ({
            id: row.id,
            type: 'download' as const,
            title: row.title,
            slug: row.slug,
            description: row.description,
            date: toIso(row.created_at) || '',
            isPinned: true,
        })),
    ].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

    const ids = baseItems.map((item) => item.id);
    const coverByEntity = ids.length
        ? await prisma.media_items.findMany({
            where: { entity_id: { in: ids }, is_main: true },
            select: { entity_id: true, media_url: true },
        })
        : [];

    const coverMap = coverByEntity.reduce<Record<string, string>>((acc, item) => {
        acc[item.entity_id] = item.media_url;
        return acc;
    }, {});

    return baseItems.map((item) => ({
        ...item,
        coverUrl: coverMap[item.id] || null,
    }));
}

export async function getHeadmasterGreeting(): Promise<HeadmasterGreeting | null> {
    const data = await prisma.headmaster_greeting.findFirst({
        where: { is_active: true },
        orderBy: { created_at: 'desc' },
    });

    if (!data) return null;
    return {
        id: data.id,
        title: data.title,
        subtitle: data.subtitle,
        contentJson: data.content_json,
        contentHtml: data.content_html,
        contentText: data.content_text,
        headmasterName: data.headmaster_name,
        headmasterTitle: data.headmaster_title,
        photoUrl: data.photo_url,
        isActive: data.is_active ?? false,
    };
}

export async function hasActivePpdbWave() {
    const wave = await prisma.ppdb_waves.findFirst({
        where: { is_active: true },
        orderBy: { start_date: 'desc' },
    });
    return Boolean(wave);
}

export async function getHomeData() {
    const [
        heroItems,
        greeting,
        activePpdb,
        newsRows,
        publicationRows,
        galleryRows,
        achievementRows,
        downloadRows,
    ] = await Promise.all([
        getHeroItems(),
        getHeadmasterGreeting(),
        hasActivePpdbWave(),
        prisma.news_posts.findMany({
            where: { is_published: true },
            orderBy: [{ is_pinned: 'desc' }, { published_at: 'desc' }],
            take: 3,
            select: { id: true, title: true, slug: true, excerpt: true, content: true, published_at: true, created_at: true },
        }),
        prisma.publications.findMany({
            where: { is_published: true },
            orderBy: [{ is_pinned: 'desc' }, { published_at: 'desc' }],
            take: 3,
            select: { id: true, title: true, slug: true, description: true, content: true, published_at: true, created_at: true },
        }),
        prisma.galleries.findMany({
            where: { is_published: true },
            orderBy: [{ is_pinned: 'desc' }, { event_date: 'desc' }],
            take: 3,
            select: { id: true, title: true, slug: true, description: true, event_date: true, created_at: true },
        }),
        prisma.achievements.findMany({
            where: { is_published: true },
            orderBy: [{ is_pinned: 'desc' }, { achieved_at: 'desc' }],
            take: 3,
            select: { id: true, title: true, slug: true, description: true, event_name: true, achieved_at: true, created_at: true },
        }),
        prisma.downloads.findMany({
            where: { is_published: true },
            orderBy: [{ is_pinned: 'desc' }, { created_at: 'desc' }],
            take: 3,
            select: { id: true, title: true, slug: true, description: true, created_at: true, updated_at: true },
        }),
    ]);

    const [newsCover, publicationCover, galleryCover, achievementCover, downloadCover] = await Promise.all([
        getCoverMap('news', newsRows.map((row) => row.id)),
        getCoverMap('publication', publicationRows.map((row) => row.id)),
        getCoverMap('gallery', galleryRows.map((row) => row.id)),
        getCoverMap('achievement', achievementRows.map((row) => row.id)),
        getCoverMap('download', downloadRows.map((row) => row.id)),
    ]);

    return {
        heroItems,
        greeting,
        activePpdb,
        news: { rows: newsRows, cover: newsCover },
        publications: { rows: publicationRows, cover: publicationCover },
        galleries: { rows: galleryRows, cover: galleryCover },
        achievements: { rows: achievementRows, cover: achievementCover },
        downloads: { rows: downloadRows, cover: downloadCover },
        toIso,
    };
}
