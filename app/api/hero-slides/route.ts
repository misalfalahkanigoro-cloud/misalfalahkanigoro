import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin()
            .from('hero_slides')
            .select('*')
            .eq('isActive', true)
            .order('order', { ascending: true });

        if (error) {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching hero slides:', error);
        return NextResponse.json(
            { error: 'Failed to fetch hero slides' },
            { status: 500 }
        );
    }
}
