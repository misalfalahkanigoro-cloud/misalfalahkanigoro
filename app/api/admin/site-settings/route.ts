import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CACHE_TAGS } from '@/lib/cache-service';
import { requireAdminRole } from '@/lib/admin-auth';
import { sanitizeEmbedHtml, sanitizePlainText, sanitizeUrl } from '@/lib/rich-text';

const hasOwn = (source: Record<string, unknown>, key: string) => Object.prototype.hasOwnProperty.call(source, key);

export async function GET(request: NextRequest) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const data = await prisma.site_settings.findFirst({
            where: { is_active: true },
            orderBy: { created_at: 'desc' },
        });

        if (!data) return NextResponse.json(null);

        const serialized = JSON.parse(
            JSON.stringify(data, (key, value) =>
                typeof value === 'bigint' ? Number(value) : value
            )
        );

        return NextResponse.json(serialized);
    } catch (error) {
        console.error('Admin site settings error:', error);
        return NextResponse.json({ error: 'Failed to fetch site settings' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const payload = (await request.json()) as Record<string, unknown>;

        const updatePayload: Record<string, unknown> = {};

        if (hasOwn(payload, 'site_title') || hasOwn(payload, 'siteTitle')) {
            updatePayload.site_title = sanitizePlainText(payload.site_title ?? payload.siteTitle, 160);
        }
        if (hasOwn(payload, 'school_name') || hasOwn(payload, 'schoolName')) {
            updatePayload.school_name = sanitizePlainText(payload.school_name ?? payload.schoolName, 200);
        }
        if (hasOwn(payload, 'school_logo_url') || hasOwn(payload, 'schoolLogoUrl')) {
            updatePayload.school_logo_url = sanitizeUrl(payload.school_logo_url ?? payload.schoolLogoUrl);
        }
        if (hasOwn(payload, 'school_address') || hasOwn(payload, 'schoolAddress')) {
            updatePayload.school_address = sanitizePlainText(payload.school_address ?? payload.schoolAddress, 500);
        }
        if (hasOwn(payload, 'school_email') || hasOwn(payload, 'schoolEmail')) {
            updatePayload.school_email = sanitizePlainText(payload.school_email ?? payload.schoolEmail, 160);
        }
        if (hasOwn(payload, 'school_whatsapp') || hasOwn(payload, 'schoolWhatsapp')) {
            updatePayload.school_whatsapp = sanitizePlainText(payload.school_whatsapp ?? payload.schoolWhatsapp, 40);
        }

        // Expanded consolidated fields
        if (hasOwn(payload, 'whatsapp_list') || hasOwn(payload, 'whatsappList')) {
            updatePayload.whatsapp_list = payload.whatsapp_list ?? payload.whatsappList ?? [];
        }
        if (hasOwn(payload, 'admin_whatsapp_id') || hasOwn(payload, 'adminWhatsappId')) {
            updatePayload.admin_whatsapp_id = sanitizePlainText(payload.admin_whatsapp_id ?? payload.adminWhatsappId, 120);
        }
        if (hasOwn(payload, 'map_embed_html') || hasOwn(payload, 'mapEmbedHtml')) {
            updatePayload.map_embed_html = sanitizeEmbedHtml(payload.map_embed_html ?? payload.mapEmbedHtml);
        }
        if (hasOwn(payload, 'social_media') || hasOwn(payload, 'socialMedia')) {
            updatePayload.social_media = payload.social_media ?? payload.socialMedia ?? {};
        }

        if (hasOwn(payload, 'school_tagline') || hasOwn(payload, 'schoolTagline')) {
            updatePayload.school_tagline = sanitizePlainText(payload.school_tagline ?? payload.schoolTagline, 220);
        }
        if (hasOwn(payload, 'favicon_url') || hasOwn(payload, 'faviconUrl')) {
            updatePayload.favicon_url = sanitizeUrl(payload.favicon_url ?? payload.faviconUrl);
        }
        if (hasOwn(payload, 'meta_description') || hasOwn(payload, 'metaDescription')) {
            updatePayload.meta_description = sanitizePlainText(payload.meta_description ?? payload.metaDescription, 320);
        }
        if (hasOwn(payload, 'meta_keywords') || hasOwn(payload, 'metaKeywords')) {
            updatePayload.meta_keywords = sanitizePlainText(payload.meta_keywords ?? payload.metaKeywords, 320);
        }
        if (hasOwn(payload, 'google_analytics_id') || hasOwn(payload, 'googleAnalyticsId')) {
            updatePayload.google_analytics_id = sanitizePlainText(payload.google_analytics_id ?? payload.googleAnalyticsId, 80);
        }

        if (hasOwn(payload, 'is_active') || hasOwn(payload, 'isActive')) {
            updatePayload.is_active = payload.is_active ?? payload.isActive;
        } else {
            updatePayload.is_active = true;
        }

        const existing = await prisma.site_settings.findFirst({
            where: { is_active: true },
            orderBy: { created_at: 'desc' },
            select: { id: true },
        });

        let updatedData;
        if (existing?.id) {
            updatedData = await prisma.site_settings.update({
                where: { id: existing.id },
                data: updatePayload as any,
            });
        } else {
            updatedData = await prisma.site_settings.create({
                data: updatePayload as any,
            });
        }

        // Trigger on-demand revalidation
        revalidateTag(CACHE_TAGS.SITE_SETTINGS, 'max');

        const serialized = JSON.parse(
            JSON.stringify(updatedData, (key, value) =>
                typeof value === 'bigint' ? Number(value) : value
            )
        );
        return NextResponse.json(serialized);
    } catch (error) {
        console.error('Admin site settings update error:', error);
        return NextResponse.json({ error: 'Failed to update site settings' }, { status: 500 });
    }
}
