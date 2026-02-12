import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10)));
        const slug = searchParams.get('slug'); // Optional: filter by slug? Mostly used in [id]

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabaseAdmin()
            .from('news_posts')
            .select('*', { count: 'exact' })
            .order('is_pinned', { ascending: false })
            .order('published_at', { ascending: false })
            .range(from, to);

        // Filter condition? (e.g. is_published only for public? API is mixed use now)
        // Usually dedicated admin API is better, but here we reuse.
        // Let's assume frontend handles isPublished filtering logic via separate param if needed?
        // Or default to published only if no auth?
        // For now, let's return all if no filter specified, or standard "is_published=true" unless logic says otherwise
        // Actually, existing frontend might expect published only for public lists.
        // Let's add 'publishedOnly=true' param support.

        // Simplified: return all for now or filter by is_published=true by default?
        // Admin needs drafts. Public needs published.
        // Let's rely on payload param or separate logic?
        // Let's fetch all, frontend filters? Pagination breaks.
        // Standard: if calls from public pages, it requests published.

        // Let's just return raw data mapping for now.

        const { data, count, error } = await query;

        if (error) throw error;

        const ids = (data || []).map((row: any) => row.id);
        let mediaByEntity: Record<string, any[]> = {};

        if (ids.length) {
            const { data: mediaData, error: mediaError } = await supabaseAdmin()
                .from('media_items')
                .select('*')
                .eq('entity_type', 'news')
                .in('entity_id', ids)
                .order('display_order', { ascending: true });

            if (mediaError) throw mediaError;

            mediaByEntity = (mediaData || []).reduce((acc: any, m: any) => {
                (acc[m.entity_id] = acc[m.entity_id] || []).push(m);
                return acc;
            }, {});
        }

        // Map to Frontend types
        const items = (data || []).map((row: any) => {
            const mediaItems = mediaByEntity[row.id] || [];
            const mappedMedia = mediaItems.map((m: any) => ({
                id: m.id,
                mediaUrl: m.media_url,
                mediaType: m.media_type,
                thumbnailUrl: m.thumbnail_url,
                caption: m.caption,
                isMain: m.is_main,
                displayOrder: m.display_order,
                createdAt: m.created_at,
                entityType: m.entity_type,
                entityId: m.entity_id
            }));

            return {
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
                media: mappedMedia,
                coverUrl: mappedMedia.find((m: any) => m.isMain)?.mediaUrl || mappedMedia[0]?.mediaUrl || null
            };
        });

        return NextResponse.json({
            items,
            total: count || 0,
            page,
            pageSize
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Map Frontend -> DB
        const dbPayload = {
            title: body.title,
            slug: body.slug,
            excerpt: body.excerpt,
            content: body.content,
            author_name: body.authorName,
            published_at: body.publishedAt,
            is_published: body.isPublished,
            is_pinned: body.isPinned
        };

        const { data, error } = await supabaseAdmin()
            .from('news_posts')
            .insert(dbPayload)
            .select()
            .single();

        if (error) throw error;

        if (body.coverUrl && data?.id) {
            await supabaseAdmin()
                .from('media_items')
                .delete()
                .eq('entity_id', data.id)
                .eq('entity_type', 'news')
                .eq('is_main', true);

            await supabaseAdmin()
                .from('media_items')
                .insert({
                    entity_id: data.id,
                    entity_type: 'news',
                    media_type: 'image',
                    media_url: body.coverUrl,
                    is_main: true,
                    display_order: 0
                });
        }

        if (body.media && Array.isArray(body.media) && body.media.length > 0) {
            const normalized = body.media
                .filter((m: any) => m.mediaUrl)
                .map((m: any, idx: number) => ({
                    entity_id: data.id,
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

        // Also handle coverUrl special case? 
        // Usually cover is just a marked media item.

        return NextResponse.json(data);

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
