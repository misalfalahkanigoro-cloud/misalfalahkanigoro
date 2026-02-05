import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { SiteSettings } from '@/lib/types';

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

        if (!data) {
            return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
        }

        const mapped: SiteSettings = {
            id: data.id,
            schoolName: data.school_name,
            schoolLogoUrl: data.school_logo_url,
            schoolAddress: data.school_address,
            schoolPhone: data.school_phone,
            schoolEmail: data.school_email,
            schoolWhatsapp: data.school_whatsapp,
            schoolTagline: data.school_tagline,
            isActive: data.is_active,
        };

        return NextResponse.json(mapped);
    } catch (error) {
        console.error('Error fetching site settings:', error);
        return NextResponse.json({ error: 'Failed to fetch site settings' }, { status: 500 });
    }
}
