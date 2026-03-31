'use client';

import type { PPDBAdminDetail, PPDBAdminListItem, PPDBAdminStatus } from '@/lib/admin-ppdb';

type Props = {
    items: PPDBAdminListItem[];
    selected: PPDBAdminListItem | null;
    detail: PPDBAdminDetail | null;
    loadingDetail: boolean;
    status: PPDBAdminStatus;
    pesan: string;
    sendStatusNotification: boolean;
    subscriptionInfo: string;
    onSelect: (item: PPDBAdminListItem) => void;
    onStatusChange: (value: PPDBAdminStatus) => void;
    onPesanChange: (value: string) => void;
    onSendStatusNotificationChange: (value: boolean) => void;
    onSaveStatus: () => void;
    onDeleteRegistration: (id: string) => void;
};

export default function PpdbRegistrationsTab({
    items,
    selected,
    detail,
    loadingDetail,
    status,
    pesan,
    sendStatusNotification,
    subscriptionInfo,
    onSelect,
    onStatusChange,
    onPesanChange,
    onSendStatusNotificationChange,
    onSaveStatus,
    onDeleteRegistration,
}: Props) {
    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="rounded-3xl border border-emerald-900/20 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 lg:col-span-1">
                <h2 className="mb-4 text-2xl font-semibold">Data PPDB</h2>
                <div className="space-y-3">
                    {items.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onSelect(item)}
                            className={`w-full rounded-2xl border border-emerald-900/10 p-4 text-left dark:border-white/10 ${selected?.id === item.id ? 'bg-emerald-50 dark:bg-white/10' : 'bg-white/80 dark:bg-white/5'}`}
                        >
                            <p className="text-sm font-semibold">{item.namaLengkap}</p>
                            <p className="text-xs text-gray-500">{item.nisn || '-'} - {item.noHp}</p>
                            <p className="text-[11px] text-emerald-600">Status: {item.status}</p>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-6 lg:col-span-2">
                {selected && (
                    <div className="rounded-3xl border border-emerald-900/20 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                        <h3 className="mb-4 text-lg font-semibold">Detail Pendaftar</h3>
                        {loadingDetail ? (
                            <p className="text-sm text-gray-500">Memuat detail...</p>
                        ) : detail ? (
                            <div className="grid gap-4 text-sm">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                                    <h4 className="mb-2 font-semibold">Berkas</h4>
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
                                        {(detail.files || []).length === 0 && <p className="text-xs text-gray-500">Belum ada berkas.</p>}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Detail tidak tersedia.</p>
                        )}
                        {detail && (
                            <div className="mt-6 flex flex-wrap gap-2">
                                <a
                                    href={`/api/ppdb/pdf/${detail.id}`}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                                >
                                    Download Formulir
                                </a>
                                <button
                                    onClick={() => onDeleteRegistration(detail.id)}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
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
                        <p className="mt-1 text-xs text-gray-500">VERIFIKASI - Menunggu verifikasi.</p>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <select
                                value={status}
                                onChange={(event) => onStatusChange(event.target.value as PPDBAdminStatus)}
                                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                            >
                                <option value="VERIFIKASI">VERIFIKASI</option>
                                <option value="BERKAS_VALID">BERKAS_VALID</option>
                                <option value="DITERIMA">DITERIMA</option>
                                <option value="DITOLAK">DITOLAK</option>
                            </select>
                            <textarea
                                value={pesan}
                                onChange={(event) => onPesanChange(event.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30 md:col-span-2"
                                rows={3}
                                placeholder="Pesan untuk pendaftar"
                            />
                            <div className="flex items-center justify-between gap-4 md:col-span-2">
                                <label className="flex items-center gap-2 text-xs text-gray-600">
                                    <input type="checkbox" checked={sendStatusNotification} onChange={(event) => onSendStatusNotificationChange(event.target.checked)} />
                                    Kirim notifikasi status
                                </label>
                                <button onClick={onSaveStatus} className="rounded-xl bg-emerald-600 px-6 py-3 text-xs font-semibold text-white">
                                    Simpan Status
                                </button>
                            </div>
                            {subscriptionInfo && <p className="text-xs text-emerald-600 md:col-span-2">{subscriptionInfo}</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
