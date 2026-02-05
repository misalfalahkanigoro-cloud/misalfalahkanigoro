import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const { data: news, error } = await supabaseAdmin()
            .from('news')
            .select('*')
            .eq('slug', slug)
            .eq('is_published', true)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!news || !news.is_published) {
            return NextResponse.json(
                { error: 'NOT_FOUND' },
                { status: 404 }
            );
        }

        return NextResponse.json(news);
    } catch (error) {
        console.error('Error fetching news detail:', error);
        return NextResponse.json(
            { error: 'Failed to fetch news detail' },
            { status: 500 }
        );
    }
}
