export type UploadScope = 'media' | 'document' | 'publikweb';

const MB = 1024 * 1024;

const MEDIA_MIME = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'audio/mpeg',
    'audio/ogg',
    'audio/wav',
    'image/x-icon',
    'application/pdf',
]);

const DOCUMENT_MIME = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'image/jpeg',
    'image/png',
]);

const byScope = {
    media: {
        maxBytes: Number(process.env.MAX_UPLOAD_MEDIA_BYTES || 25 * MB),
        mime: MEDIA_MIME,
    },
    publikweb: {
        maxBytes: Number(process.env.MAX_UPLOAD_MEDIA_BYTES || 25 * MB),
        mime: MEDIA_MIME,
    },
    document: {
        maxBytes: Number(process.env.MAX_UPLOAD_DOCUMENT_BYTES || 50 * MB),
        mime: DOCUMENT_MIME,
    },
} as const;

const fileExt = (fileName: string) => {
    const raw = (fileName || '').trim();
    if (!raw || !raw.includes('.')) return '';
    return raw.split('.').pop()?.toLowerCase() || '';
};

const extensionFallbackAllowed = (scope: UploadScope, ext: string) => {
    if (!ext) return false;
    const mediaExt = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'mp4', 'webm', 'mov', 'mp3', 'ogg', 'wav', 'pdf', 'ico']);
    const docExt = new Set(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'zip', 'rar', '7z', 'jpg', 'jpeg', 'png']);
    return scope === 'media' ? mediaExt.has(ext) : docExt.has(ext);
};

export const validateUploadPolicy = (
    file: File,
    scope: UploadScope
): { ok: true } | { ok: false; error: string } => {
    const policy = byScope[scope];
    if (!file) {
        return { ok: false, error: 'File wajib diisi.' };
    }
    if (file.size <= 0) {
        return { ok: false, error: 'File kosong tidak diperbolehkan.' };
    }
    if (file.size > policy.maxBytes) {
        return {
            ok: false,
            error: `Ukuran file melebihi batas ${(policy.maxBytes / MB).toFixed(0)} MB.`,
        };
    }

    const mime = (file.type || '').toLowerCase();
    if (mime && policy.mime.has(mime)) {
        return { ok: true };
    }

    const ext = fileExt(file.name);
    if (extensionFallbackAllowed(scope, ext)) {
        return { ok: true };
    }

    return { ok: false, error: 'Tipe file tidak diizinkan.' };
};

