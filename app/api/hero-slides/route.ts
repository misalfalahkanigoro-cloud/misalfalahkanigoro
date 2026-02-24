import { NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/db';

export async function GET() {
    try {
        const { data, error } = await dbAdmin()
            .from('hero_slides')
            .select('*')
            .eq('isActive', true)
            .order('order', { ascending: true });

        if (error) {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching hero slides:', error);
        return NextResponse.json(
            { error: 'Failed to fetch hero slides' },
            { status: 500 }
        );
    }
}
