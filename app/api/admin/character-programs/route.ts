import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin()
            .from('character_programs')
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
            frequency: row.frequency,
            display_order: row.displayorder,
            is_active: row.isactive,
        }));

        return NextResponse.json(mapped);
    } catch (error) {
        console.error('Admin character programs error:', error);
        return NextResponse.json({ error: 'Failed to fetch character programs' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();
        const insertPayload = {
            name: payload.name?.trim() || '',
            description: payload.description?.trim() || '',
            icon: payload.icon || null,
            frequency: payload.frequency || null,
            displayorder: Number(payload.displayOrder ?? payload.displayorder) || 0,
            isactive: payload.isActive ?? payload.isactive ?? true,
        };

        if (!insertPayload.name || !insertPayload.description) {
            return NextResponse.json({ error: 'Nama dan deskripsi wajib diisi.' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin()
            .from('character_programs')
            .insert(insertPayload)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Admin character programs create error:', error);
        return NextResponse.json({ error: 'Failed to create character program' }, { status: 500 });
    }
}
