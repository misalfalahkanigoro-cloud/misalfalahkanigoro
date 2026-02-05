import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const parseMeta = (value: unknown) => {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    if (typeof value === 'object') {
        return value;
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return null;
        return JSON.parse(trimmed);
    }
    return null;
};

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || undefined;

        let query = supabaseAdmin()
            .from('content_posts')
            .select('*')
            .order('isPinned', { ascending: false })
            .order('publishedAt', { ascending: false })
            .order('createdAt', { ascending: false });

        if (type) {
            query = query.eq('type', type);
        }

        const { data, error } = await query;
        if (error) {
            throw error;
        }

        return NextResponse.json(data || []);
    } catch (error) {
        console.error('Admin content posts error:', error);
        return NextResponse.json({ error: 'Failed to fetch content posts' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        const postInput = payload?.post ?? payload;
        const mediaInput = payload?.media;

        if (!postInput?.title || !postInput?.slug || !postInput?.type) {
            return NextResponse.json({ error: 'Judul, slug, dan tipe wajib diisi.' }, { status: 400 });
        }

        let metaValue: any = null;
        try {
            metaValue = parseMeta(postInput.meta);
        } catch (error) {
            return NextResponse.json({ error: 'Format meta JSON tidak valid.' }, { status: 400 });
        }

        const insertPayload: any = {
            type: postInput.type,
            title: postInput.title?.trim(),
            slug: postInput.slug?.trim(),
            excerpt: postInput.excerpt?.trim() || null,
            contentHtml: postInput.contentHtml || null,
            contentText: postInput.contentText || null,
            coverUrl: postInput.coverUrl || null,
            category: postInput.category || null,
            publishedAt: postInput.publishedAt || null,
            isPublished: postInput.isPublished ?? true,
            isPinned: postInput.isPinned ?? false,
            meta: metaValue,
        };

        const { data: created, error } = await supabaseAdmin()
            .from('content_posts')
            .insert(insertPayload)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        if (Array.isArray(mediaInput)) {
            const normalizedMedia = mediaInput
                .filter((item) => item && (item.url || item.embedHtml))
                .map((item, index) => ({
                    postId: created.id,
                    mediaType: item.mediaType,
                    url: item.url || null,
                    embedHtml: item.embedHtml || null,
                    caption: item.caption || null,
                    displayOrder: Number(item.displayOrder) || index + 1,
                    isActive: item.isActive ?? true,
                }));

            if (normalizedMedia.length) {
                const { error: mediaError } = await supabaseAdmin()
                    .from('content_media')
                    .insert(normalizedMedia);

                if (mediaError) {
                    throw mediaError;
                }
            }
        }

        return NextResponse.json({ post: created });
    } catch (error) {
        console.error('Admin create content post error:', error);
        return NextResponse.json({ error: 'Failed to create content post' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const payload = await request.json();
        const postInput = payload?.post ?? payload;
        const mediaInput = payload?.media;

        if (!postInput?.id) {
            return NextResponse.json({ error: 'ID wajib diisi.' }, { status: 400 });
        }
        if (!postInput?.title || !postInput?.slug || !postInput?.type) {
            return NextResponse.json({ error: 'Judul, slug, dan tipe wajib diisi.' }, { status: 400 });
        }

        let metaValue: any = null;
        try {
            metaValue = parseMeta(postInput.meta);
        } catch (error) {
            return NextResponse.json({ error: 'Format meta JSON tidak valid.' }, { status: 400 });
        }

        const updatePayload: any = {
            type: postInput.type,
            title: postInput.title?.trim(),
            slug: postInput.slug?.trim(),
            excerpt: postInput.excerpt?.trim() || null,
            contentHtml: postInput.contentHtml || null,
            contentText: postInput.contentText || null,
            coverUrl: postInput.coverUrl || null,
            category: postInput.category || null,
            publishedAt: postInput.publishedAt || null,
            isPublished: postInput.isPublished ?? true,
            isPinned: postInput.isPinned ?? false,
            meta: metaValue,
        };

        const { data: updated, error } = await supabaseAdmin()
            .from('content_posts')
            .update(updatePayload)
            .eq('id', postInput.id)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        if (Array.isArray(mediaInput)) {
            const { error: deleteError } = await supabaseAdmin()
                .from('content_media')
                .delete()
                .eq('postId', updated.id);

            if (deleteError) {
                throw deleteError;
            }

            const normalizedMedia = mediaInput
                .filter((item) => item && (item.url || item.embedHtml))
                .map((item, index) => ({
                    postId: updated.id,
                    mediaType: item.mediaType,
                    url: item.url || null,
                    embedHtml: item.embedHtml || null,
                    caption: item.caption || null,
                    displayOrder: Number(item.displayOrder) || index + 1,
                    isActive: item.isActive ?? true,
                }));

            if (normalizedMedia.length) {
                const { error: mediaError } = await supabaseAdmin()
                    .from('content_media')
                    .insert(normalizedMedia);

                if (mediaError) {
                    throw mediaError;
                }
            }
        }

        return NextResponse.json({ post: updated });
    } catch (error) {
        console.error('Admin update content post error:', error);
        return NextResponse.json({ error: 'Failed to update content post' }, { status: 500 });
    }
}
