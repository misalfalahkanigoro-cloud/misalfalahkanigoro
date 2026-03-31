'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SidebarAdmin from '@/components/sidebar-admin';
import HeaderAdmin from '@/components/header-admin';
import { 
    Plus, Save, Trash2, ChevronUp, ChevronDown, 
    MoreVertical, Link2, Type, Layout, 
    MousePointer2, Sparkles, RefreshCcw, 
    CheckCircle2, AlertCircle, Info, Zap,
    Layers, GripVertical, Settings2
} from 'lucide-react';

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
    const [navItems, setNavItems] = useState<NavItem[]>([]);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const navRes = await fetch('/api/admin/navigation-menu');
                const navData = await navRes.json();

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
                console.error('Failed to load navigation data', error);
            }
        };

        fetchData();
    }, []);

    const parentItems = useMemo(
        () => sortByOrder(navItems.filter((item) => !item.parent_id)),
        [navItems]
    );

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
        if (!window.confirm('Hapus menu ini beserta seluruh submenu-nya?')) return;
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
            if (!parent) return prev;

            if (type === 'button') {
                const hrefValue = parent.href && parent.href.trim().length ? parent.href.trim() : '/halaman';
                const pruned = prev.filter((item) => item.id === id || item.parent_id !== id);
                return normalizeOrders(pruned.map((item) =>
                    item.id === id ? { ...item, href: hrefValue } : item
                ));
            }

            return normalizeOrders(prev.map((item) =>
                item.id === id ? { ...item, href: null } : item
            ));
        });
    };

    const moveNavItem = (id: string, direction: 'up' | 'down') => {
        setNavItems((prev) => {
            const target = prev.find((item) => item.id === id);
            if (!target) return prev;

            const siblings = sortByOrder(prev.filter((item) => item.parent_id === target.parent_id));
            const index = siblings.findIndex((item) => item.id === id);
            const swapWith = direction === 'up' ? siblings[index - 1] : siblings[index + 1];
            if (!swapWith) return prev;

            return normalizeOrders(prev.map((item) => {
                if (item.id === target.id) return { ...item, display_order: swapWith.display_order };
                if (item.id === swapWith.id) return { ...item, display_order: target.display_order };
                return item;
            }));
        });
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const normalizedItems = normalizeOrders(navItems);
            setNavItems(normalizedItems);
            const navRes = await fetch('/api/admin/navigation-menu', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: normalizedItems.map((item) => ({
                        ...item,
                        href: item.href && item.href.trim().length ? item.href.trim() : null,
                        display_order: item.display_order,
                        is_active: true,
                    }))
                }),
            });

            if (!navRes.ok) throw new Error('Failed to save navigation menu');
            setMessage({ text: 'Menu navigasi berhasil disinkronkan.', type: 'success' });
            setTimeout(() => setMessage(null), 5000);
        } catch (error) {
            setMessage({ text: 'Terjadi kesalahan sistem saat menyimpan.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080B09] text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">
            <SidebarAdmin />
            <main className="min-h-screen lg:pl-64 pb-24">
                <HeaderAdmin 
                    title="Navigation Engine"
                    subtitle="Arsitektur menu header, hirarki navigasi, dan kebijakan redirect MI Alfalah"
                    action={
                        <div className="bg-emerald-500/10 dark:bg-emerald-500/10 px-8 py-3 rounded-2xl flex items-center gap-4 border border-emerald-500/20 shadow-inner group overflow-hidden relative">
                            <div className="absolute inset-0 bg-emerald-500/5 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            <Sparkles size={18} className="text-emerald-600 animate-pulse" />
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 tracking-[0.2em] uppercase leading-none mb-1">Live Preview Enabled</span>
                                <span className="text-[8px] font-black text-emerald-500/60 tracking-widest uppercase leading-none italic">Header Sync: Active</span>
                            </div>
                        </div>
                    }
                />

                <section className="px-4 sm:px-10 mt-12 max-w-7xl mx-auto space-y-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/70 dark:bg-[#151b18]/80 backdrop-blur-3xl rounded-[4rem] border border-white dark:border-white/10 shadow-3xl overflow-hidden"
                    >
                        <div className="p-10 lg:p-14 border-b border-gray-100 dark:border-white/5 bg-white/50 dark:bg-transparent">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-[1.75rem] text-emerald-600 shadow-inner">
                                        <Layers size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none mb-2">Structure Manager</h2>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] italic">
                                            Manajemen hirarki menu tingkat makro & mikro
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => addNavItem(null)}
                                    className="inline-flex items-center gap-4 bg-emerald-600 text-white px-8 py-4 rounded-[1.75rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-500/30 hover:bg-emerald-500 hover:-translate-y-1 active:scale-95 group"
                                >
                                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" /> ATTACH PRIMARY MENU
                                </button>
                            </div>
                        </div>

                        <div className="p-10 lg:p-14 space-y-10">
                            <AnimatePresence mode="popLayout">
                                {parentItems.length === 0 ? (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center justify-center py-24 text-center bg-gray-50/50 dark:bg-black/20 rounded-[3rem] border border-dashed border-gray-100 dark:border-white/5"
                                    >
                                        <div className="w-24 h-24 bg-white dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center text-gray-300 mb-8 shadow-inner animate-pulse">
                                            <MousePointer2 size={48} className="opacity-20" />
                                        </div>
                                        <h4 className="text-lg font-black font-fraunces text-gray-900 dark:text-white uppercase tracking-tight mb-2">No active endpoints</h4>
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] italic max-w-xs leading-relaxed">
                                            Header masih bersifat statis atau kosong. Tambahkan menu utama untuk memulai sinkronisasi.
                                        </p>
                                    </motion.div>
                                ) : (
                                    parentItems.map((parent, idx) => {
                                        const childItems = sortByOrder(navItems.filter((item) => item.parent_id === parent.id));
                                        const isDropdown = childItems.length > 0 || !parent.href;
                                        
                                        return (
                                            <motion.div 
                                                key={parent.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="group/card relative bg-gray-50/50 dark:bg-black/20 rounded-[3rem] border border-gray-100 dark:border-white/5 p-8 lg:p-10 transition-all hover:bg-white dark:hover:bg-white/5 hover:shadow-2xl hover:shadow-emerald-500/5"
                                            >
                                                <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-end">
                                                    <div className="flex-1 grid lg:grid-cols-12 gap-8 w-full">
                                                        <div className="lg:col-span-5 space-y-4">
                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4 flex items-center gap-2">
                                                                <Type size={12} className="opacity-50" /> MENU IDENTITY
                                                            </label>
                                                            <input
                                                                value={parent.label}
                                                                onChange={(e) => updateNavItem(parent.id, 'label', e.target.value)}
                                                                className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-black/40 px-6 py-4 text-sm font-black text-gray-900 dark:text-white focus:ring-4 focus:ring-emerald-500/5 outline-none shadow-inner transition-all border-emerald-500/0 focus:border-emerald-500"
                                                                placeholder="e.g. Academic Portal"
                                                            />
                                                        </div>
                                                        <div className="lg:col-span-3 space-y-4">
                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4 flex items-center gap-2">
                                                                <Settings2 size={12} className="opacity-50" /> PROTOCOL
                                                            </label>
                                                            <select
                                                                value={isDropdown ? 'dropdown' : 'button'}
                                                                onChange={(e) => setParentType(parent.id, e.target.value as 'dropdown' | 'button')}
                                                                className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-black/40 px-6 py-4 text-sm font-black text-gray-900 dark:text-white focus:ring-4 focus:ring-emerald-500/5 outline-none shadow-inner transition-all border-emerald-500/0 focus:border-emerald-500 appearance-none"
                                                            >
                                                                <option value="dropdown" className="dark:bg-[#151b18]">DROPDOWN STACK</option>
                                                                <option value="button" className="dark:bg-[#151b18]">DIRECT TRIGGER</option>
                                                            </select>
                                                        </div>
                                                        <div className="lg:col-span-4 space-y-4">
                                                            {!isDropdown ? (
                                                                <>
                                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4 flex items-center gap-2">
                                                                        <Link2 size={12} className="opacity-50" /> DESTINATION URL
                                                                    </label>
                                                                    <input
                                                                        value={parent.href || ''}
                                                                        onChange={(e) => updateNavItem(parent.id, 'href', e.target.value)}
                                                                        className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-black/40 px-6 py-4 text-sm font-bold text-gray-950 dark:text-white focus:ring-4 focus:ring-emerald-500/5 outline-none shadow-inner transition-all border-emerald-500/0 focus:border-emerald-500"
                                                                        placeholder="/target-page"
                                                                    />
                                                                </>
                                                            ) : (
                                                                <div className="h-full flex items-end pb-3">
                                                                    <button
                                                                        onClick={() => addNavItem(parent.id)}
                                                                        className="inline-flex items-center gap-3 bg-white dark:bg-white/5 hover:bg-emerald-600 hover:text-white px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border border-gray-100 dark:border-white/10 shadow-sm active:scale-95"
                                                                    >
                                                                        <Plus size={14} /> ATTACH SUBNODE
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 bg-white dark:bg-black/40 p-3 rounded-2xl border border-gray-100 dark:border-white/5 shadow-inner">
                                                        <div className="flex flex-col gap-1">
                                                            <button
                                                                onClick={() => moveNavItem(parent.id, 'up')}
                                                                className="p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-white/5 text-gray-400 hover:text-emerald-500 transition-all"
                                                                title="Move Up"
                                                            >
                                                                <ChevronUp size={16} strokeWidth={3} />
                                                            </button>
                                                            <button
                                                                onClick={() => moveNavItem(parent.id, 'down')}
                                                                className="p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-white/5 text-gray-400 hover:text-emerald-500 transition-all"
                                                                title="Move Down"
                                                            >
                                                                <ChevronDown size={16} strokeWidth={3} />
                                                            </button>
                                                        </div>
                                                        <div className="w-px h-10 bg-gray-100 dark:bg-white/5 mx-1" />
                                                        <button
                                                            onClick={() => removeNavItem(parent.id)}
                                                            className="p-4 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
                                                            title="Purge Link"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Children Submenu Area */}
                                                <AnimatePresence>
                                                    {childItems.length > 0 && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="mt-10 pl-10 lg:pl-16 space-y-4 relative border-l-2 border-dashed border-gray-100 dark:border-white/5 ml-8"
                                                        >
                                                            {childItems.map((child, cIdx) => (
                                                                <motion.div 
                                                                    key={child.id}
                                                                    initial={{ opacity: 0, x: -10 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: cIdx * 0.02 }}
                                                                    className="group/child relative flex flex-col lg:flex-row gap-6 items-center bg-white/50 dark:bg-black/20 p-5 rounded-[2rem] border border-gray-100 dark:border-white/5 hover:border-emerald-500/20 transition-all"
                                                                >
                                                                    <div className="absolute -left-10 lg:-left-16 w-10 lg:w-16 h-px bg-gray-100 dark:bg-white/5 flex items-center justify-start">
                                                                        <div className="w-2 h-2 rounded-full bg-emerald-500/40 -translate-x-1" />
                                                                    </div>
                                                                    
                                                                    <div className="flex-1 grid md:grid-cols-2 gap-6 w-full">
                                                                        <input
                                                                            value={child.label}
                                                                            onChange={(e) => updateNavItem(child.id, 'label', e.target.value)}
                                                                            className="w-full rounded-xl border border-gray-100 dark:border-white/5 bg-white/80 dark:bg-black/60 px-5 py-3 text-[13px] font-bold text-gray-950 dark:text-white focus:ring-4 focus:ring-emerald-500/5 outline-none shadow-sm transition-all focus:border-emerald-500"
                                                                            placeholder="Subnode Title"
                                                                        />
                                                                        <input
                                                                            value={child.href || ''}
                                                                            onChange={(e) => updateNavItem(child.id, 'href', e.target.value)}
                                                                            className="w-full rounded-xl border border-gray-100 dark:border-white/5 bg-white/80 dark:bg-black/60 px-5 py-3 font-mono text-xs text-emerald-600 dark:text-emerald-400 focus:ring-4 focus:ring-emerald-500/5 outline-none shadow-sm transition-all focus:border-emerald-500"
                                                                            placeholder="/path/target"
                                                                        />
                                                                    </div>

                                                                    <div className="flex items-center gap-2 opacity-0 group-hover/child:opacity-100 transition-opacity">
                                                                        <button
                                                                            onClick={() => moveNavItem(child.id, 'up')}
                                                                            className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-white/5 text-gray-400 hover:text-emerald-500 transition-all border border-transparent hover:border-emerald-100"
                                                                        >
                                                                            <ChevronUp size={14} strokeWidth={3} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => moveNavItem(child.id, 'down')}
                                                                            className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-white/5 text-gray-400 hover:text-emerald-500 transition-all border border-transparent hover:border-emerald-100"
                                                                        >
                                                                            <ChevronDown size={14} strokeWidth={3} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => removeNavItem(child.id)}
                                                                            className="p-2 rounded-lg bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </div>
                                                                </motion.div>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Footer Command Section */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-10 bg-white/70 dark:bg-[#151b18]/80 backdrop-blur-3xl p-10 lg:p-14 rounded-[4rem] border border-white dark:border-white/10 shadow-3xl">
                        <div className="flex gap-6 items-center max-w-2xl">
                            <div className={`p-4 rounded-[1.75rem] shadow-xl ring-4 ring-emerald-500/5 ${message?.type === 'success' ? 'bg-emerald-500 text-white animate-pulse' : 'bg-white dark:bg-white/5 text-emerald-600'}`}>
                                {message?.type === 'success' ? <CheckCircle2 size={32} /> : <Zap size={32} />}
                            </div>
                            <div>
                                <p className={`text-[11px] font-black uppercase tracking-[0.3em] mb-2 leading-none italic ${message?.type === 'success' ? 'text-emerald-600' : 'text-gray-400'}`}>
                                    {message?.type === 'success' ? 'SYNC COMPLETED' : 'ENGINE READINESS: STANDBY'}
                                </p>
                                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 leading-relaxed uppercase tracking-tight">
                                    {message?.text || 'Setiap perubahan struktur menu akan meng-override konfigurasi header publik secara instan. Pastikan semua path valid sebelum commit.'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full md:w-auto rounded-[1.75rem] bg-emerald-600 px-14 py-6 text-[11px] font-black text-white uppercase tracking-[0.3em] shadow-2xl shadow-emerald-500/30 hover:bg-emerald-500 hover:-translate-y-1 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-4 group"
                        >
                            {saving ? (
                                <>
                                    <RefreshCcw size={18} className="animate-spin" />
                                    SYNCHRONIZING...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={18} />
                                    COMMIT CONFIGURATION
                                </>
                            )}
                        </button>
                    </div>

                    <div className="p-10 bg-black dark:bg-[#050706] rounded-[3.5rem] text-white overflow-hidden relative group border border-white/5">
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 shadow-inner group-hover:rotate-12 transition-all duration-700">
                                    <Info size={24} />
                                </div>
                                <div className="max-w-md">
                                    <p className="text-[10px] font-black font-fraunces text-emerald-500 uppercase tracking-[0.3em] mb-1.5">UX ADVISORY</p>
                                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed italic">
                                        Rekomendasi performa: Batasi hirarki menu maksimal 2 level (Parent & Child) dan tidak lebih dari 7 menu utama untuk optimasi view port mobile.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="text-center">
                                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Integrity</p>
                                    <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">99.9%</p>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div className="text-center">
                                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Caching</p>
                                    <p className="text-xs font-black text-white uppercase tracking-widest">ENABLED</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/5 blur-[100px] -translate-y-32 translate-x-32" />
                    </div>
                </section>
            </main>
        </div>
    );
};

export default KelolaHeaderPage;
