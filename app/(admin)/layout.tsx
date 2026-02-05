'use client';

import React from 'react';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen bg-[#0B0F0C] text-gray-100">
            {children}
        </div>
    );
};

export default AdminLayout;
