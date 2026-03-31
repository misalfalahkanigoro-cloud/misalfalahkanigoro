'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { adminApi } from '@/lib/api/admin';
import { type AdminSiteSettings, createDefaultAdminSiteSettings } from '@/lib/admin-site-settings';

const SETTINGS_TABS = [
    { id: 'identity', label: 'Identitas Situs' },
    { id: 'whatsapp', label: 'WhatsApp Bisnis' },
    { id: 'social', label: 'Media Sosial' },
    { id: 'seo', label: 'SEO & Analytics' },
] as const;

type SettingsTabId = (typeof SETTINGS_TABS)[number]['id'];

const isSettingsTabId = (value: string | null): value is SettingsTabId => 
    SETTINGS_TABS.some((tab) => tab.id === value);

export function useSettings() {
    const searchParams = useSearchParams();
    const [role, setRole] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<SettingsTabId>('identity');
    const [settings, setSettings] = useState<AdminSiteSettings>(createDefaultAdminSiteSettings());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('adminUser');
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as { role?: string };
                setRole(parsed.role || null);
            } catch { setRole(null); }
        }
        void fetchSettings();
    }, []);

    useEffect(() => {
        const nextTab = searchParams.get('tab');
        if (isSettingsTabId(nextTab)) setActiveTab(nextTab);
    }, [searchParams]);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const nextSettings = await adminApi.getSiteSettings();
            setSettings(nextSettings);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal memuat konfigurasi pusat');
        } finally { setLoading(false); }
    };

    const handleSave = async (payload: Partial<AdminSiteSettings>) => {
        setSaving(true);
        setError(null);
        try {
            const updated = await adminApi.updateSiteSettings(payload);
            setSettings(updated);
            window.alert('Konfigurasi berhasil diperbarui secara global.');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal menyimpan perubahan sistem');
        } finally { setSaving(false); }
    };

    return {
        role,
        activeTab,
        setActiveTab,
        settings,
        loading,
        saving,
        error,
        handleSave,
        fetchSettings,
        tabs: SETTINGS_TABS,
    };
}
