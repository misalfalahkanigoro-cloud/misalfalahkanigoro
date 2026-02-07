import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin()
            .from('news')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            throw error;
        }

        return NextResponse.json(data || []);
    } catch (error) {
        console.error('Admin news error:', error);
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();
        const insertPayload = {
            title: payload.title?.trim() || '',
            slug: payload.slug?.trim() || '',
            date: payload.date || new Date().toISOString(),
            excerpt: payload.excerpt?.trim() || '',
            content: payload.content || null,
            thumbnailUrl: payload.thumbnailUrl || null,
            category: payload.category?.trim() || 'Umum',
            isPublished: payload.isPublished ?? true,
        };

        if (!insertPayload.title || !insertPayload.slug || !insertPayload.excerpt) {
            return NextResponse.json({ error: 'Judul, slug, dan ringkasan wajib diisi.' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin()
            .from('news')
            .insert(insertPayload)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Admin news create error:', error);
        return NextResponse.json({ error: 'Failed to create news' }, { status: 500 });
    }
}
