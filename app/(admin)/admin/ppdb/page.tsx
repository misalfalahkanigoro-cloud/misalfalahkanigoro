'use client';

import React, { useEffect, useState } from 'react';
import SidebarAdmin from '@/components/sidebar-admin';

type PPDBItem = {
    id: string;
    namaLengkap: string;
    nisn?: string | null;
    noHp: string;
    status: 'VERIFIKASI' | 'BERKAS_VALID' | 'DITERIMA' | 'DITOLAK';
    pesan?: string | null;
    tanggalDaftar: string;
};

const AdminPPDBPage: React.FC = () => {
    const [items, setItems] = useState<PPDBItem[]>([]);
    const [selected, setSelected] = useState<PPDBItem | null>(null);
    const [status, setStatus] = useState<PPDBItem['status']>('VERIFIKASI');
    const [pesan, setPesan] = useState('');

    const fetchItems = async () => {
        const res = await fetch('/api/admin/ppdb-registrations');
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleSelect = (item: PPDBItem) => {
        setSelected(item);
        setStatus(item.status);
        setPesan(item.pesan || '');
    };

    const handleUpdate = async () => {
        if (!selected) return;
        await fetch(`/api/admin/ppdb-registrations/${selected.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, pesan }),
        });
        setSelected(null);
        fetchItems();
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors dark:bg-[#0B0F0C] dark:text-gray-100">
            <SidebarAdmin />
            <main className="min-h-screen px-6 py-10 lg:pl-80 space-y-8">
                <div className="rounded-3xl border border-emerald-900/20 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
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

                {selected && (
                    <div className="rounded-3xl border border-emerald-900/20 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                        <h3 className="text-lg font-semibold">Update Status</h3>
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
                            <button
                                onClick={handleUpdate}
                                className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white"
                            >
                                Simpan Status
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPPDBPage;
