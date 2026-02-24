import { NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/db';

export async function GET() {
    try {
        const { data: settings, error } = await dbAdmin()
            .from('school_settings')
            .select('*')
            .eq('id', 'main')
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!settings) {
            return NextResponse.json(
                { error: 'School settings not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching school settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch school settings' },
            { status: 500 }
        );
    }
}
