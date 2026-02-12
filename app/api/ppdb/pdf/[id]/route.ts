import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import PPDBPdfDocument from '@/components/ppdb/PPDBPdfDocument';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { data: registration, error } = await supabaseAdmin()
            .from('ppdb_registrations')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        if (!registration) {
            return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
        }

        const { data: files, error: filesError } = await supabaseAdmin()
            .from('ppdb_files')
            .select('*')
            .eq('registration_id', id)
            .order('created_at', { ascending: true });

        if (filesError) throw filesError;

        const mapped = {
            id: registration.id,
            namaLengkap: registration.namaLengkap,
            nik: registration.nik,
            nisn: registration.nisn,
            tempatLahir: registration.tempatLahir,
            tanggalLahir: registration.tanggalLahir,
            jenisKelamin: registration.jenisKelamin,
            alamat: registration.alamat,
            namaAyah: registration.namaAyah,
            pekerjaanAyah: registration.pekerjaanAyah,
            namaIbu: registration.namaIbu,
            pekerjaanIbu: registration.pekerjaanIbu,
            noHp: registration.noHp,
            status: registration.status,
            pesan: registration.pesan,
            tanggalDaftar: registration.tanggalDaftar,
            createdAt: registration.createdAt,
            updatedAt: registration.updatedAt,
            files: (files || []).map((file: any) => ({
                id: file.id,
                registrationId: file.registration_id,
                fileType: file.file_type,
                fileUrl: file.file_url,
                createdAt: file.created_at,
            })),
        };

        const element = React.createElement(PPDBPdfDocument, { data: mapped as any }) as any;
        const pdfBuffer = await renderToBuffer(element);
        const filename = `ppdb-${String(mapped.nisn || mapped.namaLengkap || 'formulir').replace(/\s+/g, '-').toLowerCase()}.pdf`;

        const body = pdfBuffer as unknown as Uint8Array;
        return new NextResponse(body as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=\"${filename}\"`,
            },
        });
    } catch (error) {
        console.error('PPDB PDF error:', error);
        return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
    }
}
