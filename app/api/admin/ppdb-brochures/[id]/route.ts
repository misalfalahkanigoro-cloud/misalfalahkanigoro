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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const payload = await request.json();

        const updated = await prisma.media_items.update({
            where: { id },
            data: {
                entity_id: payload.waveId,
                media_url: payload.mediaUrl,
                caption: payload.caption || null,
                is_main: Boolean(payload.isMain),
                display_order: Number(payload.displayOrder) || 0,
            },
        });

        return NextResponse.json(mapBrochure(updated as unknown as Record<string, any>));
    } catch (error) {
        console.error('Admin PPDB brochure update error:', error);
        return NextResponse.json({ error: 'Failed to update brochure' }, { status: 500 });
    }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.media_items.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin PPDB brochure delete error:', error);
        return NextResponse.json({ error: 'Failed to delete brochure' }, { status: 500 });
    }
}
