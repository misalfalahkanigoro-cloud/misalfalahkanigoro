import { NextRequest, NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const payload = await request.json();
        const updatePayload = {
            title: payload.title?.trim() || '',
            slug: payload.slug?.trim() || '',
            excerpt: payload.excerpt?.trim() || '',
            content: payload.content || null,
            author_name: payload.authorName || 'Admin',
            published_at: payload.publishedAt || new Date().toISOString(),
            is_published: payload.isPublished ?? true,
            is_pinned: payload.isPinned ?? false,
        };

        const { data, error } = await dbAdmin()
            .from('news_posts')
            .update(updatePayload)
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({
            ...data,
            isPinned: data.is_pinned
        });
    } catch (error) {
        console.error('Admin news update error:', error);
        return NextResponse.json({ error: 'Failed to update news' }, { status: 500 });
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { error } = await dbAdmin()
            .from('news_posts')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin news delete error:', error);
        return NextResponse.json({ error: 'Failed to delete news' }, { status: 500 });
    }
}
