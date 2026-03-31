import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { SiteSettings } from '@/lib/types';

import { getCachedSiteSettings, CACHE_TAGS } from '@/lib/cache-service';

export async function GET() {
    try {
        const data = await getCachedSiteSettings();

        if (!data) {
            return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
        }

        const response = {
            id: data.id,
            siteTitle: data.site_title,
            schoolName: data.school_name,
            schoolLogoUrl: data.school_logo_url,
            schoolAddress: data.school_address,
            schoolPhone: data.school_whatsapp,
            schoolEmail: data.school_email,
            schoolWhatsapp: data.school_whatsapp,
            schoolTagline: data.school_tagline,
            faviconUrl: data.favicon_url,
            metaDescription: data.meta_description,
            metaKeywords: data.meta_keywords,
            googleAnalyticsId: data.google_analytics_id,
            whatsappList: Array.isArray(data.whatsapp_list) ? data.whatsapp_list : [],
            adminWhatsappId: data.admin_whatsapp_id,
            mapEmbedHtml: data.map_embed_html,
            isActive: Boolean(data.is_active),
        };

        return NextResponse.json(response, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59',
            },
        });
    } catch (error) {

        console.error('Error fetching site settings:', error);
        return NextResponse.json({ error: 'Failed to fetch site settings' }, { status: 500 });
    }
}
