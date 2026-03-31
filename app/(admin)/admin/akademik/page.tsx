'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SidebarAdmin from '@/components/sidebar-admin';
import HeaderAdmin from '@/components/header-admin';
import { 
    Plus, Save, Trash2, Image as ImageIcon, BookOpen, 
    Layout, Layers, Sparkles, CheckCircle2, Type, 
    FileText, Hash, ChevronLeft, ChevronRight, Play, 
    Eye, Loader2, Globe, Settings2, GripVertical, AlertCircle
} from 'lucide-react';
import MediaUploadButton from '@/components/admin/MediaUploadButton';
import MediaManager, { MediaForm } from '@/components/admin/MediaManager';

type AcademicPageForm = {
    id?: string | null;
    title: string;
    subtitle: string;
    content: string;
    isActive: boolean;
};

type AcademicSectionForm = {
    id?: string;
    title: string;
    body: string;
    displayOrder: number;
};

const DEFAULT_PAGE: AcademicPageForm = {
    id: null,
    title: '',
    subtitle: '',
    content: '',
    isActive: true,
};

const AdminAkademikPage: React.FC = () => {
    const [page, setPage] = useState<AcademicPageForm>(DEFAULT_PAGE);
    const [sections, setSections] = useState<AcademicSectionForm[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [saving, setSaving] = useState(false);
    const [coverUrl, setCoverUrl] = useState<string>('');
    const [mediaItems, setMediaItems] = useState<MediaForm[]>([]);
    const [mediaPreviewIndex, setMediaPreviewIndex] = useState(0);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/academic-page');
            const data = await res.json();
            if (data?.page) {
                setPage({
                    id: data.page.id || null,
                    title: data.page.title || '',
                    subtitle: data.page.subtitle || '',
                    content: data.page.content || '',
                    isActive: data.page.isActive ?? true,
                });
            } else {
                setPage(DEFAULT_PAGE);
            }

            setSections(Array.isArray(data?.sections) ? data.sections : []);
            const cover = data?.coverUrl || '';
            setCoverUrl(cover);

            const mappedMedia = (Array.isArray(data?.media) ? data.media : [])
                .filter((item: any) => !item.isMain)
                .map((item: any, idx: number) => ({
                    id: item.id,
                    mediaType: item.mediaType || 'image',
                    url: item.mediaUrl || '',
                    embedHtml: item.mediaType === 'youtube_embed' ? (item.mediaUrl || '') : '',
                    caption: item.caption || '',
                    displayOrder: item.displayOrder || idx + 1,
                    isActive: true,
                }));
            setMediaItems(mappedMedia);
        } catch (error) {
            console.error('Failed to fetch academic page', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const savePage = async () => {
        setMessage(null);
        setSaving(true);
        try {
            const mediaPayload = mediaItems
                .map((m, idx) => ({
                    mediaType: m.mediaType,
                    mediaUrl: m.mediaType === 'youtube_embed' ? (m.embedHtml || m.url) : m.url,
                    caption: m.caption || '',
                    displayOrder: m.displayOrder || idx + 1,
                }))
                .filter((m) => m.mediaUrl);

            const payload = {
                page,
                sections,
                media: mediaPayload,
                coverUrl: coverUrl || null,
            };

            const res = await fetch('/api/admin/academic-page', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                setMessage({ text: 'Data akademik berhasil diperbarui secara global.', type: 'success' });
                setTimeout(() => setMessage(null), 4000);
                fetchData();
            } else {
                const err = await res.json().catch(() => ({}));
                setMessage({ text: err.error || 'Gagal menyimpan data akademik.', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Terjadi kesalahan pada server.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const addSection = () => {
        setSections([
            ...sections,
            {
                title: '',
                body: '',
                displayOrder: sections.length + 1,
            },
        ]);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080B09] text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <SidebarAdmin />
            
            <main className="min-h-screen lg:pl-64 pb-20">
                <HeaderAdmin 
                    title="Portal Akademik"
                    subtitle="Kelola kurikulum, program unggulan, dan sarana edukasi madrasah"
                    action={
                        <button
                            onClick={savePage}
                            disabled={saving}
                            className="group inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 sm:py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} className="group-hover:-rotate-12 transition-transform" />}
                            <span>PUBLISH CHANGES</span>
                        </button>
                    }
                />

                <div className="px-4 sm:px-8 mt-6 sm:mt-10 space-y-10 max-w-7xl mx-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-48 bg-white/50 dark:bg-white/5 rounded-[4rem] border border-gray-100 dark:border-white/10 backdrop-blur-xl">
                            <div className="relative">
                                <div className="w-20 h-20 border-4 border-emerald-500/10 rounded-full"></div>
                                <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                            </div>
                            <p className="mt-8 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-[0.4em] animate-pulse">Menghubungkan Database Akademik...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
                            {/* Main Layout Area */}
                            <div className="lg:col-span-8 space-y-10">
                                {/* Page Narrative Grid */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white/80 dark:bg-[#151b18]/90 backdrop-blur-3xl rounded-[3rem] border border-gray-100 dark:border-white/10 shadow-2xl p-8 sm:p-12"
                                >
                                    <div className="flex items-center gap-5 mb-10">
                                        <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600">
                                            <Layout size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight">Narasi Utama</h3>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Identitas dan tagline utama segmen akademik</p>
                                        </div>
                                    </div>

                                    <div className="space-y-10">
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] pl-1">
                                                <Sparkles size={12} className="text-emerald-500" /> Page Title Headline
                                            </label>
                                            <input
                                                value={page.title}
                                                onChange={(e) => setPage({ ...page, title: e.target.value })}
                                                className="w-full rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-black/30 px-6 py-4.5 text-base font-black font-fraunces text-gray-950 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-inner"
                                                placeholder="Contoh: Kurikulum Terpadu & Modern"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] pl-1">
                                                <Globe size={12} className="text-emerald-500" /> Sub-caption Description
                                            </label>
                                            <input
                                                value={page.subtitle}
                                                onChange={(e) => setPage({ ...page, subtitle: e.target.value })}
                                                className="w-full rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-black/30 px-6 py-4 text-sm font-bold text-gray-700 dark:text-gray-300 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                                placeholder="Tagline singkat yang merangkum visi akademik"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] pl-1">
                                                <FileText size={12} className="text-emerald-500" /> Main Body Content
                                            </label>
                                            <textarea
                                                value={page.content}
                                                onChange={(e) => setPage({ ...page, content: e.target.value })}
                                                rows={8}
                                                className="w-full rounded-[2rem] border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-black/30 px-6 py-6 text-sm font-medium leading-relaxed text-gray-800 dark:text-gray-100 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-inner scrollbar-none"
                                                placeholder="Deskripsikan program pendidikan secara mendalam..."
                                            />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Academic Segments Grid */}
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-indigo-100 dark:bg-indigo-500/10 rounded-2xl text-indigo-600">
                                                <Layers size={24} />
                                            </div>
                                            <h3 className="text-xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight">Segmen Akademik</h3>
                                        </div>
                                        <button 
                                            onClick={addSection}
                                            className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                                        >
                                            <Plus size={16} /> ADD SEGMENT
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6">
                                        <AnimatePresence mode="popLayout">
                                            {sections.map((section, idx) => (
                                                <motion.div 
                                                    key={section.id || idx}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    className="group relative bg-white/70 dark:bg-[#151b18]/80 backdrop-blur-xl p-8 rounded-[3rem] border border-gray-100 dark:border-white/10 shadow-xl hover:border-indigo-500/20 transition-all overflow-hidden"
                                                >
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
                                                    
                                                    <div className="flex items-start justify-between mb-8">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-500/20">
                                                                {idx + 1}
                                                            </div>
                                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic group-hover:text-indigo-500 transition-colors">Segment Profil #{idx + 1}</div>
                                                        </div>
                                                        <button
                                                            onClick={() => setSections(sections.filter((_, i) => i !== idx))}
                                                            className="p-3 text-red-100 hover:text-red-500 bg-red-500/5 hover:bg-red-500/10 rounded-xl transition-all"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-[1fr_140px] gap-8">
                                                        <div className="space-y-6">
                                                            <div className="relative">
                                                                <input
                                                                    value={section.title}
                                                                    onChange={(e) => {
                                                                        const next = [...sections];
                                                                        next[idx] = { ...section, title: e.target.value };
                                                                        setSections(next);
                                                                    }}
                                                                    className="w-full bg-transparent border-b-2 border-gray-100 dark:border-white/5 py-3 text-lg font-black font-fraunces text-gray-950 dark:text-white outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-300"
                                                                    placeholder="Judul Segmen (Misal: Program Unggulan)"
                                                                />
                                                            </div>
                                                            <textarea
                                                                value={section.body}
                                                                onChange={(e) => {
                                                                    const next = [...sections];
                                                                    next[idx] = { ...section, body: e.target.value };
                                                                    setSections(next);
                                                                }}
                                                                rows={3}
                                                                className="w-full bg-gray-50/50 dark:bg-black/20 rounded-2xl p-5 text-sm font-medium text-gray-600 dark:text-gray-400 outline-none focus:ring-4 focus:ring-indigo-500/5 border border-transparent focus:border-indigo-500/20 transition-all placeholder:text-gray-300"
                                                                placeholder="Deskripsi singkat program akademik..."
                                                            />
                                                        </div>
                                                        <div className="bg-gray-50/80 dark:bg-black/40 p-6 rounded-[2rem] flex flex-col items-center justify-center gap-3 border border-gray-100 dark:border-white/5 group-hover:border-indigo-500/20 transition-all">
                                                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Display Order</label>
                                                            <div className="flex items-center gap-4">
                                                                <input
                                                                    type="number"
                                                                    value={section.displayOrder}
                                                                    onChange={(e) => {
                                                                        const next = [...sections];
                                                                        next[idx] = { ...section, displayOrder: Number(e.target.value) };
                                                                        setSections(next);
                                                                    }}
                                                                    className="w-16 bg-white dark:bg-white/5 rounded-xl py-3 text-center text-xl font-black text-indigo-600 outline-none shadow-sm"
                                                                />
                                                            </div>
                                                            <GripVertical size={16} className="text-gray-300 mt-2" />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>

                                        {sections.length === 0 && (
                                            <div className="text-center py-24 bg-white/30 dark:bg-white/5 rounded-[4rem] border-4 border-dashed border-gray-100 dark:border-white/5 flex flex-col items-center justify-center pointer-events-none opacity-50">
                                                <Layers size={64} className="text-gray-200 dark:text-gray-800 mb-6" />
                                                <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Belum Ada Segmen Tambahan</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Media Asset Management Block */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white/70 dark:bg-[#151b18]/80 backdrop-blur-3xl rounded-[3rem] border border-gray-100 dark:border-white/10 shadow-2xl p-8 sm:p-12 overflow-hidden"
                                >
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="p-3 bg-amber-100 dark:bg-amber-500/10 rounded-2xl text-amber-600">
                                            <BookOpen size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight">Galeri Pendukung</h3>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Dokumentasi visual kegiatan edukasi</p>
                                        </div>
                                    </div>
                                    <div className="p-2 sm:p-6 bg-gray-50/50 dark:bg-black/30 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-inner">
                                        <MediaManager
                                            items={mediaItems}
                                            onChange={setMediaItems}
                                            onMessage={(msg) => setMessage({ text: msg, type: 'success' })}
                                        />
                                    </div>
                                </motion.div>
                            </div>

                            {/* Options Area (Sidebar) */}
                            <div className="lg:col-span-4 space-y-8">
                                {/* Page Settings */}
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white/80 dark:bg-[#151b18]/90 backdrop-blur-3xl rounded-[3rem] border border-gray-100 dark:border-white/10 shadow-2xl p-8 space-y-8 sticky top-24"
                                >
                                    {/* Status Toggle */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between px-2">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tighter">Status Publikasi</span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{page.isActive ? 'ONLINE' : 'DRAFT'}</span>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer group">
                                                <input 
                                                    type="checkbox" 
                                                    checked={page.isActive}
                                                    onChange={(e) => setPage({ ...page, isActive: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-16 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 shadow-inner group-active:scale-95 duration-500"></div>
                                            </label>
                                        </div>
                                        <div className={`p-5 rounded-2xl border text-[10px] font-bold uppercase tracking-widest leading-relaxed text-center ${page.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/5' : 'bg-gray-50 text-gray-400 border-gray-100 dark:bg-white/5'}`}>
                                            {page.isActive ? 'Terlihat oleh semua pengunjung website.' : 'Tersembunyi dari menu publik.'}
                                        </div>
                                    </div>

                                    <div className="h-px bg-gray-100 dark:bg-white/5 mx-2" />

                                    {/* Hero Image */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 px-2">
                                            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600">
                                                <ImageIcon size={18} />
                                            </div>
                                            <label className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">Main Cover Visual</label>
                                        </div>
                                        
                                        <div className="relative group aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-gray-50 dark:bg-black/40 border-2 border-dashed border-gray-100 dark:border-white/10 group-hover:border-emerald-500/30 transition-all shadow-inner">
                                            {coverUrl ? (
                                                <>
                                                    <img src={coverUrl} alt="Hero" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm pointer-events-none group-hover:pointer-events-auto">
                                                        <button
                                                            onClick={() => setCoverUrl('')}
                                                            className="p-5 bg-red-600 text-white rounded-3xl shadow-2xl hover:scale-110 active:scale-95 transition-all"
                                                        >
                                                            <Trash2 size={24} />
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-5 p-8 text-center">
                                                    <div className="p-5 bg-white dark:bg-white/5 rounded-[2rem] shadow-xl">
                                                        <Settings2 size={40} strokeWidth={1.5} className="animate-spin-slow" />
                                                    </div>
                                                    <span className="text-[8px] font-black uppercase tracking-[0.3em] leading-relaxed">System Ready <br/> Target: Academic Coverage</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="px-2">
                                            <MediaUploadButton
                                                folder="mis-al-falah/academic"
                                                label={coverUrl ? "REPLACE HERO IMAGE" : "UPLOAD COVER RESOLUTION"}
                                                onUploaded={(url) => setCoverUrl(url)}
                                            />
                                            <p className="mt-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest italic text-center leading-relaxed">
                                                Rekomendasi: 1920x1080 (16:9) <br/> untuk hasil visual terbaik.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    )}
                </div>

                {/* NOTIFICATION TOAST */}
                <AnimatePresence>
                    {message && (
                        <motion.div 
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className={`fixed bottom-10 right-10 z-[200] flex items-center gap-5 px-8 py-5 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] backdrop-blur-2xl border border-white/20 overflow-hidden ${
                                message.type === 'success' ? 'bg-emerald-600/95 text-white' : 'bg-red-600/95 text-white'
                            }`}
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                            <div className="p-3 bg-white/20 rounded-2xl shadow-inner">
                                {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                            </div>
                            <div className="relative">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-0.5">Academic System Response</p>
                                <p className="text-sm font-black uppercase tracking-tight">{message.text}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default AdminAkademikPage;
