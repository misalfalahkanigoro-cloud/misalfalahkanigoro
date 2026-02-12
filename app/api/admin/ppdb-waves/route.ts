import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin()
            .from('ppdb_waves')
            .select('*')
            .order('start_date', { ascending: false });

        if (error) throw error;
        return NextResponse.json(data || []);
    } catch (error) {
        console.error('Admin PPDB waves error:', error);
        return NextResponse.json({ error: 'Failed to fetch PPDB waves' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();
        if (payload.isActive) {
            await supabaseAdmin()
                .from('ppdb_waves')
                .update({ is_active: false })
                .eq('is_active', true);
        }
        const { data, error } = await supabaseAdmin()
            .from('ppdb_waves')
            .insert({
                name: payload.name,
                start_date: payload.startDate,
                end_date: payload.endDate,
                quota: payload.quota ?? null,
                is_active: payload.isActive ?? true,
            })
            .select('*')
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error('Admin PPDB wave create error:', error);
        return NextResponse.json({ error: 'Failed to create PPDB wave' }, { status: 500 });
    }
}
