import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { mapPpdbFile } from '@/lib/ppdb-mapper';
import { requireAdminRole } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const nisn = searchParams.get('nisn');

        if (!nisn) {
            return NextResponse.json({ error: 'NISN is required' }, { status: 400 });
        }

        const registration = await prisma.ppdb_registrations.findFirst({
            where: { nisn },
        });

        if (!registration) {
            return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
        }

        const files = await prisma.ppdb_files.findMany({
            where: { registration_id: registration.id },
            orderBy: [{ created_at: 'asc' }],
        });

        return NextResponse.json({
            ...registration,
            files: files.map((file) => mapPpdbFile(file as unknown as Record<string, any>)),
        });
    } catch (error) {
        console.error('PPDB by NISN error:', error);
        return NextResponse.json({ error: 'Failed to fetch registration' }, { status: 500 });
    }
}
