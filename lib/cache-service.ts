import { unstable_cache } from 'next/cache';
import prisma from './prisma';

/**
 * Cache Tag Constants
 */
export const CACHE_TAGS = {
    SITE_SETTINGS: 'site-settings',
    NAVIGATION: 'navigation',
    NEWS: 'news',
    PUBLICATIONS: 'publications',
    GALLERY: 'gallery',
} as const;

/**
 * Get Site Settings with Smart Cache
 */
export const getCachedSiteSettings = unstable_cache(
    async () => {
        const data = await prisma.site_settings.findFirst({
            where: { is_active: true },
            orderBy: { created_at: 'desc' },
        });

        if (!data) return null;

        // BigInt serialization fix for Server Components / Cache
        return JSON.parse(
            JSON.stringify(data, (key, value) =>
                typeof value === 'bigint' ? Number(value) : value
            )
        ) as typeof data;
    },
    ['site-settings-data'], // cache key
    {
        tags: [CACHE_TAGS.SITE_SETTINGS],
        revalidate: 3600, // Background revalidation every hour
    }
);

/**
 * Get Navigation Menu with Smart Cache
 */
export const getCachedNavigationMenu = unstable_cache(
    async () => {
        return await prisma.navigation_menu.findMany({
            where: { is_active: true, parent_id: null },
            orderBy: { display_order: 'asc' },
            include: {
                other_navigation_menu: {
                    where: { is_active: true },
                    orderBy: { display_order: 'asc' },
                },
            },
        });
    },
    ['navigation-menu-data'],
    {
        tags: [CACHE_TAGS.NAVIGATION],
        revalidate: 3600,
    }
);

/**
 * Get News items with Smart Cache
 */
export const getCachedLatestNews = unstable_cache(
    async (limit: number = 3) => {
        return await prisma.news_posts.findMany({
            where: { is_published: true },
            orderBy: { published_at: 'desc' },
            take: limit,
        });
    },
    ['latest-news-data'],
    {
        tags: [CACHE_TAGS.NEWS],
        revalidate: 3600,
    }
);

/**
 * Get Publications with Smart Cache
 */
export const getCachedLatestPublications = unstable_cache(
    async (limit: number = 3) => {
        return await prisma.publications.findMany({
            where: { is_published: true },
            orderBy: { published_at: 'desc' },
            take: limit,
        });
    },
    ['latest-publications-data'],
    {
        tags: [CACHE_TAGS.PUBLICATIONS],
        revalidate: 3600,
    }
);

/**
 * Get Achievements with Smart Cache
 */
export const getCachedLatestAchievements = unstable_cache(
    async (limit: number = 3) => {
        return await prisma.achievements.findMany({
            where: { is_published: true },
            orderBy: { achieved_at: 'desc' },
            take: limit,
        });
    },
    ['latest-achievements-data'],
    {
        tags: [CACHE_TAGS.GALLERY], // Use gallery tag or separate if needed
        revalidate: 3600,
    }
);
