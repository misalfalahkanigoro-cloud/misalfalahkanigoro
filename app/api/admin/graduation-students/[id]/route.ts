import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const payload = await request.json();
        const updatePayload = {
            nisn: payload.nisn?.trim() || '',
            name: payload.name?.trim() || '',
            className: payload.className?.trim() || '',
            status: payload.status || 'LULUS',
            averageScore: Number(payload.averageScore) || 0,
            year: payload.year?.trim() || '',
        };

        const { data, error } = await supabaseAdmin()
            .from('graduation_students')
            .update(updatePayload)
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Admin graduation students update error:', error);
        return NextResponse.json({ error: 'Failed to update graduation student' }, { status: 500 });
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { error } = await supabaseAdmin()
            .from('graduation_students')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin graduation students delete error:', error);
        return NextResponse.json({ error: 'Failed to delete graduation student' }, { status: 500 });
    }
}
