import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const parseMeta = (value: unknown) => {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    if (typeof value === 'object') {
        return value;
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return null;
        try {
            return JSON.parse(trimmed);
        } catch (e) {
            return null;
        }
    }
    return null;
};

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin()
            .from('achievements')
            .select('*')
            .order('is_pinned', { ascending: false })
            .order('achieved_at', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) throw error;
        const mapped = (data || []).map((row) => ({
            ...row,
            isPinned: row.is_pinned,
        }));
        return NextResponse.json(mapped);
    } catch (error) {
        console.error('Admin achievements GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const postInput = await request.json();

        if (!postInput?.title || !postInput?.slug) {
            return NextResponse.json({ error: 'Judul dan slug wajib diisi.' }, { status: 400 });
        }

        const insertPayload = {
            title: postInput.title?.trim(),
            slug: postInput.slug?.trim(),
            description: postInput.description || null,
            event_name: postInput.eventName || null,
            event_level: postInput.eventLevel || null,
            rank: postInput.rank || null,
            achieved_at: postInput.achievedAt || null,
            is_published: postInput.isPublished ?? true,
            is_pinned: postInput.isPinned ?? false,
        };

        const { data, error } = await supabaseAdmin()
            .from('achievements')
            .insert(insertPayload)
            .select('*')
            .single();

        if (error) throw error;
        return NextResponse.json({ achievement: data });
    } catch (error) {
        console.error('Admin achievements POST error:', error);
        return NextResponse.json({ error: 'Failed to create achievement' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const postInput = await request.json();

        if (!postInput?.id) {
            return NextResponse.json({ error: 'ID wajib diisi.' }, { status: 400 });
        }

        const updatePayload = {
            title: postInput.title?.trim(),
            slug: postInput.slug?.trim(),
            description: postInput.description || null,
            event_name: postInput.eventName || null,
            event_level: postInput.eventLevel || null,
            rank: postInput.rank || null,
            achieved_at: postInput.achievedAt || null,
            is_published: postInput.isPublished ?? true,
            is_pinned: postInput.isPinned ?? false,
        };

        const { data, error } = await supabaseAdmin()
            .from('achievements')
            .update(updatePayload)
            .eq('id', postInput.id)
            .select('*')
            .single();

        if (error) throw error;
        return NextResponse.json({ achievement: data });
    } catch (error) {
        console.error('Admin achievements PUT error:', error);
        return NextResponse.json({ error: 'Failed to update achievement' }, { status: 500 });
    }
}
