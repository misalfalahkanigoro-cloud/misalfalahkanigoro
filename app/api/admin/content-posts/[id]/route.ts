import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

type RouteContext = {
    params: { id: string } | Promise<{ id: string }>;
};

export async function GET(_: Request, context: RouteContext) {
    try {
        const params = await context.params;
        const id = Number(params.id);
        if (Number.isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const { data: post, error } = await supabaseAdmin()
            .from('content_posts')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!post) {
            return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
        }

        let media: any[] = [];
        const { data: mediaData, error: mediaError } = await supabaseAdmin()
            .from('content_media')
            .select('*')
            .eq('postId', id)
            .order('displayOrder', { ascending: true });

        if (mediaError) {
            // 42P01 = undefined_table (handle gracefully so edit still works)
            if (mediaError.code !== '42P01') {
                throw mediaError;
            }
            console.warn('content_media table missing, returning empty media list.');
        } else {
            media = mediaData || [];
        }

        return NextResponse.json({ post, media });
    } catch (error) {
        console.error('Admin content post detail error:', error);
        return NextResponse.json({ error: 'Failed to fetch content post' }, { status: 500 });
    }
}

export async function DELETE(_: Request, context: RouteContext) {
    try {
        const params = await context.params;
        const id = Number(params.id);
        if (Number.isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const { error } = await supabaseAdmin()
            .from('content_posts')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin delete content post error:', error);
        return NextResponse.json({ error: 'Failed to delete content post' }, { status: 500 });
    }
}
