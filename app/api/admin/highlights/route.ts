import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin()
            .from('highlights')
            .select('*')
            .order('order', { ascending: true });

        if (error) {
            throw error;
        }

        return NextResponse.json(data || []);
    } catch (error) {
        console.error('Admin highlights error:', error);
        return NextResponse.json({ error: 'Failed to fetch highlights' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();
        const insertPayload = {
            icon: payload.icon || 'Star',
            title: payload.title?.trim() || '',
            description: payload.description?.trim() || '',
            order: Number(payload.order) || 0,
        };

        if (!insertPayload.title || !insertPayload.description) {
            return NextResponse.json({ error: 'Judul dan deskripsi wajib diisi.' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin()
            .from('highlights')
            .insert(insertPayload)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Admin highlights create error:', error);
        return NextResponse.json({ error: 'Failed to create highlight' }, { status: 500 });
    }
}
