import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin()
            .from('media_items')
            .select('*')
            .eq('entity_type', 'ppdb')
            .order('display_order', { ascending: true });

        if (error) throw error;

        const mapped = (data || []).map((row: any) => ({
            id: row.id,
            entityId: row.entity_id,
            mediaUrl: row.media_url,
            caption: row.caption,
            displayOrder: row.display_order,
            isMain: row.is_main,
            createdAt: row.created_at,
        }));

        return NextResponse.json(mapped);
    } catch (error) {
        console.error('Admin PPDB brochures error:', error);
        return NextResponse.json({ error: 'Failed to fetch brochures' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();
        if (!payload.waveId || !payload.mediaUrl) {
            return NextResponse.json({ error: 'waveId and mediaUrl are required' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin()
            .from('media_items')
            .insert({
                entity_type: 'ppdb',
                entity_id: payload.waveId,
                media_type: 'image',
                media_url: payload.mediaUrl,
                caption: payload.caption || null,
                is_main: Boolean(payload.isMain),
                display_order: Number(payload.displayOrder) || 0,
            })
            .select('*')
            .single();

        if (error) throw error;

        return NextResponse.json({
            id: data.id,
            entityId: data.entity_id,
            mediaUrl: data.media_url,
            caption: data.caption,
            displayOrder: data.display_order,
            isMain: data.is_main,
            createdAt: data.created_at,
        });
    } catch (error) {
        console.error('Admin PPDB brochure create error:', error);
        return NextResponse.json({ error: 'Failed to create brochure' }, { status: 500 });
    }
}
