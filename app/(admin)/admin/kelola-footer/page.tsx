'use client';

import React, { useEffect, useState } from 'react';
import SidebarAdmin from '@/components/sidebar-admin';

type SiteSettingsForm = {
    school_address: string;
    school_phone: string;
    school_email: string;
    school_whatsapp: string;
    school_tagline: string;
};


type FooterLink = {
    label: string;
    href: string;
};

const KelolaFooterPage: React.FC = () => {
    const [settings, setSettings] = useState<SiteSettingsForm>({
        school_address: '',
        school_phone: '',
        school_email: '',
        school_whatsapp: '',
        school_tagline: '',
    });
    const [footerLinks, setFooterLinks] = useState<FooterLink[]>([]);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [settingsRes, footerRes] = await Promise.all([
                    fetch('/api/admin/site-settings'),
                    fetch('/api/admin/footer-links'),
                ]);

                const settingsData = await settingsRes.json();
                const footerData = await footerRes.json();

                if (settingsData) {
                    setSettings({
                        school_address: settingsData.school_address || '',
                        school_phone: settingsData.school_phone || '',
                        school_email: settingsData.school_email || '',
                        school_whatsapp: settingsData.school_whatsapp || '',
                        school_tagline: settingsData.school_tagline || '',
                    });
                }

                if (Array.isArray(footerData)) {
                    setFooterLinks(footerData.map((item: any) => ({
                        label: item.label,
                        href: item.href,
                    })));
                }
            } catch (error) {
                console.error('Failed to load footer data', error);
            }
        };

        fetchData();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const [settingsRes, footerRes] = await Promise.all([
                fetch('/api/admin/site-settings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(settings),
                }),
                fetch('/api/admin/footer-links', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items: footerLinks.map((item, idx) => ({
                        ...item,
                        display_order: idx + 1,
                        is_active: true,
                    })) }),
                }),
            ]);

            if (!settingsRes.ok || !footerRes.ok) {
                throw new Error('Failed to save');
            }

            setMessage('Perubahan footer berhasil disimpan.');
        } catch (error) {
            console.error(error);
            setMessage('Gagal menyimpan perubahan.');
        } finally {
            setSaving(false);
        }
    };

    const addFooterLink = () => {
        setFooterLinks((prev) => [...prev, { label: 'Tautan Baru', href: '/tautan' }]);
    };

    const updateFooterLink = (index: number, field: keyof FooterLink, value: string) => {
        setFooterLinks((prev) => prev.map((item, idx) => idx === index ? { ...item, [field]: value } : item));
    };

    const removeFooterLink = (index: number) => {
        setFooterLinks((prev) => prev.filter((_, idx) => idx !== index));
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors dark:bg-[#0B0F0C] dark:text-gray-100">
            <SidebarAdmin />
            <main className="min-h-screen px-6 py-10 lg:pl-80 space-y-8">
                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <h2 className="text-2xl font-semibold">Kelola Footer</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Atur kontak, tagline, dan tautan cepat.</p>

                    <div className="mt-8 grid gap-6 lg:grid-cols-2">
                        <div className="space-y-4">
                            <label className="text-sm font-semibold">Alamat</label>
                            <input
                                value={settings.school_address}
                                onChange={(e) => setSettings({ ...settings, school_address: e.target.value })}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                            />

                            <label className="text-sm font-semibold">Telepon</label>
                            <input
                                value={settings.school_phone}
                                onChange={(e) => setSettings({ ...settings, school_phone: e.target.value })}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                            />

                            <label className="text-sm font-semibold">Email</label>
                            <input
                                value={settings.school_email}
                                onChange={(e) => setSettings({ ...settings, school_email: e.target.value })}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                            />

                            <label className="text-sm font-semibold">WhatsApp</label>
                            <input
                                value={settings.school_whatsapp}
                                onChange={(e) => setSettings({ ...settings, school_whatsapp: e.target.value })}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-semibold">Tagline Footer</label>
                            <textarea
                                value={settings.school_tagline}
                                onChange={(e) => setSettings({ ...settings, school_tagline: e.target.value })}
                                className="w-full min-h-[140px] rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                            />

                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-emerald-900/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-semibold">Tautan Cepat</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Atur link di footer.</p>
                        </div>
                        <button
                            onClick={addFooterLink}
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                        >
                            + Tambah Link
                        </button>
                    </div>

                    <div className="mt-6 space-y-3">
                        {footerLinks.map((link, index) => (
                            <div key={index} className="flex flex-col gap-2 md:flex-row md:items-center">
                                <input
                                    value={link.label}
                                    onChange={(e) => updateFooterLink(index, 'label', e.target.value)}
                                    className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                    placeholder="Label"
                                />
                                <input
                                    value={link.href}
                                    onChange={(e) => updateFooterLink(index, 'href', e.target.value)}
                                    className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                    placeholder="/tautan"
                                />
                                <button
                                    onClick={() => removeFooterLink(index)}
                                    className="rounded-lg border border-red-500 px-3 py-2 text-xs text-red-500"
                                >
                                    Hapus
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
                    >
                        {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default KelolaFooterPage;
