import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { mapPpdbFile } from '@/lib/ppdb-mapper';
import { requireAdminRole } from '@/lib/admin-auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;

        const registration = await prisma.ppdb_registrations.findUnique({
            where: { id },
        });

        if (!registration) {
            return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
        }

        const files = await prisma.ppdb_files.findMany({
            where: { registration_id: id },
            orderBy: [{ created_at: 'asc' }],
        });

        return NextResponse.json({
            ...registration,
            files: files.map((file) => mapPpdbFile(file as unknown as Record<string, any>)),
        });
    } catch (error) {
        console.error('Error fetching PPDB registration:', error);
        return NextResponse.json({ error: 'Failed to fetch PPDB registration' }, { status: 500 });
    }
}
