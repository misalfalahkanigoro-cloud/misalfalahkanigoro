'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import type { PPDBFormData, PPDBSubmitResponse, PPDBWave } from '@/lib/types';
import { FileUploadCard, InputField, SectionTitle, SelectField } from '@/components/ppdb/PPDBFormFields';

// Dynamic document types based on wave configuration
type FormStep = 0 | 1 | 2 | 3;
type FormErrors = Record<string, string>;

type PPDBFormState = Omit<PPDBFormData, 'files'>;

type PPDBFormTabProps = {
    ppdbOpen: boolean;
    activeWave: PPDBWave | null;
};

const PPDBFormTab: React.FC<PPDBFormTabProps> = ({ ppdbOpen, activeWave }) => {
    const router = useRouter();
    const [step, setStep] = useState<FormStep>(0);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [files, setFiles] = useState<Record<string, string>>({});

    // Initialize files state when activeWave changes
    React.useEffect(() => {
        if (activeWave?.documentRequirements) {
            const initialFiles: Record<string, string> = {};
            activeWave.documentRequirements.forEach(req => {
                initialFiles[req.key] = '';
            });
            setFiles(initialFiles);
        }
    }, [activeWave]);
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
            if (activeWave?.documentRequirements) {
                activeWave.documentRequirements.forEach((req) => {
                    if (req.isRequired && !files[req.key]) {
                        nextErrors[req.key] = `${req.label} wajib diupload`;
                    }
                });
            }
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
                files: Object.entries(files).map(([key, url]) => ({
                    fileType: key,
                    fileUrl: url,
                })),
            };
            const response = await api.submitPPDB(payload) as PPDBSubmitResponse;
            if (!response.accessToken) {
                throw new Error('Tautan konfirmasi tidak tersedia. Silakan hubungi panitia.');
            }
            router.push(`/ppdb/sukses?token=${encodeURIComponent(response.accessToken)}`);
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
                        {activeWave?.documentRequirements?.map((req) => (
                            <FileUploadCard
                                key={req.key}
                                label={req.label}
                                value={files[req.key] || ''}
                                error={errors[req.key]}
                                onUploaded={(url) =>
                                    setFiles((prev) => ({
                                        ...prev,
                                        [req.key]: url,
                                    }))
                                }
                            />
                        ))}
                        {(!activeWave?.documentRequirements || activeWave.documentRequirements.length === 0) && (
                            <div className="col-span-2 text-center py-8 text-gray-400 text-sm italic">
                                Tidak ada berkas yang wajib diunggah untuk gelombang ini.
                            </div>
                        )}
                    </div>
                    {Object.keys(errors).some((key) => activeWave?.documentRequirements?.some(r => r.key === key)) && (
                        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                            Mohon lengkapi semua berkas wajib.
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

export default PPDBFormTab;
