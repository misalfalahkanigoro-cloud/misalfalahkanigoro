import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const payload = await request.json();
        const updatePayload = {
            title: payload.title?.trim() || '',
            description: payload.description?.trim() || null,
            buttontext: payload.buttonText?.trim() || '',
            buttonlink: payload.buttonLink?.trim() || '',
            backgroundcolor: payload.backgroundColor || '#10b981',
            textcolor: payload.textColor || '#ffffff',
            placement: payload.placement || 'home',
            displayorder: Number(payload.displayOrder ?? payload.displayorder) || 0,
            isactive: payload.isActive ?? payload.isactive ?? true,
        };

        const { data, error } = await supabaseAdmin()
            .from('site_banners')
            .update(updatePayload)
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Admin site banners update error:', error);
        return NextResponse.json({ error: 'Failed to update site banner' }, { status: 500 });
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { error } = await supabaseAdmin()
            .from('site_banners')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin site banners delete error:', error);
        return NextResponse.json({ error: 'Failed to delete site banner' }, { status: 500 });
    }
}
