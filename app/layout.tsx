import type { Metadata } from 'next';
import { Fraunces, Sora } from 'next/font/google';
import './globals.css';

const sora = Sora({
    subsets: ['latin'],
    variable: '--font-sora',
});

const fraunces = Fraunces({
    subsets: ['latin'],
    variable: '--font-fraunces',
});

export const metadata: Metadata = {
    title: 'MIS Al-Falah Kanigoro',
    description: 'Website Resmi MIS Al-Falah Kanigoro - Madrasah Unggul Berakhlak Mulia',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="id">
            <body className={`${sora.variable} ${fraunces.variable} font-sans`}>{children}</body>
        </html>
    );
}
