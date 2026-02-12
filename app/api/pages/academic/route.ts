import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data: page, error: pageError } = await supabaseAdmin()
            .from('academic_pages')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (pageError) throw pageError;
        if (!page) {
            return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
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
            id: page.id,
            title: page.title,
            subtitle: page.subtitle,
            content: page.content,
            isActive: page.is_active,
            createdAt: page.created_at,
            updatedAt: page.updated_at,
            sections: mappedSections,
            media: mappedMedia,
            coverUrl: mappedMedia.find((m) => m.isMain)?.mediaUrl || mappedMedia[0]?.mediaUrl || null,
        });
    } catch (error) {
        console.error('Error fetching academic page:', error);
        return NextResponse.json({ error: 'Failed to fetch academic page' }, { status: 500 });
    }
}
