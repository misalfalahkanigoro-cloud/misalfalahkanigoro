'use client';

import React, { useState } from 'react';
import { FileText, User, Search } from 'lucide-react';
import type { PPDBWave } from '@/lib/types';
import PPDBActiveWaveWatcher from '@/components/ppdb/PPDBActiveWaveWatcher';
import PPDBHeroBrosur from '@/components/ppdb/PPDBHeroBrosur';
import PPDBInfoTab from '@/components/ppdb/PPDBInfoTab';
import PPDBFormTab from '@/components/ppdb/PPDBFormTab';
import PPDBStatusTab from '@/components/ppdb/PPDBStatusTab';

const PPDB: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'info' | 'daftar' | 'status'>('info');
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
                    <h1 className="mt-3 text-2xl md:text-4xl font-bold text-emerald-950 dark:text-white">PPDB 2026/2027</h1>
                </div>
            </section>

            <div className="container mx-auto px-4 py-12 relative z-30">
                <PPDBActiveWaveWatcher onStatus={setPpdbOpen} onWave={setActiveWave} />
                <PPDBHeroBrosur waveId={activeWave?.id} />
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
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm min-h-[500px] transition-colors overflow-hidden">
                    {activeTab === 'info' && <PPDBInfoTab />}
                    {activeTab === 'daftar' && <PPDBFormTab ppdbOpen={ppdbOpen} activeWave={activeWave} />}
                    {activeTab === 'status' && <PPDBStatusTab />}
                </div>
            </div>
        </div>
    );
};

export default PPDB;
