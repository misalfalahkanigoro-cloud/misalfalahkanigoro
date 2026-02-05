import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Check PPDB status by registration ID
export async function POST(request: NextRequest) {
    try {
        const { registrationId } = await request.json();

        if (!registrationId) {
            return NextResponse.json(
                { error: 'Registration ID is required' },
                { status: 400 }
            );
        }

        const { data: registration, error } = await supabaseAdmin()
            .from('ppdb_registrations')
            .select('id, namaLengkap, tanggalDaftar, status, pesan')
            .eq('id', registrationId)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!registration) {
            return NextResponse.json(
                { error: 'NOT_FOUND', message: 'ID pendaftaran tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: registration.id,
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
