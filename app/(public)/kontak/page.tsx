'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
    Facebook,
    Instagram,
    Linkedin,
    Mail,
    MapPin,
    MessageCircle,
    Music2,
    Phone,
    Twitter,
    Youtube,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { ContactPage, ContactWhatsappItem, SocialMediaLink } from '@/lib/types';

const DEFAULT_MAP_EMBED_HTML =
    '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3949.7337151461493!2d112.2221!3d-8.12857!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e78eb3897ca0edb%3A0x7e5b26d2a3d88ee9!2sMIS%20Al-Falah%20Kanigoro!5e0!3m2!1sid!2sid!4v1770228442341!5m2!1sid!2sid" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>';

const renderSocialIcon = (platform: SocialMediaLink['platform']) => {
    switch (platform) {
        case 'facebook':
            return <Facebook size={18} />;
        case 'instagram':
            return <Instagram size={18} />;
        case 'youtube':
            return <Youtube size={18} />;
        case 'twitter':
            return <Twitter size={18} />;
        case 'linkedin':
            return <Linkedin size={18} />;
        case 'tiktok':
            return <Music2 size={18} />;
        default:
            return <Facebook size={18} />;
    }
};

const Kontak: React.FC = () => {
    const [page, setPage] = useState<ContactPage | null>(null);
    const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pageData, socialData] = await Promise.all([
                    api.pages.getContact(),
                    api.getSocialMediaLinks(),
                ]);
                setPage(pageData as ContactPage);
                setSocialLinks((socialData as SocialMediaLink[]) || []);
            } catch (err) {
                console.error('Error fetching contact page:', err);
                setError('Gagal memuat kontak');
            }
        };

        fetchData();
    }, []);

    const fallback: ContactPage = {
        id: 'main',
        address: '',
        phone: null,
        email: '',
        whatsappList: [],
        adminWhatsappId: null,
        mapEmbedHtml: DEFAULT_MAP_EMBED_HTML,
    };

    const view = page ?? fallback;
    const whatsappList: ContactWhatsappItem[] = Array.isArray(view.whatsappList)
        ? view.whatsappList
        : [];

    const adminWhatsapp = useMemo(() => {
        if (!whatsappList.length) return null;
        const selected = whatsappList.find((item) => item.id === view.adminWhatsappId);
        return selected || whatsappList[0];
    }, [whatsappList, view.adminWhatsappId]);

    const mapEmbedHtml = (view.mapEmbedHtml || DEFAULT_MAP_EMBED_HTML).trim();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 transition-colors duration-200">
            <section className="relative overflow-hidden">
                <div className="absolute -top-16 right-12 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-500/10" />
                <div className="absolute top-20 -left-16 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl dark:bg-amber-500/10" />
                <div className="container mx-auto px-4 py-14">
                    <div className="max-w-3xl">
                        <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-200">Kontak</p>
                        <h1 className="mt-3 text-4xl font-semibold text-emerald-900 dark:text-white">Hubungi Kami</h1>
                        <p className="mt-4 text-lg text-emerald-900/70 dark:text-emerald-100/70">
                            {error ? error : 'Kami siap membantu Anda. Silakan hubungi kontak di bawah ini.'}
                        </p>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 py-12 space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-8">
                    <div className="space-y-6">
                        <div className="rounded-3xl border border-emerald-100 bg-white/90 p-8 shadow-lg shadow-emerald-100/40 backdrop-blur dark:border-white/10 dark:bg-white/5">
                            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-200">
                                <MapPin size={18} />
                                <span className="text-xs font-semibold uppercase tracking-[0.3em]">Alamat</span>
                            </div>
                            <p className="mt-4 text-gray-600 dark:text-gray-300">{view.address || 'Alamat belum tersedia.'}</p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-lg shadow-emerald-100/40 backdrop-blur dark:border-white/10 dark:bg-white/5">
                                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-200">
                                    <Mail size={18} />
                                    <span className="text-xs font-semibold uppercase tracking-[0.3em]">Email</span>
                                </div>
                                <p className="mt-4 text-gray-600 dark:text-gray-300">{view.email || '-'}</p>
                            </div>
                            <div className="rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-lg shadow-emerald-100/40 backdrop-blur dark:border-white/10 dark:bg-white/5">
                                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-200">
                                    <Phone size={18} />
                                    <span className="text-xs font-semibold uppercase tracking-[0.3em]">Telepon</span>
                                </div>
                                <p className="mt-4 text-gray-600 dark:text-gray-300">{view.phone || '-'}</p>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-emerald-100 bg-white/90 p-8 shadow-lg shadow-emerald-100/40 backdrop-blur dark:border-white/10 dark:bg-white/5">
                            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-200">
                                <MessageCircle size={18} />
                                <span className="text-xs font-semibold uppercase tracking-[0.3em]">WhatsApp</span>
                            </div>
                            <div className="mt-6 space-y-3">
                                {whatsappList.length === 0 && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada nomor WhatsApp.</p>
                                )}
                                {whatsappList.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-white/5"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-emerald-900 dark:text-white">{item.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.url}</p>
                                        </div>
                                        <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="rounded-xl border border-emerald-600 px-4 py-2 text-xs font-semibold text-emerald-600"
                                        >
                                            Chat
                                        </a>
                                    </div>
                                ))}
                            </div>

                            {adminWhatsapp && (
                                <a
                                    href={adminWhatsapp.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-100/40"
                                >
                                    <MessageCircle size={20} />
                                    Chat Admin: {adminWhatsapp.name}
                                </a>
                            )}
                        </div>
                    </div>

                    <aside className="space-y-6">
                        <div className="rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-lg shadow-emerald-100/40 backdrop-blur dark:border-white/10 dark:bg-white/5">
                            <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-200">Sosial Media</p>
                            <div className="mt-4 flex flex-wrap gap-3">
                                {socialLinks.map((link) => (
                                    <a
                                        key={link.id}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-100 bg-white text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50 dark:border-white/10 dark:bg-white/5 dark:text-emerald-200"
                                    >
                                        {renderSocialIcon(link.platform)}
                                    </a>
                                ))}
                                {!socialLinks.length && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada sosial media.</p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-emerald-100 bg-white/90 p-2 shadow-lg shadow-emerald-100/40 backdrop-blur dark:border-white/10 dark:bg-white/5 h-[320px]">
                            <div
                                className="h-full w-full [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:rounded-2xl [&_iframe]:border-0"
                                dangerouslySetInnerHTML={{ __html: mapEmbedHtml }}
                            />
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default Kontak;
