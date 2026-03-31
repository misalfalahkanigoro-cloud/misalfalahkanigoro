'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube, MessageCircle, Twitter, Linkedin, Music2 } from 'lucide-react';
import type { FooterQuickLink, SiteSettings } from '@/lib/types';

type FooterProps = {
    siteSettings?: SiteSettings | null;
    footerLinks?: FooterQuickLink[];
};

const Footer: React.FC<FooterProps> = ({ siteSettings = null, footerLinks = [] }) => {
    const [logoError, setLogoError] = useState(false);

    const logoUrl = siteSettings?.schoolLogoUrl;
    const schoolName = siteSettings?.schoolName;
    const address = siteSettings?.schoolAddress;
    const phone = siteSettings?.schoolPhone;
    const email = siteSettings?.schoolEmail;
    const tagline = siteSettings?.schoolTagline;

    useEffect(() => {
        setLogoError(false);
    }, [logoUrl]);

    const adminWhatsapp = useMemo(() => {
        const list = Array.isArray(siteSettings?.whatsappList) ? siteSettings.whatsappList : [];
        if (!list.length) return null;
        const selected = list.find((item) => item.id === siteSettings?.adminWhatsappId);
        return selected || list[0];
    }, [siteSettings]);

    const renderSocialIcon = (platform: string) => {
        switch (platform.toLowerCase()) {
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

    return (
        <>
            {adminWhatsapp && (
                <a
                    href={`https://wa.me/${adminWhatsapp.number.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform duration-300 flex items-center justify-center hover:shadow-2xl group animate-bounce-subtle"
                    title="Hubungi Admin Sekolah"
                >
                    <MessageCircle size={32} />
                    <span className="absolute right-full mr-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-4 py-2 rounded-xl text-sm font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Chat Admin: {adminWhatsapp.name || adminWhatsapp.label}
                    </span>
                </a>
            )}

            <footer className="bg-gray-900 text-gray-300 pt-12 pb-6 border-t dark:border-gray-800">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                {!logoError && logoUrl && (
                                    <img
                                        src={logoUrl}
                                        alt="Logo"
                                        className="w-12 h-12 md:w-14 md:h-14 object-contain drop-shadow-sm transition-transform"
                                        onError={() => setLogoError(true)}
                                    />
                                )}
                                {(logoError || !logoUrl) && (
                                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white font-bold text-[10px] px-2 text-center leading-tight">
                                        MIS<br />AL-FALAH
                                    </div>
                                )}
                                <h3 className="text-xl font-bold text-white">{schoolName || 'MIS Al-Falah'}</h3>
                            </div>
                            <p className="text-sm leading-relaxed mb-6 text-gray-400 max-w-sm">
                                {tagline || 'Mencetak Generasi Qur\'ani, Berakhlak Mulia, dan Berprestasi.'}
                            </p>
                            <div className="flex gap-3">
                                {siteSettings?.socialMedia && Object.entries(siteSettings.socialMedia).map(([platform, url]) => {
                                    if (!url) return null;
                                    return (
                                        <a key={platform} href={url as string} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all transform hover:-translate-y-1" title={platform}>
                                            {renderSocialIcon(platform)}
                                        </a>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-white font-bold text-lg mb-6 underline decoration-emerald-500/50 underline-offset-8">Tautan Cepat</h4>
                            <ul className="space-y-3 text-sm">
                                {footerLinks.map((link) => (
                                    <li key={link.id}><Link href={link.href} className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                                        <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                                        {link.label}
                                    </Link></li>
                                ))}
                                {!footerLinks.length && (
                                    <li className="text-xs uppercase tracking-[0.2em] text-gray-500">Tautan belum diatur</li>
                                )}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold text-lg mb-6 underline decoration-emerald-500/50 underline-offset-8">Kontak Kami</h4>
                            <ul className="space-y-5 text-sm">
                                <li className="flex items-start gap-4 group">
                                    <div className="p-2.5 rounded-xl bg-gray-800 group-hover:bg-emerald-600/20 group-hover:text-emerald-400 transition-colors">
                                        <MapPin size={18} className="shrink-0" />
                                    </div>
                                    <span className="leading-relaxed">{address || 'Alamat belum tersedia'}</span>
                                </li>
                                <li className="flex items-center gap-4 group">
                                    <div className="p-2.5 rounded-xl bg-gray-800 group-hover:bg-emerald-600/20 group-hover:text-emerald-400 transition-colors">
                                        <Phone size={18} className="shrink-0" />
                                    </div>
                                    <span>{phone || '-'}</span>
                                </li>
                                <li className="flex items-center gap-4 group">
                                    <div className="p-2.5 rounded-xl bg-gray-800 group-hover:bg-emerald-600/20 group-hover:text-emerald-400 transition-colors">
                                        <Mail size={18} className="shrink-0" />
                                    </div>
                                    <span className="truncate">{email || '-'}</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col items-center justify-center gap-4 text-sm text-gray-500 text-center">
                        <p>&copy; {new Date().getFullYear()} {schoolName || 'MIS Al-Falah'}</p>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Footer;
