import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');

        let query = supabaseAdmin()
            .from('download_files')
            .select('*')
            .eq('isActive', true)
            .order('date', { ascending: false });

        if (category && category !== 'Semua') {
            query = query.eq('category', category);
        }

        const { data, error } = await query;

        if (error) {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching downloads:', error);
        return NextResponse.json(
            { error: 'Failed to fetch downloads' },
            { status: 500 }
        );
    }
}
