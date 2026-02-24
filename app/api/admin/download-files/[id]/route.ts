import { NextRequest, NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/db';

const normalizeStoragePath = (value: string) => value.replace(/^\/+/, '').replace(/\/+$/, '');

const extractStoragePathFromUrl = (value: unknown): string | null => {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed) return null;

    try {
        const parsed = new URL(trimmed, 'http://local');

        if (parsed.pathname === '/api/storage/public') {
            const pathParam = parsed.searchParams.get('path');
            if (!pathParam) return null;
            return normalizeStoragePath(decodeURIComponent(pathParam));
        }

        const segments = parsed.pathname
            .split('/')
            .filter(Boolean)
            .map((segment) => decodeURIComponent(segment));

        const host = parsed.hostname.toLowerCase();
        if (host.endsWith('.r2.cloudflarestorage.com') && segments.length >= 2) {
            return normalizeStoragePath(segments.slice(1).join('/'));
        }

        if (host.endsWith('.r2.dev') && segments.length >= 1) {
            return normalizeStoragePath(segments.join('/'));
        }
    } catch {
        return null;
    }

    return null;
};

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const payload = await request.json();
        const publicUrlInput = payload.publicUrl || payload.url || null;
        const derivedPath = extractStoragePathFromUrl(publicUrlInput);
        const storageProvider = payload.storageProvider || 'r2';
        const storageBucket = payload.storageBucket || payload.bucket || 'downloads';
        const storagePath = payload.storagePath || payload.path || derivedPath || null;

        let publicUrl = publicUrlInput;
        if (!publicUrl && storagePath) {
            const { data: urlData } = dbAdmin().storage.from(storageBucket).getPublicUrl(storagePath);
            publicUrl = urlData.publicUrl;
        }

        const fileName =
            payload.fileName ||
            (typeof storagePath === 'string' && storagePath.includes('/')
                ? storagePath.split('/').pop()
                : storagePath) ||
            null;

        const updatePayload = {
            download_id: payload.downloadId,
            file_name: fileName,
            file_type: payload.fileType,
            file_size_kb: payload.fileSizeKb,
            storage_provider: storageProvider,
            storage_bucket: storageBucket,
            storage_path: storagePath,
            public_url: publicUrl,
            display_order: payload.displayOrder ?? 0,
        };

        if (!updatePayload.download_id || !updatePayload.file_name || !updatePayload.storage_path) {
            return NextResponse.json(
                { error: 'downloadId, fileName, dan storagePath wajib diisi.' },
                { status: 400 }
            );
        }

        const { data, error } = await dbAdmin()
            .from('download_files')
            .update(updatePayload)
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Admin download files update error:', error);
        return NextResponse.json({ error: 'Failed to update download file' }, { status: 500 });
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { error } = await dbAdmin()
            .from('download_files')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin download files delete error:', error);
        return NextResponse.json({ error: 'Failed to delete download file' }, { status: 500 });
    }
}
