import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data: page, error: pageError } = await supabaseAdmin()
            .from('academic_page')
            .select('*')
            .eq('id', 'main')
            .maybeSingle();

        if (pageError) {
            throw pageError;
        }

        const { data: subjects, error: subjectsError } = await supabaseAdmin()
            .from('academic_subjects')
            .select('*')
            .eq('pageId', 'main')
            .order('order', { ascending: true });

        if (subjectsError) {
            throw subjectsError;
        }

        const { data: programs, error: programsError } = await supabaseAdmin()
            .from('academic_programs')
            .select('*')
            .eq('pageId', 'main')
            .order('order', { ascending: true });

        if (programsError) {
            throw programsError;
        }

        return NextResponse.json({
            page: page || null,
            subjects: subjects || [],
            programs: programs || [],
        });
    } catch (error) {
        console.error('Admin academic page error:', error);
        return NextResponse.json({ error: 'Failed to fetch academic page' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const payload = await request.json();
        const page = payload.page || payload;
        const subjects = Array.isArray(payload.subjects) ? payload.subjects : [];
        const programs = Array.isArray(payload.programs) ? payload.programs : [];

        const pagePayload = {
            id: 'main',
            heroTitle: page.heroTitle || '',
            heroSubtitle: page.heroSubtitle || '',
            heroImageUrl: page.heroImageUrl || null,
            curriculumTitle: page.curriculumTitle || '',
            curriculumIntro1: page.curriculumIntro1 || '',
            curriculumIntro2: page.curriculumIntro2 || '',
            subjectsTitle: page.subjectsTitle || '',
            programsTitle: page.programsTitle || '',
        };

        const { data: savedPage, error: pageError } = await supabaseAdmin()
            .from('academic_page')
            .upsert(pagePayload)
            .select('*')
            .single();

        if (pageError) {
            throw pageError;
        }

        const { error: deleteSubjectsError } = await supabaseAdmin()
            .from('academic_subjects')
            .delete()
            .eq('pageId', 'main');
        if (deleteSubjectsError) {
            throw deleteSubjectsError;
        }

        const { error: deleteProgramsError } = await supabaseAdmin()
            .from('academic_programs')
            .delete()
            .eq('pageId', 'main');
        if (deleteProgramsError) {
            throw deleteProgramsError;
        }

        if (subjects.length) {
            const subjectPayload = subjects.map((item: any, index: number) => ({
                pageId: 'main',
                name: item.name?.trim() || '',
                order: Number(item.order) || index + 1,
            })).filter((item: any) => item.name);

            if (subjectPayload.length) {
                const { error } = await supabaseAdmin()
                    .from('academic_subjects')
                    .insert(subjectPayload);
                if (error) throw error;
            }
        }

        if (programs.length) {
            const programPayload = programs.map((item: any, index: number) => ({
                pageId: 'main',
                title: item.title?.trim() || '',
                description: item.description?.trim() || '',
                icon: item.icon || null,
                order: Number(item.order) || index + 1,
            })).filter((item: any) => item.title && item.description);

            if (programPayload.length) {
                const { error } = await supabaseAdmin()
                    .from('academic_programs')
                    .insert(programPayload);
                if (error) throw error;
            }
        }

        return NextResponse.json({ page: savedPage });
    } catch (error) {
        console.error('Admin academic page update error:', error);
        return NextResponse.json({ error: 'Failed to update academic page' }, { status: 500 });
    }
}
