import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin()
            .from('download_files')
            .select('*')
            .order('date', { ascending: false });

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
            title: payload.title?.trim() || '',
            category: payload.category?.trim() || 'Umum',
            date: payload.date || new Date().toISOString(),
            size: payload.size?.trim() || '',
            fileType: payload.fileType || 'PDF',
            fileUrl: payload.fileUrl || '',
            isActive: payload.isActive ?? true,
        };

        if (!insertPayload.title || !insertPayload.fileUrl) {
            return NextResponse.json({ error: 'Judul dan file wajib diisi.' }, { status: 400 });
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
