'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Check, MessageCircle, Plus, RefreshCcw, Save, X, 
    User, Phone, Trash2, Edit2, Zap, Star, 
    CheckCircle2, Info, ShieldCheck, Activity
} from 'lucide-react';
import type { AdminSiteSettings, WhatsappContact } from '@/lib/admin-site-settings';

type Props = {
    settings: AdminSiteSettings;
    onSave: (payload: Partial<AdminSiteSettings>) => void;
    saving: boolean;
};

const createEmptyContact = (): WhatsappContact => ({
    id: Math.random().toString(36).slice(2, 11),
    name: '',
    number: '',
});

export default function WhatsappSettingsTab({ settings, onSave, saving }: Props) {
    const [list, setList] = useState<WhatsappContact[]>(settings.whatsappList);
    const [adminWhatsappId, setAdminWhatsappId] = useState(settings.adminWhatsappId);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<WhatsappContact | null>(null);

    const saveChanges = (nextList: WhatsappContact[], nextAdminWhatsappId: string | null) => {
        const defaultContact = nextList.find((item) => item.id === nextAdminWhatsappId) || nextList[0];
        onSave({
            whatsappList: nextList,
            adminWhatsappId: nextAdminWhatsappId,
            schoolWhatsapp: defaultContact ? defaultContact.number : null,
        });
    };

    const openAddModal = () => {
        setEditingItem(createEmptyContact());
        setIsModalOpen(true);
    };

    const openEditModal = (item: WhatsappContact) => {
        setEditingItem({ ...item });
        setIsModalOpen(true);
    };

    const handleModalSave = () => {
        if (!editingItem || !editingItem.name || !editingItem.number) return;

        const normalized = editingItem.number.startsWith('0') ? `62${editingItem.number.slice(1)}` : editingItem.number;
        const nextItem = { ...editingItem, number: normalized };
        const nextList = [...list];
        const existingIndex = nextList.findIndex((item) => item.id === nextItem.id);

        if (existingIndex >= 0) {
            nextList[existingIndex] = nextItem;
        } else {
            nextList.push(nextItem);
        }

        setList(nextList);
        setIsModalOpen(false);
        saveChanges(nextList, adminWhatsappId);
    };

    const deleteItem = (id: string) => {
        if (!window.confirm('Hapus nomor ini?')) return;
        const nextList = list.filter((item) => item.id !== id);
        const nextAdminWhatsappId = adminWhatsappId === id ? null : adminWhatsappId;
        setList(nextList);
        setAdminWhatsappId(nextAdminWhatsappId);
        saveChanges(nextList, nextAdminWhatsappId);
    };

    const setPrimary = (id: string) => {
        setAdminWhatsappId(id);
        saveChanges(list, id);
    };

    return (
        <div className="max-w-6xl space-y-10 font-sans">
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl rounded-[3.5rem] border border-white dark:border-white/10 shadow-3xl p-10 lg:p-14 relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -translate-y-32 translate-x-32" />
                
                <div className="relative z-10">
                    <div className="mb-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-[1.75rem] text-emerald-600 shadow-inner group-hover:rotate-6 transition-transform duration-700">
                                <MessageCircle size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none mb-2">WhatsApp Hub</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] italic">Gerbang Komunikasi Instan</p>
                            </div>
                        </div>
                        <button 
                            onClick={openAddModal} 
                            className="inline-flex items-center gap-4 bg-white dark:bg-white/5 hover:bg-emerald-600 hover:text-white px-8 py-4 rounded-[1.75rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-gray-100 dark:border-white/10 shadow-xl active:scale-95 group/btn"
                        >
                            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" /> SYNC NEW CONTACT
                        </button>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        <AnimatePresence mode="popLayout">
                            {list.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="col-span-full py-24 flex flex-col items-center justify-center text-center p-10 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-black/20"
                                >
                                    <div className="w-20 h-20 bg-white dark:bg-white/5 rounded-[1.75rem] flex items-center justify-center text-gray-300 mb-8 shadow-inner animate-pulse">
                                        <MessageCircle size={40} />
                                    </div>
                                    <h4 className="text-lg font-black font-fraunces text-gray-900 dark:text-gray-100 uppercase tracking-tight mb-2">Hub Disconnected</h4>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest max-w-xs leading-relaxed italic">
                                        Sistem belum memiliki saluran komunikasi WhatsApp aktif.
                                    </p>
                                </motion.div>
                            ) : (
                                list.map((item, idx) => {
                                    const isPrimary = adminWhatsappId === item.id;
                                    return (
                                        <motion.div 
                                            key={item.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className={`group/card relative p-8 rounded-[3rem] border transition-all duration-700 hover:-translate-y-1 hover:shadow-2xl ${
                                                isPrimary 
                                                    ? 'bg-emerald-600 dark:bg-emerald-600 text-white border-emerald-500 shadow-2xl shadow-emerald-500/40' 
                                                    : 'bg-gray-50/50 dark:bg-black/20 border-gray-100 dark:border-white/5 hover:bg-white dark:hover:bg-white/5 hover:border-emerald-500/30'
                                            }`}
                                        >
                                            {isPrimary && (
                                                <div className="absolute top-6 right-8 bg-white/20 p-2 rounded-xl text-white backdrop-blur-md">
                                                    <Star size={16} fill="currentColor" />
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center gap-5 mb-10">
                                                <div className={`p-4 rounded-2xl transition-all duration-700 shadow-xl ${isPrimary ? 'bg-white text-emerald-600' : 'bg-white dark:bg-black/40 text-emerald-600 shadow-emerald-500/5 group-hover/card:rotate-12 ring-1 ring-gray-100 dark:ring-white/5'}`}>
                                                    <User size={24} />
                                                </div>
                                                <div>
                                                    <h4 className={`text-base font-black uppercase tracking-tight leading-none mb-1.5 ${isPrimary ? 'text-white' : 'text-gray-950 dark:text-white'}`}>{item.name}</h4>
                                                    <p className={`text-[9px] font-black uppercase tracking-[0.2em] italic ${isPrimary ? 'text-emerald-100' : 'text-gray-400'}`}>
                                                        {isPrimary ? 'PRIMARY ENGINE' : 'STANDBY NODE'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className={`p-4 rounded-2xl border transition-all duration-500 ${isPrimary ? 'bg-white/10 border-white/20' : 'bg-white dark:bg-black/40 border-gray-100 dark:border-white/5 ring-1 ring-emerald-500/5'}`}>
                                                <div className="flex items-center gap-3 mb-2 opacity-60">
                                                    <Phone size={12} />
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Contact Protocol</span>
                                                </div>
                                                <p className={`font-mono text-sm font-black tracking-widest ${isPrimary ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                    +{item.number}
                                                </p>
                                            </div>

                                            <div className={`mt-8 flex items-center justify-between gap-4 border-t transition-all pt-6 ${isPrimary ? 'border-white/10' : 'border-gray-100 dark:border-white/5'}`}>
                                                <button
                                                    onClick={() => setPrimary(item.id)}
                                                    disabled={isPrimary}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                                                        isPrimary 
                                                            ? 'bg-white/20 text-white cursor-default' 
                                                            : 'text-gray-400 hover:bg-emerald-500 hover:text-white'
                                                    }`}
                                                >
                                                    {isPrimary ? 'DEFAULT' : 'BOOT PRIMARY'}
                                                </button>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => openEditModal(item)} 
                                                        className={`p-2 rounded-xl transition-all ${isPrimary ? 'bg-white/20 text-white hover:bg-white hover:text-emerald-600' : 'bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white'}`}
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    {!isPrimary && (
                                                        <button 
                                                            onClick={() => deleteItem(item.id)} 
                                                            className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="mt-14 p-8 bg-emerald-500/5 rounded-[3rem] border border-emerald-500/10 flex gap-6 items-start">
                    <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-xl ring-4 ring-emerald-500/10 transition-transform group-hover:rotate-12"><Info size={20}/></div>
                    <div>
                        <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-1.5 leading-none italic">Hub Priority Advisory</p>
                        <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 leading-relaxed italic uppercase tracking-widest">
                            Kontak yang diatur sebagai <strong className="text-emerald-600 dark:text-emerald-400">PRIMARY ENGINE</strong> akan diprioritaskan untuk widget floating chat dan link direct marketing di header publik.
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
                                        <div className="p-3 bg-emerald-600 rounded-2xl text-white shadow-xl shadow-emerald-600/20">
                                            <Zap size={24} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none mb-1.5">Contact Sync</h3>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic leading-none">Pendaftaran terminal komunikasi</p>
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
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 transition-colors group-focus-within:text-emerald-500">CONTACT ALIAS / NAME</label>
                                        <input
                                            type="text"
                                            value={editingItem.name}
                                            onChange={(event) => setEditingItem({ ...editingItem, name: event.target.value })}
                                            className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 px-6 py-4 text-sm font-bold text-gray-950 dark:text-white focus:ring-4 focus:ring-emerald-500/5 outline-none shadow-inner transition-all border-emerald-500/0 focus:border-emerald-500"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="space-y-4 group">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 transition-colors group-focus-within:text-emerald-500">WA NUMBER (INTERNATIONAL FORMAT: 628...)</label>
                                        <input
                                            type="text"
                                            value={editingItem.number}
                                            placeholder="628123456789"
                                            onChange={(event) => setEditingItem({ ...editingItem, number: event.target.value.replace(/\D/g, '') })}
                                            className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/40 px-6 py-4 font-mono text-sm text-emerald-600 dark:text-emerald-400 focus:ring-4 focus:ring-emerald-500/5 outline-none shadow-inner transition-all border-emerald-500/0 focus:border-emerald-500"
                                        />
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4 italic px-1">Gunakan angka saja, tanpa spasi/simbol.</p>
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
                                        disabled={!editingItem.name || !editingItem.number || saving}
                                        className="flex items-center gap-4 rounded-2xl bg-emerald-600 px-10 py-5 text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/30 transition-all hover:bg-emerald-500 hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <>
                                                <RefreshCcw size={18} className="animate-spin" />
                                                SYNCHRONIZING...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 size={18} />
                                                COMMIT CONTACT
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
