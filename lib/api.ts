import type { PPDBFormData } from '@/lib/types';

const API_BASE = '';

// Generic fetch helper
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `API Error: ${res.status}`);
    }

    return res.json();
}

// Optional fetch helper (returns null on 404)
async function fetchOptional<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (res.status === 404) {
        return null;
    }

    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `API Error: ${res.status}`);
    }

    return res.json();
}

// Public APIs
export const api = {
    // School Settings
    getPinnedItems: () => fetchAPI('/api/pinned'),
    getSchoolSettings: () => fetchAPI('/api/school-settings'),
    getSiteSettings: () => fetchAPI('/api/site-settings'),
    getSocialMediaLinks: () => fetchAPI('/api/social-media-links'),
    getNavigationMenu: () => fetchAPI('/api/navigation-menu'),
    getFooterLinks: () => fetchAPI('/api/footer-links'),
    getHeadmasterGreeting: () => fetchOptional('/api/headmaster-greeting'),
    getExtracurriculars: () => fetchAPI('/api/extracurriculars'),
    getCharacterPrograms: () => fetchAPI('/api/character-programs'),
    getSiteBanners: (placement?: string) =>
        fetchAPI(`/api/site-banners${placement ? `?placement=${encodeURIComponent(placement)}` : ''}`),
    getPageHero: (slug: string) =>
        fetchOptional(`/api/page-heroes?slug=${encodeURIComponent(slug)}`),

    // Hero Slides
    getHeroSlides: () => fetchAPI('/api/hero-slides'),

    // Highlights
    getHighlights: () => fetchAPI('/api/highlights'),

    // Teachers
    getTeachers: () => fetchAPI('/api/teachers'),

    // News
    getNews: (params?: { page?: number; pageSize?: number; category?: string }) => {
        const search = new URLSearchParams();
        if (params?.page) search.set('page', params.page.toString());
        if (params?.pageSize) search.set('pageSize', params.pageSize.toString());
        if (params?.category) search.set('category', params.category);
        const qs = search.toString();
        return fetchAPI(`/api/news${qs ? `?${qs}` : ''}`);
    },
    getNewsDetail: (slug: string) => fetchAPI(`/api/news/${slug}`),

    // Publikasi (content posts)
    getContentPosts: (params?: { page?: number; pageSize?: number; category?: string; type?: string }) => {
        const search = new URLSearchParams();
        if (params?.page) search.set('page', params.page.toString());
        if (params?.pageSize) search.set('pageSize', params.pageSize.toString());
        if (params?.category) search.set('category', params.category);
        if (params?.type) search.set('type', params.type);
        const qs = search.toString();
        return fetchAPI(`/api/publikasi${qs ? `?${qs}` : ''}`);
    },
    getContentPostDetail: (slug: string) => fetchAPI(`/api/publikasi/${slug}`),

    // Prestasi (achievements)
    getAchievements: (params?: { page?: number; pageSize?: number; category?: string }) => {
        const search = new URLSearchParams();
        if (params?.page) search.set('page', params.page.toString());
        if (params?.pageSize) search.set('pageSize', params.pageSize.toString());
        if (params?.category) search.set('category', params.category);
        const qs = search.toString();
        return fetchAPI(`/api/prestasi${qs ? `?${qs}` : ''}`);
    },
    getAchievementDetail: (slug: string) => fetchAPI(`/api/prestasi/${slug}`),

    // Activities
    getActivities: () => fetchAPI('/api/activities'),

    // Graduation
    getGraduation: (year?: string) =>
        fetchAPI(`/api/graduation${year ? `?year=${year}` : ''}`),

    searchGraduation: (nisn: string) =>
        fetchAPI('/api/graduation', {
            method: 'POST',
            body: JSON.stringify({ nisn }),
        }),

    // Downloads
    getDownloads: (category?: string) =>
        fetchAPI(`/api/downloads${category ? `?category=${category}` : ''}`),

    // PPDB
    submitPPDB: (data: PPDBFormData) =>
        fetchAPI('/api/ppdb', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    checkPPDBStatus: (registrationId: string) =>
        fetchAPI('/api/ppdb/status', {
            method: 'POST',
            body: JSON.stringify({ registrationId }),
        }),

    // Auth
    login: (username: string, password: string) =>
        fetchAPI('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        }),

    // Upload APIs
    upload: {
        media: async (file: File, folder?: string) => {
            const formData = new FormData();
            formData.append('file', file);
            if (folder) formData.append('folder', folder);

            const res = await fetch('/api/upload/media', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const error = await res.json().catch(() => ({ error: 'Upload failed' }));
                throw new Error(error.error);
            }

            return res.json();
        },

        file: async (file: File, bucket?: string) => {
            const formData = new FormData();
            formData.append('file', file);
            if (bucket) formData.append('bucket', bucket);

            const res = await fetch('/api/upload/file', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const error = await res.json().catch(() => ({ error: 'Upload failed' }));
                throw new Error(error.error);
            }

            return res.json();
        },
    },

    // Pages
    pages: {
        getProfile: () => fetchOptional('/api/pages/profile'),
        getAcademic: () => fetchOptional('/api/pages/academic'),
        getContact: () => fetchOptional('/api/pages/contact'),
    },
};

export default api;
