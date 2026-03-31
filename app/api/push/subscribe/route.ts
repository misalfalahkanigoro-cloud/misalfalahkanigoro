import { NextRequest, NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/db';
import { parsePpdbAccessToken } from '@/lib/ppdb-access';

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();
        const registrationId = payload.registrationId;
        const accessToken = payload.accessToken;
        const endpoint = payload.endpoint;
        const p256dh = payload.p256dh;
        const auth = payload.auth;
        const userAgent = payload.userAgent || null;
        const access = parsePpdbAccessToken(accessToken);

        if (!registrationId || !endpoint || !p256dh || !auth || !access || access.registrationId !== registrationId) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        const { error } = await dbAdmin()
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
