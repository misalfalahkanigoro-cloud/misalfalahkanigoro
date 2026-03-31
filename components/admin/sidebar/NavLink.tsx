import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

type NavLinkProps = {
    href: string;
    label: string;
    icon: LucideIcon;
    isActive: boolean;
    isChild?: boolean;
};

export const NavLink: React.FC<NavLinkProps> = ({
    href,
    label,
    icon: Icon,
    isActive,
    isChild = false,
}) => {
    if (isChild) {
        return (
            <Link
                href={href}
                className={`group/child relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${isActive
                    ? 'bg-emerald-50 text-emerald-700 font-medium dark:bg-emerald-500/15 dark:text-emerald-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                    }`}
            >
                <Icon size={15} className={`transition-colors duration-200 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'opacity-40 group-hover/child:opacity-70'}`} />
                {label}

                {isActive && (
                    <div className="absolute -left-[17px] top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                )}
            </Link>
        );
    }

    return (
        <Link
            href={href}
            className={`relative flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-300 ${isActive
                ? 'bg-emerald-50 text-emerald-700 border-l-[3px] border-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-100 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                }`}
        >
            <Icon size={18} className={`transition-colors duration-200 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'opacity-60'}`} />
            {label}

            {isActive && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            )}
        </Link>
    );
};
