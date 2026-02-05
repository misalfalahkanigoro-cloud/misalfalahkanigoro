import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Submit new PPDB registration
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        // Validate required fields
        const requiredFields = [
            'namaLengkap', 'nik', 'tempatLahir', 'tanggalLahir', 'jenisKelamin',
            'alamat', 'namaAyah', 'pekerjaanAyah', 'namaIbu', 'pekerjaanIbu', 'noHp'
        ];

        for (const field of requiredFields) {
            if (!data[field]) {
                return NextResponse.json(
                    { error: `Field ${field} is required` },
                    { status: 400 }
                );
            }
        }

        const { data: registration, error } = await supabaseAdmin()
            .from('ppdb_registrations')
            .insert({
                namaLengkap: data.namaLengkap,
                nik: data.nik,
                nisn: data.nisn || null,
                tempatLahir: data.tempatLahir,
                tanggalLahir: data.tanggalLahir,
                jenisKelamin: data.jenisKelamin,
                alamat: data.alamat,
                namaAyah: data.namaAyah,
                pekerjaanAyah: data.pekerjaanAyah,
                namaIbu: data.namaIbu,
                pekerjaanIbu: data.pekerjaanIbu,
                noHp: data.noHp,
                status: 'VERIFIKASI',
                pesan: 'Pendaftaran berhasil dikirim. Berkas sedang diperiksa oleh panitia.',
            })
            .select('id')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            registrationId: registration.id,
            message: 'Pendaftaran berhasil! Simpan ID pendaftaran Anda: ' + registration.id,
        });
    } catch (error) {
        console.error('Error submitting PPDB registration:', error);
        return NextResponse.json(
            { error: 'Gagal mengirim pendaftaran' },
            { status: 500 }
        );
    }
}
