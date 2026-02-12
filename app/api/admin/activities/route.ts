import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin()
            .from('activities')
            .select('*')
            .order('createdAt', { ascending: false });

        if (error) {
            throw error;
        }

        return NextResponse.json(data || []);
    } catch (error) {
        console.error('Admin activities error:', error);
        return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();
        const insertPayload = {
            title: payload.title?.trim() || '',
            imageUrl: payload.imageUrl || null,
            isActive: payload.isActive ?? true,
        };

        if (!insertPayload.title) {
            return NextResponse.json({ error: 'Judul wajib diisi.' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin()
            .from('activities')
            .insert(insertPayload)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Admin activities create error:', error);
        return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
    }
}
