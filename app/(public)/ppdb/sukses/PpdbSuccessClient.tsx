'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Download, ArrowLeft, Loader2, BellRing } from 'lucide-react';
import type { PPDBRegistration } from '@/lib/types';
import type { PushSubscriptionPayload } from '@/lib/types';

const PpdbSuccessClient: React.FC = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const nisnParam = searchParams.get('nisn');
    const [data, setData] = useState<PPDBRegistration | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pushStatus, setPushStatus] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!nisnParam) {
                setError('NISN tidak ditemukan.');
                setLoading(false);
                return;
            }
            try {
                const res = await fetch(`/api/ppdb/by-nisn?nisn=${encodeURIComponent(nisnParam)}`);
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.error || 'Gagal memuat data');
                }
                const json = await res.json();
                setData(json as PPDBRegistration);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Gagal memuat data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [nisnParam]);

    const pdfFileName = useMemo(() => {
        if (!data) return 'ppdb-formulir.pdf';
        const safeName = data.namaLengkap.replace(/\s+/g, '-').toLowerCase();
        return `ppdb-${safeName}.pdf`;
    }, [data]);

    const subscribeToPush = async () => {
        try {
            if (!data?.id) {
                setPushStatus('NISN tidak ditemukan.');
                return;
            }
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                setPushStatus('Browser tidak mendukung notifikasi.');
                return;
            }
            const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
            if (!vapidKey) {
                setPushStatus('VAPID public key belum diatur.');
                return;
            }

            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                setPushStatus('Izin notifikasi ditolak.');
                return;
            }

            const registration = await navigator.serviceWorker.register('/sw.js');
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey),
            });

            const json = subscription.toJSON();
            const payload: PushSubscriptionPayload = {
                registrationId: data.id,
                endpoint: json.endpoint || '',
                p256dh: json.keys?.p256dh || '',
                auth: json.keys?.auth || '',
                userAgent: navigator.userAgent,
            };

            const res = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Gagal menyimpan notifikasi');
            }

            setPushStatus('Notifikasi aktif di perangkat ini.');
        } catch (err) {
            setPushStatus(err instanceof Error ? err.message : 'Gagal mengaktifkan notifikasi');
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0B0F0C] transition-colors">
            <section className="bg-gradient-to-r from-emerald-50 via-white to-emerald-50 dark:from-[#0B0F0C] dark:via-[#0F1511] dark:to-[#0B0F0C] border-b border-emerald-100/70 dark:border-white/10">
                <div className="container mx-auto px-4 py-8 md:py-10">
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-emerald-700/70 dark:text-emerald-200/70">
                        <span className="h-[2px] w-8 bg-emerald-500/70"></span>
                        Halaman
                    </div>
                    <h1 className="mt-3 text-2xl md:text-4xl font-bold text-emerald-950 dark:text-white">PPDB - Sukses</h1>
                </div>
            </section>

            <div className="container mx-auto px-4 py-12 max-w-3xl">
                <button
                    onClick={() => router.push('/ppdb')}
                    className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-6"
                >
                    <ArrowLeft size={16} /> Kembali ke PPDB
                </button>

                <div className="rounded-3xl border border-emerald-900/10 bg-white p-8 shadow-xl dark:border-white/10 dark:bg-[#151B16]">
                    {loading ? (
                        <div className="flex items-center justify-center gap-3 text-emerald-600">
                            <Loader2 className="animate-spin" size={20} />
                            Memuat data pendaftaran...
                        </div>
                    ) : error ? (
                        <p className="text-sm text-red-600">{error}</p>
                    ) : data ? (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle size={36} className="text-emerald-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-emerald-950 dark:text-white">Pendaftaran Berhasil</h2>
                                <p className="text-sm text-emerald-900/60 dark:text-white/60 mt-2">
                                    Simpan nomor pendaftaran Anda dan unduh formulir.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-dashed border-emerald-300/60 bg-emerald-50/60 p-5 text-center mb-8">
                                <p className="text-xs uppercase tracking-widest text-emerald-600/70 mb-2">Nomor Pendaftaran</p>
                                <p className="text-lg font-mono font-bold text-emerald-900">{data.nisn}</p>
                            </div>

                            <div className="grid gap-3 text-sm text-emerald-900/70 dark:text-white/70">
                                <p><span className="font-semibold">Nama:</span> {data.namaLengkap}</p>
                                <p><span className="font-semibold">NIK:</span> {data.nik}</p>
                                <p><span className="font-semibold">NISN:</span> {data.nisn || '-'}</p>
                                <p><span className="font-semibold">TTL:</span> {data.tempatLahir}, {data.tanggalLahir}</p>
                                <p><span className="font-semibold">No. WhatsApp:</span> {data.noHp}</p>
                            </div>

                            <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                <a
                                    href={`/api/ppdb/pdf?nisn=${encodeURIComponent(data.nisn || '')}`}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition"
                                    download={pdfFileName}
                                >
                                    <Download size={16} />
                                    Download Formulir
                                </a>
                                <button
                                    onClick={subscribeToPush}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-600 px-5 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-50 transition"
                                >
                                    <BellRing size={16} /> Aktifkan Notifikasi
                                </button>
                            </div>
                            {pushStatus && (
                                <p className="mt-3 text-xs text-emerald-700">{pushStatus}</p>
                            )}
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default PpdbSuccessClient;

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
