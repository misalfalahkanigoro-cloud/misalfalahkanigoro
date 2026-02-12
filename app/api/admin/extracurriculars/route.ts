import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const normalizeExtracurricularPayload = (payload: any) => ({
    name: String(payload.name ?? '').trim(),
    description: String(payload.description ?? '').trim(),
    icon: payload.icon || null,
    imageurl: payload.imageUrl || payload.image_url || payload.imageurl || null,
    schedule: payload.schedule || null,
    coachname: payload.coachName || payload.coach_name || payload.coachname || null,
    displayorder: Number(payload.displayOrder ?? payload.display_order ?? payload.displayorder ?? 0) || 0,
    isactive: payload.isActive ?? payload.is_active ?? payload.isactive ?? true,
    updatedat: new Date().toISOString(),
});

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin()
            .from('extracurriculars')
            .select('*')
            .order('displayorder', { ascending: true });

        if (error) {
            throw error;
        }

        const mapped = (data || []).map((row) => ({
            id: row.id,
            name: row.name,
            description: row.description,
            icon: row.icon,
            imageUrl: row.imageurl,
            schedule: row.schedule,
            coach_name: row.coachname,
            display_order: row.displayorder,
            is_active: row.isactive,
        }));

        return NextResponse.json(mapped);
    } catch (error) {
        console.error('Admin extracurriculars error:', error);
        return NextResponse.json({ error: 'Failed to fetch extracurriculars' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();
        const insertPayload = normalizeExtracurricularPayload(payload);

        if (!insertPayload.name || !insertPayload.description) {
            return NextResponse.json({ error: 'Nama dan deskripsi wajib diisi.' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin()
            .from('extracurriculars')
            .insert(insertPayload)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Admin extracurriculars create error:', error);
        return NextResponse.json(
            { error: (error as any)?.message || (error as any)?.details || 'Failed to create extracurricular' },
            { status: 500 }
        );
    }
}
