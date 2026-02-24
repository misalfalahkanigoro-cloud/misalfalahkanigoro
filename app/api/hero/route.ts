import { NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/db';

export async function GET() {
    try {
        const [newsRes, publicationRes, achievementRes, galleryRes, downloadRes] = await Promise.all([
            dbAdmin()
                .from('news_posts')
                .select('id, title, slug, excerpt, published_at, created_at')
                .eq('is_published', true)
                .eq('is_pinned', true),
            dbAdmin()
                .from('publications')
                .select('id, title, slug, description, published_at, created_at')
                .eq('is_published', true)
                .eq('is_pinned', true),
            dbAdmin()
                .from('achievements')
                .select('id, title, slug, description, achieved_at, created_at')
                .eq('is_published', true)
                .eq('is_pinned', true),
            dbAdmin()
                .from('galleries')
                .select('id, title, slug, description, event_date, created_at')
                .eq('is_published', true)
                .eq('is_pinned', true),
            dbAdmin()
                .from('downloads')
                .select('id, title, slug, description, created_at')
                .eq('is_published', true)
                .eq('is_pinned', true),
        ]);

        const firstError =
            newsRes.error ||
            publicationRes.error ||
            achievementRes.error ||
            galleryRes.error ||
            downloadRes.error;
        if (firstError) {
            throw firstError;
        }

        const items = [
            ...((newsRes.data as any[]) || []).map((row) => ({
                id: row.id,
                type: 'news',
                title: row.title,
                slug: row.slug,
                description: row.excerpt,
                date: row.published_at || row.created_at,
            })),
            ...((publicationRes.data as any[]) || []).map((row) => ({
                id: row.id,
                type: 'publication',
                title: row.title,
                slug: row.slug,
                description: row.description,
                date: row.published_at || row.created_at,
            })),
            ...((achievementRes.data as any[]) || []).map((row) => ({
                id: row.id,
                type: 'achievement',
                title: row.title,
                slug: row.slug,
                description: row.description,
                date: row.achieved_at || row.created_at,
            })),
            ...((galleryRes.data as any[]) || []).map((row) => ({
                id: row.id,
                type: 'gallery',
                title: row.title,
                slug: row.slug,
                description: row.description,
                date: row.event_date || row.created_at,
            })),
            ...((downloadRes.data as any[]) || []).map((row) => ({
                id: row.id,
                type: 'download',
                title: row.title,
                slug: row.slug,
                description: row.description,
                date: row.created_at,
            })),
        ].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

        // Fetch cover media (is_main) per entity from media_items
        const idsAll = items.map((row: any) => row.id);
        const coverByEntity: Record<string, string | null> = {};

        if (idsAll.length) {
            const { data: mediaData, error: mediaErr } = await dbAdmin()
                .from('media_items')
                .select('entity_id, media_url, is_main, entity_type, display_order')
                .in('entity_id', idsAll)
                .eq('is_main', true);

            if (mediaErr) {
                console.error('Error fetching hero media:', mediaErr);
            } else {
                (mediaData || []).forEach((m: any) => {
                    coverByEntity[m.entity_id] = m.media_url;
                });
            }
        }

        // Map database fields to frontend HeroItem type
        const mappedData = items.map((item: any) => ({
            id: item.id,
            type: item.type,
            title: item.title,
            slug: item.slug,
            description: item.description, // view currently not providing; kept for compatibility
            date: item.date,
            coverUrl: coverByEntity[item.id] || null,
            isPinned: true
        }));

        return NextResponse.json(mappedData);
    } catch (error) {
        console.error('Unhandled error in hero API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
