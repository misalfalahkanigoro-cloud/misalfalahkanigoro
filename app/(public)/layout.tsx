import React from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import prisma from '@/lib/prisma';
import type { FooterQuickLink, NavigationMenuItem, SiteSettings } from '@/lib/types';
import { getCachedNavigationMenu, getCachedSiteSettings } from '@/lib/cache-service';

const mapSiteSettings = (data: any): SiteSettings | null => {
    if (!data) return null;
    return {
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
};

const mapNavigationMenu = (rows: any[]): NavigationMenuItem[] =>
    rows.map((row: any) => ({
        id: row.id,
        label: row.label,
        href: row.href,
        parentId: row.parent_id,
        displayOrder: row.display_order ?? 0,
        isActive: Boolean(row.is_active),
        icon: row.icon ?? null,
        children: (row.other_navigation_menu || []).map((sub: any) => ({
            id: sub.id,
            label: sub.label,
            href: sub.href,
            parentId: sub.parent_id,
            displayOrder: sub.display_order ?? 0,
            isActive: Boolean(sub.is_active),
            icon: sub.icon ?? null,
        })),
    }));

const mapFooterLinks = (rows: any[]): FooterQuickLink[] =>
    rows.map((row: any) => ({
        id: row.id,
        label: row.label,
        href: row.href,
        displayOrder: row.display_order ?? 0,
        isActive: Boolean(row.is_active),
    }));

const PublicLayout = async ({ children }: { children: React.ReactNode }) => {
    const [siteSettingsRaw, menuRaw, footerRaw] = await Promise.all([
        getCachedSiteSettings(),
        getCachedNavigationMenu(),
        prisma.footer_quick_links.findMany({
            where: { is_active: true },
            orderBy: { display_order: 'asc' },
        }),
    ]);

    const siteSettings = mapSiteSettings(siteSettingsRaw);
    const menuItems = mapNavigationMenu(menuRaw || []);
    const footerLinks = mapFooterLinks(footerRaw || []);

    return (
        <div className="flex flex-col min-h-screen font-sans text-gray-800 dark:text-gray-100 dark:bg-gray-900 transition-colors duration-200 relative">
            <Header menuItems={menuItems} siteSettings={siteSettings} />
            <main className="flex-grow bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
                {children}
            </main>
            <Footer siteSettings={siteSettings} footerLinks={footerLinks} />
        </div>
    );
};

export default PublicLayout;
