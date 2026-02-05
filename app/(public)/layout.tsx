import React from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
