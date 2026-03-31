import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendPushNotification } from '@/lib/push';
import { requireAdminRole } from '@/lib/admin-auth';
import { createPpdbAccessToken } from '@/lib/ppdb-access';
import { mapPpdbRegistration } from '@/lib/ppdb-mapper';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const registration = await prisma.ppdb_registrations.findUnique({
            where: { id },
        });

        if (!registration) {
            return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
        }

        const files = await prisma.ppdb_files.findMany({
            where: { registration_id: id },
            orderBy: [{ created_at: 'asc' }],
        });

        return NextResponse.json(
            mapPpdbRegistration(
                registration as unknown as Record<string, any>,
                files as unknown as Array<Record<string, any>>
            )
        );
    } catch (error) {
        console.error('Admin PPDB detail error:', error);
        return NextResponse.json({ error: 'Failed to fetch PPDB registration' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const payload = await request.json();

        const registration = await prisma.ppdb_registrations.update({
            where: { id },
            data: {
                status: payload.status,
                pesan: payload.pesan ?? null,
            },
        });

        let hasSubscription = false;

        try {
            const subscriptions = await prisma.push_subscriptions.findMany({
                where: { registration_id: id },
                select: {
                    endpoint: true,
                    p256dh: true,
                    auth: true,
                },
            });

            hasSubscription = subscriptions.length > 0;

            if (payload.sendNotification && hasSubscription) {
                const accessToken = createPpdbAccessToken(id);
                const pushPayload = {
                    title: 'Status PPDB Diperbarui',
                    body: `Status pendaftaran Anda sekarang: ${payload.status}`,
                    data: { url: `/ppdb/sukses?token=${encodeURIComponent(accessToken)}` },
                };

                for (const subscription of subscriptions) {
                    try {
                        await sendPushNotification(subscription as any, pushPayload);
                    } catch (pushError) {
                        console.error('Failed to send push notification:', pushError);
                    }
                }
            }
        } catch (error) {
            console.error('Push notification error:', error);
        }

        return NextResponse.json({ ...registration, hasSubscription });
    } catch (error) {
        console.error('Admin PPDB update error:', error);
        return NextResponse.json({ error: 'Failed to update PPDB registration' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        await prisma.ppdb_registrations.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin PPDB delete error:', error);
        return NextResponse.json({ error: 'Failed to delete PPDB registration' }, { status: 500 });
    }
}
