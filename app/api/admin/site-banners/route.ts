import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin()
            .from('site_banners')
            .select('*')
            .order('displayorder', { ascending: true });

        if (error) {
            throw error;
        }

        const mapped = (data || []).map((row) => ({
            id: row.id,
            title: row.title,
            description: row.description,
            button_text: row.buttontext,
            button_link: row.buttonlink,
            background_color: row.backgroundcolor,
            text_color: row.textcolor,
            placement: row.placement,
            display_order: row.displayorder,
            is_active: row.isactive,
        }));

        return NextResponse.json(mapped);
    } catch (error) {
        console.error('Admin site banners error:', error);
        return NextResponse.json({ error: 'Failed to fetch site banners' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();
        const insertPayload = {
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

        if (!insertPayload.title || !insertPayload.buttontext || !insertPayload.buttonlink) {
            return NextResponse.json({ error: 'Judul dan tombol wajib diisi.' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin()
            .from('site_banners')
            .insert(insertPayload)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Admin site banners create error:', error);
        return NextResponse.json({ error: 'Failed to create site banner' }, { status: 500 });
    }
}
