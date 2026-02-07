'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Menu,
    X,
    Phone,
    Mail,
    Facebook,
    Instagram,
    Youtube,
    Twitter,
    Linkedin,
    Music2,
    Sun,
    Moon,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { NavigationMenuItem, SocialMediaLink, SiteSettings } from '@/lib/types';
import { CldImage } from 'next-cloudinary';

type NavItem = { label: string; href: string };

type NavEntry =
    | { type: 'link'; label: string; href: string }
    | { type: 'dropdown'; label: string; items: NavItem[] };

const isCloudinaryUrl = (src?: string | null) =>
    !!src && src.includes('res.cloudinary.com') && src.includes('/upload/');

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [openGroup, setOpenGroup] = useState<string | null>(null);
    const [navEntries, setNavEntries] = useState<NavEntry[]>([]);
    const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>([]);
    const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
    const [logoError, setLogoError] = useState(false);
    const pathname = usePathname();
    const headerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    useEffect(() => {
        const fetchHeaderData = async () => {
            try {
                const [menuData, socialData, settingsData] = await Promise.all([
                    api.getNavigationMenu(),
                    api.getSocialMediaLinks(),
                    api.getSiteSettings(),
                ]);

                const menuItems = (menuData as NavigationMenuItem[]) || [];
                if (menuItems.length) {
                    const entries = menuItems
                        .slice()
                        .sort((a, b) => a.displayOrder - b.displayOrder)
                        .map((item) => {
                            const children = (item.children || [])
                                .slice()
                                .sort((a, b) => a.displayOrder - b.displayOrder)
                                .filter((child) => !!child.href)
                                .map((child) => ({
                                    label: child.label,
                                    href: child.href || '/',
                                }));

                            if (children.length) {
                                return {
                                    type: 'dropdown' as const,
                                    label: item.label,
                                    items: children,
                                };
                            }

                            if (item.href) {
                                return {
                                    type: 'link' as const,
                                    label: item.label,
                                    href: item.href,
                                };
                            }

                            return null;
                        })
                        .filter((entry): entry is NavEntry => !!entry)
                        .filter((entry) => entry.label !== 'Beranda');

                    setNavEntries(entries);
                } else {
                    setNavEntries([]);
                }

                setSocialLinks((socialData as SocialMediaLink[]) || []);
                setSiteSettings((settingsData as SiteSettings) || null);
            } catch (error) {
                console.error('Failed to load header data:', error);
            }
        };

        fetchHeaderData();
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

    useEffect(() => {
        setIsMenuOpen(false);
        setOpenGroup(null);
    }, [pathname]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node | null;
            if (headerRef.current && target && !headerRef.current.contains(target)) {
                setOpenGroup(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const activeGroup = useMemo(() => {
        return navEntries.find(
            (entry) => entry.type === 'dropdown' && entry.items.some((item) => pathname === item.href)
        ) as NavEntry | undefined;
    }, [pathname, navEntries]);

    const isHomeActive = pathname === '/';

    const logoUrl = siteSettings?.schoolLogoUrl;
    const schoolName = siteSettings?.schoolName;
    const phone = siteSettings?.schoolPhone;
    const email = siteSettings?.schoolEmail;
    const logoIsCloudinary = isCloudinaryUrl(logoUrl);
    const systemDown = !siteSettings;

    useEffect(() => {
        setLogoError(false);
    }, [logoUrl]);

    return (
        <>
            <div className="bg-primary text-white py-2 text-sm hidden md:block dark:bg-green-900">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="flex space-x-6">
                        {systemDown ? (
                            <span className="text-xs uppercase tracking-[0.3em]">Sistem belum bekerja</span>
                        ) : (
                            <>
                                <span className="flex items-center gap-2"><Phone size={14} /> {phone}</span>
                                <span className="flex items-center gap-2"><Mail size={14} /> {email}</span>
                            </>
                        )}
                    </div>
                    <div className="flex space-x-4">
                        {socialLinks.map((link) => (
                            <a key={link.id} href={link.url} className="hover:text-accent transition">
                                {link.platform === 'facebook' && <Facebook size={16} />}
                                {link.platform === 'instagram' && <Instagram size={16} />}
                                {link.platform === 'youtube' && <Youtube size={16} />}
                                {link.platform === 'twitter' && <Twitter size={16} />}
                                {link.platform === 'linkedin' && <Linkedin size={16} />}
                                {link.platform === 'tiktok' && <Music2 size={16} />}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <header ref={headerRef} className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md transition-colors duration-200">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex justify-between items-center">
                        <Link href="/" className="flex items-center gap-3 group">
                            {!logoError && logoIsCloudinary && logoUrl && (
                                <CldImage
                                    src={logoUrl}
                                    width={56}
                                    height={56}
                                    sizes="56px"
                                    alt={`Logo ${schoolName || ''}`}
                                    className="w-12 h-12 md:w-14 md:h-14 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
                                    preserveTransformations
                                    onError={() => setLogoError(true)}
                                />
                            )}
                            {!logoError && !logoIsCloudinary && logoUrl && (
                                <img
                                    src={logoUrl}
                                    alt={`Logo ${schoolName || ''}`}
                                    className="w-12 h-12 md:w-14 md:h-14 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
                                    onError={() => setLogoError(true)}
                                />
                            )}
                            {(logoError || !logoUrl) && (
                                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-[10px] px-2 text-center leading-tight">
                                    Sistem<br />Belum<br />Bekerja
                                </div>
                            )}

                            <div className="leading-tight">
                                <h1 className="text-lg md:text-xl font-bold text-primary dark:text-green-400">
                                    {schoolName || 'Sistem belum bekerja'}
                                </h1>
                            </div>
                        </Link>

                        <nav className="hidden lg:flex items-center space-x-2">
                            <Link
                                href="/"
                                className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${isHomeActive
                                        ? 'text-primary bg-green-50 dark:bg-green-900/30 dark:text-green-400'
                                        : 'text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-green-400'
                                    }`}
                            >
                                Beranda
                            </Link>
                            {navEntries.map((entry) => {
                                if (entry.type === 'link') {
                                    const isActive = pathname === entry.href;
                                    return (
                                        <Link
                                            key={`link-${entry.label}`}
                                            href={entry.href}
                                            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${isActive
                                                    ? 'text-primary bg-green-50 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-green-400'
                                                }`}
                                        >
                                            {entry.label}
                                        </Link>
                                    );
                                }

                                const isActive = activeGroup?.label === entry.label;
                                const isOpen = openGroup === entry.label;
                                return (
                                    <div key={`dropdown-${entry.label}`} className="relative group">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setOpenGroup((prev) => (prev === entry.label ? null : entry.label))
                                            }
                                            aria-expanded={isOpen}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${isActive
                                                    ? 'text-primary bg-green-50 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-green-400'
                                                }`}
                                        >
                                            {entry.label}
                                            <ChevronDown size={16} />
                                        </button>
                                        <div
                                            className={`absolute left-0 mt-2 w-64 rounded-xl border border-gray-100 bg-white shadow-xl transition-all dark:border-gray-800 dark:bg-gray-900 ${isOpen
                                                    ? 'opacity-100 pointer-events-auto translate-y-0'
                                                    : 'opacity-0 pointer-events-none translate-y-2'
                                                } group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0`}
                                        >
                                            <div className="py-2">
                                                {entry.items.map((item, idx) => (
                                                    <Link
                                                        key={`${item.href}-${item.label}-${idx}`}
                                                        href={item.href}
                                                        className={`block px-4 py-2 text-sm transition ${pathname === item.href
                                                                ? 'bg-green-50 text-primary dark:bg-green-900/30 dark:text-green-400'
                                                                : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                                                            }`}
                                                    >
                                                        {item.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {!navEntries.length && (
                                <span className="text-xs uppercase tracking-[0.25em] text-gray-400 dark:text-gray-500">
                                    Sistem belum bekerja
                                </span>
                            )}

                            <button
                                onClick={toggleTheme}
                                className="ml-1 p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                                aria-label="Toggle Dark Mode"
                            >
                                {isDark ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                        </nav>

                        <div className="lg:hidden flex items-center gap-2">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                {isDark ? <Sun size={24} /> : <Moon size={24} />}
                            </button>
                            <button
                                className="text-gray-700 dark:text-gray-200 p-2"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                aria-label="Toggle Menu"
                            >
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {isMenuOpen && (
                    <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-lg absolute w-full left-0">
                        <div className="flex flex-col p-4 space-y-3">
                            <Link
                                href="/"
                                className={`px-4 py-3 rounded-lg text-sm font-semibold ${isHomeActive
                                        ? 'bg-green-50 text-primary dark:bg-green-900/30 dark:text-green-400'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                Beranda
                            </Link>
                            {navEntries.map((entry) => {
                                if (entry.type === 'link') {
                                    const isActive = pathname === entry.href;
                                    return (
                                        <Link
                                            key={`mobile-link-${entry.label}`}
                                            href={entry.href}
                                            className={`px-4 py-3 rounded-lg text-sm font-semibold ${isActive
                                                    ? 'bg-green-50 text-primary dark:bg-green-900/30 dark:text-green-400'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            {entry.label}
                                        </Link>
                                    );
                                }

                                return (
                                    <div key={`mobile-dropdown-${entry.label}`} className="rounded-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
                                        <button
                                            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-800"
                                            onClick={() => setOpenGroup(openGroup === entry.label ? null : entry.label)}
                                        >
                                            {entry.label}
                                            {openGroup === entry.label ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                        {openGroup === entry.label && (
                                            <div className="flex flex-col">
                                                {entry.items.map((item, idx) => (
                                                    <Link
                                                        key={`${item.href}-${item.label}-${idx}`}
                                                        href={item.href}
                                                        className={`px-4 py-3 text-sm ${pathname === item.href
                                                                ? 'bg-green-50 text-primary dark:bg-green-900/30 dark:text-green-400'
                                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                            }`}
                                                    >
                                                        {item.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {!navEntries.length && (
                                <div className="rounded-lg border border-dashed border-gray-200 px-4 py-3 text-xs uppercase tracking-[0.25em] text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                    Sistem belum bekerja
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </header>
        </>
    );
};

export default Header;
