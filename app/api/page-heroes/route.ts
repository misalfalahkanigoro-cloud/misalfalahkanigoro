import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug') || undefined;

        if (slug) {
            const { data, error } = await supabaseAdmin()
                .from('page_heroes')
                .select('*')
                .eq('isactive', true)
                .eq('pageslug', slug)
                .maybeSingle();

            if (error) throw error;
            if (!data) {
                return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
            }

            return NextResponse.json({
                id: data.id,
                pageSlug: data.pageslug,
                title: data.title,
                subtitle: data.subtitle,
                imageUrl: data.imageurl,
                overlayOpacity: data.overlayopacity,
                isActive: data.isactive,
            });
        }

        const { data, error } = await supabaseAdmin()
            .from('page_heroes')
            .select('*')
            .eq('isactive', true)
            .order('pageslug', { ascending: true });

        if (error) throw error;

        const mapped = (data || []).map((row) => ({
            id: row.id,
            pageSlug: row.pageslug,
            title: row.title,
            subtitle: row.subtitle,
            imageUrl: row.imageurl,
            overlayOpacity: row.overlayopacity,
            isActive: row.isactive,
        }));

        return NextResponse.json(mapped);
    } catch (error) {
        console.error('Error fetching page heroes:', error);
        return NextResponse.json({ error: 'Failed to fetch page heroes' }, { status: 500 });
    }
}
