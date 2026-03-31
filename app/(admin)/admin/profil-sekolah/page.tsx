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
    ImagePlus, Bold, Italic, Heading2, List, 
    ListOrdered, Quote, Undo2, Redo2, Video, 
    Save, CheckCircle2, Trash2, School, MapPin, 
    ShieldCheck, Activity, Zap, Camera, Type, Bookmark,
    FileText, TrendingUp, Info, Globe, Map
} from 'lucide-react';

const ProfilSekolahPage: React.FC = () => {
    const [videoUrl, setVideoUrl] = useState('');
    const [schoolName, setSchoolName] = useState('');
    const [npsn, setNpsn] = useState('');
    const [schoolAddress, setSchoolAddress] = useState('');
    const [village, setVillage] = useState('');
    const [district, setDistrict] = useState('');
    const [city, setCity] = useState('');
    const [province, setProvince] = useState('');
    const [schoolStatus, setSchoolStatus] = useState('');
    const [educationForm, setEducationForm] = useState('');
    const [educationLevel, setEducationLevel] = useState('');
    const [initialDescription, setInitialDescription] = useState<string | object>('');
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
                const res = await fetch('/api/admin/profile-page');
                if (!res.ok) return;
                const data = await res.json();
                setVideoUrl(data.videoUrl || '');
                setSchoolName(data.schoolName || '');
                setNpsn(data.npsn || '');
                setSchoolAddress(data.schoolAddress || '');
                setVillage(data.village || '');
                setDistrict(data.district || '');
                setCity(data.city || '');
                setProvince(data.province || '');
                setSchoolStatus(data.schoolStatus || '');
                setEducationForm(data.educationForm || '');
                setEducationLevel(data.educationLevel || '');
                setInitialDescription(data.descriptionHtml || data.descriptionJson || data.descriptionText || '');
            } catch (error) {
                console.error('Failed to load profile data', error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (editor && initialDescription) {
            editor.commands.setContent(initialDescription);
        }
    }, [editor, initialDescription]);

    const getUploadUrl = (result: any) => {
        if (result?.event !== 'success') return null;
        const info = result.info;
        if (typeof info === 'string') return info;
        if (info && typeof info === 'object') return info.secure_url || info.url || null;
        return null;
    };

    const handleVideoUpload = (result: any) => {
        const secureUrl = getUploadUrl(result);
        if (secureUrl) setVideoUrl(secureUrl);
    };

    const insertDescriptionImage = (result: any) => {
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
                videoUrl,
                descriptionJson: editor.getJSON(),
                descriptionHtml: editor.getHTML(),
                descriptionText: editor.getText(),
                schoolName, npsn, schoolAddress, village, district, city, province,
                schoolStatus, educationForm, educationLevel,
            };
            const res = await fetch('/api/admin/profile-page', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Gagal menyimpan profil');
            setMessage({ text: 'Data profil madrasah berhasil diperbarui.', type: 'success' });
            setTimeout(() => setMessage(null), 4000);
        } catch (error) {
            setMessage({ text: 'Terjadi kesalahan sistem.', type: 'error' });
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
                    title="Entitas Resmi"
                    subtitle="Manajemen identitas hukum, profil sinematik, dan narasi sejarah lembaga"
                    action={
                        <button
                            onClick={handleSave}
                            disabled={saving || !editor}
                            className="group inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4.5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl shadow-emerald-600/30 active:scale-95 disabled:opacity-50"
                        >
                            <Save size={18} className="group-hover:-rotate-12 transition-transform" /> 
                            {saving ? 'SYNCHRONIZING...' : 'COMMIT CHANGES'}
                        </button>
                    }
                />

                <div className="px-4 sm:px-10 mt-12 space-y-12 max-w-7xl mx-auto">
                    {/* VIDEO PROFIL SECTION */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/70 dark:bg-[#151b18]/80 backdrop-blur-3xl rounded-[4rem] border border-white dark:border-white/10 shadow-3xl p-10 lg:p-14 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                            <Video size={200} className="text-emerald-500" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-6 mb-12">
                                <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-[1.75rem] text-indigo-600 shadow-inner">
                                    <Video size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none mb-2">Sinematik Profil</h3>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">Integrasi media visual utama madrasah</p>
                                </div>
                            </div>

                            <div className="grid lg:grid-cols-2 gap-14 items-center">
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="flex items-center gap-3 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-2">
                                            <Globe size={14} className="text-indigo-500" /> SOURCE ENDPOINT (CDN/R2)
                                        </label>
                                        <div className="relative group">
                                            <input
                                                value={videoUrl}
                                                onChange={(e) => setVideoUrl(e.target.value)}
                                                className="w-full rounded-[1.75rem] border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 pl-6 pr-44 py-5 text-sm font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all shadow-inner"
                                                placeholder="https://cdn.mialfalah.sch.id/profile.mp4"
                                            />
                                            <div className="absolute right-2 top-2 bottom-2">
                                                <StorageUploadWidget
                                                    options={{ folder: 'profile/video', resourceType: 'video' }}
                                                    onSuccess={handleVideoUpload}
                                                >
                                                    {({ open }) => (
                                                        <button
                                                            type="button"
                                                            onClick={() => open()}
                                                            className="h-full px-6 rounded-2xl bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center gap-2"
                                                        >
                                                            <Camera size={14} /> REPLACE VIDEO
                                                        </button>
                                                    )}
                                                </StorageUploadWidget>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-6 bg-indigo-500/5 rounded-[2rem] border border-indigo-500/10 flex gap-5 items-start">
                                        <div className="p-2 bg-indigo-500 rounded-xl text-white shadow-lg"><Info size={16}/></div>
                                        <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-relaxed">
                                            Video ini akan ditampilkan pada section Hero di halaman utama. Pastikan video memiliki size &lt; 20MB untuk kenyamanan akses pengunjung.
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="relative group aspect-video rounded-[3rem] overflow-hidden bg-black shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] ring-8 ring-white dark:ring-white/5">
                                    {videoUrl ? (
                                        <video src={videoUrl} controls className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 bg-gray-900/40 gap-5">
                                            <Zap size={64} className="text-indigo-500/30 animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">NO SIGNAL / NO VIDEO</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* NARRATIVE EDITOR SECTION */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/60 dark:bg-[#151b18]/60 backdrop-blur-3xl rounded-[4rem] border border-white dark:border-white/10 shadow-3xl overflow-hidden"
                    >
                        {/* Editor Toolbar */}
                        <div className="bg-gray-50/50 dark:bg-black/40 p-8 border-b border-gray-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-8">
                            <div className="flex items-center gap-5">
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-emerald-600 shadow-inner">
                                    <Type size={20} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none">Narasi Utama</h4>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1">Struktur konten & dokumentasi tekstual</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 bg-white/50 dark:bg-white/5 p-2 rounded-[2rem] shadow-sm ring-1 ring-gray-100 dark:ring-white/5">
                                <div className="flex gap-1.5 px-2 border-r border-gray-100 dark:border-white/10">
                                    <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()} className={toolbarButton(editor?.isActive('bold') || false)}><Bold size={18} /></button>
                                    <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()} className={toolbarButton(editor?.isActive('italic') || false)}><Italic size={18} /></button>
                                    <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={toolbarButton(editor?.isActive('heading', { level: 2 }) || false)}><Heading2 size={18} /></button>
                                </div>
                                <div className="flex gap-1.5 px-2 border-r border-gray-100 dark:border-white/10">
                                    <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={toolbarButton(editor?.isActive('bulletList') || false)}><List size={18} /></button>
                                    <button type="button" onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={toolbarButton(editor?.isActive('orderedList') || false)}><ListOrdered size={18} /></button>
                                    <button type="button" onClick={() => editor?.chain().focus().toggleBlockquote().run()} className={toolbarButton(editor?.isActive('blockquote') || false)}><Quote size={18} /></button>
                                </div>
                                <div className="flex gap-1.5 px-2">
                                    <button type="button" onClick={() => editor?.chain().focus().undo().run()} className={toolbarButton(false)}><Undo2 size={18} /></button>
                                    <button type="button" onClick={() => editor?.chain().focus().redo().run()} className={toolbarButton(false)}><Redo2 size={18} /></button>
                                </div>
                                <StorageUploadWidget options={{ folder: 'mis-al-falah/profile/narrative' }} onSuccess={insertDescriptionImage}>
                                    {({ open }) => (
                                        <button type="button" onClick={() => open()} className="ml-2 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3.5 rounded-[1.5rem] text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-600/20 active:scale-95">
                                            <ImagePlus size={16} /> ADD ASSET
                                        </button>
                                    )}
                                </StorageUploadWidget>
                            </div>
                        </div>

                        {/* Editor Canvas */}
                        <div className="p-12 lg:p-20 min-h-[600px] prose-container">
                            <EditorContent editor={editor} className="prose prose-xl max-w-none dark:prose-invert focus:outline-none min-h-[500px]" />
                        </div>
                    </motion.div>

                    {/* OFFICIAL DATA SECTION */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/70 dark:bg-[#151b18]/80 backdrop-blur-3xl rounded-[4rem] border border-white dark:border-white/10 shadow-3xl p-10 lg:p-14"
                    >
                        <div className="flex items-center gap-6 mb-14">
                            <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-[1.75rem] text-amber-600 shadow-inner">
                                <ShieldCheck size={32} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black font-fraunces text-gray-950 dark:text-white uppercase tracking-tight leading-none mb-2">Legalitas & Identitas</h3>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">Data administratif resmi pusdatin madrasah</p>
                            </div>
                        </div>

                        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-4 group">
                                <label className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3 group-focus-within:text-amber-500 transition-colors">
                                    <School size={14} className="opacity-50" /> NAMA RESMI LEMBAGA
                                </label>
                                <input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className="w-full rounded-[1.75rem] border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 px-8 py-5 text-sm font-black text-gray-950 dark:text-white focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 outline-none transition-all shadow-inner" />
                            </div>
                            <div className="space-y-4 group">
                                <label className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3 group-focus-within:text-amber-500 transition-colors">
                                    <Bookmark size={14} className="opacity-50" /> NOMOR POKOK (NPSN)
                                </label>
                                <input value={npsn} onChange={(e) => setNpsn(e.target.value)} className="w-full rounded-[1.75rem] border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 px-8 py-5 text-sm font-black text-gray-950 dark:text-white focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 outline-none transition-all shadow-inner" />
                            </div>
                            <div className="space-y-4 group">
                                <label className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3 group-focus-within:text-amber-500 transition-colors">
                                    <Activity size={14} className="opacity-50" /> STATUS AKREDITASI
                                </label>
                                <input value={schoolStatus} onChange={(e) => setSchoolStatus(e.target.value)} className="w-full rounded-[1.75rem] border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 px-8 py-5 text-sm font-black text-gray-950 dark:text-white focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 outline-none transition-all shadow-inner" />
                            </div>
                            <div className="md:col-span-2 lg:col-span-3 space-y-4 group">
                                <label className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3 group-focus-within:text-amber-500 transition-colors">
                                    <Map size={14} className="opacity-50" /> DOMISILI & TITIK KOORDINAT
                                </label>
                                <input value={schoolAddress} onChange={(e) => setSchoolAddress(e.target.value)} className="w-full rounded-[1.75rem] border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 px-8 py-5 text-sm font-black text-gray-950 dark:text-white focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 outline-none transition-all shadow-inner" />
                            </div>
                            <div className="space-y-4 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">KELURAHAN / DESA</label>
                                <input value={village} onChange={(e) => setVillage(e.target.value)} className="w-full rounded-[1.75rem] border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 px-8 py-5 text-sm font-black text-gray-950 dark:text-white focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 outline-none transition-all shadow-inner" />
                            </div>
                            <div className="space-y-4 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">KECAMATAN</label>
                                <input value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full rounded-[1.75rem] border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 px-8 py-5 text-sm font-black text-gray-950 dark:text-white focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 outline-none transition-all shadow-inner" />
                            </div>
                            <div className="space-y-4 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">KOTA / KABUPATEN</label>
                                <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-[1.75rem] border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 px-8 py-5 text-sm font-black text-gray-950 dark:text-white focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 outline-none transition-all shadow-inner" />
                            </div>
                        </div>
                    </motion.div>

                    {/* TOAST SYSTEM */}
                    <AnimatePresence>
                        {message && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 50 }} 
                                animate={{ opacity: 1, scale: 1, y: 0 }} 
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className={`fixed bottom-12 right-12 z-[200] flex items-center gap-6 px-10 py-6 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] backdrop-blur-2xl border border-white/20 transition-all ${
                                    message.type === 'success' ? 'bg-emerald-600/90 text-white' : 'bg-red-600/90 text-white'
                                }`}
                            >
                                <div className="p-3 bg-white/20 rounded-full shadow-lg ring-1 ring-white/30">
                                    {message.type === 'success' ? <CheckCircle2 size={24} /> : <Trash2 size={24} />}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 leading-none mb-1.5">System Response</p>
                                    <p className="text-base font-black uppercase tracking-tight leading-none">{message.text}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default ProfilSekolahPage;
