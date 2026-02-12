import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin()
            .from('page_heroes')
            .select('*')
            .order('pageslug', { ascending: true });

        if (error) {
            throw error;
        }

        const mapped = (data || []).map((row) => ({
            id: row.id,
            page_slug: row.pageslug,
            title: row.title,
            subtitle: row.subtitle,
            image_url: row.imageurl,
            overlay_opacity: row.overlayopacity,
            is_active: row.isactive,
        }));

        return NextResponse.json(mapped);
    } catch (error) {
        console.error('Admin page heroes error:', error);
        return NextResponse.json({ error: 'Failed to fetch page heroes' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();
        const insertPayload = {
            pageslug: payload.pageSlug?.trim() || '',
            title: payload.title?.trim() || '',
            subtitle: payload.subtitle?.trim() || null,
            imageurl: payload.imageUrl?.trim() || '',
            overlayopacity: payload.overlayOpacity ?? 0.5,
            isactive: payload.isActive ?? payload.isactive ?? true,
        };

        if (!insertPayload.pageslug || !insertPayload.title || !insertPayload.imageurl) {
            return NextResponse.json({ error: 'Slug, judul, dan gambar wajib diisi.' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin()
            .from('page_heroes')
            .insert(insertPayload)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Admin page heroes create error:', error);
        return NextResponse.json({ error: 'Failed to create page hero' }, { status: 500 });
    }
}
