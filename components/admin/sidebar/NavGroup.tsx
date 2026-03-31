import React, { useRef, useEffect, useState } from 'react';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { NavLink } from './NavLink';

type NavGroupProps = {
    label: string;
    icon: LucideIcon;
    isActive: boolean;
    isOpen: boolean;
    onToggle: () => void;
    children: Array<{ label: string; href: string; icon?: LucideIcon }>;
    pathname: string;
};

export const NavGroup: React.FC<NavGroupProps> = ({
    label,
    icon: Icon,
    isActive,
    isOpen,
    onToggle,
    children,
    pathname,
}) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number>(0);

    useEffect(() => {
        if (contentRef.current) {
            setHeight(contentRef.current.scrollHeight);
        }
    }, [children, isOpen]);

    return (
        <div className="mb-0.5">
            {/* Group Label / Toggle Button */}
            <button
                onClick={onToggle}
                className={`relative flex w-full items-center justify-between rounded-lg px-3 py-2 text-[11px] font-semibold uppercase tracking-wider transition-all duration-300 ${isActive
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
                    }`}
            >
                <span className="flex items-center gap-2.5">
                    <Icon size={15} className={`transition-colors duration-200 ${isActive ? 'text-emerald-500 dark:text-emerald-400' : 'opacity-50'}`} />
                    {label}
                </span>
                <ChevronDown
                    size={13}
                    className={`transition-transform duration-300 ease-in-out opacity-40 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                />
            </button>

            {/* Collapsible Children */}
            <div
                className="overflow-hidden transition-all duration-400 ease-in-out"
                style={{
                    maxHeight: isOpen ? `${height}px` : '0px',
                    opacity: isOpen ? 1 : 0,
                }}
            >
                <div ref={contentRef} className="relative ml-5 space-y-0.5 border-l border-gray-200/80 pl-3 py-1.5 dark:border-white/10">
                    {children.map((child) => (
                        <NavLink
                            key={child.href}
                            href={child.href}
                            label={child.label}
                            icon={child.icon || Icon}
                            isActive={pathname === child.href}
                            isChild
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
