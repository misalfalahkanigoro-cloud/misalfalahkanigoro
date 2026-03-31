import type { PPDBFile, PPDBNotification, PPDBRegistration, PPDBWave } from '@/lib/types';

export type PPDBAdminStatus = 'VERIFIKASI' | 'BERKAS_VALID' | 'DITERIMA' | 'DITOLAK';

export interface PPDBAdminListItem {
    id: string;
    namaLengkap: string;
    nisn?: string | null;
    noHp: string;
    status: PPDBAdminStatus;
    pesan?: string | null;
    tanggalDaftar: string;
    waveId?: string | null;
}

export type PPDBAdminDetail = PPDBRegistration & {
    files?: PPDBFile[];
};

export interface PPDBSubscriberItem {
    id: string;
    registrationId: string;
    namaLengkap: string;
    nisn: string;
    createdAt: string;
}

export interface PPDBBrochureItem {
    id: string;
    entityId: string;
    mediaUrl: string;
    caption?: string | null;
    displayOrder: number;
    isMain: boolean;
    createdAt?: string;
}

export interface PPDBWaveFormValue {
    name: string;
    startDate: string;
    endDate: string;
    quota: number | string;
    isActive: boolean;
}

export interface PPDBNotificationFormValue {
    title: string;
    message: string;
    target: 'registration' | 'wave';
    registrationId: string;
    waveId: string;
}

export interface PPDBBrochureFormValue {
    waveId: string;
    mediaUrl: string;
    caption: string;
    displayOrder: number;
    isMain: boolean;
}

const asString = (value: unknown, fallback = '') => (typeof value === 'string' ? value : fallback);

const asNullableString = (value: unknown) => (typeof value === 'string' ? value : null);

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export const createEmptyWaveForm = (): PPDBWaveFormValue => ({
    name: '',
    startDate: '',
    endDate: '',
    quota: '',
    isActive: true,
});

export const createEmptyNotificationForm = (): PPDBNotificationFormValue => ({
    title: '',
    message: '',
    target: 'registration',
    registrationId: '',
    waveId: '',
});

export const createEmptyBrochureForm = (): PPDBBrochureFormValue => ({
    waveId: '',
    mediaUrl: '',
    caption: '',
    displayOrder: 0,
    isMain: false,
});

export const mapPpdbAdminListItem = (value: unknown): PPDBAdminListItem => {
    const record = isRecord(value) ? value : {};
    const status = asString(record.status, 'VERIFIKASI') as PPDBAdminStatus;

    return {
        id: asString(record.id),
        namaLengkap: asString(record.namaLengkap ?? record.nama_lengkap),
        nisn: asNullableString(record.nisn),
        noHp: asString(record.noHp ?? record.no_hp),
        status,
        pesan: asNullableString(record.pesan),
        tanggalDaftar: asString(record.tanggalDaftar ?? record.tanggal_daftar),
        waveId: asNullableString(record.waveId ?? record.wave_id),
    };
};

export const mapPpdbAdminDetail = (value: unknown): PPDBAdminDetail => {
    const record = isRecord(value) ? value : {};

    return {
        id: asString(record.id),
        namaLengkap: asString(record.namaLengkap ?? record.nama_lengkap),
        nik: asString(record.nik),
        nisn: asNullableString(record.nisn),
        tempatLahir: asString(record.tempatLahir ?? record.tempat_lahir),
        tanggalLahir: asString(record.tanggalLahir ?? record.tanggal_lahir),
        jenisKelamin: asString(record.jenisKelamin ?? record.jenis_kelamin, 'L') as 'L' | 'P',
        alamat: asString(record.alamat),
        namaAyah: asString(record.namaAyah ?? record.nama_ayah),
        pekerjaanAyah: asNullableString(record.pekerjaanAyah ?? record.pekerjaan_ayah),
        namaIbu: asString(record.namaIbu ?? record.nama_ibu),
        pekerjaanIbu: asNullableString(record.pekerjaanIbu ?? record.pekerjaan_ibu),
        noHp: asString(record.noHp ?? record.no_hp),
        status: asString(record.status),
        pesan: asNullableString(record.pesan),
        tanggalDaftar: asNullableString(record.tanggalDaftar ?? record.tanggal_daftar) || undefined,
        createdAt: asNullableString(record.createdAt ?? record.created_at) || undefined,
        updatedAt: asNullableString(record.updatedAt ?? record.updated_at) || undefined,
        files: Array.isArray(record.files) ? (record.files as PPDBFile[]) : [],
    };
};

export const mapPpdbWave = (value: unknown): PPDBWave => {
    const record = isRecord(value) ? value : {};

    return {
        id: asString(record.id),
        name: asString(record.name),
        startDate: asString(record.startDate ?? record.start_date),
        endDate: asString(record.endDate ?? record.end_date),
        quota: typeof record.quota === 'number' ? record.quota : record.quota === null ? null : Number(record.quota ?? NaN) || null,
        isActive: Boolean(record.isActive ?? record.is_active),
        createdAt: asNullableString(record.createdAt ?? record.created_at) || undefined,
        updatedAt: asNullableString(record.updatedAt ?? record.updated_at) || undefined,
    };
};

export const mapPpdbNotification = (value: unknown): PPDBNotification => {
    const record = isRecord(value) ? value : {};

    return {
        id: asString(record.id),
        registrationId: asNullableString(record.registrationId ?? record.registration_id),
        waveId: asNullableString(record.waveId ?? record.wave_id),
        title: asString(record.title),
        message: asString(record.message),
        createdAt: asNullableString(record.createdAt ?? record.created_at) || undefined,
    };
};

export const mapPpdbSubscriber = (value: unknown): PPDBSubscriberItem => {
    const record = isRecord(value) ? value : {};

    return {
        id: asString(record.id),
        registrationId: asString(record.registrationId),
        namaLengkap: asString(record.namaLengkap),
        nisn: asString(record.nisn),
        createdAt: asString(record.createdAt),
    };
};

export const mapPpdbBrochure = (value: unknown): PPDBBrochureItem => {
    const record = isRecord(value) ? value : {};

    return {
        id: asString(record.id),
        entityId: asString(record.entityId),
        mediaUrl: asString(record.mediaUrl),
        caption: asNullableString(record.caption),
        displayOrder: typeof record.displayOrder === 'number' ? record.displayOrder : Number(record.displayOrder ?? 0) || 0,
        isMain: Boolean(record.isMain),
        createdAt: asNullableString(record.createdAt) || undefined,
    };
};
