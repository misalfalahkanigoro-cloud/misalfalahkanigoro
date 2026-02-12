import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const payload = await request.json();
        const { data, error } = await supabaseAdmin()
            .from('ppdb_notifications')
            .update({
                title: payload.title,
                message: payload.message,
                registration_id: payload.registrationId || null,
                wave_id: payload.waveId || null,
            })
            .eq('id', id)
            .select('*')
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error('Admin PPDB notification update error:', error);
        return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
    }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { error } = await supabaseAdmin()
            .from('ppdb_notifications')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin PPDB notification delete error:', error);
        return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
    }
}
