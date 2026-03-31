import type { Prisma } from '@prisma/client';
import { sanitizeEmbedHtml, sanitizePlainText, sanitizeUrl } from '@/lib/rich-text';

export type ContentEntityType = 'news' | 'publication' | 'achievement' | 'gallery' | 'download' | 'academic' | 'ppdb';
export type ContentMediaType = 'image' | 'video' | 'youtube_embed';

type GenericMediaInput = {
    mediaUrl?: string | null;
    url?: string | null;
    embedHtml?: string | null;
    mediaType?: string | null;
    storageProvider?: string | null;
    storageBucket?: string | null;
    storagePath?: string | null;
    thumbnailUrl?: string | null;
    caption?: string | null;
    isMain?: boolean;
    displayOrder?: number | null;
};

export const normalizeMediaType = (value: unknown): ContentMediaType => {
    const normalized = String(value || '')
        .trim()
        .toLowerCase();

    if (normalized === 'video') return 'video';
    if (normalized === 'youtube_embed') return 'youtube_embed';
    return 'image';
};

export const mapMediaItem = (item: Record<string, any>) => ({
    id: item.id,
    mediaUrl: item.media_url,
    mediaType: item.media_type,
    storageProvider: item.storage_provider,
    storageBucket: item.storage_bucket,
    storagePath: item.storage_path,
    thumbnailUrl: item.thumbnail_url,
    caption: item.caption,
    isMain: Boolean(item.is_main),
    displayOrder: item.display_order,
    createdAt: item.created_at,
    entityType: item.entity_type,
    entityId: item.entity_id,
});

export const groupMediaByEntity = (items: Array<Record<string, any>>) =>
    items.reduce<Record<string, Array<Record<string, any>>>>((acc, item) => {
        if (!acc[item.entity_id]) acc[item.entity_id] = [];
        acc[item.entity_id].push(item);
        return acc;
    }, {});

export const buildMediaPayload = (params: {
    entityId: string;
    entityType: ContentEntityType;
    mediaInput: unknown;
    coverUrlInput?: unknown;
}): Prisma.media_itemsCreateManyInput[] => {
    const { entityId, entityType, mediaInput, coverUrlInput } = params;

    const rows: Prisma.media_itemsCreateManyInput[] = [];
    const seenUrls = new Set<string>();
    const coverUrl = sanitizeUrl(coverUrlInput) || '';

    if (coverUrl) {
        rows.push({
            entity_id: entityId,
            entity_type: entityType,
            media_type: 'image',
            media_url: coverUrl,
            thumbnail_url: null,
            caption: null,
            is_main: true,
            display_order: 0,
        });
        seenUrls.add(coverUrl);
    }

    if (Array.isArray(mediaInput)) {
        mediaInput.forEach((rawItem, index) => {
            if (!rawItem || typeof rawItem !== 'object') return;
            const mediaItem = rawItem as GenericMediaInput;
            const mediaType = normalizeMediaType(mediaItem.mediaType);
            const mediaUrl =
                mediaType === 'youtube_embed'
                    ? sanitizeEmbedHtml(mediaItem.mediaUrl || mediaItem.url || mediaItem.embedHtml)
                    : sanitizeUrl(mediaItem.mediaUrl || mediaItem.url || mediaItem.embedHtml);
            if (!mediaUrl || seenUrls.has(mediaUrl)) return;

            rows.push({
                entity_id: entityId,
                entity_type: entityType,
                media_type: mediaType,
                media_url: mediaUrl,
                storage_provider: mediaItem.storageProvider || null,
                storage_bucket: mediaItem.storageBucket || null,
                storage_path: mediaItem.storagePath || null,
                thumbnail_url: sanitizeUrl(mediaItem.thumbnailUrl) || null,
                caption: sanitizePlainText(mediaItem.caption, 300) || null,
                is_main: !coverUrl && Boolean(mediaItem.isMain),
                display_order:
                    typeof mediaItem.displayOrder === 'number'
                        ? mediaItem.displayOrder
                        : coverUrl
                          ? index + 1
                          : index,
            });

            seenUrls.add(mediaUrl);
        });
    }

    if (rows.length > 0 && !rows.some((item) => item.is_main)) {
        rows[0].is_main = true;
    }

    return rows.map((row, index) => ({
        ...row,
        display_order: row.is_main ? 0 : Math.max(1, index),
    }));
};
