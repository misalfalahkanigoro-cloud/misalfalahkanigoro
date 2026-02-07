'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Newspaper,
    Users,
    ClipboardList,
    Settings,
    Shield,
    UserRound,
    Menu,
    Sun,
    Moon,
    LogOut,
    LayoutPanelTop,
    LayoutList,
    ChevronDown,
    ChevronUp,
    BookOpen,
    Landmark,
    History,
    Target,
    MapPin,
    Share2,
    ImagePlus,
    Sparkles,
    PanelsTopLeft,
    Download,
    GraduationCap,
    FileText,
} from 'lucide-react';

type SidebarItem = {
    label: string;
    href?: string;
    icon: React.ElementType;
    children?: Array<{ label: string; href: string; icon?: React.ElementType }>;
};

const SIDEBAR_ITEMS: SidebarItem[] = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    {
        label: 'Profil',
        icon: BookOpen,
        children: [
            { label: 'Sambutan KM', href: '/admin/sambutan', icon: Landmark },
            { label: 'Profil', href: '/admin/profil-sekolah', icon: UserRound },
            { label: 'Sejarah', href: '/admin/sejarah', icon: History },
            { label: 'Visi Misi', href: '/admin/visi-misi', icon: Target },
            { label: 'Kontak', href: '/admin/kontak', icon: MapPin },
            { label: 'Akademik', href: '/admin/akademik', icon: BookOpen },
            { label: 'Kesiswaan', href: '/admin/kesiswaan', icon: Users },
        ],
    },
    {
        label: 'Konten',
        icon: FileText,
        children: [
            { label: 'Hero Slides', href: '/admin/kelola-hero', icon: ImagePlus },
            { label: 'Highlights', href: '/admin/kelola-highlights', icon: Sparkles },
            { label: 'Banner CTA', href: '/admin/kelola-banner', icon: PanelsTopLeft },
            { label: 'Hero Pages', href: '/admin/kelola-hero-pages', icon: ImagePlus },
            { label: 'Publikasi', href: '/admin/publikasi', icon: Newspaper },
            { label: 'Berita', href: '/admin/berita', icon: Newspaper },
            { label: 'Prestasi', href: '/admin/prestasi', icon: Newspaper },
        ],
    },
    { label: 'Guru', href: '/admin/guru', icon: Users },
    { label: 'Kegiatan', href: '/admin/kelola-kegiatan', icon: ImagePlus },
    { label: 'Download', href: '/admin/kelola-download', icon: Download },
    { label: 'Kelulusan', href: '/admin/kelulusan', icon: GraduationCap },
    { label: 'PPDB', href: '/admin/ppdb', icon: ClipboardList },
    { label: 'Kelola Header', href: '/admin/kelola-header', icon: LayoutPanelTop },
    { label: 'Kelola Footer', href: '/admin/kelola-footer', icon: LayoutList },
    { label: 'Sosial Media', href: '/admin/sosial-media', icon: Share2 },
    { label: 'Pengaturan', href: '/admin/pengaturan', icon: Settings },
];

type StoredAdminUser = {
    id: string;
    username: string;
    role: 'admin' | 'superadmin' | string;
    fullName?: string;
};

