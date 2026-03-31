import { randomUUID } from 'crypto';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CACHE_TAGS } from '@/lib/cache-service';
import { requireAdminRole } from '@/lib/admin-auth';
import { sanitizePlainText } from '@/lib/rich-text';

type NavPayload = {
    id?: string;
    label?: string;
    href?: string | null;
    parent_id?: string | null;
    parentId?: string | null;
    display_order?: number | null;
    displayOrder?: number | null;
    is_active?: boolean | null;
    isActive?: boolean | null;
    icon?: string | null;
};

const normalizeItems = (items: NavPayload[]) =>
    items
        .map((item, index) => ({
            id: item.id || randomUUID(),
            label: sanitizePlainText(item.label, 120),
            href: typeof item.href === 'string' && item.href.trim().length ? item.href.trim() : null,
            parent_id: item.parent_id ?? item.parentId ?? null,
            display_order: Number(item.display_order ?? item.displayOrder ?? index + 1) || index + 1,
            is_active: item.is_active ?? item.isActive ?? true,
            icon: sanitizePlainText(item.icon, 80),
        }))
        .filter((item) => item.label);

export async function GET(request: NextRequest) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const data = await prisma.navigation_menu.findMany({
            orderBy: [{ display_order: 'asc' }, { created_at: 'asc' }],
        });

        return NextResponse.json(data || []);
    } catch (error) {
        console.error('Admin navigation menu error:', error);
        return NextResponse.json({ error: 'Failed to fetch navigation menu' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const payload = await request.json();
        const items = Array.isArray(payload) ? payload : payload.items;

        if (!Array.isArray(items)) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        const normalized = normalizeItems(items);

        await prisma.$transaction(async (tx) => {
            for (const item of normalized) {
                await tx.navigation_menu.upsert({
                    where: { id: item.id },
                    update: {
                        label: item.label!,
                        href: item.href,
                        parent_id: item.parent_id,
                        display_order: item.display_order,
                        is_active: item.is_active,
                        icon: item.icon,
                    },
                    create: {
                        id: item.id,
                        label: item.label!,
                        href: item.href,
                        parent_id: item.parent_id,
                        display_order: item.display_order,
                        is_active: item.is_active,
                        icon: item.icon,
                    },
                });
            }

            await tx.navigation_menu.deleteMany({
                where: normalized.length ? { id: { notIn: normalized.map((item) => item.id) } } : undefined,
            });
        });

        revalidateTag(CACHE_TAGS.NAVIGATION, 'max');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin navigation menu update error:', error);
        return NextResponse.json({ error: 'Failed to update navigation menu' }, { status: 500 });
    }
}
