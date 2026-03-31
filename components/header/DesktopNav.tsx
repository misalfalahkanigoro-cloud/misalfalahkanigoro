import React from 'react';
import Link from 'next/link';
import { ChevronDown, Sun, Moon } from 'lucide-react';

type NavItem = { label: string; href: string };
export type NavEntry =
    | { type: 'link'; label: string; href: string }
    | { type: 'dropdown'; label: string; items: NavItem[] };

type DesktopNavProps = {
    navEntries: NavEntry[];
    pathname: string;
    isHomeActive: boolean;
    activeGroupLabel: string | undefined;
    openGroup: string | null;
    setOpenGroup: (label: string | null) => void;
    isDark: boolean;
    toggleTheme: () => void;
};

export const DesktopNav: React.FC<DesktopNavProps> = ({
    navEntries,
    pathname,
    isHomeActive,
    activeGroupLabel,
    openGroup,
    setOpenGroup,
    isDark,
    toggleTheme,
}) => {
    return (
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

                const isActive = activeGroupLabel === entry.label;
                const isOpen = openGroup === entry.label;
                return (
                    <div key={`dropdown-${entry.label}`} className="relative group">
                        <button
                            type="button"
                            onClick={() =>
                                setOpenGroup(openGroup === entry.label ? null : entry.label)
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
                    Menu belum tersedia
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
    );
};
