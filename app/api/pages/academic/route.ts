import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { AcademicSubject, AcademicProgram } from '@/lib/types';

export async function GET() {
    try {
        const { data: page, error } = await supabaseAdmin()
            .from('academic_page')
            .select('*, subjects:academic_subjects(*), programs:academic_programs(*)')
            .eq('id', 'main')
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!page) {
            return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
        }

        const subjects = ((page?.subjects || []) as AcademicSubject[]).sort(
            (a, b) => a.order - b.order
        );
        const programs = ((page?.programs || []) as AcademicProgram[]).sort(
            (a, b) => a.order - b.order
        );

        return NextResponse.json({ ...page, subjects, programs });
    } catch (error) {
        console.error('Error fetching academic page:', error);
        return NextResponse.json({ error: 'Failed to fetch academic page' }, { status: 500 });
    }
}
