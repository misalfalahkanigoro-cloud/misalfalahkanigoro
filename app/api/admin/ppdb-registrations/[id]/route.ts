import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendPushNotification } from '@/lib/push';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const payload = await request.json();
        const updatePayload = {
            status: payload.status,
            pesan: payload.pesan ?? null,
        };

        const { data: registration, error } = await supabaseAdmin()
            .from('ppdb_registrations')
            .update(updatePayload)
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        let hasSubscription = false;
        try {
            const { data: subs, error: subsError } = await supabaseAdmin()
                .from('push_subscriptions')
                .select('endpoint, p256dh, auth')
                .eq('registration_id', id);

            if (subsError) throw subsError;

            hasSubscription = Boolean(subs && subs.length);

            if (payload.sendNotification && hasSubscription) {
                const pushPayload = {
                    title: 'Status PPDB Diperbarui',
                    body: `Status pendaftaran Anda sekarang: ${updatePayload.status}`,
                    data: { url: registration.nisn ? `/ppdb/sukses?nisn=${registration.nisn}` : '/ppdb' },
                };

                for (const sub of subs || []) {
                    try {
                        await sendPushNotification(sub as any, pushPayload);
                    } catch (err) {
                        console.error('Failed to send push notification:', err);
                    }
                }
            }
        } catch (err) {
            console.error('Push notification error:', err);
        }

        return NextResponse.json({ ...registration, hasSubscription });
    } catch (error) {
        console.error('Admin PPDB update error:', error);
        return NextResponse.json({ error: 'Failed to update PPDB registration' }, { status: 500 });
    }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { error } = await supabaseAdmin()
            .from('ppdb_registrations')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin PPDB delete error:', error);
        return NextResponse.json({ error: 'Failed to delete PPDB registration' }, { status: 500 });
    }
}
