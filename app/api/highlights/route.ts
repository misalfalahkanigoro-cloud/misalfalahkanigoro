import { NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/db';

export async function GET() {
    try {
        const { data, error } = await dbAdmin()
            .from('highlights')
            .select('*')
            .order('order', { ascending: true });

        if (error) {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching highlights:', error);
        return NextResponse.json(
            { error: 'Failed to fetch highlights' },
            { status: 500 }
        );
    }
}
