import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const payload = await request.json();

        const updated = await prisma.$transaction(async (tx) => {
            if (payload.isActive) {
                await tx.ppdb_waves.updateMany({
                    where: {
                        is_active: true,
                        id: { not: id },
                    },
                    data: { is_active: false },
                });
            }

            return tx.ppdb_waves.update({
                where: { id },
                data: {
                    name: payload.name,
                    start_date: new Date(payload.startDate),
                    end_date: new Date(payload.endDate),
                    quota: payload.quota ?? null,
                    is_active: payload.isActive ?? true,
                },
            });
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Admin PPDB wave update error:', error);
        return NextResponse.json({ error: 'Failed to update PPDB wave' }, { status: 500 });
    }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.ppdb_waves.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin PPDB wave delete error:', error);
        return NextResponse.json({ error: 'Failed to delete PPDB wave' }, { status: 500 });
    }
}
