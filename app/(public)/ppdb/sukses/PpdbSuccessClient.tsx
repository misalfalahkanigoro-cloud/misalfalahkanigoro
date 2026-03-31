'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Download, ArrowLeft, Loader2, BellRing } from 'lucide-react';
import type { PPDBPublicSummary } from '@/lib/types';
import type { PushSubscriptionPayload } from '@/lib/types';

const PpdbSuccessClient: React.FC = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tokenParam = searchParams.get('token');
    const [data, setData] = useState<PPDBPublicSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pushStatus, setPushStatus] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!tokenParam) {
                setError('Tautan konfirmasi tidak valid atau sudah kedaluwarsa.');
                setLoading(false);
                return;
            }
            try {
                const res = await fetch(`/api/ppdb/summary?token=${encodeURIComponent(tokenParam)}`);
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.error || 'Gagal memuat data');
                }
                const json = await res.json();
                setData(json as PPDBPublicSummary);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Gagal memuat data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [tokenParam]);

    const pdfFileName = useMemo(() => {
        if (!data) return 'ppdb-formulir.pdf';
        const safeName = data.namaLengkap.replace(/\s+/g, '-').toLowerCase();
        return `ppdb-${safeName}.pdf`;
    }, [data]);

    const subscribeToPush = async () => {
        try {
            if (!data?.id) {
                setPushStatus('Data pendaftaran tidak ditemukan.');
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
            const readyRegistration = await navigator.serviceWorker.ready;
            const activeRegistration = readyRegistration.active ? readyRegistration : registration;

            let subscription = await activeRegistration.pushManager.getSubscription();
            if (!subscription) {
                subscription = await activeRegistration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidKey),
                });
            }

            const json = subscription.toJSON();
            const payload: PushSubscriptionPayload = {
                registrationId: data.id,
                accessToken: tokenParam || '',
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
                                    Simpan tautan halaman ini untuk melihat ringkasan pendaftaran dan unduh formulir.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-dashed border-emerald-300/60 bg-emerald-50/60 p-5 text-center mb-8 dark:bg-emerald-500/10 dark:border-emerald-500/30">
                                <p className="text-xs uppercase tracking-widest text-emerald-600/70 dark:text-emerald-400/70 mb-2 font-black">Nomor Pendaftaran</p>
                                <p className="text-lg font-mono font-bold text-emerald-900 dark:text-emerald-300">{data.id}</p>
                            </div>

                            <div className="grid gap-3 text-sm text-emerald-900/70 dark:text-white/70">
                                <p><span className="font-semibold">Nama:</span> {data.namaLengkap}</p>
                                <p><span className="font-semibold">NISN:</span> {data.nisn || '-'}</p>
                                <p><span className="font-semibold">TTL:</span> {data.tempatLahir}, {data.tanggalLahir}</p>
                                <p><span className="font-semibold">Status:</span> {data.status}</p>
                                {data.pesan && <p><span className="font-semibold">Catatan:</span> {data.pesan}</p>}
                            </div>

                            <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                <a
                                    href={`/api/ppdb/pdf?token=${encodeURIComponent(tokenParam || '')}`}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 active:scale-95"
                                    download={pdfFileName}
                                >
                                    <Download size={16} />
                                    Download Formulir
                                </a>
                                <button
                                    onClick={subscribeToPush}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-600 px-5 py-3 text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition"
                                >
                                    <BellRing size={16} /> Aktifkan Notifikasi
                                </button>
                            </div>
                            {pushStatus && (
                                <p className="mt-3 text-xs text-emerald-700 dark:text-emerald-400 font-medium">{pushStatus}</p>
                            )}

                            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/5 space-y-8">
                                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 text-amber-800 dark:text-amber-400 text-sm font-bold leading-relaxed text-center">
                                    "Cetak formulir ini dan bawa saat tes JKD bersama berkas asli persyaratan."
                                </div>

                                <section className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Pertanyaan? Hubungi panitia PPDB</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <a href="https://wa.me/6287753631037" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-emerald-500 transition-all">
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Panitia 1</p>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">Bu Yuli</p>
                                            </div>
                                            <p className="text-xs font-bold text-emerald-600">0877 5363 1037</p>
                                        </a>
                                        <a href="https://wa.me/6285706908905" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-emerald-500 transition-all">
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Panitia 2</p>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">Bu Nisa</p>
                                            </div>
                                            <p className="text-xs font-bold text-emerald-600">0857 0690 8905</p>
                                        </a>
                                    </div>
                                </section>
                            </div>
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
