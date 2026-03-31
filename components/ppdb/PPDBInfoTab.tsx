'use client';

import React from 'react';
import { Calendar, FileCheck, Star, Activity, Clock, Table, MessageCircle, MapPin } from 'lucide-react';

const PPDBInfoTab: React.FC = () => (
    <div className="p-6 md:p-10 space-y-12">
        {/* GELOMBANG PENDAFTARAN */}
        <section className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <Calendar size={20} />
                </div>
                <h3 className="text-xl font-black font-fraunces text-slate-900 dark:text-white">Gelombang Pendaftaran</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-6 rounded-3xl bg-white dark:bg-white/5 border border-emerald-100 dark:border-white/10 shadow-sm">
                    <h4 className="font-bold text-emerald-700 dark:text-emerald-400 mb-2">Gelombang 1</h4>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">22 November 2025 s/d 20 Desember 2025</p>
                    <div className="mt-4 pt-4 border-t border-emerald-50 dark:border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Jadwal Tes JKD</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">20 Desember 2025</p>
                    </div>
                </div>
                <div className="p-6 rounded-3xl bg-white dark:bg-white/5 border border-emerald-100 dark:border-white/10 shadow-sm">
                    <h4 className="font-bold text-emerald-700 dark:text-emerald-400 mb-2">Gelombang 2</h4>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">21 Desember 2025 s/d 21 Februari 2026</p>
                    <div className="mt-4 pt-4 border-t border-emerald-50 dark:border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Jadwal Tes JKD</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">21 Februari 2026</p>
                    </div>
                </div>
            </div>
        </section>

        {/* SYARAT PENDAFTARAN */}
        <section className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <FileCheck size={20} />
                </div>
                <h3 className="text-xl font-black font-fraunces text-slate-900 dark:text-white">Syarat Pendaftaran</h3>
            </div>
            <div className="bg-white dark:bg-white/5 border border-emerald-100 dark:border-white/10 rounded-[32px] p-8">
                <ul className="grid gap-4 sm:grid-cols-2 text-sm text-slate-600 dark:text-slate-300">
                    {[
                        'Mengisi formulir pendaftaran',
                        '3 lembar foto 3x4',
                        'FC. Kartu Keluarga 2 lembar',
                        'FC. Akta Kelahiran 2 lembar',
                        'FC. NISN dari Lembaga 2 lembar',
                        'FC. Sertifikat Prestasi (bagi yang punya)',
                        'FC. Kartu KIP, KIS, KSP, PKH 2 lembar (bagi yang punya)',
                        'FC. Ijazah dari TK/RA (menyusul)',
                        'Membayar biaya pendaftaran Rp 50.000,-'
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>

        {/* PROGRAM & KEGIATAN */}
        <div className="grid gap-8 lg:grid-cols-3">
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600">
                    <Star size={18} />
                    <h4 className="font-black text-[12px] uppercase tracking-[0.2em]">Program Unggulan</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                    {['Tahfidz Juz 30', 'Olimpiade Class', 'Outing Class', 'Wisata Religi', 'Pembelajaran Multimedia'].map(item => (
                        <span key={item} className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold leading-none">{item}</span>
                    ))}
                </div>
            </section>
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-600">
                    <Activity size={18} />
                    <h4 className="font-black text-[12px] uppercase tracking-[0.2em]">Ekstrakurikuler</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                    {['Pramuka', 'Baca Tulis Pegon/Kitab', 'Pidato 3 Bahasa', 'Paduan Suara', 'Tenis Meja', 'Silat', 'Catur', 'Karate', 'Tari', 'Lukis', 'Volly', 'SBQ'].map(item => (
                        <span key={item} className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[11px] font-bold leading-none">{item}</span>
                    ))}
                </div>
            </section>
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-amber-600">
                    <Clock size={18} />
                    <h4 className="font-black text-[12px] uppercase tracking-[0.2em]">Pembiasaan</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                    {['Sholat Dhuha', 'Sholat Dhuhur', 'Istighotsah', 'Tahlil', 'Yasin'].map(item => (
                        <span key={item} className="px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-500 text-xs font-bold leading-none">{item}</span>
                    ))}
                </div>
            </section>
        </div>

        {/* RINCIAN BIAYA */}
        <section className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <Table size={20} />
                </div>
                <h3 className="text-xl font-black font-fraunces text-slate-900 dark:text-white">Rincian Biaya Pendaftaran</h3>
            </div>
            <div className="overflow-x-auto rounded-[32px] border border-gray-200 dark:border-white/10 shadow-sm">
                <table className="w-full text-left text-sm border-collapse bg-white dark:bg-white/5">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-black/20 border-b border-gray-100 dark:border-white/5">
                            <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-slate-400 w-16">No</th>
                            <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Rincian Biaya</th>
                            <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-slate-400 text-right">Laki-laki</th>
                            <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-slate-400 text-right">Perempuan</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                        {[
                            ['Seragam Lengkap', 'Rp 1.020.000', 'Rp 1.150.000'],
                            ['Buku STUA', 'Rp 25.000', 'Rp 25.000'],
                            ['Uang Kegiatan Siswa 1 tahun', 'Rp 175.000', 'Rp 175.000'],
                            ['Infaq Bulan Juli 2025', 'Rp 55.000', 'Rp 55.000'],
                            ['Tahfidz Bulan Juli 2025', 'Rp 15.000', 'Rp 15.000'],
                            ['Tabungan Wajib Bulan Juli', 'Rp 10.000', 'Rp 10.000'],
                            ['1 Paket LKS Semester 1', 'Rp 170.000', 'Rp 170.000'],
                            ['Pengadaan Rapot', 'Rp 100.000', 'Rp 100.000'],
                            ['Kalender Pendidikan', 'Rp 25.000', 'Rp 25.000'],
                            ['Iuran Qurban Idul Adha', 'Rp 50.000', 'Rp 50.000'],
                            ['Pengembangan Madrasah', 'Rp 100.000', 'Rp 100.000'],
                        ].map(([nama, l, p], idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-400">{idx + 1}</td>
                                <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">{nama}</td>
                                <td className="px-6 py-4 font-black text-slate-900 dark:text-white text-right font-mono">{l}</td>
                                <td className="px-6 py-4 font-black text-slate-900 dark:text-white text-right font-mono">{p}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-emerald-50 dark:bg-emerald-500/10 font-fraunces">
                            <td colSpan={2} className="px-6 py-6 text-xl font-black text-emerald-900 dark:text-emerald-400 text-right">TOTAL</td>
                            <td className="px-6 py-6 text-xl font-black text-emerald-900 dark:text-emerald-400 text-right font-mono">Rp 1.745.000</td>
                            <td className="px-6 py-6 text-xl font-black text-emerald-900 dark:text-emerald-400 text-right font-mono">Rp 1.875.000</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </section>

        {/* KONTAK PENDAFTARAN */}
        <section className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <MessageCircle size={20} />
                </div>
                <h3 className="text-xl font-black font-fraunces text-slate-900 dark:text-white">Kontak Pendaftaran</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <a href="https://wa.me/6287753631037" target="_blank" rel="noopener noreferrer" className="group p-6 rounded-3xl bg-white dark:bg-white/5 border border-emerald-100 dark:border-white/10 shadow-sm hover:border-emerald-500 transition-all">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Panitia 1</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-600">Bu Yuli</p>
                    <p className="text-sm font-bold text-emerald-600 mt-2">0877 5363 1037</p>
                </a>
                <a href="https://wa.me/6285706908905" target="_blank" rel="noopener noreferrer" className="group p-6 rounded-3xl bg-white dark:bg-white/5 border border-emerald-100 dark:border-white/10 shadow-sm hover:border-emerald-500 transition-all">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Panitia 2</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-600">Bu Nisa</p>
                    <p className="text-sm font-bold text-emerald-600 mt-2">0857 0690 8905</p>
                </a>
                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 shadow-sm sm:col-span-2 lg:col-span-1 flex items-start gap-4">
                    <MapPin className="text-slate-400 shrink-0 mt-1" size={20} />
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Alamat Kantor</p>
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
                            Jl. Irian Gg. Pondok Jajar Kel. Kanigoro Kab. Blitar
                        </p>
                    </div>
                </div>
            </div>
        </section>
    </div>
);

export default PPDBInfoTab;
