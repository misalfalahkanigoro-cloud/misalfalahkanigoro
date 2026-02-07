import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const payload = await request.json();
        const updatePayload = {
            name: payload.name?.trim() || '',
            description: payload.description?.trim() || '',
            icon: payload.icon || null,
            imageurl: payload.imageUrl || payload.imageurl || null,
            schedule: payload.schedule || null,
            coachname: payload.coachName || payload.coachname || null,
            displayorder: Number(payload.displayOrder ?? payload.displayorder) || 0,
            isactive: payload.isActive ?? payload.isactive ?? true,
        };

        const { data, error } = await supabaseAdmin()
            .from('extracurriculars')
            .update(updatePayload)
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Admin extracurriculars update error:', error);
        return NextResponse.json({ error: 'Failed to update extracurricular' }, { status: 500 });
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { error } = await supabaseAdmin()
            .from('extracurriculars')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin extracurriculars delete error:', error);
        return NextResponse.json({ error: 'Failed to delete extracurricular' }, { status: 500 });
    }
}
