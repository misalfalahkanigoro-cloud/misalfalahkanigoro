'use client';

import React, { useEffect, useMemo, useState } from 'react';
import SidebarAdmin from '@/components/sidebar-admin';
import CloudinaryButton from '@/components/admin/CloudinaryButton';
import type { PPDBFile, PPDBWave, PPDBNotification } from '@/lib/types';

const ADMIN_TABS = ['pendaftar', 'gelombang', 'notifikasi', 'brosur'] as const;
type AdminTab = typeof ADMIN_TABS[number];

type PPDBItem = {
    id: string;
    namaLengkap: string;
    nisn?: string | null;
    noHp: string;
    status: 'VERIFIKASI' | 'BERKAS_VALID' | 'DITERIMA' | 'DITOLAK';
    pesan?: string | null;
    tanggalDaftar: string;
    wave_id?: string | null;
};

type PPDBDetail = PPDBItem & {
    nik: string;
    tempatLahir: string;
    tanggalLahir: string;
    jenisKelamin: string;
    alamat: string;
    namaAyah: string;
    pekerjaanAyah?: string | null;
    namaIbu: string;
    pekerjaanIbu?: string | null;
    files?: PPDBFile[];
};

type SubscriberItem = {
    id: string;
    registrationId: string;
    namaLengkap: string;
    nisn: string;
    createdAt: string;
};

type BrochureItem = {
    id: string;
    entityId: string;
    mediaUrl: string;
    caption?: string | null;
    displayOrder: number;
    isMain: boolean;
    createdAt?: string;
};

const AdminPPDBPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('pendaftar');

    const [items, setItems] = useState<PPDBItem[]>([]);
    const [selected, setSelected] = useState<PPDBItem | null>(null);
    const [detail, setDetail] = useState<PPDBDetail | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [status, setStatus] = useState<PPDBItem['status']>('VERIFIKASI');
    const [pesan, setPesan] = useState('Menunggu verifikasi.');
    const [sendStatusNotification, setSendStatusNotification] = useState(true);
    const [subscriptionInfo, setSubscriptionInfo] = useState<string>('');
    const [subscribers, setSubscribers] = useState<SubscriberItem[]>([]);

    const [waves, setWaves] = useState<PPDBWave[]>([]);
    const [waveForm, setWaveForm] = useState({
        name: '',
        startDate: '',
        endDate: '',
        quota: '' as string | number,
        isActive: true,
    });
    const [editingWaveId, setEditingWaveId] = useState<string | null>(null);

    const [notifications, setNotifications] = useState<PPDBNotification[]>([]);
    const [notifForm, setNotifForm] = useState({
        title: '',
        message: '',
        target: 'registration' as 'registration' | 'wave',
        registrationId: '',
        waveId: '',
    });
    const [notifMessage, setNotifMessage] = useState<string | null>(null);

    const [brochures, setBrochures] = useState<BrochureItem[]>([]);
    const [brochureForm, setBrochureForm] = useState({
        waveId: '',
        mediaUrl: '',
        caption: '',
        displayOrder: 0,
        isMain: false,
    });
    const [editingBrochureId, setEditingBrochureId] = useState<string | null>(null);

    const fetchItems = async () => {
        const res = await fetch('/api/admin/ppdb-registrations');
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
    };

    const fetchWaves = async () => {
        const res = await fetch('/api/admin/ppdb-waves');
        const data = await res.json();
        const mapped = (Array.isArray(data) ? data : []).map((w: any) => ({
            id: w.id,
            name: w.name,
            startDate: w.start_date,
            endDate: w.end_date,
            quota: w.quota,
            isActive: w.is_active,
            createdAt: w.created_at,
            updatedAt: w.updated_at,
        }));
        setWaves(mapped);
    };

    const fetchNotifications = async () => {
        const res = await fetch('/api/admin/ppdb-notifications');
        const data = await res.json();
        const mapped = (Array.isArray(data) ? data : []).map((n: any) => ({
            id: n.id,
            registrationId: n.registration_id,
            waveId: n.wave_id,
            title: n.title,
            message: n.message,
            createdAt: n.created_at,
        }));
        setNotifications(mapped);
    };

    const fetchSubscribers = async () => {
        const res = await fetch('/api/admin/ppdb-subscribers');
        const data = await res.json();
        setSubscribers(Array.isArray(data) ? data : []);
    };

    const fetchBrochures = async () => {
        const res = await fetch('/api/admin/ppdb-brochures');
        const data = await res.json();
        const mapped = (Array.isArray(data) ? data : []).map((b: any) => ({
            id: b.id,
            entityId: b.entityId,
            mediaUrl: b.mediaUrl,
            caption: b.caption,
            displayOrder: b.displayOrder ?? 0,
            isMain: Boolean(b.isMain),
            createdAt: b.createdAt,
        }));
        setBrochures(mapped);
    };

    useEffect(() => {
        fetchItems();
        fetchWaves();
        fetchNotifications();
        fetchSubscribers();
        fetchBrochures();
    }, []);

    const handleSelect = async (item: PPDBItem) => {
        setSelected(item);
        setStatus(item.status);
        setPesan(item.pesan || 'Menunggu verifikasi.');
        setLoadingDetail(true);
        try {
            const res = await fetch(`/api/ppdb/registration/${item.id}`);
            const data = await res.json();
            if (res.ok) {
                setDetail(data);
            } else {
                setDetail(null);
            }
        } catch (error) {
            console.error('Failed to fetch registration detail', error);
            setDetail(null);
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleUpdate = async () => {
        if (!selected) return;
        const response = await fetch(`/api/admin/ppdb-registrations/${selected.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status,
                pesan: pesan || 'Menunggu verifikasi.',
                sendNotification: sendStatusNotification,
            }),
        });
        const json = await response.json().catch(() => ({}));
        if (!response.ok) {
            alert(json.error || 'Gagal menyimpan status');
            return;
        }
        if (sendStatusNotification) {
            setSubscriptionInfo(json.hasSubscription ? 'Notifikasi terkirim ke perangkat peserta.' : 'Peserta belum mengaktifkan notifikasi.');
        } else {
            setSubscriptionInfo(json.hasSubscription ? 'Peserta sudah mengaktifkan notifikasi.' : 'Peserta belum mengaktifkan notifikasi.');
        }
        setSelected(null);
        setDetail(null);
        fetchItems();
        fetchSubscribers();
    };

    const deleteRegistration = async (id: string) => {
        if (!confirm('Hapus data pendaftar ini?')) return;
        await fetch(`/api/admin/ppdb-registrations/${id}`, { method: 'DELETE' });
        setSelected(null);
        setDetail(null);
        fetchItems();
        fetchSubscribers();
    };

    const saveWave = async () => {
        const payload = {
            name: waveForm.name,
            startDate: waveForm.startDate,
            endDate: waveForm.endDate,
            quota: waveForm.quota === '' ? null : Number(waveForm.quota),
            isActive: waveForm.isActive,
        };

        if (editingWaveId) {
            await fetch(`/api/admin/ppdb-waves/${editingWaveId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
        } else {
            await fetch('/api/admin/ppdb-waves', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
        }

        setEditingWaveId(null);
        setWaveForm({ name: '', startDate: '', endDate: '', quota: '', isActive: true });
        fetchWaves();
    };

    const editWave = (wave: PPDBWave) => {
        setEditingWaveId(wave.id);
        setWaveForm({
            name: wave.name,
            startDate: wave.startDate,
            endDate: wave.endDate,
            quota: wave.quota ?? '',
            isActive: wave.isActive,
        });
    };

    const deleteWave = async (id: string) => {
        await fetch(`/api/admin/ppdb-waves/${id}`, { method: 'DELETE' });
        fetchWaves();
    };

    const sendNotification = async () => {
        setNotifMessage(null);
        if (notifForm.target === 'registration' && !notifForm.registrationId) {
            setNotifMessage('Pilih pendaftar yang sudah mengaktifkan notifikasi.');
            return;
        }
        if (notifForm.target === 'wave' && !notifForm.waveId) {
            setNotifMessage('Pilih gelombang.');
            return;
        }
        const payload: any = {
            title: notifForm.title,
            message: notifForm.message,
        };
        if (notifForm.target === 'registration') {
            payload.registrationId = notifForm.registrationId;
        } else {
            payload.waveId = notifForm.waveId;
        }

        const res = await fetch('/api/admin/ppdb-notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            setNotifMessage(err.error || 'Gagal mengirim notifikasi');
            return;
        }

        setNotifMessage('Notifikasi berhasil dikirim.');
        setNotifForm({ title: '', message: '', target: 'registration', registrationId: '', waveId: '' });
        fetchNotifications();
    };

    const deleteNotification = async (id: string) => {
        await fetch(`/api/admin/ppdb-notifications/${id}`, { method: 'DELETE' });
        fetchNotifications();
    };

    const saveBrochure = async () => {
        if (!brochureForm.waveId || !brochureForm.mediaUrl) {
            alert('Wave dan media URL wajib diisi.');
            return;
        }
        const payload = {
            waveId: brochureForm.waveId,
            mediaUrl: brochureForm.mediaUrl,
            caption: brochureForm.caption,
            displayOrder: Number(brochureForm.displayOrder) || 0,
            isMain: brochureForm.isMain,
        };

        if (editingBrochureId) {
            await fetch(`/api/admin/ppdb-brochures/${editingBrochureId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
        } else {
            await fetch('/api/admin/ppdb-brochures', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
        }

        setEditingBrochureId(null);
        setBrochureForm({ waveId: '', mediaUrl: '', caption: '', displayOrder: 0, isMain: false });
        fetchBrochures();
    };

    const editBrochure = (item: BrochureItem) => {
        setEditingBrochureId(item.id);
        setBrochureForm({
            waveId: item.entityId,
            mediaUrl: item.mediaUrl,
            caption: item.caption || '',
            displayOrder: item.displayOrder ?? 0,
            isMain: item.isMain,
        });
    };

    const deleteBrochure = async (id: string) => {
        if (!confirm('Hapus brosur ini?')) return;
        await fetch(`/api/admin/ppdb-brochures/${id}`, { method: 'DELETE' });
        fetchBrochures();
    };

    const waveOptions = useMemo(() => waves, [waves]);
    const waveMap = useMemo(() => new Map(waves.map((w) => [w.id, w.name])), [waves]);

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors dark:bg-[#0B0F0C] dark:text-gray-100">
            <SidebarAdmin />
            <main className="min-h-screen px-6 py-10 lg:pl-80 space-y-8">
                <div className="flex flex-wrap gap-2">
                    {ADMIN_TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
                                activeTab === tab
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white text-gray-600 border border-emerald-900/10 dark:bg-white/5 dark:text-gray-200 dark:border-white/10'
                            }`}
                        >
                            {tab === 'pendaftar'
                                ? 'Pendaftar'
                                : tab === 'gelombang'
                                ? 'Gelombang'
                                : tab === 'notifikasi'
                                ? 'Notifikasi'
                                : 'Brosur'}
                        </button>
                    ))}
                </div>

                {activeTab === 'pendaftar' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 rounded-3xl border border-emerald-900/20 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                            <h2 className="text-2xl font-semibold mb-4">Data PPDB</h2>
                            <div className="space-y-3">
                                {items.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleSelect(item)}
                                        className={`w-full text-left rounded-2xl border border-emerald-900/10 p-4 dark:border-white/10 ${
                                            selected?.id === item.id ? 'bg-emerald-50 dark:bg-white/10' : 'bg-white/80 dark:bg-white/5'
                                        }`}
                                    >
                                        <p className="text-sm font-semibold">{item.namaLengkap}</p>
                                        <p className="text-xs text-gray-500">{item.nisn || '-'} · {item.noHp}</p>
                                        <p className="text-[11px] text-emerald-600">Status: {item.status}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            {selected && (
                                <div className="rounded-3xl border border-emerald-900/20 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                                    <h3 className="text-lg font-semibold mb-4">Detail Pendaftar</h3>
                                    {loadingDetail ? (
                                        <p className="text-sm text-gray-500">Memuat detail...</p>
                                    ) : detail ? (
                                        <div className="grid gap-4 text-sm">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <p><span className="font-semibold">Nama:</span> {detail.namaLengkap}</p>
                                                <p><span className="font-semibold">NIK:</span> {detail.nik}</p>
                                                <p><span className="font-semibold">NISN:</span> {detail.nisn || '-'}</p>
                                                <p><span className="font-semibold">TTL:</span> {detail.tempatLahir}, {detail.tanggalLahir}</p>
                                                <p><span className="font-semibold">No. HP:</span> {detail.noHp}</p>
                                                <p><span className="font-semibold">Jenis Kelamin:</span> {detail.jenisKelamin}</p>
                                                <p><span className="font-semibold">Alamat:</span> {detail.alamat}</p>
                                                <p><span className="font-semibold">Nama Ayah:</span> {detail.namaAyah}</p>
                                                <p><span className="font-semibold">Pekerjaan Ayah:</span> {detail.pekerjaanAyah || '-'}</p>
                                                <p><span className="font-semibold">Nama Ibu:</span> {detail.namaIbu}</p>
                                                <p><span className="font-semibold">Pekerjaan Ibu:</span> {detail.pekerjaanIbu || '-'}</p>
                                            </div>

                                            <div className="border-t pt-4 dark:border-white/10">
                                                <h4 className="font-semibold mb-2">Berkas</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {(detail.files || []).map((file) => (
                                                        <a
                                                            key={file.id}
                                                            href={file.fileUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="rounded-xl border border-emerald-900/10 p-3 text-xs text-emerald-700 hover:bg-emerald-50 dark:border-white/10 dark:text-emerald-300"
                                                        >
                                                            {file.fileType.replace('_', ' ')}
                                                        </a>
                                                    ))}
                                                    {(detail.files || []).length === 0 && (
                                                        <p className="text-xs text-gray-500">Belum ada berkas.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">Detail tidak tersedia.</p>
                                    )}
                                    {detail && (
                                        <div className="mt-6 flex flex-wrap gap-2">
                                            <a
                                                href={`/api/ppdb/pdf?nisn=${encodeURIComponent(detail.nisn || '')}`}
                                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                                            >
                                                Download Formulir
                                            </a>
                                            <button
                                                onClick={() => deleteRegistration(detail.id)}
                                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                                            >
                                                Hapus Pendaftar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {selected && (
                                <div className="rounded-3xl border border-emerald-900/20 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                                    <h3 className="text-lg font-semibold">Update Status</h3>
                                    <p className="text-xs text-gray-500 mt-1">VERIFIKASI · Menunggu verifikasi.</p>
                                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value as PPDBItem['status'])}
                                            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                                        >
                                            <option value="VERIFIKASI">VERIFIKASI</option>
                                            <option value="BERKAS_VALID">BERKAS_VALID</option>
                                            <option value="DITERIMA">DITERIMA</option>
                                            <option value="DITOLAK">DITOLAK</option>
                                        </select>
                                        <textarea
                                            value={pesan}
                                            onChange={(e) => setPesan(e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm md:col-span-2 dark:border-white/10 dark:bg-black/30"
                                            rows={3}
                                            placeholder="Pesan untuk pendaftar"
                                        />
                                        <div className="md:col-span-2 flex items-center justify-between gap-4">
                                            <label className="flex items-center gap-2 text-xs text-gray-600">
                                                <input
                                                    type="checkbox"
                                                    checked={sendStatusNotification}
                                                    onChange={(e) => setSendStatusNotification(e.target.checked)}
                                                />
                                                Kirim notifikasi status
                                            </label>
                                            <button
                                                onClick={handleUpdate}
                                                className="rounded-xl bg-emerald-600 px-6 py-3 text-xs font-semibold text-white"
                                            >
                                                Simpan Status
                                            </button>
                                        </div>
                                        {subscriptionInfo && (
                                            <p className="md:col-span-2 text-xs text-emerald-600">{subscriptionInfo}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'gelombang' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 rounded-3xl border border-emerald-900/20 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                            <h3 className="text-lg font-semibold mb-4">{editingWaveId ? 'Edit Gelombang' : 'Tambah Gelombang'}</h3>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={waveForm.name}
                                    onChange={(e) => setWaveForm({ ...waveForm, name: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                    placeholder="Nama Gelombang"
                                />
                                <input
                                    type="date"
                                    value={waveForm.startDate}
                                    onChange={(e) => setWaveForm({ ...waveForm, startDate: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                />
                                <input
                                    type="date"
                                    value={waveForm.endDate}
                                    onChange={(e) => setWaveForm({ ...waveForm, endDate: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                />
                                <input
                                    type="number"
                                    value={waveForm.quota}
                                    onChange={(e) => setWaveForm({ ...waveForm, quota: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                    placeholder="Kuota"
                                />
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={waveForm.isActive}
                                        onChange={(e) => setWaveForm({ ...waveForm, isActive: e.target.checked })}
                                    />
                                    Aktif
                                </label>
                                <button
                                    onClick={saveWave}
                                    className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                                >
                                    {editingWaveId ? 'Simpan Perubahan' : 'Tambah Gelombang'}
                                </button>
                            </div>
                        </div>

                        <div className="lg:col-span-2 rounded-3xl border border-emerald-900/20 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                            <h3 className="text-lg font-semibold mb-4">Daftar Gelombang</h3>
                            <div className="space-y-3">
                                {waves.map((wave) => (
                                    <div key={wave.id} className="rounded-2xl border border-emerald-900/10 p-4 dark:border-white/10 flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-semibold">{wave.name}</p>
                                                <p className="text-xs text-gray-500">{wave.startDate} - {wave.endDate}</p>
                                            </div>
                                            <span className={`text-[11px] px-2 py-1 rounded-full ${wave.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {wave.isActive ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500">Kuota: {wave.quota ?? '-'}</p>
                                        <div className="flex gap-2">
                                            <button onClick={() => editWave(wave)} className="text-xs text-emerald-600">Edit</button>
                                            <button onClick={() => deleteWave(wave.id)} className="text-xs text-red-500">Hapus</button>
                                        </div>
                                    </div>
                                ))}
                                {waves.length === 0 && <p className="text-sm text-gray-500">Belum ada gelombang.</p>}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'notifikasi' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 rounded-3xl border border-emerald-900/20 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                            <h3 className="text-lg font-semibold mb-4">Kirim Notifikasi</h3>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={notifForm.title}
                                    onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                    placeholder="Judul Notifikasi"
                                />
                                <textarea
                                    value={notifForm.message}
                                    onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                    rows={4}
                                    placeholder="Isi pesan notifikasi"
                                />
                                <select
                                    value={notifForm.target}
                                    onChange={(e) => setNotifForm({ ...notifForm, target: e.target.value as any })}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                >
                                    <option value="registration">Pendaftar Tertentu</option>
                                    <option value="wave">Berdasarkan Gelombang</option>
                                </select>
                                {notifForm.target === 'registration' ? (
                                    <select
                                        value={notifForm.registrationId}
                                        onChange={(e) => setNotifForm({ ...notifForm, registrationId: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                    >
                                        <option value="">Pilih Pendaftar (Sudah Aktif Notifikasi)</option>
                                        {subscribers.map((item) => (
                                            <option key={item.registrationId} value={item.registrationId}>
                                                {item.namaLengkap} · {item.nisn}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <select
                                        value={notifForm.waveId}
                                        onChange={(e) => setNotifForm({ ...notifForm, waveId: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                    >
                                        <option value="">Pilih Gelombang</option>
                                        {waveOptions.map((wave) => (
                                            <option key={wave.id} value={wave.id}>{wave.name}</option>
                                        ))}
                                    </select>
                                )}
                                {notifForm.target === 'registration' && subscribers.length === 0 && (
                                    <p className="text-xs text-amber-600">Belum ada pendaftar yang mengaktifkan notifikasi.</p>
                                )}
                                <button
                                    onClick={sendNotification}
                                    className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                                >
                                    Kirim Notifikasi
                                </button>
                                {notifMessage && <p className="text-xs text-emerald-600">{notifMessage}</p>}
                            </div>
                        </div>

                        <div className="lg:col-span-2 rounded-3xl border border-emerald-900/20 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                            <h3 className="text-lg font-semibold mb-4">Riwayat Notifikasi</h3>
                            <div className="space-y-3">
                                {notifications.map((notif) => (
                                    <div key={notif.id} className="rounded-2xl border border-emerald-900/10 p-4 dark:border-white/10">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-semibold">{notif.title}</p>
                                                <p className="text-xs text-gray-500">{notif.message}</p>
                                            </div>
                                            <button onClick={() => deleteNotification(notif.id)} className="text-xs text-red-500">Hapus</button>
                                        </div>
                                        <p className="text-[11px] text-gray-400 mt-2">{notif.createdAt ? new Date(notif.createdAt).toLocaleString('id-ID') : ''}</p>
                                    </div>
                                ))}
                                {notifications.length === 0 && <p className="text-sm text-gray-500">Belum ada notifikasi.</p>}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'brosur' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 rounded-3xl border border-emerald-900/20 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                            <h3 className="text-lg font-semibold mb-4">{editingBrochureId ? 'Edit Brosur' : 'Tambah Brosur'}</h3>
                            <div className="space-y-4">
                                <select
                                    value={brochureForm.waveId}
                                    onChange={(e) => setBrochureForm({ ...brochureForm, waveId: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                >
                                    <option value="">Pilih Gelombang</option>
                                    {waveOptions.map((wave) => (
                                        <option key={wave.id} value={wave.id}>{wave.name}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={brochureForm.caption}
                                    onChange={(e) => setBrochureForm({ ...brochureForm, caption: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                    placeholder="Caption brosur"
                                />
                                <input
                                    type="number"
                                    value={brochureForm.displayOrder}
                                    onChange={(e) => setBrochureForm({ ...brochureForm, displayOrder: Number(e.target.value) })}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                                    placeholder="Urutan tampil"
                                />
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={brochureForm.isMain}
                                        onChange={(e) => setBrochureForm({ ...brochureForm, isMain: e.target.checked })}
                                    />
                                    Jadikan Utama
                                </label>
                                <div className="space-y-2">
                                    <CloudinaryButton
                                        folder="mis-al-falah/ppdb/brosur"
                                        label="Upload Brosur"
                                        onUploaded={(url) => setBrochureForm({ ...brochureForm, mediaUrl: url })}
                                    />
                                    {brochureForm.mediaUrl && (
                                        <img src={brochureForm.mediaUrl} alt="Preview" className="w-full rounded-xl border border-emerald-100" />
                                    )}
                                </div>
                                <button
                                    onClick={saveBrochure}
                                    className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                                >
                                    {editingBrochureId ? 'Simpan Perubahan' : 'Tambah Brosur'}
                                </button>
                            </div>
                        </div>

                        <div className="lg:col-span-2 rounded-3xl border border-emerald-900/20 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                            <h3 className="text-lg font-semibold mb-4">Daftar Brosur</h3>
                            <div className="space-y-3">
                                {brochures.map((item) => (
                                    <div key={item.id} className="rounded-2xl border border-emerald-900/10 p-4 dark:border-white/10 flex flex-col gap-3">
                                        <div className="flex items-start gap-3">
                                            <img src={item.mediaUrl} alt={item.caption || 'Brosur'} className="h-20 w-28 rounded-lg object-cover" />
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold">{item.caption || 'Tanpa judul'}</p>
                                                <p className="text-xs text-gray-500">Gelombang: {waveMap.get(item.entityId) || '-'}</p>
                                                <p className="text-xs text-gray-500">Urutan: {item.displayOrder}</p>
                                                {item.isMain && <span className="text-[11px] text-emerald-600">Utama</span>}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 text-xs">
                                            <button onClick={() => editBrochure(item)} className="text-emerald-600">Edit</button>
                                            <button onClick={() => deleteBrochure(item.id)} className="text-red-500">Hapus</button>
                                        </div>
                                    </div>
                                ))}
                                {brochures.length === 0 && <p className="text-sm text-gray-500">Belum ada brosur.</p>}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPPDBPage;
