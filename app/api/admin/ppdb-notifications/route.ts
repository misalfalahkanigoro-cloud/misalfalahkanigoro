import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendPushNotification } from '@/lib/push';

export async function GET() {
    try {
        const rows = await prisma.ppdb_notifications.findMany({
            orderBy: [{ created_at: 'desc' }],
        });

        return NextResponse.json(rows);
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

        const created = await prisma.ppdb_notifications.create({
            data: {
                title: payload.title,
                message: payload.message,
                registration_id: registrationId,
                wave_id: waveId,
            },
        });

        let registrationIds: string[] = [];

        if (registrationId) {
            registrationIds = [registrationId];
        } else if (waveId) {
            const registrations = await prisma.ppdb_registrations.findMany({
                where: { wave_id: waveId },
                select: { id: true },
            });
            registrationIds = registrations.map((registration) => registration.id);
        }

        if (registrationIds.length > 0) {
            const subscriptions = await prisma.push_subscriptions.findMany({
                where: {
                    registration_id: { in: registrationIds },
                },
                select: {
                    endpoint: true,
                    p256dh: true,
                    auth: true,
                },
            });

            let targetUrl = '/ppdb';
            if (registrationId) {
                const registration = await prisma.ppdb_registrations.findUnique({
                    where: { id: registrationId },
                    select: { nisn: true },
                });
                if (registration?.nisn) {
                    targetUrl = `/ppdb/sukses?nisn=${registration.nisn}`;
                }
            }

            const pushPayload = {
                title: payload.title,
                body: payload.message,
                data: { url: targetUrl },
            };

            for (const subscription of subscriptions) {
                try {
                    await sendPushNotification(subscription as any, pushPayload);
                } catch (pushError) {
                    console.error('Failed to send push notification:', pushError);
                }
            }
        }

        return NextResponse.json(created);
    } catch (error) {
        console.error('Admin PPDB notification create error:', error);
        return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }
}
