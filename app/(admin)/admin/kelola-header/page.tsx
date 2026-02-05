'use client';

import React, { useEffect, useMemo, useState } from 'react';
import SidebarAdmin from '@/components/sidebar-admin';
import { CldUploadWidget } from 'next-cloudinary';

type SiteSettingsForm = {
    school_name: string;
    school_logo_url: string;
    school_address: string;
    school_phone: string;
    school_email: string;
    school_whatsapp: string;
};

type NavItem = {
    id: string;
    label: string;
    href: string | null;
    parent_id: string | null;
    display_order: number;
};

const sortByOrder = (items: NavItem[]) =>
    [...items].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

const normalizeOrders = (items: NavItem[]) => {
    const grouped = new Map<string, NavItem[]>();
    items.forEach((item) => {
        const key = item.parent_id ?? '__root__';
        const list = grouped.get(key) || [];
        list.push(item);
        grouped.set(key, list);
    });

    const orderMap = new Map<string, number>();
    grouped.forEach((group) => {
        sortByOrder(group).forEach((item, index) => {
            orderMap.set(item.id, index + 1);
        });
    });

    return items.map((item) => ({
        ...item,
        display_order: orderMap.get(item.id) || 1,
    }));
};

const getNextOrder = (items: NavItem[], parentId: string | null) => {
    const siblings = items.filter((item) => item.parent_id === parentId);
    const maxOrder = siblings.reduce((max, item) => Math.max(max, item.display_order || 0), 0);
    return maxOrder + 1;
};

