import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin()
            .from('graduation_students')
            .select('*')
            .order('year', { ascending: false })
            .order('name', { ascending: true });

        if (error) {
            throw error;
        }

        return NextResponse.json(data || []);
    } catch (error) {
        console.error('Admin graduation students error:', error);
        return NextResponse.json({ error: 'Failed to fetch graduation students' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();
        const insertPayload = {
            nisn: payload.nisn?.trim() || '',
            name: payload.name?.trim() || '',
            className: payload.className?.trim() || '',
            status: payload.status || 'LULUS',
            averageScore: Number(payload.averageScore) || 0,
            year: payload.year?.trim() || '',
        };

        if (!insertPayload.nisn || !insertPayload.name || !insertPayload.className || !insertPayload.year) {
            return NextResponse.json({ error: 'NISN, nama, kelas, dan tahun wajib diisi.' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin()
            .from('graduation_students')
            .insert(insertPayload)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Admin graduation students create error:', error);
        return NextResponse.json({ error: 'Failed to create graduation student' }, { status: 500 });
    }
}
