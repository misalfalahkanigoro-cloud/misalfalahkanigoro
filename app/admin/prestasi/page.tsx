'use client';

import React, { useState, useEffect } from 'react';
import AchievementList from '@/components/admin/AchievementList';
import AchievementForm from '@/components/admin/AchievementForm';
import type { Achievement } from '@/lib/types';

export default function AdminPrestasiPage() {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const fetchAchievements = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/achievements');
            if (res.ok) {
                const data = await res.json();
                setAchievements(data);
            }
        } catch (error) {
            console.error('Error fetching admin achievements:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAchievements();
    }, []);

    const selectedAchievement = achievements.find(a => a.id === selectedId) || null;

    const handleSelect = (id: number) => {
        setSelectedId(id);
        setIsAdding(false);
    };

    const handleAdd = () => {
        setSelectedId(null);
        setIsAdding(true);
    };

    const handleSaveSuccess = () => {
        fetchAchievements();
        setIsAdding(false);
        setSelectedId(null);
    };

    const handleDeleteSuccess = () => {
        fetchAchievements();
        setSelectedId(null);
    };

    const handleCancel = () => {
        setSelectedId(null);
        setIsAdding(false);
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] gap-6 p-4 lg:p-6">
            <div className={`flex-1 lg:max-w-md ${selectedId || isAdding ? 'hidden lg:flex' : 'flex'}`}>
                <AchievementList
                    achievements={achievements}
                    selectedId={selectedId}
                    onSelect={handleSelect}
                    onAdd={handleAdd}
                    loading={loading}
                />
            </div>

            <div className={`flex-[2] ${selectedId || isAdding ? 'flex' : 'hidden lg:flex'} items-center justify-center`}>
                {selectedId || isAdding ? (
                    <AchievementForm
                        achievement={selectedAchievement}
                        onSaveSuccess={handleSaveSuccess}
                        onDeleteSuccess={handleDeleteSuccess}
                        onCancel={handleCancel}
                    />
                ) : (
                    <div className="text-center space-y-4 opacity-40">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto">
                            <span className="text-4xl text-emerald-600">🏆</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Kelola Prestasi</h3>
                            <p className="text-sm text-gray-500">Pilih prestasi dari daftar atau buat baru.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
