import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data: page, error } = await supabaseAdmin()
            .from('profile_page')
            .select('*')
            .eq('id', 'main')
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!page) {
            return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
        }

        return NextResponse.json(page);
    } catch (error) {
        console.error('Error fetching profile page:', error);
        return NextResponse.json({ error: 'Failed to fetch profile page' }, { status: 500 });
    }
}
