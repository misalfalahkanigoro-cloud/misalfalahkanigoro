import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const settings = await prisma.school_settings.findUnique({
            where: { id: 'main' },
        });

        if (!settings) {
            return NextResponse.json({ error: 'School settings not found' }, { status: 404 });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching school settings:', error);
        return NextResponse.json({ error: 'Failed to fetch school settings' }, { status: 500 });
    }
}
