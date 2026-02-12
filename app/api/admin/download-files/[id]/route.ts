import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const payload = await request.json();
        const updatePayload = {
            download_id: payload.downloadId,
            file_name: payload.fileName,
            file_type: payload.fileType,
            file_size_kb: payload.fileSizeKb,
            storage_path: payload.storagePath || null,
            public_url: payload.publicUrl,
            display_order: payload.displayOrder ?? 0,
        };

        const { data, error } = await supabaseAdmin()
            .from('download_files')
            .update(updatePayload)
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Admin download files update error:', error);
        return NextResponse.json({ error: 'Failed to update download file' }, { status: 500 });
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { error } = await supabaseAdmin()
            .from('download_files')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin download files delete error:', error);
        return NextResponse.json({ error: 'Failed to delete download file' }, { status: 500 });
    }
}
