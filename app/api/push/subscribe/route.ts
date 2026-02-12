import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();
        const registrationId = payload.registrationId;
        const endpoint = payload.endpoint;
        const p256dh = payload.p256dh;
        const auth = payload.auth;
        const userAgent = payload.userAgent || null;

        if (!registrationId || !endpoint || !p256dh || !auth) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        const { error } = await supabaseAdmin()
            .from('push_subscriptions')
            .insert({
                registration_id: registrationId,
                endpoint,
                p256dh,
                auth,
                user_agent: userAgent,
            });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Push subscribe error:', error);
        return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
    }
}
