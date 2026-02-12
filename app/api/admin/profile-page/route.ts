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
    } catch (error: any) {
        console.error('Admin profile page error:', error);
        return NextResponse.json(
            { error: error?.message || error?.details || 'Failed to fetch profile page' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const payload = await request.json();
        const pageId = 'main';

        const pagePayload = {
            id: pageId,
            descriptionJson: payload.descriptionJson ?? payload.description_json ?? null,
            descriptionHtml: payload.descriptionHtml ?? payload.description_html ?? null,
            descriptionText: payload.descriptionText ?? payload.description_text ?? null,
            videoUrl: payload.videoUrl ?? payload.video_url ?? null,
            schoolName: payload.schoolName ?? '',
            npsn: payload.npsn ?? '',
            schoolAddress: payload.schoolAddress ?? '',
            village: payload.village ?? '',
            district: payload.district ?? '',
            city: payload.city ?? '',
            province: payload.province ?? '',
            schoolStatus: payload.schoolStatus ?? '',
            educationForm: payload.educationForm ?? '',
            educationLevel: payload.educationLevel ?? '',
        };

        const { error: pageError } = await supabaseAdmin()
            .from('profile_page')
            .upsert(pagePayload, { onConflict: 'id' });

        if (pageError) {
            throw pageError;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Admin profile page update error:', error);
        return NextResponse.json(
            { error: error?.message || error?.details || 'Failed to update profile page' },
            { status: 500 }
        );
    }
}