const SidebarAdmin: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [user, setUser] = useState<StoredAdminUser | null>(null);
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const stored = localStorage.getItem('adminUser');
        if (!stored) {
            router.replace('/login');
            return;
        }
        const parsed = JSON.parse(stored) as StoredAdminUser;
        if (!['admin', 'superadmin'].includes(parsed.role)) {
            router.replace('/login');
            return;
        }
        setUser(parsed);
    }, [router]);

    useEffect(() => {
        const syncTheme = () => {
            const storedTheme = localStorage.getItem('theme');
            if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                setIsDark(true);
                document.documentElement.classList.add('dark');
            } else {
                setIsDark(false);
                document.documentElement.classList.remove('dark');
            }
        };

        syncTheme();
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const handleMedia = () => syncTheme();
        const handleStorage = (event: StorageEvent) => {
            if (event.key === 'theme') {
                syncTheme();
            }
        };

        media.addEventListener('change', handleMedia);
        window.addEventListener('storage', handleStorage);
        return () => {
            media.removeEventListener('change', handleMedia);
            window.removeEventListener('storage', handleStorage);
        };
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch {
            // ignore logout failures
        }
        localStorage.removeItem('adminUser');
        router.replace('/login');
    };

    const displayName = useMemo(() => {
        if (!user) return 'ADMIN';
        return (user.fullName || user.username || 'ADMIN').toUpperCase();
    }, [user]);

    const displayRole = useMemo(() => {
        if (!user) return 'ADMIN';
        return (user.role || 'admin').toString().toUpperCase();
    }, [user]);

    const showKontrolAkun = user?.role === 'superadmin';

    const isGroupActive = (item: SidebarItem) =>
        item.children?.some((child) => child.href === pathname) ?? false;

    const SidebarContent = (
        <div className="flex h-full flex-col gap-8 p-6 overflow-y-auto admin-scrollbar">
            <div>
                <Link
                    href="/admin/profile"
                    className="flex items-center gap-4 rounded-2xl border border-emerald-900/10 bg-white/70 px-4 py-4 text-gray-800 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                        <UserRound size={24} />
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-200">{displayRole}</p>
                        <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">{displayName}</p>
                    </div>
                </Link>
            </div>

            <nav className="flex-1 space-y-2">
                {SIDEBAR_ITEMS.map((item) => {
                    const active = item.href ? pathname === item.href : isGroupActive(item);
                    const Icon = item.icon;

                    if (item.children?.length) {
                        const isOpen = openGroups[item.label] ?? active;
                        return (
                            <div key={item.label} className="space-y-1">
                                <button
                                    onClick={() =>
                                        setOpenGroups((prev) => ({
                                            ...prev,
                                            [item.label]: !isOpen,
                                        }))
                                    }
                                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition ${active
                                            ? 'bg-emerald-500/20 text-emerald-900 dark:text-white'
                                            : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-900 dark:text-emerald-100/80 dark:hover:bg-white/5 dark:hover:text-white'
                                        }`}
                                >
                                    <span className="flex items-center gap-3">
                                        <Icon size={18} />
                                        {item.label}
                                    </span>
                                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                                {isOpen && (
                                    <div className="space-y-1 pl-4">
                                        {item.children.map((child) => {
                                            const childActive = pathname === child.href;
                                            const ChildIcon = child.icon;
                                            return (
                                                <Link
                                                    key={child.href}
                                                    href={child.href}
                                                    className={`flex items-center gap-3 rounded-xl px-4 py-2 text-xs font-medium transition ${childActive
                                                            ? 'bg-emerald-500/20 text-emerald-900 dark:text-white'
                                                            : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-900 dark:text-emerald-100/70 dark:hover:bg-white/5 dark:hover:text-white'
                                                        }`}
                                                >
                                                    {ChildIcon ? <ChildIcon size={14} /> : null}
                                                    {child.label}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href as string}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${active
                                    ? 'bg-emerald-500/20 text-emerald-900 dark:text-white'
                                    : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-900 dark:text-emerald-100/80 dark:hover:bg-white/5 dark:hover:text-white'
                                }`}
                        >
                            <Icon size={18} />
                            {item.label}
                        </Link>
                    );
                })}

                {showKontrolAkun && (
                    <Link
                        href="/admin/kontrolAkun"
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${pathname === '/admin/kontrolAkun'
                                ? 'bg-amber-300/30 text-amber-900 dark:text-white'
                                : 'text-amber-700 hover:bg-amber-50 hover:text-amber-900 dark:text-amber-100/90 dark:hover:bg-white/5 dark:hover:text-white'
                            }`}
                    >
                        <Shield size={18} />
                        Kontrol Akun
                    </Link>
                )}
            </nav>

            <div className="space-y-3">
                <button
                    onClick={toggleTheme}
                    className="flex w-full items-center justify-between rounded-xl border border-emerald-900/10 bg-white/70 px-4 py-3 text-sm font-medium text-gray-800 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
                >
                    <span>Mode Gelap</span>
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-between rounded-xl border border-emerald-900/10 bg-white/70 px-4 py-3 text-sm font-medium text-gray-800 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
                >
                    <span>Logout</span>
                    <LogOut size={18} />
                </button>
            </div>
        </div>
    );

    return (
        <>
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-emerald-900/10 bg-white/90 text-gray-900 shadow-lg backdrop-blur lg:flex dark:border-white/10 dark:bg-[#0B0F0C] dark:text-white">
                {SidebarContent}
            </aside>

            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-6 left-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg lg:hidden"
                aria-label="Open sidebar"
            >
                <Menu size={20} />
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    <div className="flex-1 bg-black/60" onClick={() => setOpen(false)} />
                    <aside className="relative h-full w-72 bg-white/95 text-gray-900 shadow-2xl dark:bg-[#0B0F0C] dark:text-white">
                        {SidebarContent}
                    </aside>
                </div>
            )}
        </>
    );
};

export default SidebarAdmin;
