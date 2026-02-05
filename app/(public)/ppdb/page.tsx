'use client';

import React, { useState } from 'react';
import {
    CheckCircle, Download, MessageCircle, FileText, User, Users, Upload, Send,
    ChevronRight, ChevronLeft, Search, Printer, Check, Clock, AlertTriangle, Loader2
} from 'lucide-react';
import SimpleHero from '@/components/SimpleHero';
import { api } from '@/lib/api';
import type { PPDBStatusResponse, PPDBFormData, PPDBSubmitResponse } from '@/lib/types';

const SCHOOL_PHONE = '+62 812-3456-7890';

const PPDB: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'info' | 'daftar' | 'status'>('info');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 transition-colors duration-200">
            <SimpleHero
                title="PPDB Online Terpadu"
                subtitle="Penerimaan Peserta Didik Baru Tahun Ajaran 2024/2025."
                image="https://picsum.photos/id/201/1920/800"
            />

            <div className="container mx-auto px-4 -mt-10 relative z-30">

                {/* Tab Navigation */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 mb-8 flex flex-wrap justify-center gap-2 transition-colors">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`px-6 py-3 rounded-lg font-bold text-sm md:text-base flex items-center gap-2 transition-all ${activeTab === 'info' ? 'bg-primary text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        <FileText size={18} /> Informasi PPDB
                    </button>
                    <button
                        onClick={() => setActiveTab('daftar')}
                        className={`px-6 py-3 rounded-lg font-bold text-sm md:text-base flex items-center gap-2 transition-all ${activeTab === 'daftar' ? 'bg-primary text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        <User size={18} /> Daftar Sekarang
                    </button>
                    <button
                        onClick={() => setActiveTab('status')}
                        className={`px-6 py-3 rounded-lg font-bold text-sm md:text-base flex items-center gap-2 transition-all ${activeTab === 'status' ? 'bg-primary text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        <Search size={18} /> Cek Status
                    </button>
                </div>

                {/* Content Area */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm min-h-[500px] transition-colors overflow-hidden">
                    {activeTab === 'info' && <InfoTab setActiveTab={setActiveTab} />}
                    {activeTab === 'daftar' && <FormTab />}
                    {activeTab === 'status' && <StatusTab />}
                </div>

            </div>
        </div>
    );
};

// --- COMPONENTS FOR TABS ---

const InfoTab: React.FC<{ setActiveTab: (tab: 'daftar') => void }> = ({ setActiveTab }) => {
    return (
        <div className="p-8 animate-fade-in">
            <div className="text-center mb-8">
                <div className="inline-block bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-6 py-2 rounded-full font-bold text-sm border border-green-200 dark:border-green-800">
                    GELOMBANG 1: JANUARI - MARET 2024
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {/* Syarat */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-100 dark:border-gray-600">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <CheckCircle className="text-primary dark:text-green-400" /> Syarat Pendaftaran
                    </h3>
                    <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-sm">
                        <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>Mengisi Formulir Pendaftaran Online</li>
                        <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>Scan Akta Kelahiran (Asli/Fotokopi)</li>
                        <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>Scan Kartu Keluarga (KK)</li>
                        <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>Pas Foto berwarna 3x4 (Background Merah)</li>
                        <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>Usia minimal 6 tahun pada bulan Juli 2024</li>
                    </ul>
                </div>

                {/* Alur */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-100 dark:border-gray-600">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Clock className="text-primary dark:text-green-400" /> Alur Pendaftaran
                    </h3>
                    <div className="space-y-4">
                        {[
                            { title: "1. Daftar Online", desc: "Isi data diri dan upload berkas di menu 'Daftar Sekarang'." },
                            { title: "2. Verifikasi", desc: "Panitia memverifikasi kelengkapan berkas (1-3 hari kerja)." },
                            { title: "3. Tes Observasi", desc: "Calon siswa mengikuti pemetaan kemampuan dasar secara offline." },
                            { title: "4. Pengumuman", desc: "Cek hasil kelulusan di menu 'Cek Status'." }
                        ].map((step, i) => (
                            <div key={i} className="flex gap-3">
                                <div className="bg-white dark:bg-gray-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-primary dark:text-green-400 shadow-sm shrink-0 border dark:border-gray-500">
                                    {i + 1}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 dark:text-white text-sm">{step.title}</h4>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    onClick={() => setActiveTab('daftar')}
                    className="bg-primary hover:bg-secondary text-white py-4 px-8 rounded-full font-bold transition shadow-lg flex items-center justify-center gap-2 transform hover:scale-105"
                >
                    Mulai Pendaftaran Online <ChevronRight size={20} />
                </button>
                <a
                    href="#"
                    className="bg-white dark:bg-gray-700 text-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 py-4 px-8 rounded-full font-bold transition hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
                >
                    <Download size={20} /> Download Brosur PDF
                </a>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                Butuh bantuan? <a href={`https://wa.me/${SCHOOL_PHONE.replace(/[^0-9]/g, '')}`} className="text-primary dark:text-green-400 font-bold underline">Chat Panitia via WhatsApp</a>
            </div>
        </div>
    );
};

const FormTab: React.FC = () => {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [registrationId, setRegistrationId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<PPDBFormData>({
        namaLengkap: '', nik: '', nisn: '', tempatLahir: '', tanggalLahir: '', jenisKelamin: 'L', alamat: '',
        namaAyah: '', pekerjaanAyah: '', namaIbu: '', pekerjaanIbu: '', noHp: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await api.submitPPDB(formData) as PPDBSubmitResponse;
            setRegistrationId(response.registrationId);
            setStep(5);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Gagal mengirim pendaftaran';
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    if (step === 5) {
        return <SuccessState registrationId={registrationId!} />;
    }

    return (
        <div className="p-4 md:p-8 animate-fade-in">
            {/* Stepper */}
            <div className="flex justify-between items-center mb-10 px-4 md:px-20 relative">
                {[1, 2, 3, 4].map((s) => (
                    <div key={s} className="relative z-10 flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${step >= s ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                            {step > s ? <Check size={16} /> : s}
                        </div>
                        <span className="text-xs mt-2 font-medium text-gray-500 dark:text-gray-400 hidden md:block">
                            {s === 1 ? 'Data Siswa' : s === 2 ? 'Orang Tua' : s === 3 ? 'Berkas' : 'Review'}
                        </span>
                    </div>
                ))}
                {/* Connecting Line */}
                <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-0">
                    <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${((step - 1) / 3) * 100}%` }}
                    ></div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
                {step === 1 && (
                    <div className="space-y-4 animate-slide-in">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">Langkah 1: Identitas Calon Siswa</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="label">Nama Lengkap *</label>
                                <input type="text" name="namaLengkap" required value={formData.namaLengkap} onChange={handleChange} className="input-field" placeholder="Sesuai Akta Kelahiran" />
                            </div>
                            <div>
                                <label className="label">NIK (Nomor Induk Kependudukan) *</label>
                                <input type="text" name="nik" required value={formData.nik} onChange={handleChange} className="input-field" placeholder="16 Digit NIK" maxLength={16} />
                            </div>
                            <div>
                                <label className="label">NISN (Jika Ada)</label>
                                <input type="text" name="nisn" value={formData.nisn} onChange={handleChange} className="input-field" placeholder="Dari TK/RA" />
                            </div>
                            <div>
                                <label className="label">Tempat Lahir *</label>
                                <input type="text" name="tempatLahir" required value={formData.tempatLahir} onChange={handleChange} className="input-field" />
                            </div>
                            <div>
                                <label className="label">Tanggal Lahir *</label>
                                <input type="date" name="tanggalLahir" required value={formData.tanggalLahir} onChange={handleChange} className="input-field" />
                            </div>
                            <div>
                                <label className="label">Jenis Kelamin *</label>
                                <select name="jenisKelamin" value={formData.jenisKelamin} onChange={handleChange} className="input-field">
                                    <option value="L">Laki-laki</option>
                                    <option value="P">Perempuan</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="label">Alamat Lengkap *</label>
                                <textarea name="alamat" required value={formData.alamat} onChange={handleChange} className="input-field" rows={3}></textarea>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4 animate-slide-in">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">Langkah 2: Data Orang Tua / Wali</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label">Nama Ayah Kandung *</label>
                                <input type="text" name="namaAyah" required value={formData.namaAyah} onChange={handleChange} className="input-field" />
                            </div>
                            <div>
                                <label className="label">Pekerjaan Ayah</label>
                                <input type="text" name="pekerjaanAyah" value={formData.pekerjaanAyah} onChange={handleChange} className="input-field" />
                            </div>
                            <div>
                                <label className="label">Nama Ibu Kandung *</label>
                                <input type="text" name="namaIbu" required value={formData.namaIbu} onChange={handleChange} className="input-field" />
                            </div>
                            <div>
                                <label className="label">Pekerjaan Ibu</label>
                                <input type="text" name="pekerjaanIbu" value={formData.pekerjaanIbu} onChange={handleChange} className="input-field" />
                            </div>
                            <div className="col-span-2">
                                <label className="label">Nomor WhatsApp Aktif *</label>
                                <input type="tel" name="noHp" required value={formData.noHp} onChange={handleChange} className="input-field" placeholder="Contoh: 081234567890" />
                                <p className="text-xs text-gray-500 mt-1">Info kelulusan akan dikirim melalui nomor ini.</p>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-slide-in">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">Langkah 3: Upload Berkas</h3>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-sm text-yellow-800 dark:text-yellow-200 mb-4 border border-yellow-200 dark:border-yellow-700">
                            Format yang diperbolehkan: JPG, PNG, PDF. Maksimal 2MB per file.
                        </div>

                        {[
                            { label: "Scan Akta Kelahiran", id: "akta" },
                            { label: "Scan Kartu Keluarga (KK)", id: "kk" },
                            { label: "Pas Foto 3x4 (Warna)", id: "foto" }
                        ].map((item) => (
                            <div key={item.id} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer relative group">
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                                <div className="flex flex-col items-center">
                                    <Upload size={32} className="text-gray-400 group-hover:text-primary mb-2" />
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                                    <span className="text-xs text-gray-500">Klik untuk memilih file</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-6 animate-slide-in">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">Langkah 4: Review Data</h3>
                        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg space-y-4 text-sm">
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-gray-500 dark:text-gray-400">Nama Lengkap</span>
                                <span className="col-span-2 font-bold text-gray-900 dark:text-white">: {formData.namaLengkap}</span>

                                <span className="text-gray-500 dark:text-gray-400">NIK</span>
                                <span className="col-span-2 font-bold text-gray-900 dark:text-white">: {formData.nik}</span>

                                <span className="text-gray-500 dark:text-gray-400">TTL</span>
                                <span className="col-span-2 font-bold text-gray-900 dark:text-white">: {formData.tempatLahir}, {formData.tanggalLahir}</span>

                                <span className="text-gray-500 dark:text-gray-400">Nama Ayah</span>
                                <span className="col-span-2 font-bold text-gray-900 dark:text-white">: {formData.namaAyah}</span>

                                <span className="text-gray-500 dark:text-gray-400">No. WhatsApp</span>
                                <span className="col-span-2 font-bold text-gray-900 dark:text-white">: {formData.noHp}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="confirm" required className="w-5 h-5 text-primary rounded focus:ring-primary" />
                            <label htmlFor="confirm" className="text-sm text-gray-700 dark:text-gray-300">Saya menyatakan data di atas adalah benar dan dapat dipertanggungjawabkan.</label>
                        </div>
                    </div>
                )}

                <div className="flex justify-between mt-8 pt-4 border-t dark:border-gray-700">
                    {step > 1 ? (
                        <button type="button" onClick={prevStep} className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2">
                            <ChevronLeft size={18} /> Kembali
                        </button>
                    ) : <div></div>}

                    {step < 4 ? (
                        <button type="button" onClick={nextStep} className="px-6 py-2 rounded-lg bg-primary text-white font-bold hover:bg-secondary transition flex items-center gap-2">
                            Selanjutnya <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button type="submit" disabled={isSubmitting} className="px-8 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Mengirim...' : 'Kirim Pendaftaran'} <Send size={18} />
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

const SuccessState: React.FC<{ registrationId: string }> = ({ registrationId }) => {
    return (
        <div className="p-10 text-center animate-scale-up">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={48} className="text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Pendaftaran Berhasil!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">Data Anda telah kami terima. Silakan simpan ID Pendaftaran berikut.</p>

            <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-xl inline-block mb-8 border-2 border-dashed border-gray-300 dark:border-gray-500">
                <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">ID Pendaftaran Anda</span>
                <span className="text-3xl font-mono font-bold text-primary dark:text-green-400">{registrationId}</span>
            </div>

            <div className="flex justify-center gap-4">
                <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-secondary transition shadow">
                    <Printer size={18} /> Cetak Bukti
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg font-bold hover:bg-gray-50 transition">
                    <Download size={18} /> Simpan PDF
                </button>
            </div>
            <p className="mt-8 text-sm text-gray-500">Screenshot halaman ini jika diperlukan.</p>
        </div>
    )
}

const StatusTab: React.FC = () => {
    const [regId, setRegId] = useState('');
    const [statusResult, setStatusResult] = useState<PPDBStatusResponse | null | 'NOT_FOUND'>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkStatus = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!regId.trim()) return;

        setLoading(true);
        setStatusResult(null);
        setError(null);

        try {
            const result = await api.checkPPDBStatus(regId.trim()) as PPDBStatusResponse;
            setStatusResult(result);
        } catch (err) {
            const message = err instanceof Error ? err.message : '';
            if (message === 'NOT_FOUND') {
                setStatusResult('NOT_FOUND');
            } else {
                setError(message || 'Gagal mengecek status');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-8 max-w-2xl mx-auto animate-fade-in">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Cek Status Pendaftaran</h3>
                <p className="text-gray-500 dark:text-gray-400">Masukkan ID Pendaftaran yang Anda dapatkan saat mendaftar.</p>
            </div>

            <form onSubmit={checkStatus} className="flex gap-2 mb-8">
                <input
                    type="text"
                    value={regId}
                    onChange={(e) => setRegId(e.target.value)}
                    placeholder="Contoh: REG-2024-001"
                    className="flex-grow px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white outline-none"
                />
                <button type="submit" disabled={loading} className="bg-primary text-white px-6 rounded-lg font-bold hover:bg-secondary transition flex items-center gap-2">
                    {loading ? '...' : <Search size={20} />} Cek
                </button>
            </form>

            {statusResult === 'NOT_FOUND' && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3 text-red-700 dark:text-red-400">
                    <AlertTriangle size={24} />
                    <div>
                        <p className="font-bold">Data tidak ditemukan</p>
                        <p className="text-sm">Periksa kembali ID Pendaftaran Anda.</p>
                    </div>
                </div>
            )}

            {statusResult && typeof statusResult !== 'string' && (
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg overflow-hidden animate-slide-up">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b border-gray-100 dark:border-gray-600 flex justify-between items-center">
                        <span className="font-mono font-bold text-gray-600 dark:text-gray-400">{statusResult.id}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{statusResult.tanggalDaftar}</span>
                    </div>
                    <div className="p-6">
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{statusResult.nama}</h4>
                        <div className="mt-4 mb-6">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${statusResult.status === 'DITERIMA' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                                statusResult.status === 'DITOLAK' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                                    statusResult.status === 'BERKAS_VALID' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                                }`}>
                                {statusResult.status.replace('_', ' ')}
                            </span>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">Pesan Panitia:</p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{statusResult.pesan}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PPDB;
