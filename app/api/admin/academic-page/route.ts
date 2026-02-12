import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data: page, error: pageError } = await supabaseAdmin()
            .from('academic_pages')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (pageError) throw pageError;

        if (!page) {
            return NextResponse.json({ page: null, sections: [], media: [] });
        }

        const { data: sections, error: sectionsError } = await supabaseAdmin()
            .from('academic_sections')
            .select('*')
            .eq('page_id', page.id)
            .order('display_order', { ascending: true });

        if (sectionsError) throw sectionsError;

        const { data: mediaItems, error: mediaError } = await supabaseAdmin()
            .from('media_items')
            .select('*')
            .eq('entity_type', 'academic')
            .eq('entity_id', page.id)
            .order('is_main', { ascending: false })
            .order('display_order', { ascending: true });

        if (mediaError) throw mediaError;

        const mappedSections = (sections || []).map((item: any) => ({
            id: item.id,
            pageId: item.page_id,
            title: item.title,
            body: item.body,
            displayOrder: item.display_order,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
        }));

        const mappedMedia = (mediaItems || []).map((item: any) => ({
            id: item.id,
            entityType: item.entity_type,
            entityId: item.entity_id,
            mediaType: item.media_type,
            mediaUrl: item.media_url,
            thumbnailUrl: item.thumbnail_url,
            caption: item.caption,
            isMain: item.is_main,
            displayOrder: item.display_order,
            createdAt: item.created_at,
        }));

        return NextResponse.json({
            page: {
                id: page.id,
                title: page.title,
                subtitle: page.subtitle,
                content: page.content,
                isActive: page.is_active,
                createdAt: page.created_at,
                updatedAt: page.updated_at,
            },
            sections: mappedSections,
            media: mappedMedia,
            coverUrl: mappedMedia.find((m) => m.isMain)?.mediaUrl || null,
        });
    } catch (error) {
        console.error('Admin academic page error:', error);
        return NextResponse.json({ error: 'Failed to fetch academic page' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const payload = await request.json();
        const page = payload.page || payload;
        const sections = Array.isArray(payload.sections) ? payload.sections : [];
        const media = Array.isArray(payload.media) ? payload.media : [];
        const coverUrl = payload.coverUrl || page.coverUrl || null;

        const pagePayload = {
            title: page.title || '',
            subtitle: page.subtitle || null,
            content: page.content || null,
            is_active: page.isActive ?? true,
        } as any;

        let savedPage: any;

        if (page.id) {
            const { data, error } = await supabaseAdmin()
                .from('academic_pages')
                .upsert({ id: page.id, ...pagePayload })
                .select('*')
                .single();
            if (error) throw error;
            savedPage = data;
        } else {
            const { data, error } = await supabaseAdmin()
                .from('academic_pages')
                .insert(pagePayload)
                .select('*')
                .single();
            if (error) throw error;
            savedPage = data;
        }

        const { error: deleteSectionsError } = await supabaseAdmin()
            .from('academic_sections')
            .delete()
            .eq('page_id', savedPage.id);
        if (deleteSectionsError) throw deleteSectionsError;

        if (sections.length) {
            const sectionPayload = sections
                .map((item: any, index: number) => ({
                    page_id: savedPage.id,
                    title: item.title?.trim() || '',
                    body: item.body?.trim() || null,
                    display_order: Number(item.displayOrder) || index + 1,
                }))
                .filter((item: any) => item.title);

            if (sectionPayload.length) {
                const { error } = await supabaseAdmin()
                    .from('academic_sections')
                    .insert(sectionPayload);
                if (error) throw error;
            }
        }

        const { error: deleteMediaError } = await supabaseAdmin()
            .from('media_items')
            .delete()
            .eq('entity_type', 'academic')
            .eq('entity_id', savedPage.id);
        if (deleteMediaError) throw deleteMediaError;

        if (coverUrl) {
            const { error } = await supabaseAdmin()
                .from('media_items')
                .insert({
                    entity_id: savedPage.id,
                    entity_type: 'academic',
                    media_type: 'image',
                    media_url: coverUrl,
                    is_main: true,
                    display_order: 0,
                });
            if (error) throw error;
        }

        if (media.length) {
            const mediaPayload = media
                .map((item: any, index: number) => ({
                    entity_id: savedPage.id,
                    entity_type: 'academic',
                    media_type: item.mediaType || 'image',
                    media_url: item.mediaUrl || item.url || item.embedHtml,
                    thumbnail_url: item.thumbnailUrl || null,
                    caption: item.caption || null,
                    is_main: false,
                    display_order: item.displayOrder ?? index + 1,
                }))
                .filter((item: any) => item.media_url);

            if (mediaPayload.length) {
                const { error } = await supabaseAdmin()
                    .from('media_items')
                    .insert(mediaPayload);
                if (error) throw error;
            }
        }

        return NextResponse.json({
            page: {
                id: savedPage.id,
                title: savedPage.title,
                subtitle: savedPage.subtitle,
                content: savedPage.content,
                isActive: savedPage.is_active,
                createdAt: savedPage.created_at,
                updatedAt: savedPage.updated_at,
            },
        });
    } catch (error) {
        console.error('Admin academic page update error:', error);
        return NextResponse.json({ error: 'Failed to update academic page' }, { status: 500 });
    }
}
