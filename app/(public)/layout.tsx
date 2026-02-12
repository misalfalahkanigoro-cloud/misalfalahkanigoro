import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { requireAdminRole } from '@/lib/admin-auth';

const PublicLayout = async ({ children }: { children: React.ReactNode }) => {
    const cookieStore = await cookies();
    const session = requireAdminRole(cookieStore, ['admin', 'superadmin']);

    if (session) {
        redirect('/admin/dashboard');
    }

    return (
        <div className="flex flex-col min-h-screen font-sans text-gray-800 dark:text-gray-100 dark:bg-gray-900 transition-colors duration-200 relative">
            <Header />
            <main className="flex-grow bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
