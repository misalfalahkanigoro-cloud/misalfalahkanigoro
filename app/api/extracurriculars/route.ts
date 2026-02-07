import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin()
            .from('extracurriculars')
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
            imageUrl: row.imageurl,
            schedule: row.schedule,
            coachName: row.coachname,
            displayOrder: row.displayorder,
            isActive: row.isactive,
        }));

        return NextResponse.json(mapped);
    } catch (error) {
        console.error('Error fetching extracurriculars:', error);
        return NextResponse.json({ error: 'Failed to fetch extracurriculars' }, { status: 500 });
    }
}
