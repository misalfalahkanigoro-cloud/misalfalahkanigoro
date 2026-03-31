import React from 'react';
import { Phone, Mail, Facebook, Instagram, Youtube, Twitter, Linkedin, Music2 } from 'lucide-react';
import type { SiteSettings } from '@/lib/types';

type TopBarProps = {
    siteSettings: SiteSettings | null;
};

export const TopBar: React.FC<TopBarProps> = ({ siteSettings }) => {
    const systemDown = !siteSettings;
    const phone = siteSettings?.schoolPhone;
    const email = siteSettings?.schoolEmail;

    return (
        <div className="bg-primary text-white py-2 text-sm hidden md:block dark:bg-green-900">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <div className="flex space-x-6">
                    {systemDown ? (
                        <span className="text-xs uppercase tracking-[0.3em]">Kontak sekolah belum tersedia</span>
                    ) : (
                        <>
                            <span className="flex items-center gap-2"><Phone size={14} /> {phone}</span>
                            <span className="flex items-center gap-2"><Mail size={14} /> {email}</span>
                        </>
                    )}
                </div>
                <div className="flex space-x-4">
                    {siteSettings?.socialMedia && Object.entries(siteSettings.socialMedia).map(([platform, url]) => {
                        if (!url) return null;
                        return (
                            <a key={platform} href={url as string} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition" title={platform}>
                                {platform === 'facebook' && <Facebook size={16} />}
                                {platform === 'instagram' && <Instagram size={16} />}
                                {platform === 'youtube' && <Youtube size={16} />}
                                {platform === 'twitter' && <Twitter size={16} />}
                                {platform === 'linkedin' && <Linkedin size={16} />}
                                {platform === 'tiktok' && <Music2 size={16} />}
                            </a>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
