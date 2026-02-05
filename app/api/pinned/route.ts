import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { PinnedItem } from '@/lib/types';

export async function GET() {
    try {
        // Fetch pinned content posts
        const { data: posts, error: postsError } = await supabaseAdmin()
            .from('content_posts')
            .select('id, title, slug, coverUrl, publishedAt, createdAt')
            .eq('isPublished', true)
            .eq('is_pinned', true);

        if (postsError) throw postsError;

        // Fetch pinned achievements
        const { data: achievements, error: achError } = await supabaseAdmin()
            .from('achievements')
            .select('id, title, slug, coverUrl, achievedAt, createdAt')
            .eq('isPublished', true)
            .eq('is_pinned', true);

        if (achError) throw achError;

        // Map and merge
        const pinnedPosts: PinnedItem[] = (posts || []).map(p => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            coverUrl: p.coverUrl,
            type: 'publikasi',
            date: p.publishedAt || p.createdAt
        }));

        const pinnedAchievements: PinnedItem[] = (achievements || []).map(a => ({
            id: a.id,
            title: a.title,
            slug: a.slug,
            coverUrl: a.coverUrl,
            type: 'prestasi',
            date: a.achievedAt || a.createdAt
        }));

        const merged = [...pinnedPosts, ...pinnedAchievements].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        return NextResponse.json(merged);
    } catch (error) {
        console.error('Pinned items GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch pinned items' }, { status: 500 });
    }
}
