'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

export type StoredAdminUser = {
    id: string;
    username: string;
    role: 'admin' | 'superadmin' | string;
    fullName?: string;
};

export function useAdminAuth() {
    const router = useRouter();
    const [user, setUser] = useState<StoredAdminUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('adminUser');
        if (!stored) {
            router.replace('/login');
            return;
        }

        try {
            const parsed = JSON.parse(stored) as StoredAdminUser;
            if (!['admin', 'superadmin'].includes(parsed.role)) {
                router.replace('/login');
                return;
            }
            setUser(parsed);
        } catch (error) {
            console.error('Error parsing admin user:', error);
            router.replace('/login');
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        }
        localStorage.removeItem('adminUser');
        router.replace('/login');
    };

    const displayName = useMemo(() => {
        if (!user) return 'ADMIN';
        return (user.fullName || user.username || 'ADMIN').toUpperCase();
    }, [user]);

    const displayRole = useMemo(() => {
        if (!user) return 'ADMIN';
        return (user.role || 'admin').toString().toUpperCase();
    }, [user]);

    return { user, isLoading, logout, displayName, displayRole };
}
