import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const payload = await request.json();
        const updatePayload = {
            icon: payload.icon || 'Star',
            title: payload.title?.trim() || '',
            description: payload.description?.trim() || '',
            order: Number(payload.order) || 0,
        };

        const { data, error } = await supabaseAdmin()
            .from('highlights')
            .update(updatePayload)
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Admin highlights update error:', error);
        return NextResponse.json({ error: 'Failed to update highlight' }, { status: 500 });
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { error } = await supabaseAdmin()
            .from('highlights')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin highlights delete error:', error);
        return NextResponse.json({ error: 'Failed to delete highlight' }, { status: 500 });
    }
}
