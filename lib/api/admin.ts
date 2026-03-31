import type { Achievement, Download, Gallery, NewsPost, Publication, ContentType, PPDBNotification, PPDBWave, Extracurricular, CharacterProgram } from '@/lib/types';
import { fetchAPI } from '@/lib/api/shared';
import {
    type PPDBAdminDetail,
    type PPDBAdminListItem,
    type PPDBAdminStatus,
    type PPDBBrochureFormValue,
    type PPDBBrochureItem,
    type PPDBNotificationFormValue,
    type PPDBSubscriberItem,
    type PPDBWaveFormValue,
    mapPpdbAdminDetail,
    mapPpdbAdminListItem,
    mapPpdbBrochure,
    mapPpdbNotification,
    mapPpdbSubscriber,
    mapPpdbWave,
} from '@/lib/admin-ppdb';
import {
    type AdminSiteSettings,
    mapAdminSiteSettings,
    toAdminSiteSettingsPayload,
} from '@/lib/admin-site-settings';
import { mapContentPost } from '@/lib/content-post-mappers';

const CONTENT_TYPE_QUERY: Record<ContentType, string> = {
    news: 'news',
    publication: 'article',
    achievement: 'achievement',
    gallery: 'gallery',
    download: 'download',
};

const getContentList = async <T>(contentType: ContentType, params?: { page?: number; pageSize?: number; type?: string; search?: string }) => {
    const search = new URLSearchParams();
    search.set('type', contentType === 'publication' ? params?.type || 'article' : CONTENT_TYPE_QUERY[contentType]);
    if (params?.page) search.set('page', String(params.page));
    if (params?.pageSize) search.set('pageSize', String(params.pageSize));
    if (params?.search) search.set('search', params.search);

    const res = await fetchAPI<{ items: Record<string, any>[]; total: number; page: number; pageSize: number }>(
        `/api/admin/content-posts?${search.toString()}`
    );

    return {
        items: res.items.map((item) => mapContentPost(item, item.media_items || [])) as T[],
        total: res.total,
        page: res.page,
        pageSize: res.pageSize,
    };
};

const getContentDetail = async <T>(id: string) => {
    const res = await fetchAPI<{ post: Record<string, any>; media: Record<string, any>[] }>(`/api/admin/content-posts/${id}`);
    return mapContentPost(res.post, res.media) as T;
};

const saveContent = async <T extends Partial<Record<string, any>>>(method: 'POST' | 'PUT', contentType: ContentType, data: T, id?: string) =>
    fetchAPI(`/api/admin/content-posts`, {
        method,
        body: JSON.stringify({
            ...data,
            id,
            type: contentType === 'publication' ? data.type || 'article' : CONTENT_TYPE_QUERY[contentType],
        }),
    });

const deleteContent = async (id: string) =>
    fetchAPI(`/api/admin/content-posts/${id}`, {
        method: 'DELETE',
    });

