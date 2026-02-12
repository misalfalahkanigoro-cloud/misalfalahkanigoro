import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin()
            .from('ppdb_waves')
            .select('*')
            .eq('is_active', true)
            .order('start_date', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        if (!data) {
            return NextResponse.json({ active: false }, { status: 200 });
        }

        return NextResponse.json({
            active: true,
            wave: {
                id: data.id,
                name: data.name,
                startDate: data.start_date,
                endDate: data.end_date,
                quota: data.quota,
                isActive: data.is_active,
            },
        });
    } catch (error) {
        console.error('Active wave error:', error);
        return NextResponse.json({ active: false });
    }
}
