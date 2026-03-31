import type { SiteSettings } from '@/lib/types';

export type WhatsappContact = {
    id: string;
    name: string;
    number: string;
};

export type AdminSiteSettings = Omit<SiteSettings, 'whatsappList' | 'socialMedia'> & {
    faviconUrl: string | null;
    metaDescription: string | null;
    metaKeywords: string | null;
    googleAnalyticsId: string | null;
    whatsappList: WhatsappContact[];
    adminWhatsappId: string | null;
    mapEmbedHtml: string | null;
    socialMedia: Record<string, string>;
};

const asString = (value: unknown, fallback = '') => (typeof value === 'string' ? value : fallback);

const asNullableString = (value: unknown) => (typeof value === 'string' ? value : null);

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const normalizeWhatsappList = (value: unknown): WhatsappContact[] => {
    if (!Array.isArray(value)) return [];

    return value
        .map((item, index) => {
            if (!isRecord(item)) return null;

            const name = asString(item.name ?? item.label).trim();
            const number = asString(item.number).trim();
            if (!name || !number) return null;

            return {
                id: asString(item.id, `wa-${index}`),
                name,
                number,
            };
        })
        .filter((item): item is WhatsappContact => Boolean(item));
};

const normalizeSocialMedia = (value: unknown): Record<string, string> => {
    if (!isRecord(value)) return {};

    return Object.entries(value).reduce<Record<string, string>>((acc, [platform, url]) => {
        const normalizedUrl = asString(url).trim();
        if (normalizedUrl) {
            acc[platform] = normalizedUrl;
        }
        return acc;
    }, {});
};

export const createDefaultAdminSiteSettings = (): AdminSiteSettings => ({
    id: '',
    siteTitle: null,
    schoolName: '',
    schoolLogoUrl: null,
    schoolAddress: null,
    schoolPhone: null,
    schoolEmail: null,
    schoolWhatsapp: null,
    schoolTagline: null,
    faviconUrl: null,
    metaDescription: null,
    metaKeywords: null,
    googleAnalyticsId: null,
    whatsappList: [],
    adminWhatsappId: null,
    mapEmbedHtml: null,
    socialMedia: {},
    isActive: true,
});

export const mapAdminSiteSettings = (value: unknown): AdminSiteSettings => {
    if (!isRecord(value)) {
        return createDefaultAdminSiteSettings();
    }

    return {
        id: asString(value.id),
        siteTitle: asNullableString(value.site_title ?? value.siteTitle),
        schoolName: asString(value.school_name ?? value.schoolName),
        schoolLogoUrl: asNullableString(value.school_logo_url ?? value.schoolLogoUrl),
        schoolAddress: asNullableString(value.school_address ?? value.schoolAddress),
        schoolPhone: asNullableString(value.school_phone ?? value.schoolPhone),
        schoolEmail: asNullableString(value.school_email ?? value.schoolEmail),
        schoolWhatsapp: asNullableString(value.school_whatsapp ?? value.schoolWhatsapp),
        schoolTagline: asNullableString(value.school_tagline ?? value.schoolTagline),
        faviconUrl: asNullableString(value.favicon_url ?? value.faviconUrl),
        metaDescription: asNullableString(value.meta_description ?? value.metaDescription),
        metaKeywords: asNullableString(value.meta_keywords ?? value.metaKeywords),
        googleAnalyticsId: asNullableString(value.google_analytics_id ?? value.googleAnalyticsId),
        whatsappList: normalizeWhatsappList(value.whatsapp_list ?? value.whatsappList),
        adminWhatsappId: asNullableString(value.admin_whatsapp_id ?? value.adminWhatsappId),
        mapEmbedHtml: asNullableString(value.map_embed_html ?? value.mapEmbedHtml),
        socialMedia: normalizeSocialMedia(value.social_media ?? value.socialMedia),
        isActive: typeof value.is_active === 'boolean' ? value.is_active : typeof value.isActive === 'boolean' ? value.isActive : true,
    };
};

export const toAdminSiteSettingsPayload = (value: Partial<AdminSiteSettings>): Record<string, unknown> => ({
    ...(value.siteTitle !== undefined ? { siteTitle: value.siteTitle } : {}),
    ...(value.schoolName !== undefined ? { schoolName: value.schoolName } : {}),
    ...(value.schoolLogoUrl !== undefined ? { schoolLogoUrl: value.schoolLogoUrl } : {}),
    ...(value.schoolAddress !== undefined ? { schoolAddress: value.schoolAddress } : {}),
    ...(value.schoolEmail !== undefined ? { schoolEmail: value.schoolEmail } : {}),
    ...(value.schoolWhatsapp !== undefined ? { schoolWhatsapp: value.schoolWhatsapp } : {}),
    ...(value.schoolTagline !== undefined ? { schoolTagline: value.schoolTagline } : {}),
    ...(value.faviconUrl !== undefined ? { faviconUrl: value.faviconUrl } : {}),
    ...(value.metaDescription !== undefined ? { metaDescription: value.metaDescription } : {}),
    ...(value.metaKeywords !== undefined ? { metaKeywords: value.metaKeywords } : {}),
    ...(value.googleAnalyticsId !== undefined ? { googleAnalyticsId: value.googleAnalyticsId } : {}),
    ...(value.whatsappList !== undefined ? { whatsappList: value.whatsappList } : {}),
    ...(value.adminWhatsappId !== undefined ? { adminWhatsappId: value.adminWhatsappId } : {}),
    ...(value.mapEmbedHtml !== undefined ? { mapEmbedHtml: value.mapEmbedHtml } : {}),
    ...(value.socialMedia !== undefined ? { socialMedia: value.socialMedia } : {}),
    ...(value.isActive !== undefined ? { isActive: value.isActive } : {}),
});
