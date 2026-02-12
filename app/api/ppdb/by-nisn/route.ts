import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const nisn = searchParams.get('nisn');
        if (!nisn) {
            return NextResponse.json({ error: 'NISN is required' }, { status: 400 });
        }

        const { data: registration, error } = await supabaseAdmin()
            .from('ppdb_registrations')
            .select('*')
            .eq('nisn', nisn)
            .maybeSingle();

        if (error) throw error;
        if (!registration) {
            return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
        }

        const { data: files, error: filesError } = await supabaseAdmin()
            .from('ppdb_files')
            .select('*')
            .eq('registration_id', registration.id)
            .order('created_at', { ascending: true });

        if (filesError) throw filesError;

        return NextResponse.json({
            ...registration,
            files: (files || []).map((file: any) => ({
                id: file.id,
                registrationId: file.registration_id,
                fileType: file.file_type,
                fileUrl: file.file_url,
                createdAt: file.created_at,
            })),
        });
    } catch (error) {
        console.error('PPDB by NISN error:', error);
        return NextResponse.json({ error: 'Failed to fetch registration' }, { status: 500 });
    }
}
