import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const rows = await prisma.push_subscriptions.findMany({
            orderBy: [{ created_at: 'desc' }],
            include: {
                ppdb_registrations: {
                    select: {
                        id: true,
                        namaLengkap: true,
                        nisn: true,
                    },
                },
            },
        });

        const mapped = rows.map((row) => ({
            id: row.id,
            registrationId: row.registration_id,
            createdAt: row.created_at,
            namaLengkap: row.ppdb_registrations?.namaLengkap || '',
            nisn: row.ppdb_registrations?.nisn || '',
        }));

        return NextResponse.json(mapped);
    } catch (error) {
        console.error('Admin PPDB subscribers error:', error);
        return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
    }
}
