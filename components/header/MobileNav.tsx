import React from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { NavEntry } from './DesktopNav';

type MobileNavProps = {
    isOpen: boolean;
    navEntries: NavEntry[];
    pathname: string;
    isHomeActive: boolean;
    openGroup: string | null;
    setOpenGroup: (label: string | null) => void;
};

export const MobileNav: React.FC<MobileNavProps> = ({
    isOpen,
    navEntries,
    pathname,
    isHomeActive,
    openGroup,
    setOpenGroup,
}) => {
    if (!isOpen) return null;

    return (
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
                        Menu belum tersedia
                    </div>
                )}
            </div>
        </div>
    );
};
