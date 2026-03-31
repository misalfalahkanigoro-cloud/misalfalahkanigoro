'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, RefreshCcw, Save, Share2, X, 
    Facebook, Instagram, Youtube, Twitter, 
    Linkedin, Globe, Trash2, Edit2, Zap, 
    Link2, Info, CheckCircle2, Star
} from 'lucide-react';
import type { AdminSiteSettings } from '@/lib/admin-site-settings';

type Props = {
    settings: AdminSiteSettings;
    onSave: (payload: Partial<AdminSiteSettings>) => void;
    saving: boolean;
};

type SocialMediaItem = {
    platform: string;
    url: string;
};

const PLATFORM_OPTIONS = [
    { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600' },
    { id: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-600' },
    { id: 'tiktok', label: 'TikTok', icon: Share2, color: 'text-gray-900' }, // TikTok icon fallback
    { id: 'twitter', label: 'Twitter / X', icon: Twitter, color: 'text-sky-500' },
    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
];

export default function SocialSettingsTab({ settings, onSave, saving }: Props) {
    const [links, setLinks] = useState<SocialMediaItem[]>(Object.entries(settings.socialMedia || {}).map(([platform, url]) => ({ platform, url })));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<SocialMediaItem | null>(null);

    const saveChanges = (nextList: SocialMediaItem[]) => {
        const socialMedia = nextList.reduce<Record<string, string>>((acc, item) => {
            acc[item.platform] = item.url;
            return acc;
        }, {});

        onSave({ socialMedia });
    };

    const openAddModal = () => {
        setEditingItem({ platform: '', url: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (item: SocialMediaItem) => {
        setEditingItem({ ...item });
        setIsModalOpen(true);
    };

    const handleModalSave = () => {
        if (!editingItem || !editingItem.platform || !editingItem.url) return;

        const nextList = [...links];
        const existingIndex = nextList.findIndex((item) => item.platform === editingItem.platform);
        if (existingIndex >= 0) {
            nextList[existingIndex] = editingItem;
        } else {
            nextList.push(editingItem);
        }

        setLinks(nextList);
        setIsModalOpen(false);
        saveChanges(nextList);
    };

    const deleteItem = (platform: string) => {
        if (!window.confirm(`Hapus tautan ${platform}?`)) return;
        const nextList = links.filter((item) => item.platform !== platform);
        setLinks(nextList);
        saveChanges(nextList);
    };

    const getPlatformInfo = (id: string) => PLATFORM_OPTIONS.find((item) => item.id === id) || { label: id, icon: Share2, color: 'text-gray-400' };

    return (
        <div className="max-w-6xl space-y-10 font-sans">
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl rounded-[3.5rem] border border-white dark:border-white/10 shadow-3xl p-10 lg:p-14 relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 blur-[100px] -translate-y-32 translate-x-32" />
                
                <div className="relative z-10">
                    <div className="mb-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-pink-50 dark:bg-pink-500/10 rounded-[1.75rem] text-pink-600 shadow-inner group-hover:rotate-6 transition-transform duration-700">
                                <Share2 size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none mb-2">Social Network</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] italic">Eksistensi Digital MI Alfalah</p>
                            </div>
                        </div>
                        <button 
                            onClick={openAddModal} 
                            className="inline-flex items-center gap-4 bg-white dark:bg-white/5 hover:bg-pink-600 hover:text-white px-8 py-4 rounded-[1.75rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-gray-100 dark:border-white/10 shadow-xl active:scale-95 group/btn"
                        >
                            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" /> ATTACH NETWORK
                        </button>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <AnimatePresence mode="popLayout">
                            {links.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="col-span-full py-24 flex flex-col items-center justify-center text-center p-10 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-black/20"
                                >
                                    <div className="w-20 h-20 bg-white dark:bg-white/5 rounded-[1.75rem] flex items-center justify-center text-gray-300 mb-8 shadow-inner animate-pulse">
                                        <Globe size={40} />
                                    </div>
                                    <h4 className="text-lg font-black font-fraunces text-gray-900 dark:text-gray-100 uppercase tracking-tight mb-2">No Social Footprint</h4>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest max-w-xs leading-relaxed italic">
                                        Madrasah belum terintegrasi dengan platform sosial media publik manapun.
                                    </p>
                                </motion.div>
                            ) : (
                                links.map((item, idx) => {
                                    const info = getPlatformInfo(item.platform);
                                    return (
                                        <motion.div 
                                            key={item.platform}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group/card relative p-8 rounded-[2.5rem] bg-gray-50/50 dark:bg-black/20 border border-gray-100 dark:border-white/5 transition-all hover:bg-white dark:hover:bg-white/5 hover:shadow-2xl hover:shadow-pink-500/5 hover:-translate-y-1"
                                        >
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-4 bg-white dark:bg-black/40 rounded-2xl ${info.color} shadow-lg transition-transform group-hover/card:rotate-12 duration-500 ring-1 ring-gray-100 dark:ring-white/5`}>
                                                        <info.icon size={24} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-gray-950 dark:text-white uppercase tracking-tight leading-none mb-1">{info.label}</h4>
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Connected</p>
                                                    </div>
                                                </div>
                                                <div className="opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center gap-2">
                                                    <button 
                                                        onClick={() => openEditModal(item)} 
                                                        className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button 
                                                        onClick={() => deleteItem(item.platform)} 
                                                        className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-white/50 dark:bg-black/40 rounded-2xl border border-gray-100 dark:border-white/5">
                                                <div className="flex items-center gap-3 text-gray-400 mb-2">
                                                    <Link2 size={12} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest italic opacity-60">Canonical URL</span>
                                                </div>
                                                <p className="font-mono text-[10px] text-gray-500 dark:text-gray-400 break-all line-clamp-2 leading-relaxed italic">
                                                    {item.url}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="mt-14 p-8 bg-pink-500/5 rounded-[3rem] border border-pink-500/10 flex gap-6 items-center">
                    <div className="p-3 bg-pink-500 rounded-2xl text-white shadow-xl ring-4 ring-pink-500/10 transition-transform group-hover:rotate-12"><Info size={20}/></div>
                    <div>
                        <p className="text-[10px] font-black text-pink-600 dark:text-pink-400 uppercase tracking-[0.2em] mb-1.5 leading-none italic">Social Engine Advisory</p>
                        <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 leading-relaxed italic uppercase tracking-widest">
                            Tautan media sosial yang Anda konfigurasikan akan tampil secara dinamis pada Sidebar Utama, Footer, dan Widget Kontak publik.
                        </p>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {isModalOpen && editingItem && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-[#080B09]/80 backdrop-blur-xl"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-sm bg-white/90 dark:bg-[#151b18]/90 backdrop-blur-2xl rounded-[4rem] border border-white dark:border-white/10 shadow-3xl overflow-hidden font-sans"
                        >
                            <div className="p-10 lg:p-14">
                                <div className="flex items-center justify-between mb-12">
                                    <div className="flex items-center gap-5">
                                        <div className="p-3 bg-pink-600 rounded-2xl text-white shadow-xl shadow-pink-600/20">
                                            <Share2 size={24} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none mb-1.5">Network Sync</h3>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic leading-none">Manajemen integrasi sosial</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="w-10 h-10 flex items-center justify-center rounded-2xl bg-gray-50 dark:bg-black/40 hover:bg-red-500 hover:text-white transition-all border border-gray-100 dark:border-white/5 active:scale-90"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-4 group">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 transition-colors group-focus-within:text-pink-500">PLATFORM REGISTRY</label>
                                        <select
                                            value={editingItem.platform}
                                            onChange={(event) => setEditingItem({ ...editingItem, platform: event.target.value })}
                                            disabled={links.some((item) => item.platform === editingItem.platform)}
                                            className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/40 px-6 py-4 text-sm font-bold text-gray-950 dark:text-white focus:ring-4 focus:ring-pink-500/5 outline-none shadow-inner transition-all border-pink-500/0 focus:border-pink-500 appearance-none disabled:opacity-50"
                                        >
                                            <option value="" disabled className="dark:bg-[#151b18]">Select Destination</option>
                                            {PLATFORM_OPTIONS.map((platform) => (
                                                <option key={platform.id} value={platform.id} className="dark:bg-[#151b18]">
                                                    {platform.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-4 group">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 transition-colors group-focus-within:text-pink-500">FULL DESTINATION URL</label>
                                        <input
                                            type="url"
                                            value={editingItem.url}
                                            onChange={(event) => setEditingItem({ ...editingItem, url: event.target.value })}
                                            placeholder="https://platform.com/profile"
                                            className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/40 px-6 py-4 font-mono text-sm text-pink-600 dark:text-pink-400 focus:ring-4 focus:ring-pink-500/5 outline-none shadow-inner transition-all border-pink-500/0 focus:border-pink-500"
                                        />
                                    </div>
                                </div>

                                <div className="mt-12 flex items-center justify-end gap-5 border-t border-gray-100 dark:border-white/5 pt-10">
                                    <button 
                                        onClick={() => setIsModalOpen(false)} 
                                        className="px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 dark:hover:bg-black/40 transition-all"
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        onClick={handleModalSave}
                                        disabled={!editingItem.platform || !editingItem.url || saving}
                                        className="flex items-center gap-4 rounded-2xl bg-pink-600 px-10 py-5 text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-2xl shadow-pink-600/30 transition-all hover:bg-pink-500 hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <>
                                                <RefreshCcw size={18} className="animate-spin" />
                                                SYNCHRONIZING...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 size={18} />
                                                COMMIT LINK
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
