import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin()
            .from('navigation_menu')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) {
            throw error;
        }

        return NextResponse.json(data || []);
    } catch (error) {
        console.error('Admin navigation menu error:', error);
        return NextResponse.json({ error: 'Failed to fetch navigation menu' }, { status: 500 });
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
            .from('navigation_menu')
            .delete()
            .not('id', 'is', null);

        if (deleteError) {
            throw deleteError;
        }

        const mapped = items.map((item: any, index: number) => ({
            id: item.id,
            label: item.label,
            href: item.href ?? null,
            parent_id: item.parent_id ?? item.parentId ?? null,
            display_order: item.display_order ?? item.displayOrder ?? index + 1,
            is_active: item.is_active ?? item.isActive ?? true,
            icon: item.icon ?? null,
        }));

        if (mapped.length) {
            const { error } = await supabaseAdmin()
                .from('navigation_menu')
                .insert(mapped);

            if (error) {
                throw error;
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin navigation menu update error:', error);
        return NextResponse.json({ error: 'Failed to update navigation menu' }, { status: 500 });
    }
}
