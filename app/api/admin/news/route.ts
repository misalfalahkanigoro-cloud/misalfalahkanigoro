import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin()
            .from('news_posts')
            .select('*')
            .order('is_pinned', { ascending: false })
            .order('published_at', { ascending: false });

        if (error) {
            throw error;
        }

        // Map for frontend compatibility (is_pinned -> isPinned)
        const mapped = (data || []).map(row => ({
            ...row,
            isPinned: row.is_pinned
        }));

        return NextResponse.json(mapped);
    } catch (error) {
        console.error('Admin news error:', error);
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();
        const insertPayload = {
            title: payload.title?.trim() || '',
            slug: payload.slug?.trim() || '',
            excerpt: payload.excerpt?.trim() || '',
            content: payload.content || null,
            author_name: payload.authorName || 'Admin',
            published_at: payload.publishedAt || new Date().toISOString(),
            is_published: payload.isPublished ?? true,
            is_pinned: payload.isPinned ?? false,
        };

        if (!insertPayload.title || !insertPayload.slug) {
            return NextResponse.json({ error: 'Judul dan slug wajib diisi.' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin()
            .from('news_posts')
            .insert(insertPayload)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({
            ...data,
            isPinned: data.is_pinned
        });
    } catch (error) {
        console.error('Admin news create error:', error);
        return NextResponse.json({ error: 'Failed to create news' }, { status: 500 });
    }
}
