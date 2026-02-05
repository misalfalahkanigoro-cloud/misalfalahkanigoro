'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import type { AdminLoginResponse } from '@/lib/types';

const AdminLoginPage: React.FC = () => {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await api.login(username.trim(), password);
            const typedResult = result as AdminLoginResponse;
            localStorage.setItem('adminUser', JSON.stringify(typedResult.user));
            router.push('/admin/dashboard');
        } catch (err) {
            setError('Username atau password salah.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-12 transition-colors duration-200">
            <div className="w-full max-w-md">
                {/* Header Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 mb-6 text-center transition-colors">
                    <div className="w-16 h-16 bg-primary/10 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="text-primary dark:text-green-400" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Portal Admin
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Kelola berita, guru, PPDB, dan konten madrasah
                    </p>
                </div>

                {/* Login Form Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 transition-colors">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="text-gray-400 dark:text-gray-500" size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-green-400 focus:ring-2 focus:ring-primary/20 dark:focus:ring-green-400/20 focus:outline-none transition-colors"
                                    placeholder="Masukkan username"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="text-gray-400 dark:text-gray-500" size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-green-400 focus:ring-2 focus:ring-primary/20 dark:focus:ring-green-400/20 focus:outline-none transition-colors"
                                    placeholder="Masukkan password"
                                    required
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 dark:bg-green-600 dark:hover:bg-green-500 text-white font-semibold py-3 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    <span>Memeriksa...</span>
                                </>
                            ) : (
                                <span>Masuk ke Dashboard</span>
                            )}
                        </button>
                    </form>

                    {/* Footer Note */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                            Pastikan Anda memiliki akses resmi untuk masuk ke panel admin
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
