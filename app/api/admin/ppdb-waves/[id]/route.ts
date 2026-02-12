import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const payload = await request.json();
        if (payload.isActive) {
            await supabaseAdmin()
                .from('ppdb_waves')
                .update({ is_active: false })
                .neq('id', id);
        }
        const { data, error } = await supabaseAdmin()
            .from('ppdb_waves')
            .update({
                name: payload.name,
                start_date: payload.startDate,
                end_date: payload.endDate,
                quota: payload.quota ?? null,
                is_active: payload.isActive ?? true,
            })
            .eq('id', id)
            .select('*')
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error('Admin PPDB wave update error:', error);
        return NextResponse.json({ error: 'Failed to update PPDB wave' }, { status: 500 });
    }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { error } = await supabaseAdmin()
            .from('ppdb_waves')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin PPDB wave delete error:', error);
        return NextResponse.json({ error: 'Failed to delete PPDB wave' }, { status: 500 });
    }
}
