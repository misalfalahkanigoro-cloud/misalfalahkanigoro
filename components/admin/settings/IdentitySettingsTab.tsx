'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Download, Globe, RefreshCcw, Save, X, 
    MapPin, Mail, Layout, Type, Sparkles, 
    Camera, Info, ShieldCheck, Zap, Star, CheckCircle2
} from 'lucide-react';
import type { AdminSiteSettings } from '@/lib/admin-site-settings';

type Props = {
    settings: AdminSiteSettings;
    onSave: (payload: Partial<AdminSiteSettings>) => void;
    saving: boolean;
};

type UploadTarget = 'logo' | 'favicon';

const ACCEPTED_EXTENSIONS: Record<UploadTarget, string[]> = {
    logo: ['jpg', 'jpeg', 'png'],
    favicon: ['ico'],
};

export default function IdentitySettingsTab({ settings, onSave, saving }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState(settings);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingFavicon, setUploadingFavicon] = useState(false);

    const handleSave = () => {
        onSave(form);
        setIsEditing(false);
    };

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: UploadTarget) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
        if (!ACCEPTED_EXTENSIONS[type].includes(fileExt)) {
            const label = type === 'logo' ? 'Logo hanya menerima format JPG, JPEG, dan PNG.' : 'Favicon hanya menerima format ICO.';
            window.alert(`Gagal: ${label}`);
            event.target.value = '';
            return;
        }

        const prefix = type === 'logo' ? 'header' : 'favicon';
        const setUploading = type === 'logo' ? setUploadingLogo : setUploadingFavicon;
        setUploading(true);

        try {
            await fetch('/api/admin/storage', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bucket: 'publikweb', path: prefix, isFolder: true }),
            }).catch(console.error);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('bucket', 'publikweb');
            formData.append('folder', prefix);
            formData.append('path', `${prefix}/${Date.now()}_${file.name.replace(/\s+/g, '-')}`);

            const response = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Gagal mengunggah file');
            }

            const data = await response.json();
            const newUrl = data.url as string;

            if (type === 'logo') {
                setForm((prev) => ({ ...prev, schoolLogoUrl: newUrl }));
                onSave({ schoolLogoUrl: newUrl });
            } else {
                setForm((prev) => ({ ...prev, faviconUrl: newUrl }));
                onSave({ faviconUrl: newUrl });
            }
        } catch (error) {
            console.error('Upload error:', error);
            window.alert('Gagal mengunggah gambar.');
        } finally {
            setUploading(false);
            event.target.value = '';
        }
    };

    const InfoCard = ({ icon: Icon, label, value, mono = false }: { icon: any, label: string, value: string, mono?: boolean }) => (
        <div className="group space-y-3 p-6 bg-gray-50/50 dark:bg-black/20 rounded-[2rem] border border-gray-100 dark:border-white/5 hover:bg-white dark:hover:bg-white/5 transition-all duration-500 hover:shadow-xl hover:shadow-emerald-500/5">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white dark:bg-white/5 rounded-xl text-gray-400 group-hover:text-emerald-500 transition-colors shadow-sm ring-1 ring-gray-100 dark:ring-white/5">
                    <Icon size={16} />
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</span>
            </div>
            <div className={`text-sm font-bold text-gray-900 dark:text-white leading-relaxed px-1 ${mono ? 'font-mono text-xs opacity-60 break-all line-clamp-2' : ''}`}>
                {value || <span className="text-gray-300 dark:text-white/10 italic">Not set</span>}
            </div>
        </div>
    );

    return (
        <div className="grid gap-10 lg:grid-cols-3 font-sans">
            <div className="space-y-8 lg:col-span-2">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white dark:border-white/10 shadow-2xl p-10 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 blur-[80px] -translate-y-24 translate-x-24" />
                    
                    <div className="relative z-10">
                        <div className="mb-12 flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-emerald-600 shadow-inner">
                                    <Layout size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none mb-1.5">Profil & Lokasi</h3>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Identitas fundamental sistem MI Alfalah</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsEditing(true)} 
                                className="inline-flex items-center gap-3 bg-white dark:bg-white/5 hover:bg-emerald-600 hover:text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-gray-100 dark:border-white/10 shadow-sm active:scale-95"
                            >
                                <Zap size={14} className="animate-pulse" /> EDIT PARAMETERS
                            </button>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <InfoCard icon={Star} label="Judul Tab Browser" value={settings.siteTitle || ''} />
                            <InfoCard icon={ShieldCheck} label="Nama Resmi Madrasah" value={settings.schoolName || ''} />
                            <InfoCard icon={Sparkles} label="Tagline / Motto" value={settings.schoolTagline || ''} />
                            <InfoCard icon={Mail} label="Email Korespondensi" value={settings.schoolEmail || ''} />
                            <div className="sm:col-span-2">
                                <InfoCard icon={MapPin} label="Alamat Fisik Lengkap" value={settings.schoolAddress || ''} />
                            </div>
                            <div className="sm:col-span-2">
                                <InfoCard icon={Globe} label="Maps Engine Integration" value={settings.mapEmbedHtml || ''} mono />
                            </div>
                        </div>
                    </div>
                </motion.div>

                <AnimatePresence>
                    {isEditing && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsEditing(false)}
                                className="absolute inset-0 bg-[#080B09]/80 backdrop-blur-xl"
                            />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative w-full max-w-2xl bg-white/90 dark:bg-[#151b18]/90 backdrop-blur-2xl rounded-[4rem] border border-white dark:border-white/10 shadow-3xl overflow-hidden"
                            >
                                <div className="p-10 lg:p-14">
                                    <div className="flex items-center justify-between mb-12">
                                        <div className="flex items-center gap-5">
                                            <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-xl shadow-emerald-500/20">
                                                <Zap size={24} strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none mb-1.5">Override Identity</h3>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic leading-none">Sinkronisasi parameter global sistem</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-50 dark:bg-black/40 hover:bg-red-500 hover:text-white transition-all border border-gray-100 dark:border-white/5 active:scale-90"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                                        <div className="grid gap-8 md:grid-cols-2">
                                            <div className="space-y-4 group">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 transition-colors group-focus-within:text-emerald-500">BROWSER TAB TITLE</label>
                                                <input
                                                    type="text"
                                                    value={form.siteTitle || ''}
                                                    onChange={(event) => setForm({ ...form, siteTitle: event.target.value })}
                                                    className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 px-6 py-4 text-sm font-bold text-gray-950 dark:text-white focus:ring-4 focus:ring-emerald-500/5 outline-none shadow-inner transition-all border-emerald-500/0 focus:border-emerald-500"
                                                />
                                            </div>
                                            <div className="space-y-4 group">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 transition-colors group-focus-within:text-emerald-500">SCHOOL LEGAL NAME</label>
                                                <input
                                                    type="text"
                                                    value={form.schoolName || ''}
                                                    onChange={(event) => setForm({ ...form, schoolName: event.target.value })}
                                                    className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 px-6 py-4 text-sm font-bold text-gray-950 dark:text-white focus:ring-4 focus:ring-emerald-500/5 outline-none shadow-inner transition-all border-emerald-500/0 focus:border-emerald-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-8 md:grid-cols-2">
                                            <div className="space-y-4 group">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 transition-colors group-focus-within:text-emerald-500">OFFICIAL CORRESPONDENCE EMAIL</label>
                                                <input
                                                    type="email"
                                                    value={form.schoolEmail || ''}
                                                    onChange={(event) => setForm({ ...form, schoolEmail: event.target.value })}
                                                    className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 px-6 py-4 text-sm font-bold text-gray-950 dark:text-white focus:ring-4 focus:ring-emerald-500/5 outline-none shadow-inner transition-all border-emerald-500/0 focus:border-emerald-500"
                                                />
                                            </div>
                                            <div className="space-y-4 group">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 transition-colors group-focus-within:text-emerald-500">STRATEGIC TAGLINE</label>
                                                <input
                                                    type="text"
                                                    value={form.schoolTagline || ''}
                                                    onChange={(event) => setForm({ ...form, schoolTagline: event.target.value })}
                                                    className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 px-6 py-4 text-sm font-bold text-gray-950 dark:text-white focus:ring-4 focus:ring-emerald-500/5 outline-none shadow-inner transition-all border-emerald-500/0 focus:border-emerald-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4 group">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 transition-colors group-focus-within:text-emerald-500">PHYSICAL ADDRESS</label>
                                            <textarea
                                                value={form.schoolAddress || ''}
                                                onChange={(event) => setForm({ ...form, schoolAddress: event.target.value })}
                                                rows={3}
                                                className="w-full rounded-[2rem] border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 px-8 py-6 text-sm font-bold text-gray-950 dark:text-white focus:ring-4 focus:ring-emerald-500/5 outline-none shadow-inner transition-all border-emerald-500/0 focus:border-emerald-500 leading-relaxed"
                                            />
                                        </div>

                                        <div className="space-y-4 group">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 transition-colors group-focus-within:text-emerald-500">MAPS EMBED ARCHITECTURE (IFRAME)</label>
                                            <textarea
                                                value={form.mapEmbedHtml || ''}
                                                onChange={(event) => setForm({ ...form, mapEmbedHtml: event.target.value })}
                                                placeholder={'Contoh: <iframe src="..." ...></iframe>'}
                                                rows={4}
                                                className="w-full rounded-[2rem] border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 px-8 py-6 font-mono text-xs text-gray-500 dark:text-gray-400 focus:ring-4 focus:ring-emerald-500/5 outline-none shadow-inner transition-all border-emerald-500/0 focus:border-emerald-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-12 flex items-center justify-end gap-5 border-t border-gray-100 dark:border-white/5 pt-10">
                                        <button 
                                            onClick={() => setIsEditing(false)} 
                                            className="px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 dark:hover:bg-black/40 transition-all"
                                        >
                                            CANCEL
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="flex items-center gap-4 rounded-[1.75rem] bg-emerald-600 px-10 py-5 text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/30 transition-all hover:bg-emerald-500 hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                                        >
                                            {saving ? (
                                                <>
                                                    <RefreshCcw size={18} className="animate-spin" />
                                                    SYNCHRONIZING...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={18} />
                                                    COMMIT CHANGES
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

            <div className="space-y-8">
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/40 dark:bg-[#151b18]/80 backdrop-blur-3xl rounded-[3.5rem] border border-white dark:border-white/10 shadow-3xl p-10 relative group"
                >
                    <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 blur-[60px] rounded-full" />
                    
                    <div className="relative z-10 space-y-10">
                        <div className="flex items-center gap-5">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl text-indigo-600 shadow-inner group-hover:rotate-12 transition-transform duration-700">
                                <Star size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none mb-1.5">Aset Visual</h3>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Branding utama madrasah</p>
                            </div>
                        </div>

                        <div className="space-y-10">
                            {/* Logo Row */}
                            <div className="space-y-4 group/asset">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 flex items-center gap-2 group-hover/asset:text-indigo-500 transition-colors">
                                    <Type size={12} className="opacity-50" /> MADRASAH LOGO
                                </label>
                                <div className="relative aspect-[3/2] flex flex-col items-center justify-center p-8 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-black/20 group/media transition-all hover:border-indigo-500/40">
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        {form.schoolLogoUrl ? (
                                            <img src={form.schoolLogoUrl} alt="Logo" className="max-h-full object-contain transition-transform duration-1000 group-hover/media:scale-105" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-4 text-gray-300 dark:text-white/5 opacity-40">
                                                <Globe size={64} className="animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">NO ASSET DETECTED</span>
                                            </div>
                                        )}
                                        
                                        <div className="absolute inset-0 bg-indigo-950/80 opacity-0 group-hover/media:opacity-100 transition-all duration-500 backdrop-blur-md rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center border-4 border-white/10 shadow-3xl">
                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-6">Upgrade Corporate Identity</p>
                                            <label className={`w-full flex items-center justify-center gap-3 bg-white text-indigo-950 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl cursor-pointer ${uploadingLogo ? 'pointer-events-none opacity-50' : ''}`}>
                                                {uploadingLogo ? <RefreshCcw size={18} className="animate-spin" /> : <Camera size={18} />}
                                                {uploadingLogo ? 'PROCESSING...' : 'UPLOAD LOGO'}
                                                <input type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={(event) => handleUpload(event, 'logo')} disabled={uploadingLogo} />
                                            </label>
                                            <p className="text-[8px] font-black text-indigo-200/40 uppercase tracking-widest mt-6 italic">Support: JPG, PNG • Max: 5MB</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Favicon Row */}
                            <div className="space-y-4 group/asset">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 flex items-center gap-2 group-hover/asset:text-indigo-500 transition-colors">
                                    <Download size={12} className="opacity-50 rotate-180" /> BROWSER FAVICON
                                </label>
                                <div className="flex items-center gap-6 p-6 rounded-[2.5rem] bg-gray-50/50 dark:bg-black/20 border border-gray-100 dark:border-white/5 group/media transition-all hover:bg-white dark:hover:bg-black/40">
                                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-white dark:bg-white/5 border border-white dark:border-white/10 shadow-lg flex items-center justify-center shadow-inner">
                                        {form.faviconUrl ? (
                                            <img src={form.faviconUrl} alt="Favicon" className="w-12 h-12 object-contain" />
                                        ) : (
                                            <span className="text-[10px] font-black text-gray-300">ICO</span>
                                        )}
                                        {uploadingFavicon && (
                                            <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in">
                                                <RefreshCcw size={20} className="animate-spin text-indigo-600" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">Icon Signature</p>
                                        <label className={`inline-flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 cursor-pointer active:scale-95 ${uploadingFavicon ? 'pointer-events-none opacity-50' : ''}`}>
                                            ATTACH .ICO
                                            <input type="file" accept=".ico" className="hidden" onChange={(event) => handleUpload(event, 'favicon')} disabled={uploadingFavicon} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="p-8 bg-emerald-500/5 rounded-[3rem] border border-emerald-500/10 flex gap-6 items-start">
                    <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-xl ring-4 ring-emerald-500/10"><Info size={20}/></div>
                    <div>
                        <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-1.5 leading-none italic">Branding engine note</p>
                        <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 leading-relaxed italic">
                            Logo & Favicon yang diunggah akan secara otomatis dibersihkan cache-nya di level server untuk memastikan perubahan instan pada browser pengunjung.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
