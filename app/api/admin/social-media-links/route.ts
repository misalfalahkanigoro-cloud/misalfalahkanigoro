import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin()
            .from('social_media_links')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) {
            throw error;
        }

        return NextResponse.json(data || []);
    } catch (error) {
        console.error('Admin social links error:', error);
        return NextResponse.json({ error: 'Failed to fetch social links' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const payload = await request.json();
        const items = Array.isArray(payload) ? payload : payload.items;

        if (!Array.isArray(items)) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        const { error: deleteError } = await supabaseAdmin()
            .from('social_media_links')
            .delete()
            .not('id', 'is', null);

        if (deleteError) {
            throw deleteError;
        }

        const mapped = items.map((item: any, index: number) => ({
            platform: item.platform,
            url: item.url,
            display_order: item.display_order ?? item.displayOrder ?? index + 1,
            is_active: item.is_active ?? item.isActive ?? true,
        }));

        if (mapped.length) {
            const { error } = await supabaseAdmin()
                .from('social_media_links')
                .insert(mapped);

            if (error) {
                throw error;
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin social links update error:', error);
        return NextResponse.json({ error: 'Failed to update social links' }, { status: 500 });
    }
}
