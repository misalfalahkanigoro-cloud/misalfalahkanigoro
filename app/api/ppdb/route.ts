import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { extractStorageIdentityFromUrl, resolveBucketName } from '@/lib/r2-storage';
import { createPpdbAccessToken } from '@/lib/ppdb-access';

const REQUIRED_FIELDS = [
    'namaLengkap',
    'nik',
    'nisn',
    'tempatLahir',
    'tanggalLahir',
    'jenisKelamin',
    'alamat',
    'namaAyah',
    'pekerjaanAyah',
    'namaIbu',
    'pekerjaanIbu',
    'noHp',
] as const;

const isValidDigits = (value: unknown, length: number) =>
    typeof value === 'string' && new RegExp(`^\\d{${length}}$`).test(value);

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        for (const field of REQUIRED_FIELDS) {
            if (!data[field]) {
                return NextResponse.json({ error: `Field ${field} is required` }, { status: 400 });
            }
        }

        if (!isValidDigits(data.nik, 16)) {
            return NextResponse.json({ error: 'NIK harus 16 digit angka' }, { status: 400 });
        }

        if (!isValidDigits(data.nisn, 10)) {
            return NextResponse.json({ error: 'NISN harus 10 digit angka' }, { status: 400 });
        }

        const activeWave = await prisma.ppdb_waves.findFirst({
            where: { is_active: true },
            orderBy: { start_date: 'desc' },
            select: { id: true },
        });

        if (!activeWave?.id) {
            return NextResponse.json(
                { error: 'PPDB_CLOSED', message: 'PPDB sedang ditutup. Tidak ada gelombang aktif.' },
                { status: 400 }
            );
        }

        const result = await prisma.$transaction(async (tx) => {
            const registration = await tx.ppdb_registrations.create({
                data: {
                    namaLengkap: data.namaLengkap,
                    nik: data.nik,
                    nisn: data.nisn,
                    wave_id: activeWave.id,
                    tempatLahir: data.tempatLahir,
                    tanggalLahir: new Date(data.tanggalLahir),
                    jenisKelamin: data.jenisKelamin,
                    alamat: data.alamat,
                    namaAyah: data.namaAyah,
                    pekerjaanAyah: data.pekerjaanAyah,
                    namaIbu: data.namaIbu,
                    pekerjaanIbu: data.pekerjaanIbu,
                    noHp: data.noHp,
                    status: 'VERIFIKASI',
                    pesan: 'Pendaftaran berhasil dikirim. Berkas sedang diperiksa oleh panitia.',
                },
                select: { id: true },
            });

            const files = Array.isArray(data.files) ? data.files : [];
            const normalizedFiles = files
                .map((file: Record<string, any>) => {
                    const fileUrl = file.fileUrl;
                    const storageInfo = extractStorageIdentityFromUrl(fileUrl);
                    const storageBucket = file.storageBucket || file.bucket || storageInfo?.bucket || null;
                    const storagePath = file.storagePath || file.path || file.publicId || storageInfo?.path || null;

                    return {
                        registration_id: registration.id,
                        file_type: file.fileType,
                        storage_provider: file.storageProvider || file.provider || (storagePath ? 'r2' : null),
                        storage_bucket: storageBucket ? resolveBucketName(storageBucket, 'publikweb') : null,
                        storage_path: storagePath,
                        file_url: fileUrl,
                    };
                })
                .filter((file: Record<string, any>) => file.file_type && file.file_url);

            if (normalizedFiles.length > 0) {
                await tx.ppdb_files.createMany({ data: normalizedFiles });
            }

            return registration;
        });

        return NextResponse.json({
            success: true,
            registrationId: result.id,
            nisn: data.nisn,
            accessToken: createPpdbAccessToken(result.id),
            message: 'Pendaftaran berhasil. Simpan tautan konfirmasi Anda untuk melihat ringkasan pendaftaran.',
        });
    } catch (error) {
        console.error('Error submitting PPDB registration:', error);
        return NextResponse.json({ error: 'Gagal mengirim pendaftaran' }, { status: 500 });
    }
}
