import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const page = await prisma.profile_page.findUnique({
            where: { id: 'main' },
        });

        if (!page) {
            return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
        }

        return NextResponse.json(page);
    } catch (error) {
        console.error('Error fetching profile page:', error);
        return NextResponse.json({ error: 'Failed to fetch profile page' }, { status: 500 });
    }
}
