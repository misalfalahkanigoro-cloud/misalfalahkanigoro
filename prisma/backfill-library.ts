// @ts-nocheck
import { PrismaClient, library_file_kind } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const loadEnvFromDotEnv = () => {
    const envPath = path.resolve(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) return;
    const raw = fs.readFileSync(envPath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const sep = trimmed.indexOf('=');
        if (sep <= 0) continue;
        const key = trimmed.slice(0, sep).trim();
        if (process.env[key]) continue;
        let value = trimmed.slice(sep + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        process.env[key] = value;
    }
};

loadEnvFromDotEnv();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEFAULT_LEVELS = [{ name: 'Umum', slug: 'umum', order: 0 }];
const DEFAULT_CATEGORIES = [
    { name: 'Berita', slug: 'berita', order: 1 },
    { name: 'Publikasi', slug: 'publikasi', order: 2 },
    { name: 'Prestasi', slug: 'prestasi', order: 3 },
    { name: 'Galeri', slug: 'galeri', order: 4 },
    { name: 'Download', slug: 'download', order: 5 },
];
const DEFAULT_MEDIA_TYPES: Array<{ name: string; slug: string; fileKind: library_file_kind; order: number }> = [
    { name: 'Gambar', slug: 'image', fileKind: 'IMAGE', order: 1 },
    { name: 'Video', slug: 'video', fileKind: 'VIDEO', order: 2 },
    { name: 'Audio', slug: 'audio', fileKind: 'AUDIO', order: 3 },
    { name: 'PDF', slug: 'pdf', fileKind: 'PDF', order: 4 },
    { name: 'Dokumen', slug: 'document', fileKind: 'DOCUMENT', order: 5 },
    { name: 'Spreadsheet', slug: 'spreadsheet', fileKind: 'SPREADSHEET', order: 6 },
    { name: 'Presentasi', slug: 'presentation', fileKind: 'PRESENTATION', order: 7 },
    { name: 'Arsip', slug: 'archive', fileKind: 'ARCHIVE', order: 8 },
    { name: 'Lainnya', slug: 'other', fileKind: 'OTHER', order: 9 },
];

const getExtension = (nameOrUrl: string | null | undefined) => {
    const raw = String(nameOrUrl || '').trim();
    if (!raw) return '';
    const clean = raw.split('?')[0].split('#')[0];
    const part = clean.includes('.') ? clean.split('.').pop() : '';
    return (part || '').toLowerCase();
};

const inferFileKind = (params: {
    mime?: string | null;
    ext?: string | null;
    mediaType?: string | null;
}): library_file_kind => {
    const mime = String(params.mime || '').toLowerCase();
    const ext = String(params.ext || '').toLowerCase();
    const mediaType = String(params.mediaType || '').toLowerCase();

    if (mediaType === 'video' || mime.startsWith('video/')) return 'VIDEO';
    if (mediaType === 'audio' || mime.startsWith('audio/')) return 'AUDIO';
    if (mediaType === 'image' || mime.startsWith('image/')) return 'IMAGE';
    if (mime === 'application/pdf' || ext === 'pdf') return 'PDF';
    if (['doc', 'docx', 'odt', 'rtf'].includes(ext)) return 'DOCUMENT';
    if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) return 'SPREADSHEET';
    if (['ppt', 'pptx', 'odp'].includes(ext)) return 'PRESENTATION';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'ARCHIVE';
    return 'OTHER';
};

const fileKindToSlug = (kind: library_file_kind) => {
    const found = DEFAULT_MEDIA_TYPES.find((item) => item.fileKind === kind);
    return found?.slug || 'other';
};

const getLegacyFingerprint = (metadata: unknown): string | null => {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null;
    const value = (metadata as Record<string, unknown>).legacyFingerprint;
    return typeof value === 'string' && value.trim() ? value.trim() : null;
};

const toStorageKey = (bucket: string | null | undefined, path: string | null | undefined) =>
    bucket && path ? `${bucket}::${path}` : null;

