import React from 'react';
import prisma from '@/lib/prisma';
import type { ProfilePage } from '@/lib/types';
import { IdCard, BadgeCheck, GraduationCap, Building2, MapPin, School, Video } from 'lucide-react';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';

const headingFont = Playfair_Display({
    subsets: ['latin'],
    weight: ['500', '600', '700'],
});

const bodyFont = Plus_Jakarta_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
});

async function getProfileData(): Promise<ProfilePage | null> {
    try {
        const page = await prisma.profile_page.findUnique({
            where: { id: 'main' },
        });
        return page as ProfilePage | null;
    } catch (error) {
        console.error('Error fetching profile on server:', error);
        return null;
    }
}

const ProfilPage = async () => {
    const profile = await getProfileData();

    const fallback: ProfilePage = {
        id: 'main',
        descriptionHtml: '',
        descriptionText: '',
        descriptionJson: null,
        videoUrl: null,
        schoolName: 'MIS AL-FALAH',
        npsn: '-',
        schoolAddress: '-',
        village: '-',
        district: '-',
        city: '-',
        province: '-',
        schoolStatus: '-',
        educationForm: '-',
        educationLevel: '-',
    };

    const view = profile ?? fallback;

    const identityRows = [
        { label: 'Nama Madrasah', value: view.schoolName },
        { label: 'NPSN', value: view.npsn },
        { label: 'Alamat', value: view.schoolAddress },
        { label: 'Desa/Kelurahan', value: view.village },
        { label: 'Kecamatan', value: view.district },
        { label: 'Kota/Kabupaten', value: view.city },
        { label: 'Provinsi', value: view.province },
        { label: 'Status Sekolah', value: view.schoolStatus },
        { label: 'Bentuk Pendidikan', value: view.educationForm },
        { label: 'Jenjang Pendidikan', value: view.educationLevel },
    ].filter((row) => row.value && row.value !== '-');

    const highlightCards = [
        { label: 'NPSN', value: view.npsn, icon: IdCard, color: 'emerald' },
        { label: 'STATUS', value: view.schoolStatus, icon: BadgeCheck, color: 'blue' },
        { label: 'BENTUK', value: view.educationForm, icon: Building2, color: 'amber' },
        { label: 'JENJANG', value: view.educationLevel, icon: GraduationCap, color: 'purple' },
    ];

    return (
        <div className={`${bodyFont.className} min-h-screen bg-white dark:bg-[#0A0D0B] text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
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
                            PROFIL LEMBAGA
                        </div>
                        <h1 className={`${headingFont.className} text-4xl md:text-6xl text-white font-black tracking-tight leading-tight mb-6`}>
                            Mengenal Lebih Dekat <br />
                            <span className="text-emerald-400">{view.schoolName}</span>
                        </h1>
                        <p className="text-emerald-100/70 text-lg md:text-xl leading-relaxed font-medium">
                            Dedikasi kami dalam membentuk generasi Qur&apos;ani yang unggul, berprestasi, dan berakhlakul karimah sejak dini.
                        </p>
                    </div>
                </div>
            </section>

            {/* Highlights Grid */}
            <section className="container mx-auto px-4 -mt-16 relative z-20">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {highlightCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div key={card.label} className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-[2rem] shadow-2xl shadow-emerald-900/10 dark:shadow-black/50 border border-emerald-100 dark:border-white/5 transition-transform hover:-translate-y-2 duration-300">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400`}>
                                    <Icon size={24} />
                                </div>
                                <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{card.label}</h3>
                                <p className="text-lg font-bold text-gray-900 dark:text-white truncate">{card.value}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            <main className="container mx-auto px-4 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 md:gap-20">
                    {/* Left: Description & Video */}
                    <div className="space-y-12 md:space-y-20">
                        {/* Description */}
                        <article>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400">
                                    <School size={24} />
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black tracking-tight">Tentang Madrasah</h2>
                            </div>
                            
                            <div className="bg-emerald-50/50 dark:bg-emerald-900/5 rounded-[3rem] p-8 md:p-12 border border-emerald-100 dark:border-white/5">
                                {view.descriptionHtml ? (
                                    <div
                                        className="prose prose-emerald dark:prose-invert max-w-none 
                                        prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:text-lg prose-p:leading-relaxed
                                        prose-headings:font-bold prose-headings:tracking-tight
                                        prose-strong:text-emerald-800 dark:prose-strong:text-emerald-400"
                                        dangerouslySetInnerHTML={{ __html: view.descriptionHtml }}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                            <School size={32} />
                                        </div>
                                        <p className="text-sm font-medium">Informasi deskripsi belum tersedia secara lengkap.</p>
                                    </div>
                                )}
                            </div>
                        </article>

                        {/* Video Section */}
                        {view.videoUrl && (
                            <section>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-2xl text-red-600 dark:text-red-400">
                                        <Video size={24} />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black tracking-tight">Video Profil</h2>
                                </div>
                                <div className="relative group rounded-[3rem] overflow-hidden bg-black shadow-2xl shadow-emerald-900/20 aspect-video ring-8 ring-emerald-50 dark:ring-white/5">
                                    <video src={view.videoUrl} controls className="w-full h-full object-cover" />
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right: Identity Sidebar */}
                    <aside>
                        <div className="sticky top-24 space-y-8">
                            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl shadow-emerald-900/10 border border-emerald-100 dark:border-white/10 relative overflow-hidden">
                                <MapPin className="absolute -top-6 -right-6 text-emerald-500/10" size={120} />
                                <h3 className="text-xl font-black mb-8 relative z-10 flex items-center gap-3">
                                    <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
                                    Identitas Resmi
                                </h3>
                                <div className="space-y-4 relative z-10">
                                    {identityRows.map((item) => (
                                        <div key={item.label} className="group p-4 rounded-2xl transition-colors hover:bg-emerald-50 dark:hover:bg-white/5">
                                            <span className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{item.label}</span>
                                            <span className="block text-sm font-bold text-gray-800 dark:text-gray-200">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <h4 className="text-xs font-black text-emerald-200 uppercase tracking-widest mb-4">LOKASI KAMI</h4>
                                    <p className="text-lg font-bold mb-2">{view.schoolAddress}</p>
                                    <p className="text-emerald-100/70 text-sm leading-relaxed">
                                        {view.village ? `${view.village}, ` : ''}{view.district} <br />
                                        {view.city}, {view.province}
                                    </p>
                                </div>
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default ProfilPage;
