import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

type RouteContext = {
    params: Promise<{ slug: string }>;
};

export async function GET(_: Request, context: RouteContext) {
    try {
        const { slug } = await context.params;
        const { data: post, error } = await supabaseAdmin()
            .from('content_posts')
            .select('*')
            .eq('slug', slug)
            .eq('isPublished', true)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!post) {
            return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
        }

        const { data: media, error: mediaError } = await supabaseAdmin()
            .from('content_media')
            .select('*')
            .eq('postId', post.id)
            .eq('isActive', true)
            .order('displayOrder', { ascending: true });

        if (mediaError) {
            throw mediaError;
        }

        return NextResponse.json({
            post,
            media: media || [],
        });
    } catch (error) {
        console.error('Error fetching content post detail:', error);
        return NextResponse.json(
            { error: 'Failed to fetch content post' },
            { status: 500 }
        );
    }
}