async function ensureLookups() {
    for (const item of DEFAULT_LEVELS) {
        await prisma.library_levels.upsert({
            where: { slug: item.slug },
            create: { name: item.name, slug: item.slug, display_order: item.order, is_active: true },
            update: { name: item.name, display_order: item.order, is_active: true, updated_at: new Date() },
        });
    }

    for (const item of DEFAULT_CATEGORIES) {
        await prisma.library_categories.upsert({
            where: { slug: item.slug },
            create: { name: item.name, slug: item.slug, display_order: item.order, is_active: true },
            update: { name: item.name, display_order: item.order, is_active: true, updated_at: new Date() },
        });
    }

    for (const item of DEFAULT_MEDIA_TYPES) {
        await prisma.library_media_types.upsert({
            where: { slug: item.slug },
            create: {
                name: item.name,
                slug: item.slug,
                file_kind: item.fileKind,
                display_order: item.order,
                is_active: true,
            },
            update: {
                name: item.name,
                file_kind: item.fileKind,
                display_order: item.order,
                is_active: true,
                updated_at: new Date(),
            },
        });
    }
}

async function main() {
    const beforeLibraryCount = await prisma.library_media.count();
    const beforeDownloadFiles = await prisma.download_files.count();
    const beforeDownloadsLegacy = await prisma.downloads.count({ where: { file_url: { not: null } } });
    const beforeMediaItems = await prisma.media_items.count({
        where: { entity_type: { in: ['news', 'publication', 'achievement', 'gallery', 'download'] } },
    });

    await ensureLookups();

    const [levelUmum, categoryRows, mediaTypeRows] = await Promise.all([
        prisma.library_levels.findUniqueOrThrow({ where: { slug: 'umum' } }),
        prisma.library_categories.findMany({}),
        prisma.library_media_types.findMany({}),
    ]);
    const categoryBySlug = new Map(categoryRows.map((row) => [row.slug, row.id]));
    const mediaTypeBySlug = new Map(mediaTypeRows.map((row) => [row.slug, row.id]));

    const existingLibraryRows = await prisma.library_media.findMany({
        select: { metadata: true, storage_bucket: true, storage_path: true },
    });
    const existingFingerprint = new Set(existingLibraryRows.map((row) => getLegacyFingerprint(row.metadata)).filter(Boolean) as string[]);
    const existingStorage = new Set(
        existingLibraryRows.map((row) => toStorageKey(row.storage_bucket, row.storage_path)).filter(Boolean) as string[]
    );

    let createdFromDownloadFiles = 0;
    let createdFromLegacyDownloads = 0;
    let createdFromMediaItems = 0;

    const downloads = await prisma.downloads.findMany({
        select: { id: true, title: true, slug: true, description: true, is_published: true, is_pinned: true, created_at: true, file_url: true, file_type: true, file_size_kb: true, file_storage_provider: true, file_storage_bucket: true, file_storage_path: true },
    });
    const downloadById = new Map(downloads.map((row) => [row.id, row]));

    const downloadCoverRows = await prisma.media_items.findMany({
        where: { entity_type: 'download' },
        orderBy: [{ is_main: 'desc' }, { display_order: 'asc' }],
        select: { entity_id: true, media_url: true, storage_provider: true, storage_bucket: true, storage_path: true },
    });
    const coverByDownloadId = new Map<string, (typeof downloadCoverRows)[number]>();
    for (const row of downloadCoverRows) {
        if (!coverByDownloadId.has(row.entity_id)) coverByDownloadId.set(row.entity_id, row);
    }

    const downloadFiles = await prisma.download_files.findMany();
    for (const file of downloadFiles) {
        const fp = `download_files:${file.id}`;
        const storageKey = toStorageKey(file.storage_bucket, file.storage_path);
        if (existingFingerprint.has(fp) || (storageKey && existingStorage.has(storageKey))) continue;
        const parent = downloadById.get(file.download_id);
        const cover = parent ? coverByDownloadId.get(parent.id) : null;
        const ext = getExtension(file.file_name || file.public_url);
        const kind = inferFileKind({ mime: file.file_type, ext });
        const mediaTypeId = mediaTypeBySlug.get(fileKindToSlug(kind)) || mediaTypeBySlug.get('other');
        if (!mediaTypeId) continue;

        await prisma.library_media.create({
            data: {
                title: parent ? `${parent.title} - ${file.file_name}` : file.file_name,
                description: parent?.description || null,
                level_id: levelUmum.id,
                category_id: categoryBySlug.get('download')!,
                media_type_id: mediaTypeId,
                visibility: parent?.is_published === false ? 'PRIVATE' : 'PUBLIC',
                is_featured: Boolean(parent?.is_pinned),
                is_active: parent?.is_published === false ? false : true,
                file_name: file.file_name,
                file_mime_type: file.file_type,
                file_extension: ext || null,
                file_size_bytes: file.file_size_kb ? BigInt(file.file_size_kb * 1024) : null,
                storage_provider: file.storage_provider || 'r2',
                storage_bucket: file.storage_bucket,
                storage_path: file.storage_path,
                file_url: file.public_url,
                thumbnail_provider: cover?.storage_provider || null,
                thumbnail_bucket: cover?.storage_bucket || null,
                thumbnail_path: cover?.storage_path || null,
                thumbnail_url: cover?.media_url || null,
                source_url: parent?.slug ? `/download/${parent.slug}` : null,
                source_label: parent?.title || null,
                tags: ['legacy', 'download'],
                metadata: { legacyFingerprint: fp, sourceTable: 'download_files', sourceId: file.id },
                published_at: parent?.created_at || new Date(),
            },
        });
        createdFromDownloadFiles += 1;
        existingFingerprint.add(fp);
        if (storageKey) existingStorage.add(storageKey);
    }

    for (const row of downloads) {
        if (!row.file_url) continue;
        const fp = `downloads:file:${row.id}`;
        const storageKey = toStorageKey(row.file_storage_bucket, row.file_storage_path);
        if (existingFingerprint.has(fp) || (storageKey && existingStorage.has(storageKey))) continue;
        const ext = getExtension(row.file_storage_path || row.file_url);
        const kind = inferFileKind({ mime: row.file_type, ext });
        const mediaTypeId = mediaTypeBySlug.get(fileKindToSlug(kind)) || mediaTypeBySlug.get('other');
        if (!mediaTypeId) continue;

        await prisma.library_media.create({
            data: {
                title: row.title,
                description: row.description || null,
                level_id: levelUmum.id,
                category_id: categoryBySlug.get('download')!,
                media_type_id: mediaTypeId,
                visibility: row.is_published === false ? 'PRIVATE' : 'PUBLIC',
                is_featured: Boolean(row.is_pinned),
                is_active: row.is_published === false ? false : true,
                file_name: row.file_storage_path?.split('/').pop() || row.title,
                file_mime_type: row.file_type || null,
                file_extension: ext || null,
                file_size_bytes: row.file_size_kb ? BigInt(row.file_size_kb * 1024) : null,
                storage_provider: row.file_storage_provider || 'r2',
                storage_bucket: row.file_storage_bucket,
                storage_path: row.file_storage_path,
                file_url: row.file_url,
                source_url: row.slug ? `/download/${row.slug}` : null,
                source_label: row.title,
                tags: ['legacy', 'download'],
                metadata: { legacyFingerprint: fp, sourceTable: 'downloads', sourceId: row.id },
                published_at: row.created_at || new Date(),
            },
        });
        createdFromLegacyDownloads += 1;
        existingFingerprint.add(fp);
        if (storageKey) existingStorage.add(storageKey);
    }

    const entityMap = {
        news: await prisma.news_posts.findMany({ select: { id: true, title: true, slug: true, excerpt: true, is_published: true, is_pinned: true, published_at: true, created_at: true } }),
        publication: await prisma.publications.findMany({ select: { id: true, title: true, slug: true, description: true, is_published: true, is_pinned: true, published_at: true, created_at: true } }),
        achievement: await prisma.achievements.findMany({ select: { id: true, title: true, slug: true, description: true, is_published: true, is_pinned: true, created_at: true } }),
        gallery: await prisma.galleries.findMany({ select: { id: true, title: true, slug: true, description: true, is_published: true, is_pinned: true, created_at: true } }),
        download: downloads,
    } as const;

    const parentByEntity = Object.fromEntries(
        Object.entries(entityMap).map(([key, rows]) => [key, new Map((rows as any[]).map((row) => [row.id, row]))])
    ) as Record<string, Map<string, any>>;

    const mediaRows = await prisma.media_items.findMany({
        where: { entity_type: { in: ['news', 'publication', 'achievement', 'gallery', 'download'] } },
    });
    for (const row of mediaRows) {
        const fp = `media_items:${row.id}`;
        const storageKey = toStorageKey(row.storage_bucket, row.storage_path);
        if (existingFingerprint.has(fp) || (storageKey && existingStorage.has(storageKey))) continue;
        const parent = parentByEntity[row.entity_type]?.get(row.entity_id);
        if (!parent || !row.media_url) continue;
        const categorySlug = row.entity_type === 'news' ? 'berita' : row.entity_type === 'publication' ? 'publikasi' : row.entity_type === 'achievement' ? 'prestasi' : row.entity_type === 'gallery' ? 'galeri' : 'download';
        const ext = getExtension(row.storage_path || row.media_url);
        const kind = inferFileKind({ ext, mediaType: row.media_type });
        const mediaTypeId = mediaTypeBySlug.get(fileKindToSlug(kind)) || mediaTypeBySlug.get('other');
        if (!mediaTypeId) continue;

        await prisma.library_media.create({
            data: {
                title: row.caption || parent.title,
                description: parent.excerpt || parent.description || null,
                level_id: levelUmum.id,
                category_id: categoryBySlug.get(categorySlug)!,
                media_type_id: mediaTypeId,
                visibility: parent.is_published === false ? 'PRIVATE' : 'PUBLIC',
                is_featured: Boolean(parent.is_pinned),
                is_active: parent.is_published === false ? false : true,
                file_name: row.storage_path?.split('/').pop() || `${parent.title}.${ext || 'bin'}`,
                file_mime_type: null,
                file_extension: ext || null,
                file_size_bytes: null,
                storage_provider: row.storage_provider || 'r2',
                storage_bucket: row.storage_bucket,
                storage_path: row.storage_path,
                file_url: row.media_url,
                thumbnail_provider: row.thumbnail_url ? row.storage_provider || 'r2' : null,
                thumbnail_bucket: row.thumbnail_url ? row.storage_bucket : null,
                thumbnail_path: row.thumbnail_url ? row.storage_path : null,
                thumbnail_url: row.thumbnail_url || null,
                source_url: parent.slug ? `/${categorySlug}/${parent.slug}` : null,
                source_label: parent.title,
                tags: ['legacy', row.entity_type],
                metadata: { legacyFingerprint: fp, sourceTable: 'media_items', sourceId: row.id, entityType: row.entity_type, entityId: row.entity_id },
                published_at: parent.published_at || parent.created_at || new Date(),
            },
        });
        createdFromMediaItems += 1;
        existingFingerprint.add(fp);
        if (storageKey) existingStorage.add(storageKey);
    }

    const afterLibraryCount = await prisma.library_media.count();
    console.log('=== BACKFILL LIBRARY ===');
    console.log(`Source download_files: ${beforeDownloadFiles}`);
    console.log(`Source downloads (legacy file_url): ${beforeDownloadsLegacy}`);
    console.log(`Source media_items (content): ${beforeMediaItems}`);
    console.log(`Library count before: ${beforeLibraryCount}`);
    console.log(`Inserted from download_files: ${createdFromDownloadFiles}`);
    console.log(`Inserted from legacy downloads: ${createdFromLegacyDownloads}`);
    console.log(`Inserted from media_items: ${createdFromMediaItems}`);
    console.log(`Library count after: ${afterLibraryCount}`);
}

main()
    .catch((error) => {
        console.error('Backfill failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
