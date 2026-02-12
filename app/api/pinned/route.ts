import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { PinnedItem } from '@/lib/types';

export async function GET() {
    try {
        // Fetch pinned news_posts
        const { data: news, error: newsError } = await supabaseAdmin()
            .from('news_posts')
            .select('id, title, slug, published_at, created_at')
            .eq('is_published', true)
            .eq('is_pinned', true);

        if (newsError) throw newsError;

        // Fetch pinned publications
        const { data: pubs, error: pubsError } = await supabaseAdmin()
            .from('publications')
            .select('id, title, slug, type, published_at, created_at')
            .eq('is_published', true)
            .eq('is_pinned', true);

        if (pubsError) throw pubsError;

        // Fetch pinned achievements
        const { data: achievements, error: achError } = await supabaseAdmin()
            .from('achievements')
            .select('id, title, slug, achieved_at, created_at')
            .eq('is_published', true)
            .eq('is_pinned', true);

        if (achError) throw achError;

        // Map and merge
        const pinnedNews: PinnedItem[] = (news || []).map(p => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            coverUrl: null, // We'd need to join media_items for cover, or just leave null for now
            type: 'news',
            date: p.published_at || p.created_at
        }));

        const pinnedPubs: PinnedItem[] = (pubs || []).map(p => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            coverUrl: null,
            type: p.type || 'publication',
            date: p.published_at || p.created_at
        }));

        const pinnedAchievements: PinnedItem[] = (achievements || []).map(a => ({
            id: a.id,
            title: a.title,
            slug: a.slug,
            coverUrl: null,
            type: 'achievement',
            date: a.achieved_at || a.created_at
        }));

        const merged = [...pinnedNews, ...pinnedPubs, ...pinnedAchievements].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        return NextResponse.json(merged);
    } catch (error) {
        console.error('Pinned items GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch pinned items' }, { status: 500 });
    }
}
