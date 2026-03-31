'use client';

import React, { useEffect, useState } from 'react';
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
    Undo2, Redo2, Link2, Unlink2, ImagePlus, Save, 
    CheckCircle2, User, Sparkles, Trash2, Type, 
    FileText, Camera, ShieldCheck, Info, RefreshCw
} from 'lucide-react';

const KelolaSambutanPage: React.FC = () => {
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [headmasterName, setHeadmasterName] = useState('');
    const [headmasterTitle, setHeadmasterTitle] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    const [isActive, setIsActive] = useState(true);
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
        const fetchGreeting = async () => {
            try {
                const res = await fetch('/api/admin/headmaster-greeting');
                const data = await res.json();
                if (data) {
                    setTitle(data.title || '');
                    setSubtitle(data.subtitle || '');
                    setHeadmasterName(data.headmaster_name || '');
                    setHeadmasterTitle(data.headmaster_title || '');
                    setPhotoUrl(data.photo_url || '');
                    setIsActive(data.is_active ?? true);
                    setInitialContent(data.content_html || data.content_json || data.content_text || '');
                }
            } catch (error) {
                console.error('Failed to load greeting', error);
            }
        };
        fetchGreeting();
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

    const handlePhotoUpload = (result: any) => {
        const secureUrl = getUploadUrl(result);
        if (secureUrl) setPhotoUrl(secureUrl);
    };

    const insertImage = (result: any) => {
        if (!editor) return;
        const secureUrl = getUploadUrl(result);
        if (secureUrl) editor.chain().focus().setImage({ src: secureUrl }).run();
    };

    const handleSave = async () => {
        if (!editor) return;
        setSaving(true);
        setMessage(null);
        try {
            const payload = {
                title, subtitle, headmasterName, headmasterTitle, photoUrl, isActive,
                contentJson: editor.getJSON(),
                contentHtml: editor.getHTML(),
                contentText: editor.getText(),
            };
            const res = await fetch('/api/admin/headmaster-greeting', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Gagal menyimpan sambutan');
            setMessage({ text: 'Konfigurasi biografi pimpinan berhasil diperbarui.', type: 'success' });
            setTimeout(() => setMessage(null), 4000);
        } catch (error) {
            setMessage({ text: 'Terjadi kegagalan sinkronisasi data.', type: 'error' });
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
                    title="Editor Pimpinan"
                    subtitle="Kelola profil naratif dan sambutan resmi kepala madrasah"
                    action={
                        <button
                            onClick={handleSave}
                            disabled={saving || !editor}
                            className="group inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4.5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl shadow-emerald-600/30 active:scale-95 disabled:opacity-50"
                        >
                            <Save size={18} className="group-hover:-rotate-12 transition-transform" /> 
                            {saving ? 'SYNCHRONIZING...' : 'UPDATE BIOGRAPHY'}
                        </button>
                    }
                />

                <div className="px-4 sm:px-10 mt-12 space-y-12 max-w-7xl mx-auto">
                    {/* IDENTITY & PORTRAIT SECTION */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/70 dark:bg-[#151b18]/80 backdrop-blur-3xl rounded-[4rem] border border-white dark:border-white/10 shadow-3xl p-10 lg:p-14"
                    >
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-14">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-[1.75rem] text-emerald-600 shadow-inner">
                                    <User size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none mb-2">Profil Pimpinan</h3>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">Otoritas tertinggi kependidikan MI Alfalah</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-5 bg-gray-50/50 dark:bg-black/20 p-2.5 rounded-[2rem] border border-gray-100 dark:border-white/5 ring-1 ring-emerald-500/5">
                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] ml-4">visibility Status</span>
                                <label className="flex items-center gap-4 cursor-pointer group bg-white dark:bg-white/5 px-6 py-3 rounded-[1.5rem] border border-gray-100 dark:border-white/5 transition-all hover:border-emerald-500/20 shadow-sm">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                                        {isActive ? 'ACTIVE ONLINE' : 'DRAFT MODE'}
                                    </span>
                                    <div 
                                        className={`relative w-14 h-7 rounded-full transition-all duration-500 ${isActive ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-gray-300 dark:bg-white/10'}`}
                                        onClick={() => setIsActive(!isActive)}
                                    >
                                        <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-lg transition-transform duration-500 ${isActive ? 'translate-x-[1.75rem]' : ''}`} />
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="grid gap-14 lg:grid-cols-[1fr_360px]">
                            <div className="space-y-10">
                                <div className="grid md:grid-cols-2 gap-10">
                                    <div className="space-y-4 group">
                                        <label className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-3 transition-colors group-focus-within:text-emerald-500">
                                            <Type size={14} className="opacity-50" /> JUDUL SAMBUTAN
                                        </label>
                                        <input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Sambutan Kepala Madrasah"
                                            className="w-full rounded-[1.75rem] border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 px-8 py-5 text-sm font-black text-gray-950 dark:text-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-4 group">
                                        <label className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-3 transition-colors group-focus-within:text-emerald-500">
                                            <Sparkles size={14} className="opacity-50" /> SLOGAN / SUBTITLE
                                        </label>
                                        <input
                                            value={subtitle}
                                            onChange={(e) => setSubtitle(e.target.value)}
                                            placeholder="Membangun Generasi Rabbani"
                                            className="w-full rounded-[1.75rem] border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 px-8 py-5 text-sm font-black text-gray-950 dark:text-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-10">
                                    <div className="space-y-4 group">
                                        <label className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-3 transition-colors group-focus-within:text-emerald-500">
                                            <ShieldCheck size={14} className="opacity-50" /> NAMA LENGKAP & GELAR
                                        </label>
                                        <input
                                            value={headmasterName}
                                            onChange={(e) => setHeadmasterName(e.target.value)}
                                            className="w-full rounded-[1.75rem] border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 px-8 py-5 text-sm font-black text-gray-950 dark:text-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-4 group">
                                        <label className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-3 transition-colors group-focus-within:text-emerald-500">
                                            <FileText size={14} className="opacity-50" /> JABATAN STRUKTURAL
                                        </label>
                                        <input
                                            value={headmasterTitle}
                                            onChange={(e) => setHeadmasterTitle(e.target.value)}
                                            className="w-full rounded-[1.75rem] border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 px-8 py-5 text-sm font-black text-gray-950 dark:text-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all shadow-inner"
                                        />
                                    </div>
                                </div>
                                
                                <div className="p-8 bg-emerald-500/5 rounded-[2.5rem] border border-emerald-500/10 flex gap-6 items-start">
                                    <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-xl ring-4 ring-emerald-500/20"><Info size={20}/></div>
                                    <div>
                                        <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1.5 leading-none">Administrative Advisory</p>
                                        <p className="text-[12px] font-bold text-gray-500 dark:text-gray-400 leading-relaxed italic">
                                            Perubahan pada data pimpinan akan direfleksikan secara instan pada halaman Landing, Footer, dan Profil Sekolah. Pastikan data gelar valid sesuai SK.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="relative group">
                                <div className="absolute -inset-4 bg-emerald-500/10 rounded-[4rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                                <div className="relative rounded-[3.5rem] border-2 border-dashed border-emerald-900/10 dark:border-white/10 p-3 overflow-hidden bg-gray-50/50 dark:bg-black/20 transition-all hover:border-emerald-500/50">
                                    <div className="aspect-[4/5] rounded-[2.75rem] overflow-hidden bg-white/50 dark:bg-black/40 flex items-center justify-center shadow-inner relative">
                                        {photoUrl ? (
                                            <img src={photoUrl} alt="Kepala Madrasah" className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-5 text-emerald-100 dark:text-emerald-900/40">
                                                <ImagePlus size={64} className="animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.4em]">MISSING PORTRAIT</span>
                                            </div>
                                        )}
                                        
                                        <div className="absolute inset-0 bg-emerald-950/80 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center">
                                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-6">Replace Official Portrait</p>
                                            <StorageUploadWidget
                                                options={{ folder: 'headmaster', replaceUrl: photoUrl }}
                                                onSuccess={handlePhotoUpload}
                                            >
                                                {({ open }) => (
                                                    <button
                                                        type="button"
                                                        onClick={() => open()}
                                                        className="w-full bg-white text-emerald-950 px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3"
                                                    >
                                                        <Camera size={18} /> UPLOAD NEW ASSET
                                                    </button>
                                                )}
                                            </StorageUploadWidget>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* CONTENT EDITOR SECTION */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/60 dark:bg-[#151b18]/60 backdrop-blur-3xl rounded-[4rem] border border-white dark:border-white/10 shadow-3xl overflow-hidden"
                    >
                        <div className="bg-gray-50/50 dark:bg-black/40 p-10 border-b border-gray-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-10">
                            <div className="flex items-center gap-5">
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-emerald-600 shadow-inner">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none mb-1">Narasi Sambutan</h4>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Manajemen konten tekstual biografi</p>
                                </div>
                                <div className="ml-6 px-4 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/10 text-[9px] font-black text-emerald-600 uppercase tracking-widest animate-pulse">Live Editor Active</div>
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
                                <StorageUploadWidget options={{ folder: 'mis-al-falah/headmaster-content' }} onSuccess={insertImage}>
                                    {({ open }) => (
                                        <button type="button" onClick={() => open()} className="ml-2 flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-7 py-4 rounded-[1.5rem] text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
                                            <ImagePlus size={18} /> ATTACH MEDIA
                                        </button>
                                    )}
                                </StorageUploadWidget>
                            </div>
                        </div>

                        <div className="p-12 lg:p-24 min-h-[700px]">
                            <EditorContent 
                                editor={editor} 
                                className="prose prose-xl max-w-none dark:prose-invert focus:outline-none min-h-[500px] selection:bg-emerald-500/20" 
                            />
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
                                    message.type === 'success' ? 'bg-emerald-600/90 text-white shadow-emerald-900/20' : 'bg-red-600/90 text-white shadow-red-900/20'
                                }`}
                            >
                                <div className="p-3 bg-white/20 rounded-full shadow-lg ring-1 ring-white/30">
                                    {message.type === 'success' ? <CheckCircle2 size={24} /> : <Trash2 size={24} />}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 leading-none mb-1.5">Synch Engine Status</p>
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

export default KelolaSambutanPage;
