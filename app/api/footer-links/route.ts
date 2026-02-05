import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { FooterQuickLink } from '@/lib/types';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin()
            .from('footer_quick_links')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });

        if (error) {
            throw error;
        }

        const mapped: FooterQuickLink[] = (data || []).map((row) => ({
            id: row.id,
            label: row.label,
            href: row.href,
            displayOrder: row.display_order,
            isActive: row.is_active,
        }));

        return NextResponse.json(mapped);
    } catch (error) {
        console.error('Error fetching footer links:', error);
        return NextResponse.json({ error: 'Failed to fetch footer links' }, { status: 500 });
    }
}
