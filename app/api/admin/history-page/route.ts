import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

type HistoryPayload = {
    id?: string;
    title?: string;
    subtitle?: string | null;
    contentJson?: unknown;
    contentHtml?: string | null;
    contentText?: string | null;
    coverImageUrl?: string | null;
    videoUrl?: string | null;
    isActive?: boolean;
    timelineItems?: Array<{
        id?: string;
        year?: string;
        title?: string;
        descriptionJson?: unknown;
        descriptionHtml?: string | null;
        descriptionText?: string | null;
        mediaUrl?: string | null;
        displayOrder?: number;
        isActive?: boolean;
    }>;
};

const mapPage = (data: any) => ({
    id: data.id,
    title: data.title,
    subtitle: data.subtitle,
    contentJson: data.content_json,
    contentHtml: data.content_html,
    contentText: data.content_text,
    coverImageUrl: data.cover_image_url,
    videoUrl: data.video_url,
    isActive: data.is_active,
});

const mapTimeline = (items: any[]) =>
    (items || []).map((item) => ({
        id: item.id,
        historyPageId: item.history_page_id,
        year: item.year,
        title: item.title,
        descriptionJson: item.description_json,
        descriptionHtml: item.description_html,
        descriptionText: item.description_text,
        mediaUrl: item.media_url,
        displayOrder: item.display_order,
        isActive: item.is_active,
    }));

export async function GET() {
    try {
        const { data: page, error } = await supabaseAdmin()
            .from('history_page')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        if (!page) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });

        const { data: timeline, error: timelineError } = await supabaseAdmin()
            .from('history_timeline_items')
            .select('*')
            .eq('history_page_id', page.id)
            .order('display_order', { ascending: true });

        if (timelineError) throw timelineError;

        return NextResponse.json({
            page: mapPage(page),
            timelineItems: mapTimeline(timeline || []),
        });
    } catch (error: any) {
        console.error('Admin history page error:', error);
        return NextResponse.json(
            { error: error?.message || error?.details || 'Failed to fetch history page' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const payload = (await request.json()) as HistoryPayload;

        const { data: existing, error: existingError } = await supabaseAdmin()
            .from('history_page')
            .select('id')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (existingError) throw existingError;

        const pagePayload = {
            title: payload.title ?? 'Sejarah Madrasah',
            subtitle: payload.subtitle ?? null,
            content_json: payload.contentJson ?? null,
            content_html: payload.contentHtml ?? null,
            content_text: payload.contentText ?? null,
            cover_image_url: payload.coverImageUrl ?? null,
            video_url: payload.videoUrl ?? null,
            is_active: payload.isActive ?? true,
        };

        let pageId = existing?.id as string | undefined;

        if (payload.id || pageId) {
            const id = payload.id ?? pageId!;
            const { error } = await supabaseAdmin()
                .from('history_page')
                .update(pagePayload)
                .eq('id', id);

            if (error) throw error;
            pageId = id;
        } else {
            const { data: inserted, error } = await supabaseAdmin()
                .from('history_page')
                .insert(pagePayload)
                .select('id')
                .single();
            if (error) throw error;
            pageId = inserted.id;
        }

        const items = Array.isArray(payload.timelineItems) ? payload.timelineItems : [];

        const { error: deleteError } = await supabaseAdmin()
            .from('history_timeline_items')
            .delete()
            .eq('history_page_id', pageId);
        if (deleteError) throw deleteError;

        if (items.length) {
            const mapped = items.map((item, index) => ({
                history_page_id: pageId,
                year: item.year || '',
                title: item.title || '',
                description_json: item.descriptionJson ?? null,
                description_html: item.descriptionHtml ?? null,
                description_text: item.descriptionText ?? null,
                media_url: item.mediaUrl ?? null,
                display_order: item.displayOrder ?? index + 1,
                is_active: item.isActive ?? true,
            }));

            const { error } = await supabaseAdmin()
                .from('history_timeline_items')
                .insert(mapped);

            if (error) throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Admin history page update error:', error);
        return NextResponse.json(
            { error: error?.message || error?.details || 'Failed to update history page' },
            { status: 500 }
        );
    }
}
