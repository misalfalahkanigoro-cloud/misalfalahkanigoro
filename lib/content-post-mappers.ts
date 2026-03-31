import type { Achievement, Download, DownloadFile, Gallery, MediaItem, NewsPost, Publication } from '@/lib/types';
import { mapMediaItem } from '@/lib/content-media';

type RawRecord = Record<string, any>;

const mapDownloadFiles = (files: RawRecord[] = []): DownloadFile[] =>
    files.map((file) => ({
        id: file.id,
        downloadId: file.download_id,
        fileName: file.file_name,
        fileType: file.file_type,
        fileSizeKb: file.file_size_kb,
        storageProvider: file.storage_provider,
        storageBucket: file.storage_bucket,
        storagePath: file.storage_path,
        publicUrl: file.public_url,
        displayOrder: file.display_order,
        createdAt: file.created_at,
    }));

const resolveMedia = (mediaRows: RawRecord[] = []): MediaItem[] =>
    mediaRows.map((item) => mapMediaItem(item as Record<string, any>));

const resolveCoverUrl = (raw: RawRecord, media: MediaItem[]) =>
    raw.coverUrl || media.find((item) => item.isMain)?.mediaUrl || media[0]?.mediaUrl || null;

export const inferContentType = (raw: RawRecord): 'news' | 'publication' | 'achievement' | 'gallery' | 'download' => {
    if (raw.contentType) return raw.contentType;
    if (Object.prototype.hasOwnProperty.call(raw, 'author_name') || Object.prototype.hasOwnProperty.call(raw, 'view_count')) {
        return 'news';
    }
    if (Object.prototype.hasOwnProperty.call(raw, 'event_name') || Object.prototype.hasOwnProperty.call(raw, 'achieved_at')) {
        return 'achievement';
    }
    if (Object.prototype.hasOwnProperty.call(raw, 'event_date')) {
        return 'gallery';
    }
    if (Object.prototype.hasOwnProperty.call(raw, 'download_count') || Object.prototype.hasOwnProperty.call(raw, 'file_url')) {
        return 'download';
    }
    return 'publication';
};

export const mapContentPost = (raw: RawRecord, mediaRows: RawRecord[] = []) => {
    const media = resolveMedia(mediaRows);
    const coverUrl = resolveCoverUrl(raw, media);
    const contentType = inferContentType(raw);

    if (contentType === 'news') {
        return {
            id: raw.id,
            title: raw.title,
            slug: raw.slug,
            excerpt: raw.excerpt,
            content: raw.content,
            authorName: raw.author_name || 'Admin',
            publishedAt: raw.published_at || raw.created_at,
            is_published: Boolean(raw.is_published),
            isPinned: Boolean(raw.is_pinned),
            viewCount: raw.view_count || 0,
            createdAt: raw.created_at,
            updatedAt: raw.updated_at,
            media,
            coverUrl,
        } satisfies NewsPost;
    }

    if (contentType === 'achievement') {
        return {
            id: raw.id,
            title: raw.title,
            slug: raw.slug,
            content: raw.content || '',
            eventName: raw.event_name,
            eventLevel: raw.event_level,
            rank: raw.rank,
            description: raw.description,
            achievedAt: raw.achieved_at,
            is_published: Boolean(raw.is_published),
            isPinned: Boolean(raw.is_pinned),
            createdAt: raw.created_at,
            updatedAt: raw.updated_at,
            media,
            coverUrl,
        } satisfies Achievement;
    }

    if (contentType === 'gallery') {
        return {
            id: raw.id,
            title: raw.title,
            slug: raw.slug,
            description: raw.description,
            eventDate: raw.event_date,
            publishedAt: raw.created_at,
            is_published: Boolean(raw.is_published),
            isPinned: Boolean(raw.is_pinned),
            createdAt: raw.created_at,
            updatedAt: raw.updated_at,
            media,
            coverUrl,
        } satisfies Gallery;
    }

    if (contentType === 'download') {
        return {
            id: raw.id,
            title: raw.title,
            slug: raw.slug,
            description: raw.description,
            fileUrl: raw.file_url,
            fileStorageProvider: raw.file_storage_provider,
            fileStorageBucket: raw.file_storage_bucket,
            fileStoragePath: raw.file_storage_path,
            fileSizeKb: raw.file_size_kb,
            fileType: raw.file_type,
            downloadCount: raw.download_count || 0,
            is_published: Boolean(raw.is_published),
            isPinned: Boolean(raw.is_pinned),
            createdAt: raw.created_at,
            updatedAt: raw.updated_at,
            media,
            coverUrl,
            files: mapDownloadFiles(raw.download_files || []),
        } satisfies Download;
    }

    return {
        id: raw.id,
        title: raw.title,
        slug: raw.slug,
        type: raw.type || 'article',
        excerpt: raw.description,
        description: raw.description,
        content: raw.content,
        authorName: raw.author_name || 'Admin',
        publishedAt: raw.published_at || raw.created_at,
        is_published: Boolean(raw.is_published),
        isPinned: Boolean(raw.is_pinned),
        createdAt: raw.created_at,
        updatedAt: raw.updated_at,
        media,
        coverUrl,
    } satisfies Publication;
};
