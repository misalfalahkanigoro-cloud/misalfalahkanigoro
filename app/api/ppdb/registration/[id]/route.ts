import { NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/db';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { data: registration, error } = await dbAdmin()
            .from('ppdb_registrations')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        if (!registration) {
            return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
        }

        const { data: files, error: filesError } = await dbAdmin()
            .from('ppdb_files')
            .select('*')
            .eq('registration_id', id)
            .order('created_at', { ascending: true });

        if (filesError) throw filesError;

        const mappedFiles = (files || []).map((file: any) => ({
            id: file.id,
            registrationId: file.registration_id,
            fileType: file.file_type,
            fileUrl: file.file_url,
            createdAt: file.created_at,
        }));

        return NextResponse.json({
            ...registration,
            files: mappedFiles,
        });
    } catch (error) {
        console.error('Error fetching PPDB registration:', error);
        return NextResponse.json({ error: 'Failed to fetch PPDB registration' }, { status: 500 });
    }
}
