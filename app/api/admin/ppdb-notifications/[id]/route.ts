import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const payload = await request.json();

        const updated = await prisma.ppdb_notifications.update({
            where: { id },
            data: {
                title: payload.title,
                message: payload.message,
                registration_id: payload.registrationId || null,
                wave_id: payload.waveId || null,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Admin PPDB notification update error:', error);
        return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
    }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.ppdb_notifications.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin PPDB notification delete error:', error);
        return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
    }
}
