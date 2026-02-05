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
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!data) {
            return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
        }

        return NextResponse.json(mapVisionMission(data));
    } catch (error: any) {
        console.error('Public vision mission error:', error);
        return NextResponse.json(
            { error: error?.message || error?.details || 'Failed to fetch vision mission' },
            { status: 500 }
        );
    }
}
