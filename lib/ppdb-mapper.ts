type AnyRecord = Record<string, any>;

export const mapPpdbFile = (file: AnyRecord) => ({
    id: file.id,
    registrationId: file.registration_id,
    fileType: file.file_type,
    fileUrl: file.file_url,
    storageProvider: file.storage_provider ?? null,
    storageBucket: file.storage_bucket ?? null,
    storagePath: file.storage_path ?? null,
    createdAt: file.created_at,
});

export const mapPpdbRegistration = (registration: AnyRecord, files: AnyRecord[] = []) => ({
    id: registration.id,
    namaLengkap: registration.namaLengkap,
    nik: registration.nik,
    nisn: registration.nisn,
    tempatLahir: registration.tempatLahir,
    tanggalLahir: registration.tanggalLahir,
    jenisKelamin: registration.jenisKelamin,
    alamat: registration.alamat,
    namaAyah: registration.namaAyah,
    pekerjaanAyah: registration.pekerjaanAyah,
    namaIbu: registration.namaIbu,
    pekerjaanIbu: registration.pekerjaanIbu,
    noHp: registration.noHp,
    status: registration.status,
    pesan: registration.pesan,
    tanggalDaftar: registration.tanggalDaftar,
    createdAt: registration.createdAt,
    updatedAt: registration.updatedAt,
    wave_id: registration.wave_id ?? null,
    files: files.map(mapPpdbFile),
});

export const mapPpdbPublicSummary = (registration: AnyRecord, files: AnyRecord[] = []) => ({
    id: registration.id,
    namaLengkap: registration.namaLengkap,
    nisn: registration.nisn,
    tempatLahir: registration.tempatLahir,
    tanggalLahir: registration.tanggalLahir,
    jenisKelamin: registration.jenisKelamin,
    status: registration.status,
    pesan: registration.pesan,
    tanggalDaftar: registration.tanggalDaftar,
    files: files.map(mapPpdbFile),
});
