'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';
import type { AdminLoginResponse } from '@/lib/types';

const AdminLoginPage: React.FC = () => {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <section className="bg-gradient-to-r from-emerald-50 via-white to-emerald-50 dark:from-[#0B0F0C] dark:via-[#0F1511] dark:to-[#0B0F0C] border-b border-emerald-100/70 dark:border-white/10">
                <div className="container mx-auto px-4 py-8 md:py-10">
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-emerald-700/70 dark:text-emerald-200/70">
                        <span className="h-[2px] w-8 bg-emerald-500/70"></span>
                        Halaman
                    </div>
                    <h1 className="mt-3 text-2xl md:text-4xl font-bold text-emerald-950 dark:text-white">Login</h1>
                </div>
            </section>

            <div className="flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 transition-colors">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-primary/10 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Lock className="text-primary dark:text-green-400" size={32} />
                            </div>
                        </div>

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
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-green-400 focus:ring-2 focus:ring-primary/20 dark:focus:ring-green-400/20 focus:outline-none transition-colors"
                                        placeholder="Masukkan password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
