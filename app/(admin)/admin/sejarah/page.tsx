'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SidebarAdmin from '@/components/sidebar-admin';
import HeaderAdmin from '@/components/header-admin';
import { StorageUploadWidget } from '@/components/r2-upload-widget';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import {
    Bold, Italic, Heading2, List, ListOrdered, Quote, 
    Undo2, Redo2, Link2, Unlink2, ImagePlus, Video, 
    Plus, Trash2, Save, Sparkles, Calendar, Type, 
    FileText, Camera, ChevronRight, Search, History, 
    CheckCircle2, Info, RefreshCw, Layers, Bookmark, 
    ShieldCheck, Zap, Star
} from 'lucide-react';

type TimelineItem = {
    id: string;
    year: string;
    title: string;
    descriptionText: string;
    mediaUrl: string;
    isActive: boolean;
};

const KelolaSejarahPage: React.FC = () => {
    const [pageId, setPageId] = useState<string | null>(null);
    const [title, setTitle] = useState('Sejarah Madrasah');
    const [subtitle, setSubtitle] = useState('');
    const [coverImageUrl, setCoverImageUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
    const [initialContent, setInitialContent] = useState<string | object>('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Image,
            Link.configure({ openOnClick: false }),
        ],
        content: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/admin/history-page');
                if (!res.ok) return;
                const data = await res.json();
                if (data?.page) {
                    setPageId(data.page.id || null);
                    setTitle(data.page.title || 'Sejarah Madrasah');
                    setSubtitle(data.page.subtitle || '');
                    setCoverImageUrl(data.page.coverImageUrl || '');
                    setVideoUrl(data.page.videoUrl || '');
                    setIsActive(data.page.isActive ?? true);
                    setInitialContent(data.page.contentHtml || data.page.contentJson || data.page.contentText || '');
                }
                if (Array.isArray(data?.timelineItems)) {
                    setTimelineItems(data.timelineItems.map((item: any) => ({
                        id: item.id?.toString() || crypto.randomUUID(),
                        year: item.year || '',
                        title: item.title || '',
                        descriptionText: item.descriptionText || '',
                        mediaUrl: item.mediaUrl || '',
                        isActive: item.isActive ?? true,
                    })));
                }
            } catch (error) {
                console.error('Failed to load history data', error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (editor && initialContent) {
            editor.commands.setContent(initialContent);
        }
    }, [editor, initialContent]);

    const getUploadUrl = (result: any) => {
        if (result?.event !== 'success') return null;
        const info = result.info;
        if (typeof info === 'string') return info;
        if (info && typeof info === 'object') return info.secure_url || info.url || null;
        return null;
    };

    const handleCoverUpload = (result: any) => {
        const secureUrl = getUploadUrl(result);
        if (secureUrl) setCoverImageUrl(secureUrl);
    };

    const handleVideoUpload = (result: any) => {
        const secureUrl = getUploadUrl(result);
        if (secureUrl) setVideoUrl(secureUrl);
    };

    const insertContentImage = (result: any) => {
        if (!editor) return;
        const secureUrl = getUploadUrl(result);
        if (secureUrl) editor.chain().focus().setImage({ src: secureUrl }).run();
    };

    const addTimelineItem = () =>
        setTimelineItems((prev) => [
            ...prev,
            { id: crypto.randomUUID(), year: '', title: '', descriptionText: '', mediaUrl: '', isActive: true },
        ]);

    const removeTimelineItem = (id: string) =>
        setTimelineItems((prev) => prev.filter((item) => item.id !== id));

    const updateTimelineItem = (id: string, field: keyof TimelineItem, value: string | boolean) =>
        setTimelineItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
        );

    const handleTimelineMediaUpload = (id: string, result: any) => {
        const secureUrl = getUploadUrl(result);
        if (secureUrl) updateTimelineItem(id, 'mediaUrl', secureUrl);
    };

    const handleSave = async () => {
        if (!editor) return;
        setSaving(true);
        setMessage(null);
        try {
            const payload = {
                id: pageId, title, subtitle, coverImageUrl, videoUrl, isActive,
                contentJson: editor.getJSON(),
                contentHtml: editor.getHTML(),
                contentText: editor.getText(),
                timelineItems: timelineItems.map((item, index) => ({
                    id: item.id, year: item.year, title: item.title, descriptionText: item.descriptionText,
                    descriptionHtml: item.descriptionText ? `<p>${item.descriptionText.replace(/\n/g, '<br/>')}</p>` : null,
                    mediaUrl: item.mediaUrl || null,
                    displayOrder: index + 1,
                    isActive: item.isActive,
                })),
            };
            const res = await fetch('/api/admin/history-page', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Gagal menyimpan sejarah');
            setMessage({ text: 'Arsip sejarah & evolusi berhasil diperbarui.', type: 'success' });
            setTimeout(() => setMessage(null), 4000);
        } catch (error) {
            setMessage({ text: 'Kegagalan sinkronisasi pilar masa lalu.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const toolbarButton = (active: boolean) =>
        `flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-300 ${active
            ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/30 active:scale-95'
            : 'bg-white dark:bg-white/5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
        }`;

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080B09] text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">
            <SidebarAdmin />
            
            <main className="min-h-screen lg:pl-64 pb-24">
                <HeaderAdmin 
                    title="Editor Sejarah"
                    subtitle="Manajemen arsip perjalanan, milestone, dan evolusi madrasah dari masa ke masa"
                    action={
                        <button
                            onClick={handleSave}
                            disabled={saving || !editor}
                            className="group inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4.5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl shadow-emerald-600/30 active:scale-95 disabled:opacity-50"
                        >
                            <Save size={18} className="group-hover:-rotate-12 transition-transform" /> 
                            {saving ? 'SYNCHRONIZING...' : 'UPDATE HISTORY'}
                        </button>
                    }
                />

                <div className="px-4 sm:px-10 mt-12 space-y-12 max-w-7xl mx-auto">
                    {/* PAGE CONFIGURATION SECTION */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/70 dark:bg-[#151b18]/80 backdrop-blur-3xl rounded-[4rem] border border-white dark:border-white/10 shadow-3xl p-10 lg:p-14"
                    >
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-14">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-[1.75rem] text-indigo-600 shadow-inner">
                                    <History size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none mb-2">Konfigurasi Halaman</h3>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">Master data entitas sejarah madrasah</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-5 bg-gray-50/50 dark:bg-black/20 p-2.5 rounded-[2rem] border border-gray-100 dark:border-white/5 ring-1 ring-indigo-500/5">
                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] ml-4">Archives registry</span>
                                <label className="flex items-center gap-4 cursor-pointer group bg-white dark:bg-white/5 px-6 py-3 rounded-[1.5rem] border border-gray-100 dark:border-white/5 transition-all hover:border-indigo-500/20 shadow-sm">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
                                        {isActive ? 'LIVE ARCHIVE' : 'IN STORAGE'}
                                    </span>
                                    <div 
                                        className={`relative w-14 h-7 rounded-full transition-all duration-500 ${isActive ? 'bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'bg-gray-300 dark:bg-white/10'}`}
                                        onClick={() => setIsActive(!isActive)}
                                    >
                                        <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-lg transition-transform duration-500 ${isActive ? 'translate-x-[1.75rem]' : ''}`} />
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="grid gap-14 lg:grid-cols-2">
                            <div className="space-y-10">
                                <div className="space-y-4 group">
                                    <label className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-3 transition-colors group-focus-within:text-indigo-500">
                                        <Type size={14} className="opacity-50" /> JUDUL UTAMA ARSIP
                                    </label>
                                    <input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full rounded-[1.75rem] border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 px-8 py-5 text-sm font-black text-gray-950 dark:text-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all shadow-inner"
                                    />
                                </div>
                                <div className="space-y-4 group">
                                    <label className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-3 transition-colors group-focus-within:text-indigo-500">
                                        <FileText size={14} className="opacity-50" /> TEKS PENDAMPING (SUBTITLE)
                                    </label>
                                    <input
                                        value={subtitle}
                                        onChange={(e) => setSubtitle(e.target.value)}
                                        className="w-full rounded-[1.75rem] border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 px-8 py-5 text-sm font-black text-gray-950 dark:text-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all shadow-inner"
                                    />
                                </div>
                                
                                <div className="p-8 bg-indigo-500/5 rounded-[2.5rem] border border-indigo-500/10 flex gap-6 items-start">
                                    <div className="p-3 bg-indigo-500 rounded-2xl text-white shadow-xl ring-4 ring-indigo-500/10 transition-transform group-hover:rotate-12"><Info size={20}/></div>
                                    <div>
                                        <p className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mb-1 leading-none">History Advisory</p>
                                        <p className="text-[12px] font-bold text-gray-500 dark:text-gray-400 leading-relaxed italic">
                                            Halaman sejarah adalah pilar kepercayaan publik. Pastikan narasi dan milestone yang Anda input selaras dengan catatan resmi madrasah.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 h-full">
                                <div className="space-y-4 group">
                                    <label className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-3 transition-colors group-focus-within:text-indigo-500">
                                        <Camera size={14} className="opacity-50" /> COVER ARSIP
                                    </label>
                                    <div className="relative aspect-square rounded-[3rem] border-2 border-dashed border-indigo-900/10 dark:border-white/10 p-2 overflow-hidden bg-gray-50/50 dark:bg-black/20 transition-all hover:border-indigo-500/50 self-start">
                                        <div className="w-full h-full rounded-[2.5rem] overflow-hidden bg-white/50 dark:bg-black/40 flex items-center justify-center shadow-inner relative group/media">
                                            {coverImageUrl ? (
                                                <img src={coverImageUrl} alt="Sejarah" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                                            ) : (
                                                <ImagePlus size={40} className="text-indigo-100 dark:text-indigo-900/40 animate-pulse" />
                                            )}
                                            <div className="absolute inset-0 bg-indigo-950/80 opacity-0 group-hover/media:opacity-100 transition-all duration-500 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                                                <StorageUploadWidget options={{ folder: 'history/cover', replaceUrl: coverImageUrl }} onSuccess={handleCoverUpload}>
                                                    {({ open }) => (
                                                        <button onClick={() => open()} className="bg-white text-indigo-950 px-4 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl">UPDATE COVER</button>
                                                    )}
                                                </StorageUploadWidget>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4 group">
                                    <label className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-3 transition-colors group-focus-within:text-indigo-500">
                                        <Video size={14} className="opacity-50" /> CINEMATIC REEL
                                    </label>
                                    <div className="relative aspect-square rounded-[3rem] border-2 border-dashed border-indigo-900/10 dark:border-white/10 p-2 overflow-hidden bg-gray-50/50 dark:bg-black/20 transition-all hover:border-indigo-500/50 self-start">
                                        <div className="w-full h-full rounded-[2.5rem] overflow-hidden bg-white/50 dark:bg-black/40 flex items-center justify-center shadow-inner relative group/media">
                                            {videoUrl ? (
                                                <video src={videoUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                                            ) : (
                                                <Zap size={40} className="text-indigo-100 dark:text-indigo-900/40 animate-pulse" />
                                            )}
                                            <div className="absolute inset-0 bg-indigo-950/80 opacity-0 group-hover/media:opacity-100 transition-all duration-500 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                                                <StorageUploadWidget options={{ folder: 'history/video', resourceType: 'video', replaceUrl: videoUrl }} onSuccess={handleVideoUpload}>
                                                    {({ open }) => (
                                                        <button onClick={() => open()} className="bg-white text-indigo-950 px-4 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest">UPDATE REEL</button>
                                                    )}
                                                </StorageUploadWidget>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* NARRATIVE SECTION */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/60 dark:bg-[#151b18]/60 backdrop-blur-3xl rounded-[4rem] border border-white dark:border-white/10 shadow-3xl overflow-hidden"
                    >
                        <div className="bg-gray-50/50 dark:bg-black/40 p-10 border-b border-gray-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-10">
                            <div className="flex items-center gap-5">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl text-indigo-600 shadow-inner">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none mb-1">Narasi Sejarah</h4>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Manajemen konten tekstual perjalanan</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 bg-white/50 dark:bg-white/5 p-2 rounded-[2rem] shadow-sm ring-1 ring-gray-100 dark:ring-white/5">
                                <div className="flex gap-1.5 px-2 border-r border-gray-100 dark:border-white/10">
                                    <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()} className={toolbarButton(editor?.isActive('bold') || false)}><Bold size={20} /></button>
                                    <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()} className={toolbarButton(editor?.isActive('italic') || false)}><Italic size={20} /></button>
                                    <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={toolbarButton(editor?.isActive('heading', { level: 2 }) || false)}><Heading2 size={20} /></button>
                                </div>
                                <div className="flex gap-1.5 px-2 border-r border-gray-100 dark:border-white/10">
                                    <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={toolbarButton(editor?.isActive('bulletList') || false)}><List size={20} /></button>
                                    <button type="button" onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={toolbarButton(editor?.isActive('orderedList') || false)}><ListOrdered size={20} /></button>
                                    <button type="button" onClick={() => editor?.chain().focus().toggleBlockquote().run()} className={toolbarButton(editor?.isActive('blockquote') || false)}><Quote size={20} /></button>
                                </div>
                                <div className="flex gap-1.5 px-2">
                                    <button type="button" onClick={() => editor?.chain().focus().undo().run()} className={toolbarButton(false)}><Undo2 size={20} /></button>
                                    <button type="button" onClick={() => editor?.chain().focus().redo().run()} className={toolbarButton(false)}><Redo2 size={20} /></button>
                                </div>
                                <StorageUploadWidget options={{ folder: 'mis-al-falah/history/narrative' }} onSuccess={insertContentImage}>
                                    {({ open }) => (
                                        <button type="button" onClick={() => open()} className="ml-2 flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-7 py-4 rounded-[1.5rem] text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-600/20 active:scale-95">
                                            <ImagePlus size={18} /> ATTACH MEDIA
                                        </button>
                                    )}
                                </StorageUploadWidget>
                            </div>
                        </div>

                        <div className="p-12 lg:p-24 min-h-[500px]">
                            <EditorContent editor={editor} className="prose prose-xl max-w-none dark:prose-invert focus:outline-none min-h-[400px] selection:bg-indigo-500/20" />
                        </div>
                    </motion.div>

                    {/* TIMELINE SECTION */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/70 dark:bg-[#151b18]/80 backdrop-blur-3xl rounded-[4rem] border border-white dark:border-white/10 shadow-3xl p-10 lg:p-14"
                    >
                        <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-14">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-[1.75rem] text-amber-600 shadow-inner">
                                    <Layers size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none mb-2">Timeline Milestone</h3>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">Visualisasi evolusi per-tahun anggaran/ajaran</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={addTimelineItem}
                                className="group inline-flex items-center gap-4 bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4.5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl shadow-indigo-600/30 active:scale-95 whitespace-nowrap"
                            >
                                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" /> TAMBAH JEJAK BARU
                            </button>
                        </div>

                        <div className="grid gap-10">
                            <AnimatePresence mode="popLayout">
                                {timelineItems.map((item, index) => (
                                    <motion.div 
                                        key={item.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                        className="group relative p-10 lg:p-14 rounded-[4rem] bg-gray-50/50 dark:bg-black/20 border border-white dark:border-white/5 transition-all hover:bg-white dark:hover:bg-white/[0.05] hover:border-indigo-500/30 hover:shadow-2xl"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-8 mb-12">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 bg-white dark:bg-black/40 rounded-[1.75rem] flex items-center justify-center text-indigo-600 font-black text-xl shadow-xl shadow-indigo-500/5 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-700 ring-4 ring-transparent group-hover:ring-indigo-500/20">
                                                    {index + 1}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] leading-none mb-1.5">Milestone Index</span>
                                                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">ARCHIVE SET #{100 + index}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-5">
                                                <label className="flex items-center gap-4 cursor-pointer group/toggle bg-white dark:bg-black/40 px-6 py-3 rounded-[1.5rem] border border-gray-100 dark:border-white/5 shadow-sm">
                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">{item.isActive ? 'PUBLISHED' : 'HIDDEN'}</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={item.isActive}
                                                        onChange={(e) => updateTimelineItem(item.id, 'isActive', e.target.checked)}
                                                        className="hidden"
                                                    />
                                                    <div className={`relative w-10 h-5 rounded-full transition-all duration-500 ${item.isActive ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-gray-300 dark:bg-white/10'}`}>
                                                        <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full shadow-lg transition-transform duration-500 ${item.isActive ? 'translate-x-5' : ''}`} />
                                                    </div>
                                                </label>
                                                <button
                                                    onClick={() => removeTimelineItem(item.id)}
                                                    className="w-12 h-12 flex items-center justify-center text-red-100 hover:text-white bg-transparent hover:bg-red-600 rounded-[1.25rem] transition-all shadow-inner"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid lg:grid-cols-[200px_1fr_300px] gap-12">
                                            <div className="space-y-4 group/input">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 transition-colors group-focus-within/input:text-indigo-500">
                                                    YEAR EPOCH
                                                </label>
                                                <input
                                                    value={item.year}
                                                    onChange={(e) => updateTimelineItem(item.id, 'year', e.target.value)}
                                                    className="w-full rounded-[1.75rem] border border-gray-100 dark:border-white/5 bg-white dark:bg-black/30 px-8 py-5 text-xl font-black text-indigo-600 dark:text-indigo-400 focus:ring-4 focus:ring-indigo-500/5 outline-none shadow-inner text-center"
                                                    placeholder="2024"
                                                />
                                            </div>
                                            <div className="space-y-8">
                                                <div className="space-y-4 group/input">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 transition-colors group-focus-within/input:text-indigo-500">
                                                        MILESTONE IDENTITY
                                                    </label>
                                                    <input
                                                        value={item.title}
                                                        onChange={(e) => updateTimelineItem(item.id, 'title', e.target.value)}
                                                        className="w-full rounded-[1.75rem] border border-gray-100 dark:border-white/5 bg-white dark:bg-black/20 px-8 py-5 text-base font-black text-gray-950 dark:text-white focus:ring-4 focus:ring-indigo-500/5 outline-none shadow-inner"
                                                        placeholder="Contoh: Peresmian Lab Multimedia"
                                                    />
                                                </div>
                                                <div className="space-y-4 group/input">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 transition-colors group-focus-within/input:text-indigo-500">
                                                        HISTORY NARRATION
                                                    </label>
                                                    <textarea
                                                        value={item.descriptionText}
                                                        onChange={(e) => updateTimelineItem(item.id, 'descriptionText', e.target.value)}
                                                        rows={4}
                                                        className="w-full rounded-[2rem] border border-gray-100 dark:border-white/5 bg-white dark:bg-black/20 px-8 py-7 text-sm font-bold text-gray-500 dark:text-gray-400 focus:ring-4 focus:ring-indigo-500/5 outline-none shadow-inner leading-relaxed"
                                                        placeholder="Tuliskan dokumentasi detail peristiwa..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-4 group/input">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">MEDIA EVIDENCE</label>
                                                <div className="relative aspect-[4/5] rounded-[3rem] border-2 border-dashed border-indigo-900/10 dark:border-white/10 p-2 overflow-hidden bg-white/50 dark:bg-black/30 hover:border-indigo-500/50 transition-all group/media">
                                                    <div className="w-full h-full rounded-[2.5rem] overflow-hidden bg-white/50 dark:bg-black/40 flex items-center justify-center shadow-inner relative">
                                                        {item.mediaUrl ? (
                                                            item.mediaUrl.includes('/video/upload/') ? (
                                                                <video src={item.mediaUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover/media:scale-105" />
                                                            ) : (
                                                                <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover/media:scale-105" />
                                                            )
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-4 text-indigo-100 dark:text-indigo-900/40">
                                                                <ImagePlus size={48} className="animate-pulse" />
                                                                <span className="text-[8px] font-black uppercase tracking-[0.3em]">NO EVIDENCE</span>
                                                            </div>
                                                        )}
                                                        
                                                        <div className="absolute inset-0 bg-indigo-950/80 opacity-0 group-hover/media:opacity-100 transition-all duration-500 backdrop-blur-md flex flex-col items-center justify-center p-8 gap-3 text-center">
                                                            <StorageUploadWidget options={{ folder: 'history/timeline' }} onSuccess={(res) => handleTimelineMediaUpload(item.id, res)}>
                                                                {({ open }) => (
                                                                    <button onClick={() => open()} className="w-full bg-white text-indigo-950 px-5 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-2">
                                                                        <Camera size={14} /> IMAGE
                                                                    </button>
                                                                )}
                                                            </StorageUploadWidget>
                                                            <StorageUploadWidget options={{ folder: 'history/timeline', resourceType: 'video' }} onSuccess={(res) => handleTimelineMediaUpload(item.id, res)}>
                                                                {({ open }) => (
                                                                    <button onClick={() => open()} className="w-full bg-white/10 border border-white/20 text-white px-5 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                                                                        <Video size={14} /> VIDEO
                                                                    </button>
                                                                )}
                                                            </StorageUploadWidget>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* TOAST SYSTEM */}
                    <AnimatePresence>
                        {message && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 50 }} 
                                animate={{ opacity: 1, scale: 1, y: 0 }} 
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className={`fixed bottom-12 right-12 z-[200] flex items-center gap-6 px-10 py-6 rounded-[2.5rem] shadow-3xl backdrop-blur-2xl border border-white/20 transition-all ${
                                    message.type === 'success' ? 'bg-indigo-600/90 text-white shadow-indigo-900/20' : 'bg-red-600/90 text-white shadow-red-900/20'
                                }`}
                            >
                                <div className="p-3 bg-white/20 rounded-full shadow-lg ring-1 ring-white/30">
                                    {message.type === 'success' ? <CheckCircle2 size={24} /> : <Trash2 size={24} />}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 leading-none mb-1.5">Archives Synch Status</p>
                                    <p className="text-base font-black uppercase tracking-tight leading-none">{message.text}</p>
                                </div>
                                <div className="ml-4 pl-6 border-l border-white/20">
                                    <button onClick={() => setMessage(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                        <RefreshCw size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default KelolaSejarahPage;