const KelolaHeaderPage: React.FC = () => {
    const [settings, setSettings] = useState<SiteSettingsForm>({
        school_name: '',
        school_logo_url: '',
        school_address: '',
        school_phone: '',
        school_email: '',
        school_whatsapp: '',
    });
    const [navItems, setNavItems] = useState<NavItem[]>([]);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [settingsRes, navRes] = await Promise.all([
                    fetch('/api/admin/site-settings'),
                    fetch('/api/admin/navigation-menu'),
                ]);

                const settingsData = await settingsRes.json();
                const navData = await navRes.json();

                if (settingsData) {
                    setSettings({
                        school_name: settingsData.school_name || '',
                        school_logo_url: settingsData.school_logo_url || '',
                        school_address: settingsData.school_address || '',
                        school_phone: settingsData.school_phone || '',
                        school_email: settingsData.school_email || '',
                        school_whatsapp: settingsData.school_whatsapp || '',
                    });
                }

                if (Array.isArray(navData)) {
                    const mapped = navData.map((item: any) => ({
                        id: item.id,
                        label: item.label,
                        href: item.href,
                        parent_id: item.parent_id,
                        display_order: typeof item.display_order === 'number' ? item.display_order : 0,
                    }));
                    setNavItems(normalizeOrders(mapped));
                }
            } catch (error) {
                console.error('Failed to load header data', error);
            }
        };

        fetchData();
    }, []);

    const parentItems = useMemo(
        () => sortByOrder(navItems.filter((item) => !item.parent_id)),
        [navItems]
    );

    const handleLogoUpload = (result: any) => {
        if (result?.event !== 'success') return;
        const info = result.info;
        let secureUrl: string | undefined;
        
        if (typeof info === 'string') {
            secureUrl = info;
        } else if (info && typeof info === 'object') {
            secureUrl = info.secure_url || info.url;
        }
        
        if (secureUrl) {
            setSettings((prev) => ({ ...prev, school_logo_url: secureUrl }));
        }
    };

    const addNavItem = (parentId: string | null) => {
        setNavItems((prev) => {
            const nextItem: NavItem = {
                id: crypto.randomUUID(),
                label: parentId ? 'Submenu Baru' : 'Menu Baru',
                href: parentId ? '/halaman' : null,
                parent_id: parentId,
                display_order: getNextOrder(prev, parentId),
            };

            const updated = parentId
                ? prev.map((item) => (item.id === parentId ? { ...item, href: null } : item))
                : prev;

            return normalizeOrders([...updated, nextItem]);
        });
    };

    const removeNavItem = (id: string) => {
        setNavItems((prev) =>
            normalizeOrders(prev.filter((item) => item.id !== id && item.parent_id !== id))
        );
    };

    const updateNavItem = (id: string, field: 'label' | 'href', value: string) => {
        setNavItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
        );
    };

    const setParentType = (id: string, type: 'dropdown' | 'button') => {
        setNavItems((prev) => {
            const parent = prev.find((item) => item.id === id);
            if (!parent) {
                return prev;
            }

            if (type === 'button') {
                const hrefValue = parent.href && parent.href.trim().length ? parent.href.trim() : '/halaman';
                const pruned = prev.filter((item) => item.id === id || item.parent_id !== id);
                const updated = pruned.map((item) =>
                    item.id === id ? { ...item, href: hrefValue } : item
                );
                return normalizeOrders(updated);
            }

            const updated = prev.map((item) =>
                item.id === id ? { ...item, href: null } : item
            );
            return normalizeOrders(updated);
        });
    };

    const moveNavItem = (id: string, direction: 'up' | 'down') => {
        setNavItems((prev) => {
            const target = prev.find((item) => item.id === id);
            if (!target) {
                return prev;
            }

            const siblings = sortByOrder(prev.filter((item) => item.parent_id === target.parent_id));
            const index = siblings.findIndex((item) => item.id === id);
            const swapWith = direction === 'up' ? siblings[index - 1] : siblings[index + 1];
            if (!swapWith) {
                return prev;
            }

            const updated = prev.map((item) => {
                if (item.id === target.id) {
                    return { ...item, display_order: swapWith.display_order };
                }
                if (item.id === swapWith.id) {
                    return { ...item, display_order: target.display_order };
                }
                return item;
            });

            return normalizeOrders(updated);
        });
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const normalizedItems = normalizeOrders(navItems);
            setNavItems(normalizedItems);
            const [settingsRes, navRes] = await Promise.all([
                fetch('/api/admin/site-settings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(settings),
                }),
                fetch('/api/admin/navigation-menu', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items: normalizedItems.map((item) => ({
                        ...item,
                        href: item.href && item.href.trim().length ? item.href.trim() : null,
                        display_order: item.display_order,
                        is_active: true,
                    })) }),
                }),
            ]);

            if (!settingsRes.ok || !navRes.ok) {
                const [settingsErr, navErr] = await Promise.all([
                    settingsRes.json().catch(() => ({})),
                    navRes.json().catch(() => ({})),
                ]);
                throw new Error(
                    settingsErr.error ||
                    navErr.error ||
                    'Failed to save'
                );
            }

            setMessage('Perubahan header berhasil disimpan.');
        } catch (error) {
            console.error(error);
            setMessage('Gagal menyimpan perubahan.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors dark:bg-[#0B0F0C] dark:text-gray-100">
            <SidebarAdmin />
            <main className="min-h-screen px-6 py-10 lg:pl-80 space-y-8">
                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <h2 className="text-2xl font-semibold">Kelola Header</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Atur identitas sekolah, logo, dan navigasi.</p>

                    <div className="mt-8 grid gap-6 lg:grid-cols-2">
                        <div className="space-y-4">
                            <label className="text-sm font-semibold">Nama Sekolah</label>
                            <input
                                value={settings.school_name}
                                onChange={(e) => setSettings({ ...settings, school_name: e.target.value })}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                            />

                            <label className="text-sm font-semibold">Alamat</label>
                            <input
                                value={settings.school_address}
                                onChange={(e) => setSettings({ ...settings, school_address: e.target.value })}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                            />

                            <label className="text-sm font-semibold">Telepon</label>
                            <input
                                value={settings.school_phone}
                                onChange={(e) => setSettings({ ...settings, school_phone: e.target.value })}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                            />

                            <label className="text-sm font-semibold">Email</label>
                            <input
                                value={settings.school_email}
                                onChange={(e) => setSettings({ ...settings, school_email: e.target.value })}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                            />

                            <label className="text-sm font-semibold">WhatsApp</label>
                            <input
                                value={settings.school_whatsapp}
                                onChange={(e) => setSettings({ ...settings, school_whatsapp: e.target.value })}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-semibold">Logo</label>
                            <div className="flex items-center gap-4">
                                <div className="h-20 w-20 rounded-2xl bg-gray-100 dark:bg-white/10 overflow-hidden flex items-center justify-center">
                                    {settings.school_logo_url ? (
                                        <img src={settings.school_logo_url} alt="Logo" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-xs text-gray-400">Belum ada</span>
                                    )}
                                </div>
                                {uploadPreset ? (
                                    <CldUploadWidget
                                        uploadPreset={uploadPreset}
                                        options={{ folder: 'mis-al-falah/header' }}
                                        onSuccess={handleLogoUpload}
                                    >
                                        {({ open }) => (
                                            <button
                                                type="button"
                                                onClick={() => open()}
                                                className="rounded-lg border border-emerald-600 px-4 py-2 text-sm text-emerald-600"
                                            >
                                                Upload Logo
                                            </button>
                                        )}
                                    </CldUploadWidget>
                                ) : null}
                            </div>

                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-semibold">Menu Navigasi</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Atur tombol header, dropdown, dan urutan menu.</p>
                        </div>
                        <button
                            onClick={() => addNavItem(null)}
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                        >
                            + Parent Menu
                        </button>
                    </div>

                    <div className="mt-6 space-y-6">
                        {parentItems.map((parent) => {
                            const hasChildren = navItems.some((item) => item.parent_id === parent.id);
                            const parentType = hasChildren || !parent.href ? 'dropdown' : 'button';
                            const childItems = sortByOrder(
                                navItems.filter((item) => item.parent_id === parent.id)
                            );

                            return (
                                <div key={parent.id} className="rounded-2xl border border-gray-200 p-4 dark:border-white/10">
                                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                                        <input
                                            value={parent.label}
                                            onChange={(e) => updateNavItem(parent.id, 'label', e.target.value)}
                                            className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                            placeholder="Nama menu"
                                        />
                                        <select
                                            value={parentType}
                                            onChange={(e) => setParentType(parent.id, e.target.value as 'dropdown' | 'button')}
                                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 dark:border-white/10 dark:bg-black/30 dark:text-gray-200"
                                        >
                                            <option value="dropdown">Dropdown</option>
                                            <option value="button">Tombol</option>
                                        </select>
                                        {parentType === 'button' && (
                                            <input
                                                value={parent.href || ''}
                                                onChange={(e) => updateNavItem(parent.id, 'href', e.target.value)}
                                                className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                                placeholder="/tautan"
                                            />
                                        )}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => moveNavItem(parent.id, 'up')}
                                                className="rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600 dark:border-white/10 dark:text-gray-200"
                                            >
                                                Naik
                                            </button>
                                            <button
                                                onClick={() => moveNavItem(parent.id, 'down')}
                                                className="rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600 dark:border-white/10 dark:text-gray-200"
                                            >
                                                Turun
                                            </button>
                                        </div>
                                        {parentType === 'dropdown' && (
                                            <button
                                                onClick={() => addNavItem(parent.id)}
                                                className="rounded-lg border border-emerald-600 px-3 py-2 text-xs text-emerald-600"
                                            >
                                                + Submenu
                                            </button>
                                        )}
                                        <button
                                            onClick={() => removeNavItem(parent.id)}
                                            className="rounded-lg border border-red-500 px-3 py-2 text-xs text-red-500"
                                        >
                                            Hapus
                                        </button>
                                    </div>

                                    {childItems.length ? (
                                        <div className="mt-4 space-y-2">
                                            {childItems.map((child) => (
                                                <div key={child.id} className="flex flex-col gap-2 md:flex-row md:items-center">
                                                    <input
                                                        value={child.label}
                                                        onChange={(e) => updateNavItem(child.id, 'label', e.target.value)}
                                                        className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                                        placeholder="Label"
                                                    />
                                                    <input
                                                        value={child.href || ''}
                                                        onChange={(e) => updateNavItem(child.id, 'href', e.target.value)}
                                                        className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                                        placeholder="/tautan"
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => moveNavItem(child.id, 'up')}
                                                            className="rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600 dark:border-white/10 dark:text-gray-200"
                                                        >
                                                            Naik
                                                        </button>
                                                        <button
                                                            onClick={() => moveNavItem(child.id, 'down')}
                                                            className="rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600 dark:border-white/10 dark:text-gray-200"
                                                        >
                                                            Turun
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => removeNavItem(child.id)}
                                                        className="rounded-lg border border-red-500 px-3 py-2 text-xs text-red-500"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
                    >
                        {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default KelolaHeaderPage;
