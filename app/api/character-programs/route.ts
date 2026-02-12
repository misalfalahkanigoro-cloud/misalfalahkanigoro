import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin()
            .from('character_programs')
            .select('*')
            .eq('isactive', true)
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
            displayOrder: row.displayorder,
            isActive: row.isactive,
        }));

        return NextResponse.json(mapped);
    } catch (error) {
        console.error('Error fetching character programs:', error);
        return NextResponse.json({ error: 'Failed to fetch character programs' }, { status: 500 });
    }
}
