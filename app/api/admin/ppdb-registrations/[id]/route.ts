import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const payload = await request.json();
        const updatePayload = {
            status: payload.status,
            pesan: payload.pesan ?? null,
        };

        const { data, error } = await supabaseAdmin()
            .from('ppdb_registrations')
            .update(updatePayload)
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Admin PPDB update error:', error);
        return NextResponse.json({ error: 'Failed to update PPDB registration' }, { status: 500 });
    }
}
