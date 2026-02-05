'use client';

import React from 'react';
import SidebarAdmin from '@/components/sidebar-admin';

const AdminDashboardPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors dark:bg-[#0B0F0C] dark:text-gray-100">
            <SidebarAdmin />
            <main className="min-h-screen px-6 py-10 lg:pl-80">
                <div className="rounded-3xl border border-dashed border-emerald-900/20 bg-white/80 p-10 text-sm text-emerald-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-emerald-100/70">
                    Dashboard masih kosong, siap kamu isi.
                </div>
            </main>
        </div>
    );
};

export default AdminDashboardPage;
