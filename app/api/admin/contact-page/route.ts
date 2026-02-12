import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data: page, error } = await supabaseAdmin()
            .from('contact_page')
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
        console.error('Admin contact page error:', error);
        return NextResponse.json(
            { error: error?.message || error?.details || 'Failed to fetch contact page' },
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
            address: payload.address ?? '',
            phone: payload.phone ?? null,
            email: payload.email ?? '',
            whatsappList: Array.isArray(payload.whatsappList) ? payload.whatsappList : [],
            adminWhatsappId: payload.adminWhatsappId ?? null,
            mapEmbedHtml: payload.mapEmbedHtml ?? '',
        };

        const { error: pageError } = await supabaseAdmin()
            .from('contact_page')
            .upsert(pagePayload, { onConflict: 'id' });

        if (pageError) {
            throw pageError;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Admin contact page update error:', error);
        return NextResponse.json(
            { error: error?.message || error?.details || 'Failed to update contact page' },
            { status: 500 }
        );
    }
}
