import type { Metadata } from 'next';
import { Fraunces, Sora } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

const sora = Sora({
    subsets: ['latin'],
    variable: '--font-sora',
});

const fraunces = Fraunces({
    subsets: ['latin'],
    variable: '--font-fraunces',
});

import { getCachedSiteSettings } from '@/lib/cache-service';

export async function generateMetadata(): Promise<Metadata> {
    const defaultTitle = 'Program web RWM Company';
    const defaultDesc = 'Website Resmi Madrasah - Unggul Berakhlak Mulia';

    try {
        const data = await getCachedSiteSettings();

        if (!data) {
            return {
                title: defaultTitle,
                description: defaultDesc,
            };
        }

        return {
            title: data.site_title || data.school_name || defaultTitle,
            description: data.meta_description || defaultDesc,
            keywords: data.meta_keywords || undefined,
            icons: data.favicon_url ? [{ rel: 'icon', url: data.favicon_url }] : undefined
        };
    } catch (err) {
        console.error('Metadata generation error:', err);
        return {
            title: defaultTitle,
            description: defaultDesc,
        };
    }
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="id" suppressHydrationWarning>
            <body
                className={`${sora.variable} ${fraunces.variable} font-sans`}
                suppressHydrationWarning
            >
                {children}
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    );
}
