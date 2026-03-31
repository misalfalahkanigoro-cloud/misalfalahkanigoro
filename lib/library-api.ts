import type { Prisma } from '@prisma/client';

type AnyRecord = Record<string, any>;

export const parseInteger = (value: string | null | undefined) => {
    if (value === null || value === undefined || value === '') return undefined;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
};

export const parseBooleanParam = (value: string | null | undefined) => {
    if (value === null || value === undefined || value === '') return undefined;
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') return true;
    if (normalized === 'false' || normalized === '0') return false;
    return undefined;
};

export const toSafeJsonNumber = (value: bigint | number | null | undefined) => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number') return value;
    if (value <= BigInt(Number.MAX_SAFE_INTEGER) && value >= BigInt(Number.MIN_SAFE_INTEGER)) {
        return Number(value);
    }
    return value.toString();
};

const parseJsonInput = (value: unknown, fallback: unknown) => {
    if (value === undefined) return fallback;
    if (value === null) return null;
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return fallback;
        try {
            return JSON.parse(trimmed);
        } catch {
            return fallback;
        }
    }
    return value;
};

export const mapLibraryLookup = (row: AnyRecord) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    icon: row.icon ?? null,
    description: row.description ?? null,
    fileKind: row.file_kind ?? null,
    displayOrder: row.display_order ?? 0,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

export const mapLibraryMedia = (row: AnyRecord) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    categoryId: row.category_id,
    mediaTypeId: row.media_type_id,
    levelId: row.level_id,
    visibility: row.visibility,
    isFeatured: Boolean(row.is_featured),
    isActive: Boolean(row.is_active),
    fileName: row.file_name,
    fileMimeType: row.file_mime_type,
    fileExtension: row.file_extension,
    fileSizeBytes: toSafeJsonNumber(row.file_size_bytes),
    storageProvider: row.storage_provider,
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    fileUrl: row.file_url,
    thumbnailProvider: row.thumbnail_provider,
    thumbnailBucket: row.thumbnail_bucket,
    thumbnailPath: row.thumbnail_path,
    thumbnailUrl: row.thumbnail_url,
    sourceUrl: row.source_url,
    sourceLabel: row.source_label,
    tags: row.tags ?? [],
    metadata: row.metadata ?? {},
    viewCount: row.view_count ?? 0,
    downloadCount: row.download_count ?? 0,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    level: row.library_levels ? mapLibraryLookup(row.library_levels) : null,
    category: row.library_categories ? mapLibraryLookup(row.library_categories) : null,
    mediaType: row.library_media_types ? mapLibraryLookup(row.library_media_types) : null,
});

export const mapLibraryMediaPayload = (payload: AnyRecord, existing?: AnyRecord): Prisma.library_mediaUncheckedCreateInput => {
    const base = existing || {};
    const get = (camel: string, snake: string) => {
        if (Object.prototype.hasOwnProperty.call(payload, camel)) {
            const value = payload[camel];
            if (value !== undefined) return value;
        }
        if (Object.prototype.hasOwnProperty.call(payload, snake)) {
            const value = payload[snake];
            if (value !== undefined) return value;
        }
        return base[snake];
    };

    const fileSizeRaw = get('fileSizeBytes', 'file_size_bytes');
    const parsedFileSize =
        fileSizeRaw === null || fileSizeRaw === undefined || fileSizeRaw === ''
            ? null
            : typeof fileSizeRaw === 'bigint'
              ? fileSizeRaw
              : BigInt(fileSizeRaw);

    return {
        title: get('title', 'title') || '',
        description: get('description', 'description') || null,
        category_id: Number(get('categoryId', 'category_id')),
        media_type_id: Number(get('mediaTypeId', 'media_type_id')),
        level_id: Number(get('levelId', 'level_id')),
        visibility: get('visibility', 'visibility') || 'PUBLIC',
        is_featured: Boolean(get('isFeatured', 'is_featured')),
        is_active: typeof get('isActive', 'is_active') === 'boolean' ? Boolean(get('isActive', 'is_active')) : true,
        file_name: get('fileName', 'file_name') || null,
        file_mime_type: get('fileMimeType', 'file_mime_type') || null,
        file_extension: get('fileExtension', 'file_extension') || null,
        file_size_bytes: parsedFileSize,
        storage_provider: get('storageProvider', 'storage_provider') || 'r2',
        storage_bucket: get('storageBucket', 'storage_bucket') || null,
        storage_path: get('storagePath', 'storage_path') || null,
        file_url: get('fileUrl', 'file_url') || '',
        thumbnail_provider: get('thumbnailProvider', 'thumbnail_provider') || 'r2',
        thumbnail_bucket: get('thumbnailBucket', 'thumbnail_bucket') || null,
        thumbnail_path: get('thumbnailPath', 'thumbnail_path') || null,
        thumbnail_url: get('thumbnailUrl', 'thumbnail_url') || null,
        source_url: get('sourceUrl', 'source_url') || null,
        source_label: get('sourceLabel', 'source_label') || null,
        tags: parseJsonInput(get('tags', 'tags'), []),
        metadata: parseJsonInput(get('metadata', 'metadata'), {}),
        view_count: Number(get('viewCount', 'view_count') || 0),
        download_count: Number(get('downloadCount', 'download_count') || 0),
        published_at: get('publishedAt', 'published_at') ? new Date(get('publishedAt', 'published_at')) : new Date(),
    };
};
