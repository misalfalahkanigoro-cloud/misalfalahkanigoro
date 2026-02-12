import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const year = searchParams.get('year') || new Date().getFullYear().toString();

        const { data, error } = await supabaseAdmin()
            .from('graduation_students')
            .select('*')
            .eq('year', year)
            .order('name', { ascending: true });

        if (error) {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching graduation data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch graduation data' },
            { status: 500 }
        );
    }
}

// Search by NISN
export async function POST(request: NextRequest) {
    try {
        const { nisn } = await request.json();

        if (!nisn) {
            return NextResponse.json({ error: 'NISN is required' }, { status: 400 });
        }

        const { data: student, error } = await supabaseAdmin()
            .from('graduation_students')
            .select('*')
            .eq('nisn', nisn)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!student) {
            return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
        }

        return NextResponse.json(student);
    } catch (error) {
        console.error('Error searching graduation data:', error);
        return NextResponse.json(
            { error: 'Failed to search graduation data' },
            { status: 500 }
        );
    }
}
