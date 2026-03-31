import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const rows = await prisma.ppdb_waves.findMany({
            orderBy: [{ start_date: 'desc' }],
        });

        return NextResponse.json(rows);
    } catch (error) {
        console.error('Admin PPDB waves error:', error);
        return NextResponse.json({ error: 'Failed to fetch PPDB waves' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();

        const created = await prisma.$transaction(async (tx) => {
            if (payload.isActive) {
                await tx.ppdb_waves.updateMany({
                    where: { is_active: true },
                    data: { is_active: false },
                });
            }

            return tx.ppdb_waves.create({
                data: {
                    name: payload.name,
                    start_date: new Date(payload.startDate),
                    end_date: new Date(payload.endDate),
                    quota: payload.quota ?? null,
                    is_active: payload.isActive ?? true,
                },
            });
        });

        return NextResponse.json(created);
    } catch (error) {
        console.error('Admin PPDB wave create error:', error);
        return NextResponse.json({ error: 'Failed to create PPDB wave' }, { status: 500 });
    }
}
