import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const mapGallery = (row: any) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    eventDate: row.event_date,
    publishedAt: row.created_at, // fallback compatibility
    isPublished: row.is_published,
    isPinned: row.is_pinned,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    media: (row.media_items || []).map((m: any) => ({
        id: m.id,
        mediaUrl: m.media_url,
        mediaType: m.media_type,
        caption: m.caption
    }))
});

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let query = supabaseAdmin()
        .from('galleries')
        .select('*');

        if (isUUID) {
            query = query.eq('id', id);
        } else {
            query = query.eq('slug', id);
        }

        const { data, error } = await query.maybeSingle();

        if (error || !data) {
            return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });
        }

        const { data: mediaData, error: mediaError } = await supabaseAdmin()
            .from('media_items')
            .select('*')
            .eq('entity_type', 'gallery')
            .eq('entity_id', data.id)
            .order('display_order', { ascending: true });

        if (mediaError) throw mediaError;

        return NextResponse.json(mapGallery({ ...data, media_items: mediaData || [] }));

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
            description: body.description,
            event_date: body.eventDate,
            is_published: body.isPublished,
            is_pinned: body.isPinned,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabaseAdmin()
            .from('galleries')
            .update(dbPayload)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Handle media Refresh
        if (body.media && Array.isArray(body.media)) {
            await supabaseAdmin().from('media_items').delete().eq('entity_id', id).eq('entity_type', 'gallery');

            const normalizedMedia = body.media
                .filter((item: any) => item && (item.mediaUrl || item.url || item.embedHtml))
                .map((item: any, index: number) => ({
                    entity_id: id,
                    entity_type: 'gallery',
                    media_type: item.mediaType || 'image',
                    media_url: item.mediaUrl || item.url || null,
                    thumbnail_url: item.thumbnailUrl || null,
                    caption: item.caption || null,
                    display_order: Number(item.displayOrder) || index + 1,
                    is_main: index === 0,
                }));

            if (normalizedMedia.length) {
                await supabaseAdmin().from('media_items').insert(normalizedMedia);
            }
        }

        return NextResponse.json(mapGallery(data));

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
        await supabaseAdmin().from('media_items').delete().eq('entity_id', id);

        const { error } = await supabaseAdmin()
            .from('galleries')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
