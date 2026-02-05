import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const mapVisionMission = (data: any) => ({
    id: data.id,
    visionText: data.vision_text,
    missionText: data.mission_text,
    isActive: data.is_active,
});

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin()
            .from('vision_mission_page')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            throw error;
        }

        return NextResponse.json(data ? mapVisionMission(data) : null);
    } catch (error) {
        console.error('Admin vision mission error:', error);
        return NextResponse.json({ error: 'Failed to fetch vision mission' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const payload = await request.json();

        const { data: existing, error: existingError } = await supabaseAdmin()
            .from('vision_mission_page')
            .select('id')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (existingError) {
            throw existingError;
        }

        const updatePayload = {
            vision_text: payload.vision_text ?? payload.visionText ?? '',
            mission_text: payload.mission_text ?? payload.missionText ?? '',
            is_active: payload.is_active ?? payload.isActive ?? true,
        };

        const recordId = payload.id ?? existing?.id;

        if (recordId) {
            const { data, error } = await supabaseAdmin()
                .from('vision_mission_page')
                .update(updatePayload)
                .eq('id', recordId)
                .select('*')
                .single();

            if (error) {
                throw error;
            }

            return NextResponse.json(mapVisionMission(data));
        }

        const { data, error } = await supabaseAdmin()
            .from('vision_mission_page')
            .insert(updatePayload)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(mapVisionMission(data));
    } catch (error) {
        console.error('Admin vision mission update error:', error);
        return NextResponse.json({ error: 'Failed to update vision mission' }, { status: 500 });
    }
}
