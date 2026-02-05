'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube, MessageCircle, Twitter, Linkedin, Music2 } from 'lucide-react';
import { api } from '@/lib/api';
import type { ContactPage, ContactWhatsappItem, FooterQuickLink, SiteSettings, SocialMediaLink } from '@/lib/types';
import { CldImage } from 'next-cloudinary';

const Footer: React.FC = () => {
    const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
    const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>([]);
    const [footerLinks, setFooterLinks] = useState<FooterQuickLink[]>([]);
    const [contactPage, setContactPage] = useState<ContactPage | null>(null);
    const [logoError, setLogoError] = useState(false);

    useEffect(() => {
        const fetchFooterData = async () => {
            try {
                const [settingsData, socialData, linksData, contactData] = await Promise.all([
                    api.getSiteSettings(),
                    api.getSocialMediaLinks(),
                    api.getFooterLinks(),
                    api.pages.getContact(),
                ]);

                setSiteSettings((settingsData as SiteSettings) || null);
                setSocialLinks((socialData as SocialMediaLink[]) || []);
                setFooterLinks((linksData as FooterQuickLink[]) || []);
                setContactPage((contactData as ContactPage) || null);
            } catch (error) {
                console.error('Failed to load footer data:', error);
            }
        };

        fetchFooterData();
    }, []);

    const logoUrl = siteSettings?.schoolLogoUrl;
    const schoolName = siteSettings?.schoolName;
    const address = siteSettings?.schoolAddress;
    const phone = siteSettings?.schoolPhone;
    const email = siteSettings?.schoolEmail;
    const tagline = siteSettings?.schoolTagline;

    const logoIsCloudinary = !!logoUrl && logoUrl.includes('res.cloudinary.com') && logoUrl.includes('/upload/');

    useEffect(() => {
        setLogoError(false);
    }, [logoUrl]);

    const adminWhatsapp = useMemo(() => {
        const list: ContactWhatsappItem[] = Array.isArray(contactPage?.whatsappList)
            ? (contactPage?.whatsappList || [])
            : [];
        if (!list.length) return null;
        const selected = list.find((item) => item.id === contactPage?.adminWhatsappId);
        return selected || list[0];
    }, [contactPage]);

    const renderSocialIcon = (platform: SocialMediaLink['platform']) => {
        switch (platform) {
            case 'facebook':
                return <Facebook size={16} />;
            case 'instagram':
                return <Instagram size={16} />;
            case 'youtube':
                return <Youtube size={16} />;
            case 'twitter':
                return <Twitter size={16} />;
            case 'linkedin':
                return <Linkedin size={16} />;
            case 'tiktok':
                return <Music2 size={16} />;
            default:
                return <Facebook size={16} />;
        }
    };

    const systemDown = !siteSettings;

    return (
        <>
            {adminWhatsapp?.url && (
                <a
                    href={adminWhatsapp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform duration-300 flex items-center justify-center hover:shadow-2xl group animate-bounce-subtle"
                    title="Hubungi Admin Sekolah"
                >
                    <MessageCircle size={32} />
                    <span className="absolute right-full mr-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-3 py-1 rounded-lg text-sm font-medium shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Chat Admin
                    </span>
                </a>
            )}

            <footer className="bg-gray-900 text-gray-300 pt-12 pb-6 border-t dark:border-gray-800">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-white p-1.5 rounded-full w-12 h-12 flex items-center justify-center overflow-hidden">
                                    {!logoError && logoIsCloudinary && logoUrl && (
                                        <CldImage
                                            src={logoUrl}
                                            width={48}
                                            height={48}
                                            sizes="48px"
                                            alt="Logo"
                                            className="w-full h-full object-contain"
                                            preserveTransformations
                                            onError={() => setLogoError(true)}
                                        />
                                    )}
                                    {!logoError && !logoIsCloudinary && logoUrl && (
                                        <img
                                            src={logoUrl}
                                            alt="Logo"
                                            className="w-full h-full object-contain"
                                            onError={() => setLogoError(true)}
                                        />
                                    )}
                                    {(logoError || !logoUrl) && (
                                        <span className="text-[9px] text-gray-600 text-center leading-tight">
                                            Sistem<br />Belum<br />Bekerja
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-white">{schoolName || 'Sistem belum bekerja'}</h3>
                            </div>
                            <p className="text-sm leading-relaxed mb-4 text-gray-400">
                                {tagline || 'Sistem belum bekerja'}
                            </p>
                            <div className="flex gap-4">
                                {socialLinks.map((link) => (
                                    <a key={link.id} href={link.url} className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition">
                                        {renderSocialIcon(link.platform)}
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold text-lg mb-4">Tautan Cepat</h4>
                            <ul className="space-y-2 text-sm">
                                {footerLinks.map((link) => (
                                    <li key={link.id}><Link href={link.href} className="hover:text-primary transition">{link.label}</Link></li>
                                ))}
                                {!footerLinks.length && (
                                    <li className="text-xs uppercase tracking-[0.2em] text-gray-500">Sistem belum bekerja</li>
                                )}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold text-lg mb-4">Kontak Kami</h4>
                            <ul className="space-y-4 text-sm">
                                <li className="flex items-start gap-3">
                                    <MapPin size={18} className="text-primary mt-1 shrink-0" />
                                    <span>{address || 'Sistem belum bekerja'}</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Phone size={18} className="text-primary shrink-0" />
                                    <span>{phone || 'Sistem belum bekerja'}</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Mail size={18} className="text-primary shrink-0" />
                                    <span>{email || 'Sistem belum bekerja'}</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} {schoolName || 'Sistem belum bekerja'}. All rights reserved.
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Footer;
