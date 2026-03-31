import React from 'react';
import {
    FileText,
    Newspaper,
    Images,
    Trophy,
    Download as DownloadIcon,
} from 'lucide-react';
import PublicHero from '@/components/PublicHero';
import HomeHeroSection from '@/components/home/HomeHeroSection';
import HomeProgramsSection from '@/components/home/HomeProgramsSection';
import HomeGreetingSection from '@/components/home/HomeGreetingSection';
import HomeContentSection, { type ContentCardItem } from '@/components/home/HomeContentSection';
import HomePpdbCta from '@/components/home/HomePpdbCta';
import { getHomeData } from '@/lib/services/home-service';

const SCHOOL_NAME = 'MIS Al-Falah Kanigoro';

const Home = async () => {
    const data = await getHomeData();
    const { toIso } = data;

    const newsCards: ContentCardItem[] = data.news.rows.map((item) => ({
        id: item.id,
        title: item.title,
        href: `/berita/${item.slug}`,
        coverUrl: data.news.cover[item.id] || null,
        date: toIso(item.published_at || item.created_at),
        excerpt: item.excerpt || item.content?.substring(0, 120),
        badge: 'Berita',
    }));

    const publicationCards: ContentCardItem[] = data.publications.rows.map((item) => ({
        id: item.id,
        title: item.title,
        href: `/publikasi/${item.slug}`,
        coverUrl: data.publications.cover[item.id] || null,
        date: toIso(item.published_at || item.created_at),
        excerpt: item.description || item.content?.substring(0, 120),
        badge: 'Publikasi',
    }));

    const galleryCards: ContentCardItem[] = data.galleries.rows.map((item) => ({
        id: item.id,
        title: item.title,
        href: `/galeri/${item.slug}`,
        coverUrl: data.galleries.cover[item.id] || null,
        date: toIso(item.event_date || item.created_at),
        excerpt: item.description || 'Kumpulan dokumentasi kegiatan madrasah.',
        badge: 'Galeri',
        ctaLabel: 'Lihat Galeri',
    }));

    const achievementCards: ContentCardItem[] = data.achievements.rows.map((item) => ({
        id: item.id,
        title: item.title,
        href: `/prestasi/${item.slug}`,
        coverUrl: data.achievements.cover[item.id] || null,
        date: toIso(item.achieved_at || item.created_at),
        excerpt: item.description || item.event_name || 'Prestasi terbaru madrasah.',
        badge: 'Prestasi',
    }));

    const downloadCards: ContentCardItem[] = data.downloads.rows.map((item) => ({
        id: item.id,
        title: item.title,
        href: '/download',
        coverUrl: data.downloads.cover[item.id] || null,
        date: toIso(item.created_at || item.updated_at),
        excerpt: item.description || 'Dokumen dapat diunduh dari halaman download.',
        badge: 'Download',
        ctaLabel: 'Lihat Download',
    }));

    return (
        <>
            <PublicHero items={data.heroItems} />
            <HomeHeroSection schoolName={SCHOOL_NAME} />
            <HomeProgramsSection schoolName={SCHOOL_NAME} />
            <HomeGreetingSection greeting={data.greeting} schoolName={SCHOOL_NAME} />

            <HomeContentSection
                items={newsCards}
                eyebrow="Kabar Madrasah"
                title="Berita Terbaru"
                description="Informasi terbaru dari kegiatan dan agenda madrasah."
                listHref="/berita"
                listLabel="Lihat Semua Berita"
                emptyText="Belum ada berita terbaru."
                icon={<Newspaper className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            />

            <HomeContentSection
                items={publicationCards}
                eyebrow="Artikel & Informasi"
                title="Publikasi Terbaru"
                description="Artikel, pengumuman, dan publikasi terbaru dari madrasah."
                listHref="/publikasi"
                listLabel="Lihat Semua Publikasi"
                emptyText="Belum ada publikasi terbaru."
                icon={<FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            />

            <HomeContentSection
                items={galleryCards}
                eyebrow="Dokumentasi"
                title="Galeri Terbaru"
                description="Momen kegiatan madrasah dalam dokumentasi foto pilihan."
                listHref="/galeri"
                listLabel="Lihat Semua Galeri"
                emptyText="Belum ada galeri terbaru."
                icon={<Images className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            />

            <HomeContentSection
                items={achievementCards}
                eyebrow="Capaian Madrasah"
                title="Prestasi Terbaru"
                description="Pencapaian siswa dan madrasah dari berbagai ajang."
                listHref="/prestasi"
                listLabel="Lihat Semua Prestasi"
                emptyText="Belum ada prestasi terbaru."
                icon={<Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            />

            <HomeContentSection
                items={downloadCards}
                eyebrow="Dokumen"
                title="Download Terbaru"
                description="Berkas penting yang dapat diakses dan diunduh."
                listHref="/download"
                listLabel="Lihat Semua Download"
                emptyText="Belum ada dokumen download terbaru."
                icon={<DownloadIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            />

            {data.activePpdb && <HomePpdbCta schoolName={SCHOOL_NAME} />}
        </>
    );
};

export default Home;
