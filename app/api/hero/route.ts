import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        // Query the view that consolidates pinned items from all modules
        // This view runs the UNION ALL query provided by the user
        const { data, error } = await supabaseAdmin()
            .from('view_hero_section')
            .select('*');

        if (error) {
            console.error('Error fetching hero section:', error);
            // Fallback for missing view - run a minimal query or return empty
            return NextResponse.json({ error: 'Failed to fetch hero items' }, { status: 500 });
        }

        const items = data || [];

        // Fetch cover media (is_main) per entity from media_items
        const idsAll = items.map((row: any) => row.id);
        const coverByEntity: Record<string, string | null> = {};

        if (idsAll.length) {
            const { data: mediaData, error: mediaErr } = await supabaseAdmin()
                .from('media_items')
                .select('entity_id, media_url, is_main, entity_type, display_order')
                .in('entity_id', idsAll)
                .eq('is_main', true);

            if (mediaErr) {
                console.error('Error fetching hero media:', mediaErr);
            } else {
                (mediaData || []).forEach((m: any) => {
                    coverByEntity[m.entity_id] = m.media_url;
                });
            }
        }

        // Map database fields to frontend HeroItem type
        const mappedData = items.map((item: any) => ({
            id: item.id,
            type: item.type,
            title: item.title,
            slug: item.slug,
            description: item.description, // view currently not providing; kept for compatibility
            date: item.date,
            coverUrl: coverByEntity[item.id] || null,
            isPinned: true
        }));

        return NextResponse.json(mappedData);
    } catch (error) {
        console.error('Unhandled error in hero API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
