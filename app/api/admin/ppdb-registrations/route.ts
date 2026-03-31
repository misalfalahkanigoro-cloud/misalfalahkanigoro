import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminRole } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || undefined;

        const rows = await prisma.ppdb_registrations.findMany({
            where: status ? { status: status as any } : undefined,
            orderBy: [{ tanggalDaftar: 'desc' }],
        });

        return NextResponse.json(rows);
    } catch (error) {
        console.error('Admin PPDB registrations error:', error);
        return NextResponse.json({ error: 'Failed to fetch PPDB registrations' }, { status: 500 });
    }
}
