import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const isValidNisn = (value: unknown) => typeof value === 'string' && /^\d{10}$/.test(value);

export async function POST(request: NextRequest) {
    try {
        const { nisn } = await request.json();

        if (!isValidNisn(nisn)) {
            return NextResponse.json({ error: 'NISN harus 10 digit angka' }, { status: 400 });
        }

        const registration = await prisma.ppdb_registrations.findFirst({
            where: { nisn },
            select: {
                namaLengkap: true,
                tanggalDaftar: true,
                status: true,
                pesan: true,
                nisn: true,
            },
        });

        if (!registration) {
            return NextResponse.json({ error: 'NOT_FOUND', message: 'NISN tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json({
            tanggalDaftar: new Date(registration.tanggalDaftar).toISOString().split('T')[0],
            status: registration.status,
            pesan: registration.pesan,
            canViewSubmission: false,
            summaryMessage: 'Status pendaftaran ditemukan. Gunakan tautan konfirmasi yang Anda simpan untuk melihat detail berkas.',
        });
    } catch (error) {
        console.error('Error checking PPDB status:', error);
        return NextResponse.json({ error: 'Gagal mengecek status pendaftaran' }, { status: 500 });
    }
}
