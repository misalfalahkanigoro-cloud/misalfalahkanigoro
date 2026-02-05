import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin()
            .from('site_settings')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            throw error;
        }

        return NextResponse.json(data || null);
    } catch (error) {
        console.error('Admin site settings error:', error);
        return NextResponse.json({ error: 'Failed to fetch site settings' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const payload = await request.json();

        const { data: existing, error: existingError } = await supabaseAdmin()
            .from('site_settings')
            .select('id')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (existingError) {
            throw existingError;
        }

        const updatePayload = {
            school_name: payload.school_name ?? payload.schoolName ?? null,
            school_logo_url: payload.school_logo_url ?? payload.schoolLogoUrl ?? null,
            school_address: payload.school_address ?? payload.schoolAddress ?? null,
            school_phone: payload.school_phone ?? payload.schoolPhone ?? null,
            school_email: payload.school_email ?? payload.schoolEmail ?? null,
            school_whatsapp: payload.school_whatsapp ?? payload.schoolWhatsapp ?? null,
            school_tagline: payload.school_tagline ?? payload.schoolTagline ?? null,
            is_active: payload.is_active ?? payload.isActive ?? true,
        };

        if (existing?.id) {
            const { data, error } = await supabaseAdmin()
                .from('site_settings')
                .update(updatePayload)
                .eq('id', existing.id)
                .select('*')
                .single();

            if (error) {
                throw error;
            }

            return NextResponse.json(data);
        }

        const { data, error } = await supabaseAdmin()
            .from('site_settings')
            .insert(updatePayload)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Admin site settings update error:', error);
        return NextResponse.json({ error: 'Failed to update site settings' }, { status: 500 });
    }
}
