import { NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/db';

export async function GET() {
    try {
        const { data, error } = await dbAdmin()
            .from('push_subscriptions')
            .select('id, registration_id, created_at, ppdb_registrations (id, namaLengkap, nisn)')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const mapped = (data || []).map((row: any) => ({
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
