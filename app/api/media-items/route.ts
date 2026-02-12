import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const entityType = searchParams.get('entityType');
        const entityId = searchParams.get('entityId');
        if (!entityType) {
            return NextResponse.json({ error: 'entityType is required' }, { status: 400 });
        }

        let query = supabaseAdmin()
            .from('media_items')
            .select('*')
            .eq('entity_type', entityType)
            .order('display_order', { ascending: true });

        if (entityId) {
            query = query.eq('entity_id', entityId);
        }

        const { data, error } = await query;

        if (error) throw error;

        const mapped = (data || []).map((m: any) => ({
            id: m.id,
            entityType: m.entity_type,
            entityId: m.entity_id,
            mediaType: m.media_type,
            mediaUrl: m.media_url,
            thumbnailUrl: m.thumbnail_url,
            caption: m.caption,
            isMain: m.is_main,
            displayOrder: m.display_order,
            createdAt: m.created_at,
        }));

        return NextResponse.json(mapped);
    } catch (error) {
        console.error('Media items error:', error);
        return NextResponse.json({ error: 'Failed to fetch media items' }, { status: 500 });
    }
}
