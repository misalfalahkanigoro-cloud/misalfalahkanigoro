'use client';

import React, { useEffect, useMemo, useState } from 'react';
import SidebarAdmin from '@/components/sidebar-admin';

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
    const [message, setMessage] = useState<string | null>(null);

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

    const cleanedList = useMemo(() => normalizeWhatsappItems(whatsappList), [whatsappList]);

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

            setMessage('Kontak madrasah berhasil disimpan.');
        } catch (error) {
            console.error(error);
            setMessage('Gagal menyimpan kontak madrasah.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors dark:bg-[#0B0F0C] dark:text-gray-100">
            <SidebarAdmin />
            <main className="min-h-screen px-6 py-10 lg:pl-80 space-y-8">
                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5 space-y-6">
                    <div>
                        <h2 className="text-2xl font-semibold">Kontak Madrasah</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Kelola alamat, email, WhatsApp, dan embed Google Maps.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-semibold">Alamat</label>
                            <textarea
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                rows={3}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Telepon (opsional)</label>
                            <input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Email</label>
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-semibold">Daftar WhatsApp</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Semua nomor ditampilkan di halaman kontak. Pilih satu untuk tombol “Chat Admin”.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={addWhatsapp}
                            className="rounded-xl border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-600"
                        >
                            + Tambah WhatsApp
                        </button>
                    </div>

                    <div className="space-y-4">
                        {whatsappList.map((item, index) => (
                            <div key={item.id} className="rounded-2xl border border-emerald-100 p-4 dark:border-white/10">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">#{index + 1}</p>
                                    <label className="flex items-center gap-2 text-xs">
                                        <input
                                            type="radio"
                                            name="adminWhatsapp"
                                            checked={adminWhatsappId === item.id}
                                            onChange={() => setAdminWhatsappId(item.id)}
                                        />
                                        Admin (popup)
                                    </label>
                                </div>
                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Nama</label>
                                        <input
                                            value={item.name}
                                            onChange={(e) => updateWhatsapp(item.id, 'name', e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                            placeholder="Admin PPDB"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">URL WhatsApp</label>
                                        <input
                                            value={item.url}
                                            onChange={(e) => updateWhatsapp(item.id, 'url', e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                            placeholder="https://wa.me/62812..."
                                        />
                                    </div>
                                </div>
                                <div className="mt-3 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => removeWhatsapp(item.id)}
                                        className="rounded-lg border border-red-500 px-3 py-2 text-xs text-red-500"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        ))}
                        {!whatsappList.length && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada nomor WhatsApp.</p>
                        )}
                        {cleanedList.length > 0 && !adminWhatsappId && (
                            <p className="text-xs text-amber-600">
                                Pilih salah satu nomor sebagai admin untuk tombol Chat Admin.
                            </p>
                        )}
                    </div>
                </div>

                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5 space-y-4">
                    <div>
                        <h3 className="text-xl font-semibold">Embed Google Maps</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tempelkan iframe Google Maps.</p>
                    </div>
                    <textarea
                        value={mapEmbedHtml}
                        onChange={(e) => setMapEmbedHtml(e.target.value)}
                        rows={5}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                        placeholder="<iframe ...></iframe>"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
                    >
                        {saving ? 'Menyimpan...' : 'Simpan Kontak'}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default KontakAdminPage;
