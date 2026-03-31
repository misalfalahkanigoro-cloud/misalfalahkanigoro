import React from 'react';
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
    Send,
    ChevronRight,
} from 'lucide-react';
import { getCachedSiteSettings } from '@/lib/cache-service';
import type { SiteSettings, ContactWhatsappItem } from '@/lib/types';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';

const headingFont = Playfair_Display({
    subsets: ['latin'],
    weight: ['500', '600', '700'],
});

const bodyFont = Plus_Jakarta_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
});

const DEFAULT_MAP_EMBED_HTML =
    '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3949.7337151461493!2d112.2221!3d-8.12857!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e78eb3897ca0edb%3A0x7e5b26d2a3d88ee9!2sMIS%20Al-Falah%20Kanigoro!5e0!3m2!1sid!2sid!4v1770228442341!5m2!1sid!2sid" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>';

const renderSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
        case 'facebook':
            return <Facebook size={24} />;
        case 'instagram':
            return <Instagram size={24} />;
        case 'youtube':
            return <Youtube size={24} />;
        case 'twitter':
            return <Twitter size={24} />;
        case 'linkedin':
            return <Linkedin size={24} />;
        case 'tiktok':
            return <Music2 size={24} />;
        default:
            return <Send size={24} />;
    }
};

async function getContactData(): Promise<SiteSettings | null> {
    try {
        const data = await getCachedSiteSettings();
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
            socialMedia: data.social_media as Record<string, string>,
            isActive: Boolean(data.is_active),
        };
    } catch (error) {
        console.error('Error fetching contact data on server:', error);
        return null;
    }
}

const KontakPage = async () => {
    const settings = await getContactData();

    const whatsappList = (settings?.whatsappList || []) as ContactWhatsappItem[];
    const adminWhatsapp = whatsappList.find(item => item.id === settings?.adminWhatsappId) || whatsappList[0];
    const socialMedia = settings?.socialMedia || {};
    const mapEmbedHtml = (settings?.mapEmbedHtml || DEFAULT_MAP_EMBED_HTML).trim();

    return (
        <div className={`${bodyFont.className} min-h-screen bg-gray-50 dark:bg-[#0A0D0B] text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
            {/* Header Section */}
            <section className="relative overflow-hidden bg-emerald-950 pt-20 pb-32">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,_#10b981_0%,_transparent_50%)]"></div>
                    <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,_#34d399_0%,_transparent_50%)]"></div>
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-3 text-emerald-400 font-bold text-[10px] uppercase tracking-[0.4em] mb-4">
                            <span className="h-[2px] w-12 bg-emerald-500"></span>
                            HUBUNGI KAMI
                        </div>
                        <h1 className={`${headingFont.className} text-4xl md:text-6xl text-white font-black tracking-tight leading-tight mb-6`}>
                            Kami Selalu Siap <br />
                            <span className="text-emerald-400">Membantu Anda</span>
                        </h1>
                        <p className="text-emerald-100/70 text-lg md:text-xl leading-relaxed font-medium">
                            Punya pertanyaan atau ingin tahu lebih banyak tentang MIS Al-Falah? Hubungi kami melalui kanal komunikasi yang tersedia.
                        </p>
                    </div>
                </div>
            </section>

            <main className="container mx-auto px-4 py-20 -mt-16 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                    {/* Left Column: Essential Contact */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Interactive Contacts Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl shadow-emerald-900/10 border border-emerald-50 dark:border-white/5 transition-all hover:bg-emerald-950 hover:text-white group">
                                <MapPin className="text-emerald-600 group-hover:text-emerald-400 mb-6 transition-colors" size={40} />
                                <h3 className="text-lg font-black mb-2 tracking-tight">Kunjungi Kantor</h3>
                                <p className="text-gray-500 dark:text-gray-400 group-hover:text-emerald-100/70 leading-relaxed">
                                    {settings?.schoolAddress || 'Jl. Raya Kanigoro, Kec. Kanigoro, Kab. Blitar, Jawa Timur'}
                                </p>
                            </div>
                            
                            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl shadow-emerald-900/10 border border-emerald-50 dark:border-white/5 transition-all hover:bg-emerald-950 hover:text-white group">
                                <Mail className="text-emerald-600 group-hover:text-emerald-400 mb-6 transition-colors" size={40} />
                                <h3 className="text-lg font-black mb-2 tracking-tight">Email Support</h3>
                                <p className="text-gray-500 dark:text-gray-400 group-hover:text-emerald-100/70 leading-relaxed truncate">
                                    {settings?.schoolEmail || 'info@misalfalah.sch.id'}
                                </p>
                            </div>
                        </div>

                        {/* Map Section */}
                        <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-4 shadow-2xl shadow-emerald-900/10 border border-emerald-50 dark:border-white/5 h-[400px] md:h-[500px] overflow-hidden group">
                           <div 
                                className="w-full h-full rounded-[2.5rem] overflow-hidden [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:border-0 grayscale-[50%] group-hover:grayscale-0 transition-all duration-700" 
                                dangerouslySetInnerHTML={{ __html: mapEmbedHtml }} 
                            />
                        </div>
                    </div>

                    {/* Right Column: WhatsApp & Social */}
                    <aside className="lg:col-span-4 space-y-8">
                        {/* WhatsApp List */}
                        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl shadow-emerald-900/10 border border-emerald-50 dark:border-white/5">
                            <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                                <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
                                WhatsApp Layanan
                            </h3>
                            
                            <div className="space-y-4">
                                {whatsappList.length === 0 ? (
                                    <p className="text-sm text-gray-400 italic">Nomor layanan sedang diperbarui.</p>
                                ) : (
                                    whatsappList.map((item) => (
                                        <a 
                                            key={item.id}
                                            href={`https://wa.me/${item.number.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-white/5 border border-emerald-100/50 dark:border-white/5 transition-all hover:bg-emerald-600 hover:border-emerald-500 shadow-sm"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                                    <MessageCircle size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-emerald-700/60 dark:text-emerald-300/40 uppercase tracking-widest group-hover:text-emerald-200 transition-colors">{item.label}</p>
                                                    <p className="text-sm font-bold group-hover:text-white transition-colors">{item.name || item.number}</p>
                                                </div>
                                            </div>
                                            <div className="w-8 h-8 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-200 group-hover:border-white group-hover:text-white transition-colors">
                                                <ChevronRight size={16} />
                                            </div>
                                        </a>
                                    ))
                                )}
                            </div>
                            
                            {adminWhatsapp && (
                                <a 
                                    href={`https://wa.me/${adminWhatsapp.number.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-8 w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                                >
                                    <MessageCircle size={20} />
                                    HUBUNGI ADMIN UTAMA
                                </a>
                            )}
                        </div>

                        {/* Social Media */}
                        <div className="bg-emerald-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                           <div className="relative z-10">
                                <h3 className="text-xl font-black mb-8">Media Sosial</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {Object.entries(socialMedia).map(([platform, url]) => {
                                        if (!url) return null;
                                        return (
                                            <a 
                                                key={platform}
                                                href={url as string}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="aspect-square rounded-2xl bg-white/10 flex items-center justify-center text-white hover:bg-emerald-500 transition-all hover:-translate-y-1"
                                            >
                                                {renderSocialIcon(platform)}
                                            </a>
                                        );
                                    })}
                                </div>
                                <p className="mt-8 text-emerald-200/60 text-xs font-medium leading-relaxed">
                                    Ikuti kami untuk mendapatkan informasi terbaru, berita, dan kegiatan madrasah setiap hari.
                                </p>
                           </div>
                           <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default KontakPage;
