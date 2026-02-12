import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin()
            .from('ppdb_registrations')
            .select('id, namaLengkap, status, nisn')
            .order('tanggalDaftar', { ascending: false });

        if (error) throw error;

        return NextResponse.json(data || []);
    } catch (error) {
        console.error('Error fetching PPDB list:', error);
        return NextResponse.json({ error: 'Failed to fetch PPDB list' }, { status: 500 });
    }
}
