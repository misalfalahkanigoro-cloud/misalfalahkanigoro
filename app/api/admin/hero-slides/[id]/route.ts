import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const payload = await request.json();
        const updatePayload = {
            imageUrl: payload.imageUrl || payload.image_url || '',
            title: payload.title?.trim() || '',
            subtitle: payload.subtitle?.trim() || '',
            order: Number(payload.order) || 0,
            isActive: payload.isActive ?? true,
        };

        const { data, error } = await supabaseAdmin()
            .from('hero_slides')
            .update(updatePayload)
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Admin hero slides update error:', error);
        return NextResponse.json({ error: 'Failed to update hero slide' }, { status: 500 });
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { error } = await supabaseAdmin()
            .from('hero_slides')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin hero slides delete error:', error);
        return NextResponse.json({ error: 'Failed to delete hero slide' }, { status: 500 });
    }
}
