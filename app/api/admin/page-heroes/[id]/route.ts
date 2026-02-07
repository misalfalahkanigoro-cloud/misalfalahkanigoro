import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const payload = await request.json();
        const updatePayload = {
            pageslug: payload.pageSlug?.trim() || '',
            title: payload.title?.trim() || '',
            subtitle: payload.subtitle?.trim() || null,
            imageurl: payload.imageUrl?.trim() || '',
            overlayopacity: payload.overlayOpacity ?? 0.5,
            isactive: payload.isActive ?? payload.isactive ?? true,
        };

        const { data, error } = await supabaseAdmin()
            .from('page_heroes')
            .update(updatePayload)
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Admin page heroes update error:', error);
        return NextResponse.json({ error: 'Failed to update page hero' }, { status: 500 });
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { error } = await supabaseAdmin()
            .from('page_heroes')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin page heroes delete error:', error);
        return NextResponse.json({ error: 'Failed to delete page hero' }, { status: 500 });
    }
}
