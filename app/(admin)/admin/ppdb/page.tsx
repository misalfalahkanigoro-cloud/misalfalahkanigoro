'use client';

import React, { useEffect, useState } from 'react';
import SidebarAdmin from '@/components/sidebar-admin';
import { PPDBTabs } from '@/components/admin/ppdb/PPDBTabs';
import { PendaftarView } from '@/components/admin/ppdb/views/PendaftarView';
import { GelombangView } from '@/components/admin/ppdb/views/GelombangView';
import { NotifikasiView } from '@/components/admin/ppdb/views/NotifikasiView';
import { BrosurView } from '@/components/admin/ppdb/views/BrosurView';
import type { AdminTab, PPDBWave, SubscriberItem } from '@/components/admin/ppdb/types';

const AdminPPDBPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('pendaftar');
    const [waves, setWaves] = useState<PPDBWave[]>([]);
    const [subscribers, setSubscribers] = useState<SubscriberItem[]>([]);

    const fetchWaves = async () => {
        try {
            const res = await fetch('/api/admin/ppdb-waves');
            const data = await res.json();
            const mapped = (Array.isArray(data) ? data : []).map((w: any) => ({
                id: w.id,
                name: w.name,
                startDate: w.start_date,
                endDate: w.end_date,
                quota: w.quota,
                isActive: w.is_active,
                createdAt: w.created_at,
                updatedAt: w.updated_at,
            }));
            setWaves(mapped);
        } catch (error) {
            console.error('Failed to fetch waves', error);
        }
    };

    const fetchSubscribers = async () => {
        try {
            const res = await fetch('/api/admin/ppdb-registrations');
            const data = await res.json();
            setSubscribers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch subscribers', error);
        }
    };

    useEffect(() => {
        fetchWaves();
        fetchSubscribers();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 text-gray-900 transition-colors dark:bg-[#0B0F0C] dark:text-slate-100 selection:bg-emerald-500/30">
            <SidebarAdmin />
            
            {/* Main Content Area */}
            <main className="min-h-screen lg:pl-64 transition-all duration-300">
                <div className="max-w-[1600px] mx-auto px-6 py-8 sm:px-10 sm:py-12">
                    
                    {/* Page Header */}
                    <header className="mb-10 pt-12 md:pt-6">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black font-fraunces tracking-tight mb-2 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 bg-clip-text text-transparent dark:from-white dark:via-emerald-100 dark:to-emerald-300">
                                    Portal PPDB
                                </h1>
                                <p className="text-sm md:text-base text-gray-600 dark:text-slate-400 font-medium max-w-2xl">
                                    Kelola pendaftaran siswa baru, gelombang, dan materi promosi sekolah melalui dashboard terpusat.
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex flex-col items-end">
                                    <span className="text-[10px] font-bold text-gray-500 dark:text-slate-500 uppercase tracking-widest">GELOMBANG AKTIF</span>
                                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                        {waves.filter(w => w.isActive).length} Gelombang
                                    </span>
                                </div>
                                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                                    <span className="text-lg font-bold">{waves.filter(w => w.isActive).length}</span>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Integrated Tab Navigation */}
                    <PPDBTabs activeTab={activeTab} onChange={setActiveTab} />

                    {/* Keep wrapper non-transformed so fixed modal overlays in child views cover full viewport */}
                    <div className="animate-in fade-in duration-500 ease-out">
                        {activeTab === 'pendaftar' && (
                            <PendaftarView 
                                subscribers={subscribers} 
                                fetchSubscribers={fetchSubscribers} 
                            />
                        )}
                        {activeTab === 'gelombang' && <GelombangView />}
                        {activeTab === 'notifikasi' && (
                            <NotifikasiView 
                                subscribers={subscribers} 
                                waves={waves} 
                            />
                        )}
                        {activeTab === 'brosur' && <BrosurView waves={waves} />}
                    </div>
                </div>
            </main>
            
            {/* Custom Admin Scrollbar Styles */}
            <style jsx global>{`
                .admin-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .admin-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .admin-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .dark .admin-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                }
                .admin-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e0;
                }
                .dark .admin-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                
                @media (max-width: 1024px) {
                    body.sidebar-collapsed main {
                        padding-left: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default AdminPPDBPage;


