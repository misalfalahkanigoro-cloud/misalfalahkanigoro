import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

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
            <body className={inter.className}>{children}</body>
        </html>
    );
}
