import React from 'react';
import {
    LayoutDashboard,
    Newspaper,
    Users,
    ClipboardList,
    Settings,
    BookOpen,
    Landmark,
    History,
    Target,
    MapPin,
    Share2,
    ImagePlus,
    LayoutPanelTop,
    LayoutList,
    Download,
    GraduationCap,
    FileText,
    HardDrive,
    UserRound,
    type LucideIcon,
} from 'lucide-react';

export type SidebarItem = {
    label: string;
    href?: string;
    icon: LucideIcon;
    children?: Array<{ label: string; href: string; icon?: LucideIcon }>;
};

export const SIDEBAR_ITEMS: SidebarItem[] = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    {
        label: 'Profil',
        icon: BookOpen,
        children: [
            { label: 'Sambutan KM', href: '/admin/sambutan', icon: Landmark },
            { label: 'Profil', href: '/admin/profil-sekolah', icon: UserRound },
            { label: 'Sejarah', href: '/admin/sejarah', icon: History },
            { label: 'Visi Misi', href: '/admin/visi-misi', icon: Target },
            { label: 'Kontak & WA', href: '/admin/pengaturan?tab=whatsapp', icon: MapPin },
        ],
    },
    {
        label: 'Akademik',
        icon: BookOpen,
        children: [
            { label: 'Akademik', href: '/admin/akademik', icon: BookOpen },
            { label: 'Kesiswaan', href: '/admin/kesiswaan', icon: Users },
            { label: 'Guru', href: '/admin/guru', icon: Users },
        ],
    },
    {
        label: 'Informasi',
        icon: FileText,
        children: [
            { label: 'Berita', href: '/admin/berita', icon: Newspaper },
            { label: 'Publikasi', href: '/admin/publikasi', icon: Newspaper },
            { label: 'Galeri', href: '/admin/galeri', icon: ImagePlus },
            { label: 'Prestasi', href: '/admin/prestasi', icon: Newspaper },
            { label: 'Kelulusan', href: '/admin/kelulusan', icon: GraduationCap },
            { label: 'Download', href: '/admin/download', icon: Download },
        ],
    },
    { label: 'PPDB', href: '/admin/ppdb', icon: ClipboardList },
    {
        label: 'Tampilan',
        icon: LayoutPanelTop,
        children: [
            { label: 'Menu Navigasi', href: '/admin/kelola-header', icon: LayoutPanelTop },
            { label: 'Tautan Footer', href: '/admin/kelola-footer', icon: LayoutList },
            { label: 'Sosial Media', href: '/admin/pengaturan?tab=social', icon: Share2 },
        ]
    },
    { label: 'Pengaturan Situs', href: '/admin/pengaturan', icon: Settings },
    { label: 'Penyimpanan', href: '/admin/penyimpanan', icon: HardDrive },
];
