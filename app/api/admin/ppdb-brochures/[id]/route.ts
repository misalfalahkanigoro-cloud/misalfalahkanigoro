import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const payload = await request.json();
        const { data, error } = await supabaseAdmin()
            .from('media_items')
            .update({
                entity_id: payload.waveId,
                media_url: payload.mediaUrl,
                caption: payload.caption || null,
                is_main: Boolean(payload.isMain),
                display_order: Number(payload.displayOrder) || 0,
            })
            .eq('id', id)
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
        console.error('Admin PPDB brochure update error:', error);
        return NextResponse.json({ error: 'Failed to update brochure' }, { status: 500 });
    }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { error } = await supabaseAdmin()
            .from('media_items')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin PPDB brochure delete error:', error);
        return NextResponse.json({ error: 'Failed to delete brochure' }, { status: 500 });
    }
}
