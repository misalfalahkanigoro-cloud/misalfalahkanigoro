import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendPushNotification } from '@/lib/push';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin()
            .from('ppdb_notifications')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json(data || []);
    } catch (error) {
        console.error('Admin PPDB notifications error:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();
        const registrationId = payload.registrationId || null;
        const waveId = payload.waveId || null;

        if (!registrationId && !waveId) {
            return NextResponse.json({ error: 'Target pendaftar atau gelombang wajib dipilih' }, { status: 400 });
        }

        if (!payload.title || !payload.message) {
            return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin()
            .from('ppdb_notifications')
            .insert({
                title: payload.title,
                message: payload.message,
                registration_id: registrationId,
                wave_id: waveId,
            })
            .select('*')
            .single();

        if (error) throw error;

        // Build targets
        let registrationIds: string[] = [];

        if (registrationId) {
            registrationIds = [registrationId];
        } else if (waveId) {
            const { data: regs, error: regError } = await supabaseAdmin()
                .from('ppdb_registrations')
                .select('id')
                .eq('wave_id', waveId);
            if (regError) throw regError;
            registrationIds = (regs || []).map((r: any) => r.id);
        }

        if (registrationIds.length) {
            const { data: subs, error: subsError } = await supabaseAdmin()
                .from('push_subscriptions')
                .select('endpoint, p256dh, auth')
                .in('registration_id', registrationIds);

            if (subsError) throw subsError;

            let targetUrl = '/ppdb';
            if (registrationId) {
                const { data: reg } = await supabaseAdmin()
                    .from('ppdb_registrations')
                    .select('nisn')
                    .eq('id', registrationId)
                    .maybeSingle();
                if (reg?.nisn) {
                    targetUrl = `/ppdb/sukses?nisn=${reg.nisn}`;
                }
            }

            const pushPayload = {
                title: payload.title,
                body: payload.message,
                data: { url: targetUrl },
            };

            for (const sub of subs || []) {
                try {
                    await sendPushNotification(sub as any, pushPayload);
                } catch (err) {
                    console.error('Failed to send push notification:', err);
                }
            }
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Admin PPDB notification create error:', error);
        return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }
}
