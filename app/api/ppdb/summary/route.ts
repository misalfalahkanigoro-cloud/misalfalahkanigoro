import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parsePpdbAccessToken } from '@/lib/ppdb-access';
import { mapPpdbPublicSummary } from '@/lib/ppdb-mapper';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');
        const access = parsePpdbAccessToken(token);

        if (!access) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const registration = await prisma.ppdb_registrations.findUnique({
            where: { id: access.registrationId },
        });

        if (!registration) {
            return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
        }

        const files = await prisma.ppdb_files.findMany({
            where: { registration_id: registration.id },
            orderBy: [{ created_at: 'asc' }],
        });

        return NextResponse.json(
            mapPpdbPublicSummary(
                registration as unknown as Record<string, any>,
                files as unknown as Array<Record<string, any>>
            )
        );
    } catch (error) {
        console.error('PPDB summary error:', error);
        return NextResponse.json({ error: 'Failed to fetch submission summary' }, { status: 500 });
    }
}
