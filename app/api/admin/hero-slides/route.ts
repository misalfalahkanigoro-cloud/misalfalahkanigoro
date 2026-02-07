import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin()
            .from('hero_slides')
            .select('*')
            .order('order', { ascending: true });

        if (error) {
            throw error;
        }

        return NextResponse.json(data || []);
    } catch (error) {
        console.error('Admin hero slides error:', error);
        return NextResponse.json({ error: 'Failed to fetch hero slides' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();
        const insertPayload = {
            imageUrl: payload.imageUrl || payload.image_url || '',
            title: payload.title?.trim() || '',
            subtitle: payload.subtitle?.trim() || '',
            order: Number(payload.order) || 0,
            isActive: payload.isActive ?? true,
        };

        if (!insertPayload.imageUrl || !insertPayload.title) {
            return NextResponse.json({ error: 'Gambar dan judul wajib diisi.' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin()
            .from('hero_slides')
            .insert(insertPayload)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Admin hero slides create error:', error);
        return NextResponse.json({ error: 'Failed to create hero slide' }, { status: 500 });
    }
}
