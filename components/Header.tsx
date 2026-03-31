'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, Sun, Moon } from 'lucide-react';
import type { NavigationMenuItem, SiteSettings } from '@/lib/types';
import { useTheme } from '@/lib/hooks/use-theme';
import { TopBar } from './header/TopBar';
import { Logo } from './header/Logo';
import { DesktopNav, type NavEntry } from './header/DesktopNav';
import { MobileNav } from './header/MobileNav';

type HeaderProps = {
    menuItems?: NavigationMenuItem[];
    siteSettings?: SiteSettings | null;
};

const Header: React.FC<HeaderProps> = ({ menuItems = [], siteSettings = null }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openGroup, setOpenGroup] = useState<string | null>(null);
    const pathname = usePathname();
    const headerRef = useRef<HTMLElement | null>(null);
    const { isDark, toggleTheme } = useTheme();

    const navEntries = useMemo<NavEntry[]>(() => {
        if (!menuItems.length) return [];
        return menuItems
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
    }, [menuItems]);

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

    const activeGroupLabel = useMemo(() => {
        return navEntries.find(
            (entry) => entry.type === 'dropdown' && entry.items.some((item) => pathname === item.href)
        )?.label;
    }, [pathname, navEntries]);

    const isHomeActive = pathname === '/';

    return (
        <>
            <TopBar siteSettings={siteSettings} />

            <header ref={headerRef} className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md transition-colors duration-200">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex justify-between items-center">
                        <Logo 
                            logoUrl={siteSettings?.schoolLogoUrl} 
                            schoolName={siteSettings?.schoolName} 
                        />

                        <DesktopNav 
                            navEntries={navEntries}
                            pathname={pathname}
                            isHomeActive={isHomeActive}
                            activeGroupLabel={activeGroupLabel}
                            openGroup={openGroup}
                            setOpenGroup={setOpenGroup}
                            isDark={isDark}
                            toggleTheme={toggleTheme}
                        />

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

                <MobileNav 
                    isOpen={isMenuOpen}
                    navEntries={navEntries}
                    pathname={pathname}
                    isHomeActive={isHomeActive}
                    openGroup={openGroup}
                    setOpenGroup={setOpenGroup}
                />
            </header>
        </>
    );
};

export default Header;
