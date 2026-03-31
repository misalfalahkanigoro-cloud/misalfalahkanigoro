import type {
    MediaItem,
    PPDBFormData,
    PPDBStatusResponse,
} from '@/lib/types';
import { fetchAPI, fetchOptional } from '@/lib/api/shared';

export const publicApi = {
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
    getHeroSlides: () => fetchAPI('/api/hero-slides'),
    getHighlights: () => fetchAPI('/api/highlights'),
    getTeachers: () => fetchAPI('/api/teachers'),
    getNews: (params?: { page?: number; pageSize?: number }) => {
        const search = new URLSearchParams();
        if (params?.page) search.set('page', params.page.toString());
        if (params?.pageSize) search.set('pageSize', params.pageSize.toString());
        return fetchAPI(`/api/news?${search.toString()}`);
    },
    getNewsDetail: (slug: string) => fetchAPI(`/api/news/${slug}`),
    getPublications: (params?: { page?: number; pageSize?: number; type?: string }) => {
        const search = new URLSearchParams();
        if (params?.page) search.set('page', params.page.toString());
        if (params?.pageSize) search.set('pageSize', params.pageSize.toString());
        if (params?.type) search.set('type', params.type);
        return fetchAPI(`/api/publications${search.toString() ? `?${search.toString()}` : ''}`);
    },
    getPublicationDetail: (slug: string) => fetchAPI(`/api/publications/${slug}`),
    getAchievements: (params?: { page?: number; pageSize?: number; level?: string }) => {
        const search = new URLSearchParams();
        if (params?.page) search.set('page', params.page.toString());
        if (params?.pageSize) search.set('pageSize', params.pageSize.toString());
        if (params?.level) search.set('level', params.level);
        return fetchAPI(`/api/achievements${search.toString() ? `?${search.toString()}` : ''}`);
    },
    getAchievementDetail: (slug: string) => fetchAPI(`/api/achievements/${slug}`),
    getGalleries: (params?: { page?: number; pageSize?: number }) => {
        const search = new URLSearchParams();
        if (params?.page) search.set('page', params.page.toString());
        if (params?.pageSize) search.set('pageSize', params.pageSize.toString());
        return fetchAPI(`/api/galleries${search.toString() ? `?${search.toString()}` : ''}`);
    },
    getGalleryDetail: (slug: string) => fetchAPI(`/api/galleries/${slug}`),
    getActivities: () => fetchAPI('/api/activities'),
    getGraduation: (year?: string) =>
        fetchAPI(`/api/graduation${year ? `?year=${year}` : ''}`),
    searchGraduation: (nisn: string) =>
        fetchAPI('/api/graduation', {
            method: 'POST',
            body: JSON.stringify({ nisn }),
        }),
    getDownloads: (params?: { page?: number; pageSize?: number }) => {
        const search = new URLSearchParams();
        if (params?.page) search.set('page', params.page.toString());
        if (params?.pageSize) search.set('pageSize', params.pageSize.toString());
        return fetchAPI(`/api/downloads${search.toString() ? `?${search.toString()}` : ''}`);
    },
    getDownloadDetail: (id: string) => fetchAPI(`/api/downloads/${id}`),
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
    login: (username: string, password: string) =>
        fetchAPI('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        }),
    pages: {
        getProfile: () => fetchOptional('/api/pages/profile'),
        getAcademic: () => fetchOptional('/api/pages/academic'),
        getContact: () => fetchOptional('/api/pages/contact'),
    },
    upload: {
        media: async (file: File, folder: string = 'general', replaceUrl?: string): Promise<MediaItem> => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', folder);
            if (replaceUrl) {
                formData.append('replaceUrl', replaceUrl);
            }

            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });
            if (!res.ok) throw new Error('Upload failed');
            return res.json();
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
        },
    },
    uploadMedia: (file: File, folder: string = 'general') => publicApi.upload.media(file, folder),
};
