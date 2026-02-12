import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10)));
        const level = searchParams.get('level');

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabaseAdmin()
            .from('achievements')
            .select('*', { count: 'exact' })
            .order('is_pinned', { ascending: false })
            .order('achieved_at', { ascending: false })
            .range(from, to);

        if (level) {
            query = query.eq('event_level', level);
        }

        const { data, count, error } = await query;

        if (error) throw error;

        const ids = (data || []).map((row: any) => row.id);
        let mediaByEntity: Record<string, any[]> = {};

        if (ids.length) {
            const { data: mediaData, error: mediaError } = await supabaseAdmin()
                .from('media_items')
                .select('*')
                .eq('entity_type', 'achievement')
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
                eventName: row.event_name,
                eventLevel: row.event_level,
                rank: row.rank,
                description: row.description,
                achievedAt: row.achieved_at,
                isPublished: row.is_published,
                isPinned: row.is_pinned,
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

        const dbPayload = {
            title: body.title,
            slug: body.slug,
            event_name: body.eventName,
            event_level: body.eventLevel,
            rank: body.rank,
            description: body.description,
            achieved_at: body.achievedAt,
            is_published: body.isPublished,
            is_pinned: body.isPinned
        };

        const { data, error } = await supabaseAdmin()
            .from('achievements')
            .insert(dbPayload)
            .select()
            .single();

        if (error) throw error;

        if (body.coverUrl && data?.id) {
            await supabaseAdmin()
                .from('media_items')
                .delete()
                .eq('entity_id', data.id)
                .eq('entity_type', 'achievement')
                .eq('is_main', true);

            await supabaseAdmin()
                .from('media_items')
                .insert({
                    entity_id: data.id,
                    entity_type: 'achievement',
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
                    entity_type: 'achievement',
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

        return NextResponse.json(data);

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
