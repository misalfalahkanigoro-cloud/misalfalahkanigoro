import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Helper to map DB -> Frontend
const mapNews = (row: any, media: any[] = []) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    authorName: row.author_name,
    publishedAt: row.published_at,
    isPublished: row.is_published,
    isPinned: row.is_pinned,
    viewCount: row.view_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    media: media.map((m: any) => ({
        id: m.id,
        mediaUrl: m.media_url,
        mediaType: m.media_type,
        thumbnailUrl: m.thumbnail_url,
        caption: m.caption,
        isMain: m.is_main,
        displayOrder: m.display_order,
        createdAt: m.created_at,
        entityType: m.entity_type,
        entityId: m.entity_id,
    })),
    coverUrl: media.find((m: any) => m.is_main)?.media_url || media[0]?.media_url || null
});

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        let query = supabaseAdmin()
            .from('news_posts')
            .select('*');

        if (isUUID) {
            query = query.eq('id', id);
        } else {
            query = query.eq('slug', id);
        }

        const { data, error } = await query.maybeSingle();

        if (error || !data) {
            return NextResponse.json({ error: 'News not found' }, { status: 404 });
        }

        const { data: mediaData, error: mediaError } = await supabaseAdmin()
            .from('media_items')
            .select('*')
            .eq('entity_type', 'news')
            .eq('entity_id', data.id)
            .order('display_order', { ascending: true });

        if (mediaError) throw mediaError;

        return NextResponse.json(mapNews(data, mediaData || []));

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await request.json();
        const { id } = await params;

        const dbPayload = {
            title: body.title,
            slug: body.slug,
            excerpt: body.excerpt,
            content: body.content,
            author_name: body.authorName,
            published_at: body.publishedAt,
            is_published: body.isPublished,
            is_pinned: body.isPinned,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabaseAdmin()
            .from('news_posts')
            .update(dbPayload)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Replace non-cover media when provided
        if (body.media && Array.isArray(body.media)) {
            await supabaseAdmin()
                .from('media_items')
                .delete()
                .eq('entity_id', id)
                .eq('entity_type', 'news')
                .eq('is_main', false);

            const normalized = body.media
                .filter((m: any) => m.mediaUrl)
                .map((m: any, idx: number) => ({
                    entity_id: id,
                    entity_type: 'news',
                    media_type: m.mediaType || 'image',
                    media_url: m.mediaUrl,
                    thumbnail_url: m.thumbnailUrl || null,
                    caption: m.caption || null,
                    is_main: Boolean(m.isMain),
                    display_order: m.displayOrder ?? idx + 1,
                }));

            if (normalized.length) {
                await supabaseAdmin().from('media_items').insert(normalized);
            }
        }

        // Upsert cover media if provided
        if (body.coverUrl) {
            await supabaseAdmin()
                .from('media_items')
                .delete()
                .eq('entity_id', id)
                .eq('entity_type', 'news')
                .eq('is_main', true);

            await supabaseAdmin()
                .from('media_items')
                .insert({
                    entity_id: id,
                    entity_type: 'news',
                    media_type: 'image',
                    media_url: body.coverUrl,
                    is_main: true,
                    display_order: 0
                });
        }

        const { data: mediaData, error: mediaError } = await supabaseAdmin()
            .from('media_items')
            .select('*')
            .eq('entity_type', 'news')
            .eq('entity_id', id)
            .order('display_order', { ascending: true });

        if (mediaError) throw mediaError;

        return NextResponse.json(mapNews(data, mediaData || []));

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await supabaseAdmin().from('media_items').delete().eq('entity_id', id).eq('entity_type', 'news');

        const { error } = await supabaseAdmin()
            .from('news_posts')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
