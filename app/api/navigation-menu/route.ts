import { NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/db';
import type { NavigationMenuItem } from '@/lib/types';

import { getCachedNavigationMenu } from '@/lib/cache-service';

export async function GET() {
    try {
        const data = await getCachedNavigationMenu();

        const roots: NavigationMenuItem[] = data.map((row: any) => ({
            id: row.id,
            label: row.label,
            href: row.href,
            parentId: row.parent_id,
            displayOrder: row.display_order,
            isActive: row.is_active,
            icon: row.icon,
            children: (row.other_navigation_menu || []).map((sub: any) => ({
                id: sub.id,
                label: sub.label,
                href: sub.href,
                parentId: sub.parent_id,
                displayOrder: sub.display_order,
                isActive: sub.is_active,
                icon: sub.icon,
            })),
        }));

        return NextResponse.json(roots, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59',
            },
        });
    } catch (error) {
        console.error('Error fetching navigation menu:', error);
        return NextResponse.json([]);
    }
}

