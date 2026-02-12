import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Check PPDB status by NISN
export async function POST(request: NextRequest) {
    try {
        const { nisn } = await request.json();

        if (!nisn) {
            return NextResponse.json(
                { error: 'NISN is required' },
                { status: 400 }
            );
        }

        const { data: registration, error } = await supabaseAdmin()
            .from('ppdb_registrations')
            .select('id, namaLengkap, tanggalDaftar, status, pesan, nisn')
            .eq('nisn', nisn)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!registration) {
            return NextResponse.json(
                { error: 'NOT_FOUND', message: 'NISN tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: registration.nisn,
            nama: registration.namaLengkap,
            tanggalDaftar: new Date(registration.tanggalDaftar).toISOString().split('T')[0],
            status: registration.status,
            pesan: registration.pesan,
        });
    } catch (error) {
        console.error('Error checking PPDB status:', error);
        return NextResponse.json(
            { error: 'Gagal mengecek status pendaftaran' },
            { status: 500 }
        );
    }
}
