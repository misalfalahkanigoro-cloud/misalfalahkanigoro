import type { PPDBFile, PPDBWave, PPDBNotification } from '@/lib/types';

export type { PPDBWave, PPDBNotification };

export const ADMIN_TABS = ['pendaftar', 'gelombang', 'notifikasi', 'brosur'] as const;
export type AdminTab = typeof ADMIN_TABS[number];

export type PPDBItem = {
    id: string;
    namaLengkap: string;
    nisn?: string | null;
    noHp: string;
    status: 'VERIFIKASI' | 'BERKAS_VALID' | 'DITERIMA' | 'DITOLAK';
    pesan?: string | null;
    tanggalDaftar: string;
    wave_id?: string | null;
};

export type PPDBDetail = PPDBItem & {
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

export type SubscriberItem = {
    id: string;
    namaLengkap: string;
    nik: string;
    nisn: string | null;
    tempatLahir: string;
    tanggalLahir: string;
    jenisKelamin: string;
    alamat: string;
    namaAyah: string;
    pekerjaanAyah?: string | null;
    namaIbu: string;
    pekerjaanIbu?: string | null;
    noHp: string;
    status: string;
    pesan?: string | null;
    tanggalDaftar: string;
    wave_id?: string | null;
    createdAt: string;
    updatedAt: string;
};

export type BrochureItem = {
    id: string;
    entityId: string;
    mediaUrl: string;
    caption?: string | null;
    displayOrder: number;
    isMain: boolean;
    createdAt?: string;
};
