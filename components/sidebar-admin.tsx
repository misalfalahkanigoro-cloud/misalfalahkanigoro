'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Shield, X } from 'lucide-react';
import { useTheme } from '@/lib/hooks/use-theme';
import { useAdminAuth } from '@/lib/hooks/use-admin-auth';
import { SIDEBAR_ITEMS, type SidebarItem } from '@/components/admin/sidebar-constants';
import { AdminProfileSection } from './admin/sidebar/AdminProfileSection';
import { LogoutButton } from './admin/sidebar/LogoutButton';
import { NavLink } from './admin/sidebar/NavLink';
import { NavGroup } from './admin/sidebar/NavGroup';

const SIDEBAR_WIDTH = 'w-[260px]';

const SidebarAdmin: React.FC = () => {
    const pathname = usePathname();
    const { isDark, toggleTheme } = useTheme();
    const { user, logout, displayName, displayRole } = useAdminAuth();
    const [open, setOpen] = useState(false);
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
    const [isDesktopOpen, setIsDesktopOpen] = useState(true);

    // Close mobile sidebar on route change
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    // Prevent body scroll when mobile sidebar is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    // Handle desktop sidebar collapse
    useEffect(() => {
        if (!isDesktopOpen) {
            document.body.classList.add('sidebar-collapsed');
        } else {
            document.body.classList.remove('sidebar-collapsed');
        }
        return () => { document.body.classList.remove('sidebar-collapsed'); };
    }, [isDesktopOpen]);

    const isGroupActive = (item: SidebarItem) =>
        item.children?.some((child) => child.href === pathname) ?? false;

    const SidebarContent = (
        <div className="flex w-full h-full flex-col gap-2 p-3 pb-6 overflow-y-auto admin-scrollbar bg-white dark:bg-[#0B0F0C]">
            <AdminProfileSection
                displayName={displayName}
                displayRole={displayRole}
                isDark={isDark}
                toggleTheme={toggleTheme}
            />

            <nav className="flex-1 space-y-0.5 px-1">
                {SIDEBAR_ITEMS.map((item) => {
                    const active = item.href ? pathname === item.href : isGroupActive(item);

                    if (item.children?.length) {
                        const isOpen = openGroups[item.label] ?? active;
                        return (
                            <NavGroup
                                key={item.label}
                                label={item.label}
                                icon={item.icon}
                                isActive={active}
                                isOpen={isOpen}
                                pathname={pathname}
                                onToggle={() => setOpenGroups(prev => ({ ...prev, [item.label]: !isOpen }))}
                                children={item.children as any}
                            />
                        );
                    }

                    return (
                        <NavLink
                            key={item.href}
                            href={item.href as string}
                            label={item.label}
                            icon={item.icon}
                            isActive={active}
                        />
                    );
                })}

                {user?.role === 'superadmin' && (
                    <Link
                        href="/admin/kontrolAkun"
                        className={`group flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-300 ${pathname === '/admin/kontrolAkun'
                            ? 'bg-amber-50 text-amber-800 border-l-[3px] border-amber-500 dark:bg-amber-500/10 dark:text-amber-100'
                            : 'text-amber-700 hover:bg-amber-50 hover:text-amber-900 dark:text-amber-400 dark:hover:bg-amber-500/5'
                            }`}
                    >
                        <Shield size={18} className={`transition-colors duration-200 ${pathname === '/admin/kontrolAkun' ? 'text-amber-600' : 'opacity-60'}`} />
                        Kontrol Akun
                    </Link>
                )}
            </nav>

            <LogoutButton onLogout={logout} />
        </div>
    );

    return (
        <>
            {/* Floating Desktop Toggle Button */}
            <button
                onClick={() => setIsDesktopOpen(true)}
                className={`fixed top-4 left-4 z-40 hidden h-12 w-12 items-center justify-center rounded-2xl bg-white text-gray-600 shadow-xl border border-gray-100 hover:bg-gray-50 hover:text-emerald-600 transition-all duration-300 dark:bg-[#0B0F0C] dark:text-gray-300 dark:border-white/10 dark:hover:text-emerald-400 lg:flex ${!isDesktopOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'}`}
                aria-label="Open sidebar"
            >
                <Menu size={24} />
            </button>

            {/* Desktop Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-40 hidden ${SIDEBAR_WIDTH} bg-white text-gray-900 shadow-[2px_0_12px_rgba(0,0,0,0.04)] lg:flex dark:bg-[#0B0F0C] dark:text-white dark:shadow-[2px_0_12px_rgba(0,0,0,0.3)] transition-transform duration-300 ease-in-out ${isDesktopOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Close Button Desktop */}
                <button
                    onClick={() => setIsDesktopOpen(false)}
                    className={`absolute -right-10 top-6 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm text-gray-500 hover:bg-gray-50 hover:text-emerald-600 transition-all duration-300 dark:bg-[#0B0F0C] dark:border-white/10 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 ${!isDesktopOpen ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'}`}
                    aria-label="Hide sidebar"
                >
                    <X size={16} />
                </button>
                {SidebarContent}
            </aside>

            {/* Mobile Toggle Button */}
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-6 left-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-2xl shadow-emerald-600/40 hover:scale-110 active:scale-95 transition-all duration-200 lg:hidden"
                aria-label="Open sidebar"
            >
                <Menu size={24} />
            </button>

            {/* Mobile Overlay Sidebar */}
            <div
                className={`fixed inset-0 z-[60] lg:hidden transition-all duration-300 ${open ? 'visible' : 'invisible pointer-events-none'}`}
            >
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setOpen(false)}
                />

                {/* Sidebar Panel */}
                <aside
                    className={`relative h-full ${SIDEBAR_WIDTH} bg-white text-gray-900 shadow-2xl transition-transform duration-300 ease-out dark:bg-[#0B0F0C] dark:text-white ${open ? 'translate-x-0' : '-translate-x-full'}`}
                >
                    {/* Close Button */}
                    <button
                        onClick={() => setOpen(false)}
                        className="absolute right-3 top-3 z-50 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all dark:hover:bg-white/10 dark:hover:text-white"
                        aria-label="Close sidebar"
                    >
                        <X size={18} />
                    </button>
                    {SidebarContent}
                </aside>
            </div>
        </>
    );
};

export default SidebarAdmin;
