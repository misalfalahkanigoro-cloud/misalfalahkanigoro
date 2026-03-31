import { library_file_kind, library_visibility } from '@prisma/client';

const toInt = (value: unknown): number | null => {
    const parsed = Number.parseInt(String(value ?? ''), 10);
    if (!Number.isFinite(parsed)) return null;
    return parsed;
};

const toBool = (value: unknown, fallback = true) => {
    if (typeof value === 'boolean') return value;
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return fallback;
};

const trimText = (value: unknown, max = 255) => {
    const text = String(value ?? '').trim();
    if (!text) return '';
    return text.slice(0, max);
};

const trimNullable = (value: unknown, max = 1000) => {
    if (value === null || value === undefined) return null;
    const text = String(value).trim().slice(0, max);
    return text || null;
};

const parseSlug = (value: unknown) => {
    const text = trimText(value, 180).toLowerCase();
    return text
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

export const validateLookupPayload = (
    payload: Record<string, unknown>,
    options: { allowFileKind?: boolean } = {}
) => {
    const name = trimText(payload.name, 120);
    const slug = parseSlug(payload.slug || name);
    if (!name) {
        return { ok: false as const, error: 'Nama wajib diisi.' };
    }
    if (!slug) {
        return { ok: false as const, error: 'Slug tidak valid.' };
    }

    const fileKindRaw = trimText(payload.fileKind || payload.file_kind, 40).toUpperCase();
    const fileKind = Object.values(library_file_kind).includes(fileKindRaw as library_file_kind)
        ? (fileKindRaw as library_file_kind)
        : library_file_kind.OTHER;

    return {
        ok: true as const,
        data: {
            name,
            slug,
            icon: trimNullable(payload.icon, 120),
            description: trimNullable(payload.description, 500),
            file_kind: options.allowFileKind ? fileKind : undefined,
            display_order: toInt(payload.displayOrder ?? payload.display_order) ?? 0,
            is_active: toBool(payload.isActive ?? payload.is_active, true),
        },
    };
};

export const validateLibraryMediaPayload = (
    payload: Record<string, unknown>,
    mode: 'create' | 'update'
) => {
    const title = trimText(payload.title, 220);
    const levelId = toInt(payload.levelId ?? payload.level_id);
    const categoryId = toInt(payload.categoryId ?? payload.category_id);
    const mediaTypeId = toInt(payload.mediaTypeId ?? payload.media_type_id);
    const visibilityRaw = trimText(payload.visibility, 20).toUpperCase();
    const visibility = Object.values(library_visibility).includes(visibilityRaw as library_visibility)
        ? (visibilityRaw as library_visibility)
        : library_visibility.PUBLIC;

    if (mode === 'create') {
        if (!title) return { ok: false as const, error: 'Judul wajib diisi.' };
        if (!levelId || !categoryId || !mediaTypeId) {
            return {
                ok: false as const,
                error: 'levelId, categoryId, dan mediaTypeId wajib diisi.',
            };
        }
        if (!trimText(payload.fileUrl ?? payload.file_url, 2048)) {
            return { ok: false as const, error: 'fileUrl wajib diisi.' };
        }
    }

    const fileSizeRaw = payload.fileSizeBytes ?? payload.file_size_bytes;
    const fileSize = fileSizeRaw === null || fileSizeRaw === undefined || fileSizeRaw === ''
        ? null
        : Number(fileSizeRaw);

    return {
        ok: true as const,
        data: {
            title: title || undefined,
            description: trimNullable(payload.description, 2000),
            levelId: levelId ?? undefined,
            categoryId: categoryId ?? undefined,
            mediaTypeId: mediaTypeId ?? undefined,
            visibility,
            isActive: toBool(payload.isActive ?? payload.is_active, true),
            isFeatured: toBool(payload.isFeatured ?? payload.is_featured, false),
            fileUrl: trimNullable(payload.fileUrl ?? payload.file_url, 2048),
            fileName: trimNullable(payload.fileName ?? payload.file_name, 255),
            fileMimeType: trimNullable(payload.fileMimeType ?? payload.file_mime_type, 120),
            fileExtension: trimNullable(payload.fileExtension ?? payload.file_extension, 20),
            fileSizeBytes: Number.isFinite(fileSize as number) ? fileSize : null,
            storageProvider: trimNullable(payload.storageProvider ?? payload.storage_provider, 20) || 'r2',
            storageBucket: trimNullable(payload.storageBucket ?? payload.storage_bucket, 120),
            storagePath: trimNullable(payload.storagePath ?? payload.storage_path, 1024),
            thumbnailProvider: trimNullable(payload.thumbnailProvider ?? payload.thumbnail_provider, 20) || 'r2',
            thumbnailBucket: trimNullable(payload.thumbnailBucket ?? payload.thumbnail_bucket, 120),
            thumbnailPath: trimNullable(payload.thumbnailPath ?? payload.thumbnail_path, 1024),
            thumbnailUrl: trimNullable(payload.thumbnailUrl ?? payload.thumbnail_url, 2048),
            sourceUrl: trimNullable(payload.sourceUrl ?? payload.source_url, 2048),
            sourceLabel: trimNullable(payload.sourceLabel ?? payload.source_label, 255),
            tags: payload.tags ?? [],
            metadata: payload.metadata ?? {},
            publishedAt: payload.publishedAt ?? payload.published_at ?? null,
        },
    };
};

