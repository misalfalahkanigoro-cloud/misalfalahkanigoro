import type {
    PPDBRegistration,
    PPDBFormData,
    PPDBStatusResponse,
    SiteSettings,
    SocialMediaLink,
    NavigationMenuItem,
    NewsPost,
    Publication,
    Achievement,
    Gallery,
    Download,
    MediaItem
} from '@/lib/types';

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
    getHeroItems: () => fetchAPI('/api/hero'),
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

    // Hero Slides (Still used? Maybe legacy or specific)
    getHeroSlides: () => fetchAPI('/api/hero-slides'),

    // Highlights
    getHighlights: () => fetchAPI('/api/highlights'),

    // Teachers
    getTeachers: () => fetchAPI('/api/teachers'),

    // News (Berita)
    getNews: (params?: { page?: number; pageSize?: number }) => {
        const search = new URLSearchParams();
        if (params?.page) search.set('page', params.page.toString());
        if (params?.pageSize) search.set('pageSize', params.pageSize.toString());
        const qs = search.toString();
        return fetchAPI(`/api/news${qs ? `?${qs}` : ''}`);
    },
    getNewsDetail: (slug: string) => fetchAPI(`/api/news/${slug}`),

    // Publications (Publikasi: Announcement, Article)
    getPublications: (params?: { page?: number; pageSize?: number; type?: string }) => {
        const search = new URLSearchParams();
        if (params?.page) search.set('page', params.page.toString());
        if (params?.pageSize) search.set('pageSize', params.pageSize.toString());
        if (params?.type) search.set('type', params.type);
        const qs = search.toString();
        return fetchAPI(`/api/publications${qs ? `?${qs}` : ''}`);
    },
    getPublicationDetail: (slug: string) => fetchAPI(`/api/publications/${slug}`),

    // Achievements (Prestasi)
    getAchievements: (params?: { page?: number; pageSize?: number; level?: string }) => {
        const search = new URLSearchParams();
        if (params?.page) search.set('page', params.page.toString());
        if (params?.pageSize) search.set('pageSize', params.pageSize.toString());
        if (params?.level) search.set('level', params.level);
        const qs = search.toString();
        return fetchAPI(`/api/achievements${qs ? `?${qs}` : ''}`);
    },
    getAchievementDetail: (slug: string) => fetchAPI(`/api/achievements/${slug}`),

    // Galleries (Galeri)
    getGalleries: (params?: { page?: number; pageSize?: number }) => {
        const search = new URLSearchParams();
        if (params?.page) search.set('page', params.page.toString());
        if (params?.pageSize) search.set('pageSize', params.pageSize.toString());
        const qs = search.toString();
        return fetchAPI(`/api/galleries${qs ? `?${qs}` : ''}`);
    },
    getGalleryDetail: (slug: string) => fetchAPI(`/api/galleries/${slug}`),

    // Activities (Example: Random photo grid if separate from galleries)
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
    getDownloads: () =>
        fetchAPI(`/api/downloads`),
    getDownloadDetail: (id: string) => fetchAPI(`/api/downloads/${id}`),

    // PPDB
    submitPPDB: (data: PPDBFormData) =>
        fetchAPI('/api/ppdb', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    checkPPDBStatus: (nisn: string): Promise<PPDBStatusResponse> =>
        fetchAPI('/api/ppdb/status', {
            method: 'POST',
            body: JSON.stringify({ nisn }),
        }),

    // Auth
    login: (username: string, password: string) =>
        fetchAPI('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        }),

    // Pages
    pages: {
        getProfile: () => fetchOptional('/api/pages/profile'),
        getAcademic: () => fetchOptional('/api/pages/academic'),
        getContact: () => fetchOptional('/api/pages/contact'),
    },

    // Administrative & Uploads
    upload: {
        media: async (file: File, folder: string = 'general'): Promise<MediaItem> => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', folder);

            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });
            if (!res.ok) throw new Error('Upload failed');
            return await res.json();
        },
        file: async (file: File, bucket: string = 'downloads'): Promise<{ fileUrl: string; fileType: string; fileSizeKb: number; path?: string }> => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('bucket', bucket);

            const res = await fetch('/api/upload/file', {
                method: 'POST',
                body: formData,
            });
            if (!res.ok) throw new Error('Upload failed');
            const json = await res.json();
            return {
                fileUrl: json.url,
                fileType: file.type || json.fileType,
                fileSizeKb: Math.round(file.size / 1024),
                path: json.path,
            };
        }
    },

    uploadMedia: (file: File, folder: string = 'general') => api.upload.media(file, folder),

    // === ADMIN METHODS ===

    // Galleries
    createGallery: (data: Partial<Gallery>) => fetchAPI('/api/galleries', { method: 'POST', body: JSON.stringify(data) }),
    updateGallery: (id: string, data: Partial<Gallery>) => fetchAPI(`/api/galleries/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteGallery: (id: string) => fetchAPI(`/api/galleries/${id}`, { method: 'DELETE' }),

    // News
    createNews: (data: Partial<NewsPost>) => fetchAPI('/api/news', { method: 'POST', body: JSON.stringify(data) }),
    updateNews: (id: string, data: Partial<NewsPost>) => fetchAPI(`/api/news/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteNews: (id: string) => fetchAPI(`/api/news/${id}`, { method: 'DELETE' }),

    // Publications
    createPublication: (data: Partial<Publication>) => fetchAPI('/api/publications', { method: 'POST', body: JSON.stringify(data) }),
    updatePublication: (id: string, data: Partial<Publication>) => fetchAPI(`/api/publications/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deletePublication: (id: string) => fetchAPI(`/api/publications/${id}`, { method: 'DELETE' }),

    // Achievements
    createAchievement: (data: Partial<Achievement>) => fetchAPI('/api/achievements', { method: 'POST', body: JSON.stringify(data) }),
    updateAchievement: (id: string, data: Partial<Achievement>) => fetchAPI(`/api/achievements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteAchievement: (id: string) => fetchAPI(`/api/achievements/${id}`, { method: 'DELETE' }),

    // Downloads
    createDownload: (data: Partial<Download>) => fetchAPI('/api/downloads', { method: 'POST', body: JSON.stringify(data) }),
    updateDownload: (id: string, data: Partial<Download>) => fetchAPI(`/api/downloads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteDownload: (id: string) => fetchAPI(`/api/downloads/${id}`, { method: 'DELETE' }),
};

export default api;
