'use client';

import React, { useEffect, useMemo, useState } from 'react';
import SidebarAdmin from '@/components/sidebar-admin';
import HeaderAdmin from '@/components/header-admin';
import { 
    Plus, 
    Save, 
    Trash2, 
    MessageCircle, 
    Mail, 
    Phone, 
    MapPin, 
    Navigation, 
    CheckCircle2, 
    AlertCircle,
    UserCircle2,
    Link as LinkIcon,
    ShieldCheck,
    Globe
} from 'lucide-react';

type WhatsappItem = {
    id: string;
    name: string;
    url: string;
};

const normalizeWhatsappItems = (items: WhatsappItem[]) =>
    items
        .map((item) => ({
            ...item,
            name: item.name.trim(),
            url: item.url.trim(),
        }))
        .filter((item) => item.name && item.url);

const KontakAdminPage: React.FC = () => {
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [mapEmbedHtml, setMapEmbedHtml] = useState('');
    const [whatsappList, setWhatsappList] = useState<WhatsappItem[]>([]);
    const [adminWhatsappId, setAdminWhatsappId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/admin/contact-page');
                if (!res.ok) return;
                const data = await res.json();
                setAddress(data.address || '');
                setPhone(data.phone || '');
                setEmail(data.email || '');
                setMapEmbedHtml(data.mapEmbedHtml || '');
                setWhatsappList(
                    Array.isArray(data.whatsappList)
                        ? data.whatsappList.map((item: any) => ({
                              id: item.id || crypto.randomUUID(),
                              name: item.name || '',
                              url: item.url || '',
                          }))
                        : []
                );
                setAdminWhatsappId(data.adminWhatsappId ?? null);
            } catch (error) {
                console.error('Failed to load contact data', error);
            }
        };
        fetchData();
    }, []);

    const addWhatsapp = () => {
        setWhatsappList((prev) => [
            ...prev,
            { id: crypto.randomUUID(), name: '', url: '' },
        ]);
    };

    const removeWhatsapp = (id: string) => {
        setWhatsappList((prev) => prev.filter((item) => item.id !== id));
        setAdminWhatsappId((prev) => (prev === id ? null : prev));
    };

    const updateWhatsapp = (id: string, field: keyof WhatsappItem, value: string) => {
        setWhatsappList((prev) =>
            prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
        );
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const sanitizedList = normalizeWhatsappItems(whatsappList);
            const validAdminId = sanitizedList.some((item) => item.id === adminWhatsappId)
                ? adminWhatsappId
                : null;

            const payload = {
                address: address.trim(),
                phone: phone.trim() || null,
                email: email.trim(),
                mapEmbedHtml: mapEmbedHtml.trim(),
                whatsappList: sanitizedList,
                adminWhatsappId: validAdminId,
            };

            const res = await fetch('/api/admin/contact-page', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Gagal menyimpan kontak');
            }

            setMessage({ text: 'Konfigurasi kontak berhasil disinkronisasi.', type: 'success' });
            setTimeout(() => setMessage(null), 4000);
        } catch (error) {
            setMessage({ text: 'Terjadi kesalahan sistem.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080B09] text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <SidebarAdmin />
            
            <main className="min-h-screen lg:pl-64 pb-20">
                <HeaderAdmin 
                    title="Pusat Komunikasi"
                    subtitle="Kelola saluran informasi, alamat fisik, dan integrasi WhatsApp madrasah"
                    action={
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="group inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
                        >
                            <Save size={18} className="group-hover:-rotate-12 transition-transform" /> {saving ? 'CONNECTING...' : 'SAVE CHANNELS'}
                        </button>
                    }
                />

                <div className="px-4 sm:px-8 mt-8 space-y-10 max-w-7xl mx-auto">
                    {/* Primary Channels Card */}
                    <div className="bg-white/70 dark:bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white dark:border-white/10 shadow-2xl p-10">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl text-indigo-600">
                                <Globe size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-950 dark:text-white uppercase tracking-tight">Saluran Utama</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Data kontak resmi untuk korespondensi umum</p>
                            </div>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2">
                            <div className="space-y-4 md:col-span-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    <MapPin size={12} className="text-indigo-500" /> Alamat Fisik Lengkap
                                </label>
                                <textarea
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    rows={3}
                                    className="w-full rounded-[2rem] border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 px-6 py-5 text-sm font-bold text-gray-950 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner leading-relaxed"
                                    placeholder="Jl. Raya Utama No. 123, Desa..."
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    <Phone size={12} className="text-indigo-500" /> Hotline Telepon
                                </label>
                                <input
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 px-6 py-4.5 text-sm font-bold text-gray-950 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner"
                                    placeholder="(021) 12345678"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    <Mail size={12} className="text-indigo-500" /> Email Korespondensi
                                </label>
                                <input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 px-6 py-4.5 text-sm font-bold text-gray-950 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner"
                                    placeholder="kontak@misalfalah.sch.id"
                                />
                            </div>
                        </div>
                    </div>

                    {/* WhatsApp Directory Card */}
                    <div className="bg-white/70 dark:bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white dark:border-white/10 shadow-2xl p-10">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-emerald-600">
                                    <MessageCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-950 dark:text-white uppercase tracking-tight">Grup WhatsApp</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Kelola kontak departemen dan administrator PPDB</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={addWhatsapp}
                                className="group flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                            >
                                <Plus size={16} /> ADD LINE
                            </button>
                        </div>

                        <div className="grid gap-6">
                            {whatsappList.map((item, index) => (
                                <div key={item.id} className="group relative p-8 rounded-[2.5rem] bg-gray-50/50 dark:bg-white/[0.02] border border-white dark:border-white/5 transition-all hover:bg-white dark:hover:bg-white/[0.05] hover:border-emerald-500/20">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-emerald-600 font-black shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                                {index + 1}
                                            </div>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Channel Reference #{index + 1}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-3 cursor-pointer group/admin bg-white dark:bg-black/20 px-4 py-2 rounded-xl border border-gray-100 dark:border-white/5 hover:border-emerald-500/20 duration-300">
                                                <ShieldCheck size={14} className={adminWhatsappId === item.id ? 'text-emerald-500' : 'text-gray-300'} />
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${adminWhatsappId === item.id ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                    {adminWhatsappId === item.id ? 'PRIMARY ADMIN' : 'SET AS PRIMARY'}
                                                </span>
                                                <input
                                                    type="radio"
                                                    name="adminWhatsapp"
                                                    checked={adminWhatsappId === item.id}
                                                    onChange={() => setAdminWhatsappId(item.id)}
                                                    className="hidden"
                                                />
                                            </label>
                                            <button
                                                onClick={() => removeWhatsapp(item.id)}
                                                className="p-2 text-red-100 hover:text-red-500 bg-red-500/10 rounded-xl transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid lg:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                                <UserCircle2 size={12} className="text-emerald-500" /> Channel Label
                                            </label>
                                            <input
                                                value={item.name}
                                                onChange={(e) => updateWhatsapp(item.id, 'name', e.target.value)}
                                                className="w-full rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                                                placeholder="Admin PPDB / Keuangan"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                                <LinkIcon size={12} className="text-emerald-500" /> Deep Link (URL)
                                            </label>
                                            <input
                                                value={item.url}
                                                onChange={(e) => updateWhatsapp(item.id, 'url', e.target.value)}
                                                className="w-full rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                                                placeholder="https://wa.me/628..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {!whatsappList.length && (
                                <div className="text-center py-20 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[3rem]">
                                    <MessageCircle size={48} className="mx-auto text-gray-200 mb-4" />
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Direktori WhatsApp Kosong</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Geolocation Embed Card */}
                    <div className="bg-white/70 dark:bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white dark:border-white/10 shadow-2xl p-10 overflow-hidden">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-2xl text-amber-600">
                                <Navigation size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-950 dark:text-white uppercase tracking-tight">Perspektif Lokasi</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Embed peta Google Maps untuk navigasi pengunjung</p>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-[1fr_350px] gap-10">
                            <div className="space-y-6">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    <AlertCircle size={12} className="text-amber-500" /> Iframe Code Source
                                </label>
                                <textarea
                                    value={mapEmbedHtml}
                                    onChange={(e) => setMapEmbedHtml(e.target.value)}
                                    rows={5}
                                    className="w-full rounded-[2rem] border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 px-6 py-5 text-xs font-mono text-gray-900 dark:text-gray-300 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all shadow-inner"
                                    placeholder="<iframe src='...' ...></iframe>"
                                />
                                <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                                    <p className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest leading-relaxed">
                                        Pastikan kode iframe berasal dari fungsi 'Share & Embed Map' pada Google Maps resmi.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="relative group aspect-square rounded-[2.5rem] overflow-hidden bg-gray-100 dark:bg-black/40 shadow-3xl border border-white dark:border-white/5">
                                {mapEmbedHtml ? (
                                    <div 
                                        className="w-full h-full [&_iframe]:w-full [&_iframe]:h-full grayscale hover:grayscale-0 transition-all duration-700"
                                        dangerouslySetInnerHTML={{ __html: mapEmbedHtml }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-4">
                                        <MapPin size={48} className="animate-bounce" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">MAP PREVIEW UNAVAILABLE</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {message && (
                        <div className={`fixed bottom-10 right-10 z-[100] flex items-center gap-4 px-8 py-5 rounded-[2rem] shadow-3xl backdrop-blur-xl border border-white/20 animate-in slide-in-from-bottom-10 duration-700 ${
                            message.type === 'success' ? 'bg-emerald-600/90 text-white' : 'bg-red-600/90 text-white'
                        }`}>
                            <div className="p-2 bg-white/20 rounded-full">
                                {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Sistem Notifikasi</p>
                                <p className="text-sm font-black uppercase tracking-tight">{message.text}</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default KontakAdminPage;
