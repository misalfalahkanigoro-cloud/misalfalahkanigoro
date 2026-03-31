import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const mapBrochure = (row: Record<string, any>) => ({
    id: row.id,
    entityId: row.entity_id,
    mediaUrl: row.media_url,
    caption: row.caption,
    displayOrder: row.display_order,
    isMain: row.is_main,
    createdAt: row.created_at,
});

export async function GET() {
    try {
        const rows = await prisma.media_items.findMany({
            where: { entity_type: 'ppdb' },
            orderBy: [{ display_order: 'asc' }],
        });

        return NextResponse.json(rows.map((row) => mapBrochure(row as unknown as Record<string, any>)));
    } catch (error) {
        console.error('Admin PPDB brochures error:', error);
        return NextResponse.json({ error: 'Failed to fetch brochures' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();

        if (!payload.waveId || !payload.mediaUrl) {
            return NextResponse.json({ error: 'waveId and mediaUrl are required' }, { status: 400 });
        }

        const created = await prisma.media_items.create({
            data: {
                entity_type: 'ppdb',
                entity_id: payload.waveId,
                media_type: 'image',
                media_url: payload.mediaUrl,
                caption: payload.caption || null,
                is_main: Boolean(payload.isMain),
                display_order: Number(payload.displayOrder) || 0,
            },
        });

        return NextResponse.json(mapBrochure(created as unknown as Record<string, any>));
    } catch (error) {
        console.error('Admin PPDB brochure create error:', error);
        return NextResponse.json({ error: 'Failed to create brochure' }, { status: 500 });
    }
}
