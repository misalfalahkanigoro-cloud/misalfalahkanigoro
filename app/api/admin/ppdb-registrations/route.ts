import { NextRequest, NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || undefined;

        let query = dbAdmin()
            .from('ppdb_registrations')
            .select('*')
            .order('tanggalDaftar', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;
        if (error) {
            throw error;
        }

        return NextResponse.json(data || []);
    } catch (error) {
        console.error('Admin PPDB registrations error:', error);
        return NextResponse.json({ error: 'Failed to fetch PPDB registrations' }, { status: 500 });
    }
}
