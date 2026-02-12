import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const numericId = Number(id);
        if (Number.isNaN(numericId)) {
            return NextResponse.json({ error: 'Invalid character program id' }, { status: 400 });
        }
        const payload = await request.json();
        const updatePayload = {
            name: payload.name?.trim() || '',
            description: payload.description?.trim() || '',
            icon: payload.icon || null,
            frequency: payload.frequency || null,
            displayorder: Number(payload.displayOrder ?? payload.display_order ?? payload.displayorder) || 0,
            isactive: payload.isActive ?? payload.is_active ?? payload.isactive ?? true,
        };

        const { data, error } = await supabaseAdmin()
            .from('character_programs')
            .update(updatePayload)
            .eq('id', numericId)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Admin character programs update error:', error);
        return NextResponse.json({ error: 'Failed to update character program' }, { status: 500 });
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const numericId = Number(id);
        if (Number.isNaN(numericId)) {
            return NextResponse.json({ error: 'Invalid character program id' }, { status: 400 });
        }
        const { error } = await supabaseAdmin()
            .from('character_programs')
            .delete()
            .eq('id', numericId);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin character programs delete error:', error);
        return NextResponse.json({ error: 'Failed to delete character program' }, { status: 500 });
    }
}
