import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const payload = await request.json();
        const updatePayload = {
            name: payload.name?.trim() || '',
            position: payload.position?.trim() || '',
            imageUrl: payload.imageUrl || null,
            isActive: payload.isActive ?? true,
        };

        const { data, error } = await supabaseAdmin()
            .from('teachers')
            .update(updatePayload)
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Admin teachers update error:', error);
        return NextResponse.json({ error: 'Failed to update teacher' }, { status: 500 });
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { error } = await supabaseAdmin()
            .from('teachers')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin teachers delete error:', error);
        return NextResponse.json({ error: 'Failed to delete teacher' }, { status: 500 });
    }
}
