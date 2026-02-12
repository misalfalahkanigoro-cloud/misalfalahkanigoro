import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin()
            .from('teachers')
            .select('*')
            .order('createdAt', { ascending: false });

        if (error) {
            throw error;
        }

        return NextResponse.json(data || []);
    } catch (error) {
        console.error('Admin teachers error:', error);
        return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();
        const insertPayload = {
            name: payload.name?.trim() || '',
            position: payload.position?.trim() || '',
            imageUrl: payload.imageUrl || null,
            isActive: payload.isActive ?? true,
        };

        if (!insertPayload.name || !insertPayload.position) {
            return NextResponse.json({ error: 'Nama dan posisi wajib diisi.' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin()
            .from('teachers')
            .insert(insertPayload)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Admin teachers create error:', error);
        return NextResponse.json({ error: 'Failed to create teacher' }, { status: 500 });
    }
}
