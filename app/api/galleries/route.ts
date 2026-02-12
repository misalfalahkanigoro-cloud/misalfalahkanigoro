import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10)));

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabaseAdmin()
            .from('galleries')
            .select('*', { count: 'exact' })
            .order('is_pinned', { ascending: false })
            .order('event_date', { ascending: false })
            .range(from, to);

        const { data, count, error } = await query;

        if (error) throw error;

        const ids = (data || []).map((row: any) => row.id);
        let mediaByEntity: Record<string, any[]> = {};
        if (ids.length) {
            const { data: mediaData, error: mediaError } = await supabaseAdmin()
                .from('media_items')
                .select('*')
                .eq('entity_type', 'gallery')
                .in('entity_id', ids)
                .order('display_order', { ascending: true });

            if (mediaError) throw mediaError;

            mediaByEntity = (mediaData || []).reduce((acc: any, m: any) => {
                (acc[m.entity_id] = acc[m.entity_id] || []).push(m);
                return acc;
            }, {});
        }

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
                description: row.description,
                eventDate: row.event_date,
                publishedAt: row.created_at, // fallback for compatibility
                isPublished: row.is_published,
                isPinned: row.is_pinned,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                media: mappedMedia
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

        const dbPayload = {
            title: body.title,
            slug: body.slug,
            description: body.description,
            event_date: body.eventDate,
            is_published: body.isPublished,
            is_pinned: body.isPinned
        };

        const { data, error } = await supabaseAdmin()
            .from('galleries')
            .insert(dbPayload)
            .select()
            .single();

        if (error) throw error;

        // Insert gallery media items if provided
        if (body.media && Array.isArray(body.media) && body.media.length > 0) {
            const normalizedMedia = body.media
                .filter((item: any) => item && (item.mediaUrl || item.url))
                .map((item: any, index: number) => ({
                    entity_id: data.id,
                    entity_type: 'gallery',
                    media_type: item.mediaType || 'image',
                    media_url: item.mediaUrl || item.url,
                    thumbnail_url: item.thumbnailUrl || null,
                    caption: item.caption || null,
                    display_order: Number(item.displayOrder) || index + 1,
                    is_main: index === 0,
                }));

            if (normalizedMedia.length) {
                await supabaseAdmin().from('media_items').insert(normalizedMedia);
            }
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
