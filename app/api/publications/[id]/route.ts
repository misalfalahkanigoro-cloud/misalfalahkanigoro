import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

type PublicationMediaType = 'image' | 'video' | 'youtube_embed';

const normalizePublicationType = (value: unknown): 'announcement' | 'article' | 'bulletin' => {
    const type = String(value || '')
        .toLowerCase()
        .trim();

    if (type === 'publication') return 'announcement';
    if (type === 'announcement' || type === 'article' || type === 'bulletin') return type;
    return 'article';
};

const normalizeMediaType = (value: unknown): PublicationMediaType => {
    const mediaType = String(value || '')
        .toLowerCase()
        .trim();

    if (mediaType === 'video') return 'video';
    if (mediaType === 'youtube_embed') return 'youtube_embed';
    return 'image';
};

const buildPublicationMediaPayload = (
    entityId: string,
    mediaInput: unknown,
    coverUrlInput: unknown
) => {
    const normalized: Array<{
        entity_id: string;
        entity_type: 'publication';
        media_type: PublicationMediaType;
        media_url: string;
        thumbnail_url: string | null;
        caption: string | null;
        display_order: number;
        is_main: boolean;
    }> = [];

    const seenUrls = new Set<string>();
    const coverUrl = typeof coverUrlInput === 'string' ? coverUrlInput.trim() : '';

    if (coverUrl) {
        normalized.push({
            entity_id: entityId,
            entity_type: 'publication',
            media_type: 'image',
            media_url: coverUrl,
            thumbnail_url: null,
            caption: null,
            display_order: 0,
            is_main: true,
        });
        seenUrls.add(coverUrl);
    }

    if (Array.isArray(mediaInput)) {
        for (const item of mediaInput) {
            if (!item || typeof item !== 'object') continue;
            const mediaObject = item as Record<string, any>;
            const mediaUrl = String(mediaObject.mediaUrl || mediaObject.url || '').trim();
            if (!mediaUrl || seenUrls.has(mediaUrl)) continue;

            normalized.push({
                entity_id: entityId,
                entity_type: 'publication',
                media_type: normalizeMediaType(mediaObject.mediaType),
                media_url: mediaUrl,
                thumbnail_url: mediaObject.thumbnailUrl || null,
                caption: mediaObject.caption || null,
                display_order: normalized.length,
                is_main: !coverUrl && Boolean(mediaObject.isMain),
            });
            seenUrls.add(mediaUrl);
        }
    }

    if (normalized.length > 0 && !normalized.some((item) => item.is_main)) {
        normalized[0].is_main = true;
    }

    return normalized.map((item, index) => ({
        ...item,
        display_order: item.is_main ? 0 : Math.max(1, index),
    }));
};

const mapPublication = (row: any) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    type: row.type,
    excerpt: row.description,
    description: row.description,
    content: row.content,
    authorName: 'Admin',
    publishedAt: row.published_at,
    isPublished: row.is_published,
    isPinned: row.is_pinned,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    media: (row.media_items || []).map((m: any) => ({
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
    })),
    coverUrl:
        (row.media_items || []).find((m: any) => m.is_main)?.media_url ||
        (row.media_items || [])[0]?.media_url ||
        row.coverUrl ||
        null,
});

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let query = supabaseAdmin()
        .from('publications')
        .select('*');

        if (isUUID) {
            query = query.eq('id', id);
        } else {
            query = query.eq('slug', id);
        }

        const { data, error } = await query.maybeSingle();

        if (error || !data) {
            return NextResponse.json({ error: 'Publication not found' }, { status: 404 });
        }

        // fetch media separately
        const { data: mediaData, error: mediaError } = await supabaseAdmin()
            .from('media_items')
            .select('*')
            .eq('entity_type', 'publication')
            .eq('entity_id', data.id)
            .order('display_order', { ascending: true });

        if (mediaError) throw mediaError;

        return NextResponse.json(mapPublication({ ...data, media_items: mediaData || [] }));

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

        const { data: existing, error: existingError } = await supabaseAdmin()
            .from('publications')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (existingError) throw existingError;
        if (!existing) {
            return NextResponse.json({ error: 'Publication not found' }, { status: 404 });
        }

        const hasPublishedFlag = typeof body.isPublished === 'boolean';
        const hasPinnedFlag = typeof body.isPinned === 'boolean';

        const dbPayload = {
            title: body.title ?? existing.title,
            slug: body.slug ?? existing.slug,
            type: normalizePublicationType(body.type ?? existing.type),
            description: body.description ?? body.excerpt ?? existing.description ?? null,
            content: body.content ?? existing.content ?? null,
            published_at: body.publishedAt ?? existing.published_at ?? new Date().toISOString(),
            is_published: hasPublishedFlag ? body.isPublished : (existing.is_published ?? true),
            is_pinned: hasPinnedFlag ? body.isPinned : (existing.is_pinned ?? false),
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabaseAdmin()
            .from('publications')
            .update(dbPayload)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Handle media updates, including cover changes.
        const shouldRefreshMedia = Array.isArray(body.media) || Object.prototype.hasOwnProperty.call(body, 'coverUrl');
        if (shouldRefreshMedia) {
            await supabaseAdmin().from('media_items').delete().eq('entity_id', id).eq('entity_type', 'publication');

            const normalizedMedia = buildPublicationMediaPayload(id, body.media, body.coverUrl);

            if (normalizedMedia.length) {
                await supabaseAdmin().from('media_items').insert(normalizedMedia);
            }
        }

        const { data: mediaData, error: mediaError } = await supabaseAdmin()
            .from('media_items')
            .select('*')
            .eq('entity_type', 'publication')
            .eq('entity_id', data.id)
            .order('display_order', { ascending: true });

        if (mediaError) throw mediaError;

        return NextResponse.json(mapPublication({ ...data, media_items: mediaData || [] }));

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
        await supabaseAdmin().from('media_items').delete().eq('entity_id', id).eq('entity_type', 'publication');

        const { error } = await supabaseAdmin()
            .from('publications')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
