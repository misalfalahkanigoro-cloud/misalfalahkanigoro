
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CldUploadWidget } from 'next-cloudinary';
import {
    FileText,
    User,
    Search,
    Users,
    ArrowRight,
    ArrowLeft,
    Upload,
    Loader2,
    CheckCircle,
    AlertTriangle,
} from 'lucide-react';
import api from '@/lib/api';
import type { MediaItem, PPDBFormData, PPDBListItem, PPDBStatusResponse, PPDBWave } from '@/lib/types';

type FileType = 'kk' | 'akta_kelahiran' | 'ktp_wali' | 'pas_foto' | 'nisn' | 'ijazah_rapor';

type FormStep = 0 | 1 | 2 | 3;

type FormErrors = Record<string, string>;

const FILE_LABELS: Record<FileType, string> = {
    kk: 'Foto Kartu Keluarga (KK)',
    akta_kelahiran: 'Akta Kelahiran',
    ktp_wali: 'KTP Orang Tua/Wali',
    pas_foto: 'Pas Foto Siswa',
    nisn: 'Kartu/Print NISN',
    ijazah_rapor: 'Ijazah/Rapor Terakhir',
};

const PPDB: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'info' | 'daftar' | 'status' | 'list'>('info');
    const [ppdbOpen, setPpdbOpen] = useState(true);
    const [activeWave, setActiveWave] = useState<PPDBWave | null>(null);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 transition-colors duration-200">
            <section className="bg-gradient-to-r from-emerald-50 via-white to-emerald-50 dark:from-[#0B0F0C] dark:via-[#0F1511] dark:to-[#0B0F0C] border-b border-emerald-100/70 dark:border-white/10">
                <div className="container mx-auto px-4 py-8 md:py-10">
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-emerald-700/70 dark:text-emerald-200/70">
                        <span className="h-[2px] w-8 bg-emerald-500/70"></span>
                        Halaman
                    </div>
                    <h1 className="mt-3 text-2xl md:text-4xl font-bold text-emerald-950 dark:text-white">PPDB</h1>
                </div>
            </section>

            <div className="container mx-auto px-4 py-12 relative z-30">
                <ActiveWaveWatcher onStatus={setPpdbOpen} onWave={setActiveWave} />
                <HeroBrosur waveId={activeWave?.id} />
                {!ppdbOpen && (
                    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                        PPDB sedang ditutup. Saat ini belum ada gelombang pendaftaran yang aktif.
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 mb-8 flex flex-wrap justify-center gap-2 transition-colors">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`px-6 py-3 rounded-lg font-bold text-sm md:text-base flex items-center gap-2 transition-all ${activeTab === 'info' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        <FileText size={18} /> Informasi PPDB
                    </button>
                    <button
                        onClick={() => setActiveTab('daftar')}
                        disabled={!ppdbOpen}
                        className={`px-6 py-3 rounded-lg font-bold text-sm md:text-base flex items-center gap-2 transition-all ${activeTab === 'daftar' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'} ${!ppdbOpen ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        <User size={18} /> Daftar Sekarang
                    </button>
                    <button
                        onClick={() => setActiveTab('status')}
                        className={`px-6 py-3 rounded-lg font-bold text-sm md:text-base flex items-center gap-2 transition-all ${activeTab === 'status' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        <Search size={18} /> Cek Status
                    </button>
                    <button
                        onClick={() => setActiveTab('list')}
                        className={`px-6 py-3 rounded-lg font-bold text-sm md:text-base flex items-center gap-2 transition-all ${activeTab === 'list' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        <Users size={18} /> Daftar Pendaftar
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm min-h-[500px] transition-colors overflow-hidden">
                    {activeTab === 'info' && <InfoTab />}
                    {activeTab === 'daftar' && <FormTab ppdbOpen={ppdbOpen} activeWave={activeWave} />}
                    {activeTab === 'status' && <StatusTab />}
                    {activeTab === 'list' && <ListTab />}
                </div>
            </div>
        </div>
    );
};

export default PPDB;

const ActiveWaveWatcher: React.FC<{ onStatus: (open: boolean) => void; onWave: (wave: PPDBWave | null) => void }> = ({
    onStatus,
    onWave,
}) => {
    useEffect(() => {
        const fetchWave = async () => {
            try {
                const res = await fetch('/api/ppdb/active-wave');
                const json = await res.json();
                const active = Boolean(json?.active);
                onStatus(active);
                onWave(active ? (json.wave as PPDBWave) : null);
            } catch (error) {
                console.error('Failed to fetch active wave', error);
                onStatus(false);
                onWave(null);
            }
        };
        fetchWave();
    }, [onStatus, onWave]);

    return null;
};

const HeroBrosur: React.FC<{ waveId?: string | null }> = ({ waveId }) => {
    const [items, setItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBrosur = async () => {
            try {
                const params = new URLSearchParams({ entityType: 'ppdb' });
                if (waveId) params.set('entityId', waveId);
                const res = await fetch(`/api/media-items?${params.toString()}`);
                const json = await res.json();
                setItems(Array.isArray(json) ? json : []);
            } catch (error) {
                console.error('Failed to fetch brosur', error);
                setItems([]);
            } finally {
                setLoading(false);
            }
        };
        fetchBrosur();
    }, [waveId]);

    return (
        <div className="mb-10">
            <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-emerald-600/70">Brosur PPDB</p>
                    <h2 className="text-xl md:text-2xl font-bold text-emerald-950 dark:text-white">Informasi Utama PPDB</h2>
                </div>
                {loading && <Loader2 className="animate-spin text-emerald-600" size={20} />}
            </div>

            {items.length === 0 && !loading ? (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-6 text-sm text-emerald-700">
                    Brosur PPDB belum tersedia.
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {items.map((item) => (
                        <div key={item.id} className="rounded-2xl border border-emerald-100/60 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/5">
                            <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-emerald-50">
                                <img src={item.mediaUrl} alt={item.caption || 'Brosur PPDB'} className="h-full w-full object-cover" />
                            </div>
                            {item.caption && <p className="mt-3 text-xs text-gray-600 dark:text-gray-300">{item.caption}</p>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
const InfoTab: React.FC = () => {
    return (
        <div className="p-6 md:p-10">
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-2xl font-semibold text-emerald-900 dark:text-white">Informasi PPDB</h3>
                    <p className="text-sm text-emerald-900/70 dark:text-emerald-100/70">
                        Pendaftaran peserta didik baru MIS Al-Falah Kanigoro dilakukan secara daring. Pastikan semua data dan
                        berkas diisi dengan benar sesuai dokumen resmi.
                    </p>
                    <div className="grid gap-3 text-sm text-emerald-900/70 dark:text-emerald-100/70">
                        <div className="rounded-2xl border border-emerald-100/70 bg-emerald-50/70 px-4 py-3">
                            Semua isian wajib diisi dan akan diverifikasi oleh panitia.
                        </div>
                        <div className="rounded-2xl border border-emerald-100/70 bg-emerald-50/70 px-4 py-3">
                            Format berkas: JPG/PNG, maksimal 2MB per file.
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <h4 className="text-sm font-semibold text-emerald-900 dark:text-white mb-3">Alur Pendaftaran</h4>
                    <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <li>1. Isi data siswa</li>
                        <li>2. Isi data orang tua/wali</li>
                        <li>3. Upload berkas pendukung</li>
                        <li>4. Review dan kirim pendaftaran</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

const StatusTab: React.FC = () => {
    const [nisn, setNisn] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<PPDBStatusResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCheck = async () => {
        setLoading(true);
        setError(null);
        setData(null);
        try {
            const response = await api.checkPPDBStatus(nisn.trim());
            setData(response as PPDBStatusResponse);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal mengecek status');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-10 space-y-6">
            <div>
                <h3 className="text-2xl font-semibold text-emerald-900 dark:text-white">Cek Status Pendaftaran</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Masukkan NISN untuk melihat status pendaftaran.</p>
            </div>
            <div className="flex flex-col md:flex-row gap-3">
                <input
                    type="text"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                    placeholder="Masukkan NISN"
                />
                <button
                    onClick={handleCheck}
                    className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white"
                    disabled={loading || nisn.length === 0}
                >
                    {loading ? 'Memeriksa...' : 'Cek Status'}
                </button>
            </div>
            {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}
            {data && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 text-sm text-emerald-900/80 dark:border-white/10 dark:bg-white/5 dark:text-white">
                    <p><span className="font-semibold">Nomor Pendaftaran (NISN):</span> {data.id}</p>
                    <p><span className="font-semibold">Nama:</span> {data.nama}</p>
                    <p><span className="font-semibold">Tanggal Daftar:</span> {data.tanggalDaftar}</p>
                    <p><span className="font-semibold">Status:</span> {data.status}</p>
                    {data.pesan && <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-200">{data.pesan}</p>}
                    <div className="mt-4">
                        <a
                            href={`/api/ppdb/pdf?nisn=${encodeURIComponent(data.id)}`}
                            className="inline-flex items-center gap-2 rounded-xl border border-emerald-600 px-4 py-2 text-xs font-semibold text-emerald-700"
                        >
                            Download Formulir
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

const ListTab: React.FC = () => {
    const [items, setItems] = useState<PPDBListItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchList = async () => {
            try {
                const res = await fetch('/api/ppdb/list');
                const json = await res.json();
                setItems(Array.isArray(json) ? json : []);
            } catch (error) {
                console.error('Failed to fetch list', error);
                setItems([]);
            } finally {
                setLoading(false);
            }
        };
        fetchList();
    }, []);

    return (
        <div className="p-6 md:p-10">
            <h3 className="text-2xl font-semibold text-emerald-900 dark:text-white mb-4">Daftar Pendaftar</h3>
            {loading ? (
                <p className="text-sm text-gray-500">Memuat data...</p>
            ) : items.length === 0 ? (
                <p className="text-sm text-gray-500">Belum ada pendaftar.</p>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                        <div key={item.id} className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                            <p className="text-sm font-semibold text-emerald-900 dark:text-white">{item.namaLengkap}</p>
                            <p className="text-xs text-gray-500">NISN: {item.nisn || '-'}</p>
                            <p className="text-xs text-emerald-700">Status: {item.status}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
type PPDBFormState = Omit<PPDBFormData, 'files'>;

const FormTab: React.FC<{ ppdbOpen: boolean; activeWave: PPDBWave | null }> = ({ ppdbOpen, activeWave }) => {
    const router = useRouter();
    const [step, setStep] = useState<FormStep>(0);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [files, setFiles] = useState<Record<FileType, string>>({
        kk: '',
        akta_kelahiran: '',
        ktp_wali: '',
        pas_foto: '',
        nisn: '',
        ijazah_rapor: '',
    });
    const [form, setForm] = useState<PPDBFormState>({
        namaLengkap: '',
        nik: '',
        nisn: '',
        tempatLahir: '',
        tanggalLahir: '',
        jenisKelamin: 'L',
        alamat: '',
        namaAyah: '',
        pekerjaanAyah: '',
        namaIbu: '',
        pekerjaanIbu: '',
        noHp: '',
    });

    const updateField = (field: keyof typeof form, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const validateNik = (value: string) => /^\d{16}$/.test(value);
    const validateNisn = (value: string) => /^\d{10}$/.test(value);

    const validateStep = (targetStep: FormStep) => {
        const nextErrors: FormErrors = {};
        if (targetStep === 0) {
            if (!form.namaLengkap) nextErrors.namaLengkap = 'Nama lengkap wajib diisi';
            if (!form.nik) nextErrors.nik = 'NIK wajib diisi';
            if (form.nik && !validateNik(form.nik)) nextErrors.nik = 'NIK harus 16 digit angka';
            if (!form.nisn) nextErrors.nisn = 'NISN wajib diisi';
            if (form.nisn && !validateNisn(form.nisn)) nextErrors.nisn = 'NISN harus 10 digit angka';
            if (!form.tempatLahir) nextErrors.tempatLahir = 'Tempat lahir wajib diisi';
            if (!form.tanggalLahir) nextErrors.tanggalLahir = 'Tanggal lahir wajib diisi';
            if (!form.jenisKelamin) nextErrors.jenisKelamin = 'Jenis kelamin wajib diisi';
            if (!form.alamat) nextErrors.alamat = 'Alamat wajib diisi';
        }
        if (targetStep === 1) {
            if (!form.namaAyah) nextErrors.namaAyah = 'Nama ayah wajib diisi';
            if (!form.pekerjaanAyah) nextErrors.pekerjaanAyah = 'Pekerjaan ayah wajib diisi';
            if (!form.namaIbu) nextErrors.namaIbu = 'Nama ibu wajib diisi';
            if (!form.pekerjaanIbu) nextErrors.pekerjaanIbu = 'Pekerjaan ibu wajib diisi';
            if (!form.noHp) nextErrors.noHp = 'Nomor HP/WhatsApp wajib diisi';
        }
        if (targetStep === 2) {
            (Object.keys(files) as FileType[]).forEach((key) => {
                if (!files[key]) nextErrors[key] = 'Berkas wajib diupload';
            });
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleNext = () => {
        if (!ppdbOpen) return;
        if (!validateStep(step)) return;
        setStep((prev) => (prev + 1) as FormStep);
    };

    const handleBack = () => setStep((prev) => (prev - 1) as FormStep);

    const handleSubmit = async () => {
        const valid = validateStep(2);
        if (!valid) return;
        setSubmitting(true);
        try {
            const payload: PPDBFormData = {
                ...form,
                files: (Object.keys(files) as FileType[]).map((key) => ({
                    fileType: key,
                    fileUrl: files[key],
                })),
            };
            await api.submitPPDB(payload);
            router.push(`/ppdb/sukses?nisn=${encodeURIComponent(form.nisn)}`);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Gagal mengirim pendaftaran');
        } finally {
            setSubmitting(false);
        }
    };

    const stepLabels = useMemo(() => ['Data Siswa', 'Orang Tua', 'Berkas', 'Review'], []);

    return (
        <div className="p-6 md:p-10 space-y-6">
            {!ppdbOpen && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    PPDB sedang ditutup. Silakan menunggu gelombang dibuka.
                </div>
            )}

            <div className="grid gap-3 sm:grid-cols-4">
                {stepLabels.map((label, index) => (
                    <div
                        key={label}
                        className={`rounded-2xl px-4 py-3 text-xs font-semibold uppercase tracking-wider border ${
                            step === index ? 'bg-emerald-600 text-white border-emerald-600' : 'border-emerald-100 text-emerald-700'
                        }`}
                    >
                        {index + 1}. {label}
                    </div>
                ))}
            </div>

            {step === 0 && (
                <div className="grid gap-5">
                    <SectionTitle title="Data Calon Siswa" />
                    <div className="grid gap-4 md:grid-cols-2">
                        <InputField
                            label="Nama Lengkap"
                            value={form.namaLengkap}
                            onChange={(value) => updateField('namaLengkap', value)}
                            error={errors.namaLengkap}
                            placeholder="Sesuai Akta Kelahiran"
                        />
                        <InputField
                            label="NIK (16 digit)"
                            value={form.nik}
                            onChange={(value) => updateField('nik', value.replace(/\D/g, ''))}
                            error={errors.nik}
                            placeholder="Contoh: 3505xxxxxxxxxxxx"
                            onBlur={() => {
                                if (form.nik && !validateNik(form.nik)) {
                                    setErrors((prev) => ({ ...prev, nik: 'NIK harus 16 digit angka' }));
                                }
                            }}
                        />
                        <InputField
                            label="NISN"
                            value={form.nisn}
                            onChange={(value) => updateField('nisn', value.replace(/\D/g, ''))}
                            error={errors.nisn}
                            placeholder="Nomor Induk Siswa Nasional"
                            onBlur={() => {
                                if (form.nisn && !validateNisn(form.nisn)) {
                                    setErrors((prev) => ({ ...prev, nisn: 'NISN harus 10 digit angka' }));
                                }
                            }}
                        />
                        <InputField
                            label="Tempat Lahir"
                            value={form.tempatLahir}
                            onChange={(value) => updateField('tempatLahir', value)}
                            error={errors.tempatLahir}
                            placeholder="Kota/Kabupaten"
                        />
                        <InputField
                            label="Tanggal Lahir"
                            value={form.tanggalLahir}
                            type="date"
                            onChange={(value) => updateField('tanggalLahir', value)}
                            error={errors.tanggalLahir}
                        />
                        <SelectField
                            label="Jenis Kelamin"
                            value={form.jenisKelamin}
                            onChange={(value) => updateField('jenisKelamin', value)}
                            error={errors.jenisKelamin}
                            options={[
                                { value: 'L', label: 'Laki-laki' },
                                { value: 'P', label: 'Perempuan' },
                            ]}
                        />
                    </div>
                    <InputField
                        label="Alamat Lengkap"
                        value={form.alamat}
                        onChange={(value) => updateField('alamat', value)}
                        error={errors.alamat}
                        placeholder="Dusun/Desa, Kecamatan, Kabupaten"
                        multiline
                    />
                </div>
            )}

            {step === 1 && (
                <div className="grid gap-5">
                    <SectionTitle title="Data Orang Tua / Wali" />
                    <div className="grid gap-4 md:grid-cols-2">
                        <InputField
                            label="Nama Ayah"
                            value={form.namaAyah}
                            onChange={(value) => updateField('namaAyah', value)}
                            error={errors.namaAyah}
                        />
                        <InputField
                            label="Pekerjaan Ayah"
                            value={form.pekerjaanAyah}
                            onChange={(value) => updateField('pekerjaanAyah', value)}
                            error={errors.pekerjaanAyah}
                        />
                        <InputField
                            label="Nama Ibu"
                            value={form.namaIbu}
                            onChange={(value) => updateField('namaIbu', value)}
                            error={errors.namaIbu}
                        />
                        <InputField
                            label="Pekerjaan Ibu"
                            value={form.pekerjaanIbu}
                            onChange={(value) => updateField('pekerjaanIbu', value)}
                            error={errors.pekerjaanIbu}
                        />
                        <InputField
                            label="Nomor HP/WhatsApp"
                            value={form.noHp}
                            onChange={(value) => updateField('noHp', value.replace(/\s+/g, ''))}
                            error={errors.noHp}
                        />
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="grid gap-6">
                    <SectionTitle title="Upload Berkas" subtitle="Format: JPG/PNG. Maksimal 2MB per file." />
                    <div className="grid gap-4 md:grid-cols-2">
                        {(Object.keys(FILE_LABELS) as FileType[]).map((key) => (
                            <FileUploadCard
                                key={key}
                                label={FILE_LABELS[key]}
                                value={files[key]}
                                error={errors[key]}
                                onUploaded={(url) =>
                                    setFiles((prev) => ({
                                        ...prev,
                                        [key]: url,
                                    }))
                                }
                            />
                        ))}
                    </div>
                    {Object.keys(errors).some((key) => key in FILE_LABELS) && (
                        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                            Semua berkas wajib diupload.
                        </div>
                    )}
                </div>
            )}

            {step === 3 && (
                <div className="grid gap-5">
                    <SectionTitle title="Review Data" />
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 text-sm text-emerald-900/80">
                        <div className="grid gap-2 md:grid-cols-2">
                            <p><span className="font-semibold">Nama:</span> {form.namaLengkap}</p>
                            <p><span className="font-semibold">NIK:</span> {form.nik}</p>
                            <p><span className="font-semibold">NISN:</span> {form.nisn}</p>
                            <p><span className="font-semibold">TTL:</span> {form.tempatLahir}, {form.tanggalLahir}</p>
                            <p><span className="font-semibold">Jenis Kelamin:</span> {form.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                            <p><span className="font-semibold">Alamat:</span> {form.alamat}</p>
                            <p><span className="font-semibold">Nama Ayah:</span> {form.namaAyah}</p>
                            <p><span className="font-semibold">Pekerjaan Ayah:</span> {form.pekerjaanAyah}</p>
                            <p><span className="font-semibold">Nama Ibu:</span> {form.namaIbu}</p>
                            <p><span className="font-semibold">Pekerjaan Ibu:</span> {form.pekerjaanIbu}</p>
                            <p><span className="font-semibold">No. HP:</span> {form.noHp}</p>
                        </div>
                        <div className="mt-4 text-xs text-emerald-700">Berkas terunggah: {Object.values(files).filter(Boolean).length} file</div>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-emerald-100">
                <button
                    onClick={handleBack}
                    disabled={step === 0}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-600 px-4 py-2 text-xs font-semibold text-emerald-700 disabled:opacity-50"
                >
                    <ArrowLeft size={14} /> Kembali
                </button>
                {step < 3 ? (
                    <button
                        onClick={handleNext}
                        disabled={!ppdbOpen}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-semibold text-white disabled:opacity-50"
                    >
                        Selanjutnya <ArrowRight size={14} />
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !ppdbOpen}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-semibold text-white disabled:opacity-60"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                        Kirim Pendaftaran
                    </button>
                )}
            </div>

            {step < 3 && Object.keys(errors).length > 0 && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600">
                    <AlertTriangle size={14} className="inline-block mr-2" />
                    Pastikan semua field wajib diisi dengan benar.
                </div>
            )}

            {activeWave && (
                <p className="text-xs text-emerald-600">Gelombang aktif: {activeWave.name} ({activeWave.startDate} - {activeWave.endDate})</p>
            )}
        </div>
    );
};

const SectionTitle: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
    <div>
        <h3 className="text-lg font-semibold text-emerald-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-xs text-emerald-700/70">{subtitle}</p>}
    </div>
);

const InputField: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
    type?: string;
    multiline?: boolean;
    onBlur?: () => void;
}> = ({ label, value, onChange, placeholder, error, type = 'text', multiline, onBlur }) => (
    <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-emerald-900">{label} *</label>
        {multiline ? (
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                className="rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
                rows={3}
                placeholder={placeholder}
            />
        ) : (
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                className="rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
                placeholder={placeholder}
            />
        )}
        {error && <span className="text-[11px] text-red-600">{error}</span>}
    </div>
);

const SelectField: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    error?: string;
}> = ({ label, value, onChange, options, error }) => (
    <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-emerald-900">{label} *</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
        {error && <span className="text-[11px] text-red-600">{error}</span>}
    </div>
);

const FileUploadCard: React.FC<{
    label: string;
    value: string;
    error?: string;
    onUploaded: (url: string) => void;
}> = ({ label, value, error, onUploaded }) => {
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';
    const canUpload = Boolean(preset);

    return (
        <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-emerald-900 mb-3">{label}</p>
            {value ? (
                <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-emerald-50 mb-3">
                    <img src={value} alt={label} className="h-full w-full object-cover" />
                </div>
            ) : (
                <div className="flex items-center justify-center rounded-xl border border-dashed border-emerald-200 bg-emerald-50/50 p-6 text-xs text-emerald-700 mb-3">
                    Belum ada berkas
                </div>
            )}
            {canUpload ? (
                <CldUploadWidget
                    uploadPreset={preset}
                    options={{
                        sources: ['local'],
                        clientAllowedFormats: ['png', 'jpg', 'jpeg'],
                        maxFileSize: 2000000,
                        multiple: false,
                    }}
                    onSuccess={(result: any) => {
                        const info = result?.info as any;
                        const url = info?.secure_url || info?.url;
                        if (url) onUploaded(url);
                    }}
                >
                    {({ open }) => (
                        <button
                            type="button"
                            onClick={() => open?.()}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white"
                        >
                            <Upload size={14} /> Upload
                        </button>
                    )}
                </CldUploadWidget>
            ) : (
                <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl bg-gray-300 px-4 py-2 text-xs font-semibold text-gray-600"
                    disabled
                >
                    <Upload size={14} /> Upload belum aktif
                </button>
            )}
            {error && <p className="mt-2 text-[11px] text-red-600">{error}</p>}
        </div>
    );
};
