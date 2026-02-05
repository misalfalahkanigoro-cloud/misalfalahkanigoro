import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { NavigationMenuItem } from '@/lib/types';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin()
            .from('navigation_menu')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });

        if (error) {
            throw error;
        }

        const items: NavigationMenuItem[] = (data || []).map((row) => ({
            id: row.id,
            label: row.label,
            href: row.href,
            parentId: row.parent_id,
            displayOrder: row.display_order,
            isActive: row.is_active,
            icon: row.icon,
        }));

        const map = new Map<string, NavigationMenuItem>();
        items.forEach((item) => map.set(item.id, { ...item, children: [] }));

        const roots: NavigationMenuItem[] = [];
        items.forEach((item) => {
            const current = map.get(item.id)!;
            if (item.parentId) {
                const parent = map.get(item.parentId);
                if (parent) {
                    parent.children = parent.children || [];
                    parent.children.push(current);
                }
            } else {
                roots.push(current);
            }
        });

        roots.forEach((root) => {
            if (root.children) {
                root.children.sort((a, b) => a.displayOrder - b.displayOrder);
            }
        });

        return NextResponse.json(roots.sort((a, b) => a.displayOrder - b.displayOrder));
    } catch (error) {
        console.error('Error fetching navigation menu:', error);
        return NextResponse.json({ error: 'Failed to fetch navigation menu' }, { status: 500 });
    }
}
