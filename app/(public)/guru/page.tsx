'use client';

import React, { useEffect, useState } from 'react';
import SimpleHero from '@/components/SimpleHero';
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
            <SimpleHero
                title="Guru & Tenaga Kependidikan"
                subtitle="Pendidik profesional, sabar, dan berdedikasi tinggi dalam membimbing putra-putri Anda."
                image="https://picsum.photos/id/342/1920/800"
            />

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

                    {/* Mock more items for demo purposes */}
                    {[5, 6, 7, 8].map((i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden text-center">
                            <div className="h-64 overflow-hidden bg-gray-200 dark:bg-gray-700">
                                <img
                                    src={`https://picsum.photos/id/${1030 + i}/300/400`}
                                    alt="Guru"
                                    className="w-full h-full object-cover object-top opacity-80"
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Guru Mata Pelajaran</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Staf Pengajar</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Guru;
