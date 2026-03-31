import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminRole } from '@/lib/admin-auth';
import { sanitizePlainText, sanitizeRichText, sanitizeUrl } from '@/lib/rich-text';

type HistoryPayload = {
    id?: string;
    title?: string;
    subtitle?: string | null;
    contentJson?: unknown;
    contentHtml?: string | null;
    contentText?: string | null;
    coverImageUrl?: string | null;
    videoUrl?: string | null;
    isActive?: boolean;
    timelineItems?: Array<{
        id?: string;
        year?: string;
        title?: string;
        descriptionJson?: unknown;
        descriptionHtml?: string | null;
        descriptionText?: string | null;
        mediaUrl?: string | null;
        displayOrder?: number;
        isActive?: boolean;
    }>;
};

const mapPage = (data: any) => ({
    id: data.id,
    title: data.title,
    subtitle: data.subtitle,
    contentJson: data.content_json,
    contentHtml: data.content_html,
    contentText: data.content_text,
    coverImageUrl: data.cover_image_url,
    videoUrl: data.video_url,
    isActive: data.is_active,
});

const mapTimeline = (items: any[]) =>
    (items || []).map((item) => ({
        id: item.id,
        historyPageId: item.history_page_id,
        year: item.year,
        title: item.title,
        descriptionJson: item.description_json,
        descriptionHtml: item.description_html,
        descriptionText: item.description_text,
        mediaUrl: item.media_url,
        displayOrder: item.display_order,
        isActive: item.is_active,
    }));

export async function GET(request: NextRequest) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const page = await prisma.history_page.findFirst({
            orderBy: { created_at: 'desc' },
            include: {
                history_timeline_items: {
                    orderBy: [{ display_order: 'asc' }, { created_at: 'asc' }],
                },
            },
        });

        if (!page) {
            return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
        }

        return NextResponse.json({
            page: mapPage(page),
            timelineItems: mapTimeline(page.history_timeline_items),
        });
    } catch (error: any) {
        console.error('Admin history page error:', error);
        return NextResponse.json(
            { error: error?.message || error?.details || 'Failed to fetch history page' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const payload = (await request.json()) as HistoryPayload;

        const saved = await prisma.$transaction(async (tx) => {
            const existing = payload.id
                ? await tx.history_page.findUnique({ where: { id: payload.id } })
                : await tx.history_page.findFirst({ orderBy: { created_at: 'desc' }, select: { id: true } });

            const pagePayload: any = {
                title: sanitizePlainText(payload.title, 160) ?? 'Sejarah Madrasah',
                subtitle: sanitizePlainText(payload.subtitle, 220),
                content_json: payload.contentJson ?? null,
                content_html: sanitizeRichText(payload.contentHtml),
                content_text: sanitizePlainText(payload.contentText, 10_000),
                cover_image_url: sanitizeUrl(payload.coverImageUrl),
                video_url: sanitizeUrl(payload.videoUrl),
                is_active: payload.isActive ?? true,
            };

            const page = existing?.id
                ? await tx.history_page.update({
                      where: { id: existing.id },
                      data: pagePayload,
                  })
                : await tx.history_page.create({
                      data: pagePayload,
                  });

            const incomingItems = Array.isArray(payload.timelineItems) ? payload.timelineItems : [];
            const keptIds: string[] = [];

            for (let index = 0; index < incomingItems.length; index += 1) {
                const item = incomingItems[index];
                const itemPayload: any = {
                    history_page_id: page.id,
                    year: sanitizePlainText(item.year, 20) ?? '',
                    title: sanitizePlainText(item.title, 160) ?? '',
                    description_json: item.descriptionJson ?? null,
                    description_html: sanitizeRichText(item.descriptionHtml),
                    description_text: sanitizePlainText(item.descriptionText, 5000),
                    media_url: sanitizeUrl(item.mediaUrl),
                    display_order: Number(item.displayOrder ?? index + 1) || index + 1,
                    is_active: item.isActive ?? true,
                };

                if (item.id) {
                    const savedItem = await tx.history_timeline_items.upsert({
                        where: { id: item.id },
                        update: itemPayload,
                        create: { id: item.id, ...itemPayload },
                    });
                    keptIds.push(savedItem.id);
                } else {
                    const savedItem = await tx.history_timeline_items.create({
                        data: itemPayload,
                    });
                    keptIds.push(savedItem.id);
                }
            }

            await tx.history_timeline_items.deleteMany({
                where: {
                    history_page_id: page.id,
                    ...(keptIds.length ? { id: { notIn: keptIds } } : {}),
                },
            });

            return page;
        });

        return NextResponse.json({ success: true, id: saved.id });
    } catch (error: any) {
        console.error('Admin history page update error:', error);
        return NextResponse.json(
            { error: error?.message || error?.details || 'Failed to update history page' },
            { status: 500 }
        );
    }
}
