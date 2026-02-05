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
            .order('isPinned', { ascending: false })
            .order('achievedAt', { ascending: false })
            .order('createdAt', { ascending: false });

        if (error) throw error;
        return NextResponse.json(data || []);
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
            excerpt: postInput.excerpt?.trim() || null,
            contentHtml: postInput.contentHtml || null,
            contentText: postInput.contentText || null,
            coverUrl: postInput.coverUrl || null,
            category: postInput.category || null,
            achievedAt: postInput.achievedAt || null,
            isPublished: postInput.isPublished ?? true,
            isPinned: postInput.isPinned ?? false,
            meta: parseMeta(postInput.meta),
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
            excerpt: postInput.excerpt?.trim() || null,
            contentHtml: postInput.contentHtml || null,
            contentText: postInput.contentText || null,
            coverUrl: postInput.coverUrl || null,
            category: postInput.category || null,
            achievedAt: postInput.achievedAt || null,
            isPublished: postInput.isPublished ?? true,
            isPinned: postInput.isPinned ?? false,
            meta: parseMeta(postInput.meta),
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
