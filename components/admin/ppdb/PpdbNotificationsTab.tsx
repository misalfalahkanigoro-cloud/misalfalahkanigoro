'use client';

import type { PPDBNotification, PPDBWave } from '@/lib/types';
import type { PPDBNotificationFormValue, PPDBSubscriberItem } from '@/lib/admin-ppdb';

type Props = {
    notifications: PPDBNotification[];
    notifForm: PPDBNotificationFormValue;
    subscribers: PPDBSubscriberItem[];
    waves: PPDBWave[];
    notifMessage: string | null;
    onNotifFormChange: (value: PPDBNotificationFormValue) => void;
    onSendNotification: () => void;
    onDeleteNotification: (id: string) => void;
};

export default function PpdbNotificationsTab({
    notifications,
    notifForm,
    subscribers,
    waves,
    notifMessage,
    onNotifFormChange,
    onSendNotification,
    onDeleteNotification,
}: Props) {
    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="rounded-3xl border border-emerald-900/20 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 lg:col-span-1">
                <h3 className="mb-4 text-lg font-semibold">Kirim Notifikasi</h3>
                <div className="space-y-4">
                    <input
                        type="text"
                        value={notifForm.title}
                        onChange={(event) => onNotifFormChange({ ...notifForm, title: event.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                        placeholder="Judul Notifikasi"
                    />
                    <textarea
                        value={notifForm.message}
                        onChange={(event) => onNotifFormChange({ ...notifForm, message: event.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                        rows={4}
                        placeholder="Isi pesan notifikasi"
                    />
                    <select
                        value={notifForm.target}
                        onChange={(event) => onNotifFormChange({ ...notifForm, target: event.target.value as PPDBNotificationFormValue['target'] })}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                    >
                        <option value="registration">Pendaftar Tertentu</option>
                        <option value="wave">Berdasarkan Gelombang</option>
                    </select>
                    {notifForm.target === 'registration' ? (
                        <select
                            value={notifForm.registrationId}
                            onChange={(event) => onNotifFormChange({ ...notifForm, registrationId: event.target.value })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                        >
                            <option value="">Pilih Pendaftar (Sudah Aktif Notifikasi)</option>
                            {subscribers.map((item) => (
                                <option key={item.registrationId} value={item.registrationId}>
                                    {item.namaLengkap} - {item.nisn}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <select
                            value={notifForm.waveId}
                            onChange={(event) => onNotifFormChange({ ...notifForm, waveId: event.target.value })}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/30"
                        >
                            <option value="">Pilih Gelombang</option>
                            {waves.map((wave) => (
                                <option key={wave.id} value={wave.id}>
                                    {wave.name}
                                </option>
                            ))}
                        </select>
                    )}
                    {notifForm.target === 'registration' && subscribers.length === 0 && <p className="text-xs text-amber-600">Belum ada pendaftar yang mengaktifkan notifikasi.</p>}
                    <button onClick={onSendNotification} className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                        Kirim Notifikasi
                    </button>
                    {notifMessage && <p className="text-xs text-emerald-600">{notifMessage}</p>}
                </div>
            </div>

            <div className="rounded-3xl border border-emerald-900/20 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 lg:col-span-2">
                <h3 className="mb-4 text-lg font-semibold">Riwayat Notifikasi</h3>
                <div className="space-y-3">
                    {notifications.map((notif) => (
                        <div key={notif.id} className="rounded-2xl border border-emerald-900/10 p-4 dark:border-white/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold">{notif.title}</p>
                                    <p className="text-xs text-gray-500">{notif.message}</p>
                                </div>
                                <button onClick={() => onDeleteNotification(notif.id)} className="text-xs text-red-500">Hapus</button>
                            </div>
                            <p className="mt-2 text-[11px] text-gray-400">{notif.createdAt ? new Date(notif.createdAt).toLocaleString('id-ID') : ''}</p>
                        </div>
                    ))}
                    {notifications.length === 0 && <p className="text-sm text-gray-500">Belum ada notifikasi.</p>}
                </div>
            </div>
        </div>
    );
}
