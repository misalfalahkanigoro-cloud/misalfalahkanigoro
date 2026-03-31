import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminRole } from '@/lib/admin-auth';
import { buildMediaPayload, mapMediaItem } from '@/lib/content-media';
import { sanitizePlainText } from '@/lib/rich-text';

export async function GET(request: NextRequest) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const page = await prisma.academic_pages.findFirst({
            orderBy: { created_at: 'desc' },
            include: {
                academic_sections: {
                    orderBy: [{ display_order: 'asc' }, { created_at: 'asc' }],
                },
            },
        });

        if (!page) {
            return NextResponse.json({ page: null, sections: [], media: [] });
        }

        const mediaItems = await prisma.media_items.findMany({
            where: {
                entity_type: 'academic',
                entity_id: page.id,
            },
            orderBy: [{ is_main: 'desc' }, { display_order: 'asc' }],
        });

        const mappedMedia = mediaItems.map((item) => mapMediaItem(item as unknown as Record<string, any>));

        return NextResponse.json({
            page: {
                id: page.id,
                title: page.title,
                subtitle: page.subtitle,
                content: page.content,
                isActive: page.is_active,
                createdAt: page.created_at,
                updatedAt: page.updated_at,
            },
            sections: page.academic_sections.map((item) => ({
                id: item.id,
                pageId: item.page_id,
                title: item.title,
                body: item.body,
                displayOrder: item.display_order,
                createdAt: item.created_at,
                updatedAt: item.updated_at,
            })),
            media: mappedMedia,
            coverUrl: mappedMedia.find((item) => item.isMain)?.mediaUrl || null,
        });
    } catch (error) {
        console.error('Admin academic page error:', error);
        return NextResponse.json({ error: 'Failed to fetch academic page' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const payload = await request.json();
        const page = payload.page || payload;
        const sections = Array.isArray(payload.sections) ? payload.sections : [];
        const media = Array.isArray(payload.media) ? payload.media : [];
        const coverUrl = payload.coverUrl || page.coverUrl || null;

        const savedPage = await prisma.$transaction(async (tx) => {
            const pagePayload = {
                title: sanitizePlainText(page.title, 160) ?? '',
                subtitle: sanitizePlainText(page.subtitle, 220),
                content: sanitizePlainText(page.content, 5000),
                is_active: page.isActive ?? true,
            };

            const persistedPage = page.id
                ? await tx.academic_pages.upsert({
                      where: { id: page.id },
                      update: pagePayload,
                      create: { id: page.id, ...pagePayload },
                  })
                : await tx.academic_pages.create({
                      data: pagePayload,
                  });

            const keptSectionIds: string[] = [];

            for (const [index, item] of sections.entries()) {
                const sectionPayload = {
                    page_id: persistedPage.id,
                    title: sanitizePlainText(item.title, 160) ?? '',
                    body: sanitizePlainText(item.body, 4000),
                    display_order: Number(item.displayOrder ?? index + 1) || index + 1,
                };

                if (!sectionPayload.title) continue;

                if (item.id) {
                    const savedSection = await tx.academic_sections.upsert({
                        where: { id: item.id },
                        update: sectionPayload,
                        create: { id: item.id, ...sectionPayload },
                    });
                    keptSectionIds.push(savedSection.id);
                } else {
                    const savedSection = await tx.academic_sections.create({
                        data: sectionPayload,
                    });
                    keptSectionIds.push(savedSection.id);
                }
            }

            await tx.academic_sections.deleteMany({
                where: {
                    page_id: persistedPage.id,
                    ...(keptSectionIds.length ? { id: { notIn: keptSectionIds } } : {}),
                },
            });

            await tx.media_items.deleteMany({
                where: {
                    entity_type: 'academic',
                    entity_id: persistedPage.id,
                },
            });

            const mediaRows = buildMediaPayload({
                entityId: persistedPage.id,
                entityType: 'academic',
                mediaInput: media,
                coverUrlInput: coverUrl,
            });

            if (mediaRows.length > 0) {
                await tx.media_items.createMany({ data: mediaRows });
            }

            return persistedPage;
        });

        return NextResponse.json({
            page: {
                id: savedPage.id,
                title: savedPage.title,
                subtitle: savedPage.subtitle,
                content: savedPage.content,
                isActive: savedPage.is_active,
                createdAt: savedPage.created_at,
                updatedAt: savedPage.updated_at,
            },
        });
    } catch (error) {
        console.error('Admin academic page update error:', error);
        return NextResponse.json({ error: 'Failed to update academic page' }, { status: 500 });
    }
}
