import { DeleteObjectsCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

const DEFAULT_R2_REGION = process.env.R2_REGION || 'auto';

const normalizePath = (value: string) => value.replace(/^\/+/, '').replace(/\/+$/, '');

export const sanitizeStorageSegment = (value: string) =>
    value
        .trim()
        .replace(/[^a-zA-Z0-9._/-]/g, '-')
        .replace(/\/+/g, '/')
        .replace(/^-+|-+$/g, '');

export const buildStoragePath = (folder: string, fileName: string) => {
    const normalizedFolder = normalizePath(sanitizeStorageSegment(folder || 'uploads'));
    const normalizedName = sanitizeStorageSegment(fileName || 'file.bin') || 'file.bin';
    const timestamp = Date.now();
    const unique = randomUUID();
    return normalizePath(`${normalizedFolder}/${timestamp}-${unique}-${normalizedName}`);
};

const safeDecodeURIComponent = (value: string) => {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
};

const resolvePublikwebBucket = () =>
    (process.env.R2_BUCKET_PUBLIKWEB || process.env.R2_DEFAULT_BUCKET || process.env.R2_BUCKET_MEDIA || 'publikweb').trim();

export const resolveBucketName = (bucket: string | undefined | null, fallback = 'publikweb') => {
    const normalized = (bucket || fallback || process.env.R2_DEFAULT_BUCKET || 'publikweb').trim();
    if (normalized === 'downloads') {
        return process.env.R2_BUCKET_DOWNLOADS || 'downloads';
    }
    if (normalized === 'media') {
        return process.env.R2_BUCKET_MEDIA || 'media';
    }
    if (normalized === 'publikweb') {
        return resolvePublikwebBucket();
    }
    return normalized;
};

export const getPublicUrl = (bucket: string, path: string) => {
    const normalizedBucket = resolveBucketName(bucket);
    const normalizedPath = encodeURIComponent(normalizePath(path)).replace(/%2F/g, '/');
    const configuredBase = (process.env.R2_PUBLIC_BASE_URL || '').trim().replace(/\/+$/, '');

    if (configuredBase) {
        if (configuredBase.includes('{bucket}')) {
            return `${configuredBase.replace('{bucket}', normalizedBucket)}/${normalizedPath}`;
        }
        return `${configuredBase}/${normalizedBucket}/${normalizedPath}`;
    }

    const rawPath = normalizePath(path);
    return `/api/storage/public?bucket=${encodeURIComponent(normalizedBucket)}&path=${encodeURIComponent(rawPath)}`;
};

export const extractStorageIdentityFromUrl = (
    rawUrl: string | null | undefined
): { bucket?: string; path?: string } | null => {
    if (!rawUrl || typeof rawUrl !== 'string') return null;
    const trimmed = rawUrl.trim();
    if (!trimmed) return null;

    try {
        const parsed = new URL(trimmed, 'http://local');
        const segments = parsed.pathname
            .split('/')
            .filter(Boolean)
            .map((segment) => safeDecodeURIComponent(segment));

        if (parsed.pathname === '/api/storage/public') {
            const bucket = parsed.searchParams.get('bucket');
            const path = parsed.searchParams.get('path');
            if (bucket && path) {
                return {
                    bucket: resolveBucketName(bucket),
                    path: normalizePath(path),
                };
            }
        }

        const host = parsed.hostname.toLowerCase();
        if (host.endsWith('.r2.cloudflarestorage.com') && segments.length >= 2) {
            return {
                bucket: resolveBucketName(segments[0]),
                path: normalizePath(segments.slice(1).join('/')),
            };
        }

        if (host.endsWith('.r2.dev') && segments.length >= 1) {
            const hostParts = host.split('.');
            if (hostParts.length >= 4 && hostParts[0] !== 'www') {
                return {
                    bucket: resolveBucketName(hostParts[0]),
                    path: normalizePath(segments.join('/')),
                };
            }
        }
    } catch {
        return null;
    }

    return null;
};

const createR2Client = () => {
    const endpoint = process.env.R2_S3_ENDPOINT;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (!endpoint || !accessKeyId || !secretAccessKey) {
        return null;
    }

    return new S3Client({
        endpoint,
        region: DEFAULT_R2_REGION,
        forcePathStyle: true,
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
    });
};

const r2Client = createR2Client();

const ensureClient = () => {
    if (!r2Client) {
        throw new Error('R2 storage belum dikonfigurasi.');
    }
    return r2Client;
};

export const deleteObjectsFromBucket = async (
    bucket: string | undefined | null,
    paths: Array<string | null | undefined>
) => {
    const normalizedPaths = paths.map((path) => normalizePath(path || '')).filter(Boolean);
    if (normalizedPaths.length === 0) return;

    const client = ensureClient();
    await client.send(
        new DeleteObjectsCommand({
            Bucket: resolveBucketName(bucket, 'publikweb'),
            Delete: {
                Objects: normalizedPaths.map((path) => ({ Key: path })),
                Quiet: true,
            },
        })
    );
};

export const getObjectMetadata = async (
    bucket: string | undefined | null,
    path: string | null | undefined
) => {
    if (!path) return null;
    try {
        const client = ensureClient();
        const response = await client.send(
            new HeadObjectCommand({
                Bucket: resolveBucketName(bucket, 'publikweb'),
                Key: normalizePath(path),
            })
        );
        return response;
    } catch (err) {
        return null;
    }
};

export type UploadedStorageMetadata = {
    provider: 'r2';
    bucket: string;
    path: string;
    url: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    extension: string;
};

export const uploadObjectToBucket = async (params: {
    bucket?: string | null;
    path: string;
    file: File | Blob;
    contentType?: string | null;
    cacheControl?: string | null;
}): Promise<UploadedStorageMetadata> => {
    const client = ensureClient();
    const resolvedBucket = resolveBucketName(params.bucket || 'publikweb', 'publikweb');
    const normalizedPath = normalizePath(params.path);
    const payload = Buffer.from(await params.file.arrayBuffer());
    const mimeType = params.contentType || (params.file as File).type || 'application/octet-stream';
    const fileName = normalizedPath.split('/').pop() || 'file.bin';
    const extension = fileName.includes('.') ? (fileName.split('.').pop() || '').toLowerCase() : '';

    await client.send(
        new PutObjectCommand({
            Bucket: resolvedBucket,
            Key: normalizedPath,
            Body: payload,
            ContentType: mimeType,
            CacheControl: params.cacheControl || 'public, max-age=31536000, immutable',
        })
    );

    return {
        provider: 'r2',
        bucket: resolvedBucket,
        path: normalizedPath,
        url: getPublicUrl(resolvedBucket, normalizedPath),
        fileName,
        mimeType,
        sizeBytes: payload.byteLength,
        extension,
    };
};
