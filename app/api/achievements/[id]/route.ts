import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const mapAchievement = (row: any, media: any[] = []) => {
    const mappedMedia = media.map((m: any) => ({
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
};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        let query = supabaseAdmin()
            .from('achievements')
            .select('*');

        if (isUUID) {
            query = query.eq('id', id);
        } else {
            query = query.eq('slug', id);
        }

        const { data, error } = await query.maybeSingle();

        if (error || !data) {
            return NextResponse.json({ error: 'Achievement not found' }, { status: 404 });
        }

        const { data: mediaData, error: mediaError } = await supabaseAdmin()
            .from('media_items')
            .select('*')
            .eq('entity_type', 'achievement')
            .eq('entity_id', data.id)
            .order('display_order', { ascending: true });

        if (mediaError) throw mediaError;

        return NextResponse.json(mapAchievement(data, mediaData || []));

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
            event_name: body.eventName,
            event_level: body.eventLevel,
            rank: body.rank,
            description: body.description,
            achieved_at: body.achievedAt,
            is_published: body.isPublished,
            is_pinned: body.isPinned,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabaseAdmin()
            .from('achievements')
            .update(dbPayload)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        if (body.media && Array.isArray(body.media)) {
            await supabaseAdmin()
                .from('media_items')
                .delete()
                .eq('entity_id', id)
                .eq('entity_type', 'achievement')
                .eq('is_main', false);

            const normalized = body.media
                .filter((m: any) => m.mediaUrl)
                .map((m: any, idx: number) => ({
                    entity_id: id,
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

        if (body.coverUrl) {
            await supabaseAdmin()
                .from('media_items')
                .delete()
                .eq('entity_id', id)
                .eq('entity_type', 'achievement')
                .eq('is_main', true);

            await supabaseAdmin()
                .from('media_items')
                .insert({
                    entity_id: id,
                    entity_type: 'achievement',
                    media_type: 'image',
                    media_url: body.coverUrl,
                    is_main: true,
                    display_order: 0
                });
        }

        const { data: mediaData, error: mediaError } = await supabaseAdmin()
            .from('media_items')
            .select('*')
            .eq('entity_type', 'achievement')
            .eq('entity_id', id)
            .order('display_order', { ascending: true });

        if (mediaError) throw mediaError;

        return NextResponse.json(mapAchievement(data, mediaData || []));

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
        // Cleanup media first
        await supabaseAdmin().from('media_items').delete().eq('entity_id', id);

        const { error } = await supabaseAdmin()
            .from('achievements')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
