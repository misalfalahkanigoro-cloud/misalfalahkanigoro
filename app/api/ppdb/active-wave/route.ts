import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const wave = await prisma.ppdb_waves.findFirst({
            where: { is_active: true },
            orderBy: { start_date: 'desc' },
            include: {
                ppdb_document_requirements: true,
            },
        });

        if (!wave) {
            return NextResponse.json({ active: false }, { status: 200 });
        }

        return NextResponse.json({
            active: true,
            wave: {
                id: wave.id,
                name: wave.name,
                startDate: wave.start_date,
                endDate: wave.end_date,
                quota: wave.quota,
                isActive: wave.is_active,
                documentRequirements: wave.ppdb_document_requirements.map((req: any) => ({
                    id: req.id,
                    label: req.label,
                    key: req.key,
                    isRequired: req.is_required,
                })),
            },
        });
    } catch (error) {
        console.error('Active wave error:', error);
        return NextResponse.json({ active: false });
    }
}
