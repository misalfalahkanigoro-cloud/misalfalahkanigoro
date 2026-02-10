'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Teacher } from '@/lib/types';

const Guru: React.FC = () => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const data = await api.getTeachers();
                setTeachers((data as Teacher[]) || []);
            } catch (error) {
                console.error('Failed to fetch teachers:', error);
            }
        };

        fetchTeachers();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 transition-colors duration-200">
            <section className="bg-gradient-to-r from-emerald-50 via-white to-emerald-50 dark:from-[#0B0F0C] dark:via-[#0F1511] dark:to-[#0B0F0C] border-b border-emerald-100/70 dark:border-white/10">
                <div className="container mx-auto px-4 py-8 md:py-10">
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-emerald-700/70 dark:text-emerald-200/70">
                        <span className="h-[2px] w-8 bg-emerald-500/70"></span>
                        Halaman
                    </div>
                    <h1 className="mt-3 text-2xl md:text-4xl font-bold text-emerald-950 dark:text-white">Guru</h1>
                </div>
            </section>

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {teachers.map((teacher) => (
                        <div key={teacher.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden text-center group">
                            <div className="h-64 overflow-hidden bg-gray-200 dark:bg-gray-700">
                                <img
                                    src={teacher.imageUrl || 'https://picsum.photos/300/400'}
                                    alt={teacher.name}
                                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{teacher.name}</h3>
                                <p className="text-primary dark:text-green-400 font-medium text-sm">{teacher.position}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Guru;