export const adminApi = {
    getNews: (params?: { page?: number; pageSize?: number; search?: string }) => getContentList<NewsPost>('news', params),
    getNewsDetail: (id: string) => getContentDetail<NewsPost>(id),
    createNews: (data: Partial<NewsPost>) => saveContent('POST', 'news', data),
    updateNews: (id: string, data: Partial<NewsPost>) => saveContent('PUT', 'news', data, id),
    deleteNews: deleteContent,

    getPublications: (params?: { page?: number; pageSize?: number; type?: string; search?: string }) =>
        getContentList<Publication>('publication', params),
    getPublicationDetail: (id: string) => getContentDetail<Publication>(id),
    createPublication: (data: Partial<Publication>) => saveContent('POST', 'publication', data),
    updatePublication: (id: string, data: Partial<Publication>) => saveContent('PUT', 'publication', data, id),
    deletePublication: deleteContent,

    getAchievements: async (params?: { page?: number; pageSize?: number; level?: string; search?: string }) => {
        const response = await getContentList<Achievement>('achievement', params);
        const items = params?.level
            ? response.items.filter((item) => item.eventLevel === params.level)
            : response.items;

        return {
            ...response,
            items,
            total: items.length,
        };
    },
    getAchievementDetail: (id: string) => getContentDetail<Achievement>(id),
    createAchievement: (data: Partial<Achievement>) => saveContent('POST', 'achievement', data),
    updateAchievement: (id: string, data: Partial<Achievement>) => saveContent('PUT', 'achievement', data, id),
    deleteAchievement: deleteContent,

    getGalleries: (params?: { page?: number; pageSize?: number; search?: string }) => getContentList<Gallery>('gallery', params),
    getGalleryDetail: (id: string) => getContentDetail<Gallery>(id),
    createGallery: (data: Partial<Gallery>) => saveContent('POST', 'gallery', data),
    updateGallery: (id: string, data: Partial<Gallery>) => saveContent('PUT', 'gallery', data, id),
    deleteGallery: deleteContent,

    getDownloads: (params?: { page?: number; pageSize?: number; search?: string }) => getContentList<Download>('download', params),
    getDownloadDetail: (id: string) => getContentDetail<Download>(id),
    createDownload: (data: Partial<Download>) => saveContent('POST', 'download', data),
    updateDownload: (id: string, data: Partial<Download>) => saveContent('PUT', 'download', data, id),
    deleteDownload: deleteContent,

    getSiteSettings: async () => mapAdminSiteSettings(await fetchAPI<Record<string, unknown> | null>('/api/admin/site-settings')),
    updateSiteSettings: async (data: Partial<AdminSiteSettings>) =>
        mapAdminSiteSettings(
            await fetchAPI<Record<string, unknown>>('/api/admin/site-settings', {
                method: 'PUT',
                body: JSON.stringify(toAdminSiteSettingsPayload(data)),
            })
        ),

    getPpdbRegistrations: async () => {
        const response = await fetchAPI<unknown[]>('/api/admin/ppdb-registrations');
        return Array.isArray(response) ? response.map(mapPpdbAdminListItem) : [];
    },
    getPpdbRegistrationDetail: async (id: string) => mapPpdbAdminDetail(await fetchAPI<Record<string, unknown>>(`/api/admin/ppdb-registrations/${id}`)),
    updatePpdbRegistration: (id: string, data: { status: PPDBAdminStatus; pesan: string; sendNotification: boolean }) =>
        fetchAPI<{ hasSubscription?: boolean; error?: string }>(`/api/admin/ppdb-registrations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    deletePpdbRegistration: (id: string) =>
        fetchAPI(`/api/admin/ppdb-registrations/${id}`, {
            method: 'DELETE',
        }),

    getPpdbWaves: async () => {
        const response = await fetchAPI<unknown[]>('/api/admin/ppdb-waves');
        return Array.isArray(response) ? response.map(mapPpdbWave) : [];
    },
    createPpdbWave: (data: PPDBWaveFormValue) =>
        fetchAPI<PPDBWave>('/api/admin/ppdb-waves', {
            method: 'POST',
            body: JSON.stringify({
                name: data.name,
                startDate: data.startDate,
                endDate: data.endDate,
                quota: data.quota === '' ? null : Number(data.quota),
                isActive: data.isActive,
            }),
        }),
    updatePpdbWave: (id: string, data: PPDBWaveFormValue) =>
        fetchAPI<PPDBWave>(`/api/admin/ppdb-waves/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                name: data.name,
                startDate: data.startDate,
                endDate: data.endDate,
                quota: data.quota === '' ? null : Number(data.quota),
                isActive: data.isActive,
            }),
        }),
    deletePpdbWave: (id: string) =>
        fetchAPI(`/api/admin/ppdb-waves/${id}`, {
            method: 'DELETE',
        }),

    getPpdbNotifications: async () => {
        const response = await fetchAPI<unknown[]>('/api/admin/ppdb-notifications');
        return Array.isArray(response) ? response.map(mapPpdbNotification) : [];
    },
    createPpdbNotification: (data: PPDBNotificationFormValue) =>
        fetchAPI<PPDBNotification>('/api/admin/ppdb-notifications', {
            method: 'POST',
            body: JSON.stringify({
                title: data.title,
                message: data.message,
                ...(data.target === 'registration' ? { registrationId: data.registrationId } : { waveId: data.waveId }),
            }),
        }),
    deletePpdbNotification: (id: string) =>
        fetchAPI(`/api/admin/ppdb-notifications/${id}`, {
            method: 'DELETE',
        }),

    getPpdbSubscribers: async () => {
        const response = await fetchAPI<unknown[]>('/api/admin/ppdb-subscribers');
        return Array.isArray(response) ? response.map(mapPpdbSubscriber) : [];
    },

    getPpdbBrochures: async () => {
        const response = await fetchAPI<unknown[]>('/api/admin/ppdb-brochures');
        return Array.isArray(response) ? response.map(mapPpdbBrochure) : [];
    },
    createPpdbBrochure: (data: PPDBBrochureFormValue) =>
        fetchAPI<PPDBBrochureItem>('/api/admin/ppdb-brochures', {
            method: 'POST',
            body: JSON.stringify({
                waveId: data.waveId,
                mediaUrl: data.mediaUrl,
                caption: data.caption,
                displayOrder: Number(data.displayOrder) || 0,
                isMain: data.isMain,
            }),
        }),
    updatePpdbBrochure: (id: string, data: PPDBBrochureFormValue) =>
        fetchAPI<PPDBBrochureItem>(`/api/admin/ppdb-brochures/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                waveId: data.waveId,
                mediaUrl: data.mediaUrl,
                caption: data.caption,
                displayOrder: Number(data.displayOrder) || 0,
                isMain: data.isMain,
            }),
        }),
    deletePpdbBrochure: (id: string) =>
        fetchAPI(`/api/admin/ppdb-brochures/${id}`, {
            method: 'DELETE',
        }),

    getExtracurriculars: () => fetchAPI<Extracurricular[]>('/api/admin/extracurriculars'),
    createExtracurricular: (data: Partial<Extracurricular>) => 
        fetchAPI<Extracurricular>('/api/admin/extracurriculars', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    updateExtracurricular: (id: string | number, data: Partial<Extracurricular>) =>
        fetchAPI<Extracurricular>(`/api/admin/extracurriculars/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    deleteExtracurricular: (id: string | number) =>
        fetchAPI(`/api/admin/extracurriculars/${id}`, {
            method: 'DELETE',
        }),

    getCharacterPrograms: () => fetchAPI<CharacterProgram[]>('/api/admin/character-programs'),
    createCharacterProgram: (data: Partial<CharacterProgram>) =>
        fetchAPI<CharacterProgram>('/api/admin/character-programs', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    updateCharacterProgram: (id: string | number, data: Partial<CharacterProgram>) =>
        fetchAPI<CharacterProgram>(`/api/admin/character-programs/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    deleteCharacterProgram: (id: string | number) =>
        fetchAPI(`/api/admin/character-programs/${id}`, {
            method: 'DELETE',
        }),
};
