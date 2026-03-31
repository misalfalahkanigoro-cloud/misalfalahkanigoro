import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import prisma from '@/lib/prisma';
import { mapPpdbRegistration } from '@/lib/ppdb-mapper';
import { requireAdminRole } from '@/lib/admin-auth';
import { createPpdbPdfElement } from '@/lib/ppdb-pdf';
import { getCachedSiteSettings } from '@/lib/cache-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;

        const registration = await prisma.ppdb_registrations.findUnique({
            where: { id },
        });

        if (!registration) {
            return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
        }

        const files = await prisma.ppdb_files.findMany({
            where: { registration_id: id },
            orderBy: [{ created_at: 'asc' }],
        });

        const [siteSettings, requirements] = await Promise.all([
            getCachedSiteSettings(),
            registration.wave_id
                ? prisma.ppdb_document_requirements.findMany({
                      where: { wave_id: registration.wave_id },
                      orderBy: [{ created_at: 'asc' }],
                  })
                : Promise.resolve([]),
        ]);

        const mapped = mapPpdbRegistration(
            registration as unknown as Record<string, any>,
            files as unknown as Array<Record<string, any>>
        );

        const dynamicFileLabels = Object.fromEntries(
            (requirements || [])
                .filter((item) => Boolean(item.key))
                .map((item) => [String(item.key), String(item.label || item.key)])
        );

        const element = createPpdbPdfElement(mapped as any, {
            schoolName: siteSettings?.school_name || siteSettings?.site_title || 'Sekolah',
            subtitle: 'Bukti pendaftaran dan data calon peserta didik.',
            fileLabels: dynamicFileLabels,
        });
        const pdfBuffer = await renderToBuffer(element);
        const filename = `ppdb-${String(mapped.nisn || mapped.namaLengkap || 'formulir').replace(/\s+/g, '-').toLowerCase()}.pdf`;

        const body = pdfBuffer as unknown as Uint8Array;
        return new NextResponse(body as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error('PPDB PDF error:', error);
        return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
    }
}
