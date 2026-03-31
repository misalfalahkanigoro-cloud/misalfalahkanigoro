import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminRole } from '@/lib/admin-auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const requirements = await prisma.ppdb_document_requirements.findMany({
            where: { wave_id: id },
            orderBy: [{ created_at: 'asc' }],
        });

        return NextResponse.json(requirements);
    } catch (error) {
        console.error('Admin PPDB document requirements fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch document requirements' }, { status: 500 });
    }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const payload = await request.json(); // Array of { label, key, isRequired }

        // Sync operation: Delete existing and recreate, or update?
        // Let's go with a simple sync (Delete all for this wave and recreate)
        // This is easiest for managing a small list of requirements.
        
        const results = await prisma.$transaction(async (tx) => {
            // Delete all current requirements for this wave
            await tx.ppdb_document_requirements.deleteMany({
                where: { wave_id: id }
            });

            // Create new ones
            if (Array.isArray(payload) && payload.length > 0) {
                return tx.ppdb_document_requirements.createMany({
                    data: payload.map((req: any) => ({
                        wave_id: id,
                        label: req.label,
                        key: req.key,
                        is_required: req.isRequired ?? true,
                    }))
                });
            }
            return { count: 0 };
        });

        return NextResponse.json(results);
    } catch (error) {
        console.error('Admin PPDB document requirements sync error:', error);
        return NextResponse.json({ error: 'Failed to sync document requirements' }, { status: 500 });
    }
}
