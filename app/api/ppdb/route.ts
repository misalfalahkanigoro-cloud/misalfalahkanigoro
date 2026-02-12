import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Submit new PPDB registration
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        // Validate required fields
        const requiredFields = [
            'namaLengkap', 'nik', 'nisn', 'tempatLahir', 'tanggalLahir', 'jenisKelamin',
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

        const { data: activeWave, error: waveError } = await supabaseAdmin()
            .from('ppdb_waves')
            .select('id')
            .eq('is_active', true)
            .order('start_date', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (waveError) throw waveError;
        if (!activeWave?.id) {
            return NextResponse.json(
                { error: 'PPDB_CLOSED', message: 'PPDB sedang ditutup. Tidak ada gelombang aktif.' },
                { status: 400 }
            );
        }

        const { data: registration, error } = await supabaseAdmin()
            .from('ppdb_registrations')
            .insert({
                namaLengkap: data.namaLengkap,
                nik: data.nik,
                nisn: data.nisn,
                wave_id: activeWave.id,
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

        const files = Array.isArray(data.files) ? data.files : [];
        if (files.length && registration?.id) {
            const normalized = files
                .map((file: any) => ({
                    registration_id: registration.id,
                    file_type: file.fileType,
                    file_url: file.fileUrl,
                }))
                .filter((file: any) => file.file_type && file.file_url);

            if (normalized.length) {
                const { error: fileError } = await supabaseAdmin()
                    .from('ppdb_files')
                    .insert(normalized);
                if (fileError) throw fileError;
            }
        }

        return NextResponse.json({
            success: true,
            registrationId: registration.id,
            nisn: data.nisn,
            message: 'Pendaftaran berhasil! Simpan NISN Anda sebagai nomor pendaftaran.',
        });
    } catch (error) {
        console.error('Error submitting PPDB registration:', error);
        return NextResponse.json(
            { error: 'Gagal mengirim pendaftaran' },
            { status: 500 }
        );
    }
}
