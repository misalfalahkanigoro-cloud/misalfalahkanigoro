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

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10)));
        const type = searchParams.get('type');

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabaseAdmin()
            .from('publications')
            .select('*', { count: 'exact' })
            .order('is_pinned', { ascending: false })
            .order('published_at', { ascending: false })
            .range(from, to);

        if (type) {
            query = query.eq('type', type);
        }

        const { data, count, error } = await query;

        if (error) throw error;

        const ids = (data || []).map((row: any) => row.id);
        let mediaByEntity: Record<string, any[]> = {};

        if (ids.length) {
            const { data: mediaData, error: mediaError } = await supabaseAdmin()
                .from('media_items')
                .select('*')
                .eq('entity_type', 'publication')
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
                type: row.type,
                excerpt: row.description, // Alias for backward compatibility
                description: row.description,
                content: row.content,
                authorName: 'Admin',
                publishedAt: row.published_at,
                isPublished: row.is_published,
                isPinned: row.is_pinned,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                media: mappedMedia,
                coverUrl: mappedMedia.find((m: any) => m.isMain)?.mediaUrl || mappedMedia[0]?.mediaUrl || null,
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
        const normalizedType = normalizePublicationType(body.type);

        const dbPayload = {
            title: body.title,
            slug: body.slug,
            type: normalizedType,
            description: body.description || body.excerpt || null,
            content: body.content || null,
            published_at: body.publishedAt || new Date().toISOString(),
            is_published: body.isPublished ?? true,
            is_pinned: body.isPinned ?? false
        };

        const { data, error } = await supabaseAdmin()
            .from('publications')
            .insert(dbPayload)
            .select()
            .single();

        if (error) throw error;

        const normalizedMedia = buildPublicationMediaPayload(data.id, body.media, body.coverUrl);
        if (normalizedMedia.length > 0) {
            await supabaseAdmin().from('media_items').insert(normalizedMedia);
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
