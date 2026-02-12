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

const parseBigintId = (id: string) => {
    const raw = String(id ?? '').trim();
    if (!/^\d+$/.test(raw)) return null;
    return raw;
};

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const parsedId = parseBigintId(id);
        if (!parsedId) {
            return NextResponse.json({ error: 'Invalid extracurricular id' }, { status: 400 });
        }
        const payload = await request.json();
        const updatePayload = normalizeExtracurricularPayload(payload);
        if (!updatePayload.name || !updatePayload.description) {
            return NextResponse.json({ error: 'Nama dan deskripsi wajib diisi.' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin()
            .from('extracurriculars')
            .update(updatePayload)
            .eq('id', parsedId)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Admin extracurriculars update error:', error);
        return NextResponse.json(
            { error: (error as any)?.message || (error as any)?.details || 'Failed to update extracurricular' },
            { status: 500 }
        );
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const parsedId = parseBigintId(id);
        if (!parsedId) {
            return NextResponse.json({ error: 'Invalid extracurricular id' }, { status: 400 });
        }
        const { error } = await supabaseAdmin()
            .from('extracurriculars')
            .delete()
            .eq('id', parsedId);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin extracurriculars delete error:', error);
        return NextResponse.json(
            { error: (error as any)?.message || (error as any)?.details || 'Failed to delete extracurricular' },
            { status: 500 }
        );
    }
}
