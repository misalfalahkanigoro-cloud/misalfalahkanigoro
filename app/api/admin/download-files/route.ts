import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin()
            .from('download_files')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) {
            throw error;
        }

        return NextResponse.json(data || []);
    } catch (error) {
        console.error('Admin download files error:', error);
        return NextResponse.json({ error: 'Failed to fetch download files' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();
        const insertPayload = {
            download_id: payload.downloadId,
            file_name: payload.fileName,
            file_type: payload.fileType,
            file_size_kb: payload.fileSizeKb,
            storage_path: payload.storagePath || null,
            public_url: payload.publicUrl,
            display_order: payload.displayOrder ?? 0,
        };

        if (!insertPayload.download_id || !insertPayload.public_url || !insertPayload.file_name) {
            return NextResponse.json({ error: 'downloadId, fileName, dan publicUrl wajib diisi.' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin()
            .from('download_files')
            .insert(insertPayload)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Admin download files create error:', error);
        return NextResponse.json({ error: 'Failed to create download file' }, { status: 500 });
    }
}
