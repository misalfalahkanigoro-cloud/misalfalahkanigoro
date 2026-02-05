import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

type RouteContext = {
    params: Promise<{ slug: string }>;
};

export async function GET(_: Request, context: RouteContext) {
    try {
        const { slug } = await context.params;
        const { data, error } = await supabaseAdmin()
            .from('achievements')
            .select('*')
            .eq('slug', slug)
            .eq('isPublished', true)
            .maybeSingle();

        if (error) throw error;
        if (!data) {
            return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
        }

        return NextResponse.json({ achievement: data });
    } catch (error) {
        console.error('Public achievement detail GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch achievement detail' }, { status: 500 });
    }
}
