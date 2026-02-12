import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

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
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        if (!page) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });

        const { data: timeline, error: timelineError } = await supabaseAdmin()
            .from('history_timeline_items')
            .select('*')
            .eq('history_page_id', page.id)
            .eq('is_active', true)
            .order('display_order', { ascending: true });

        if (timelineError) throw timelineError;

        return NextResponse.json({
            page: mapPage(page),
            timelineItems: mapTimeline(timeline || []),
        });
    } catch (error: any) {
        console.error('Public history page error:', error);
        return NextResponse.json(
            { error: error?.message || error?.details || 'Failed to fetch history page' },
            { status: 500 }
        );
    }
}
