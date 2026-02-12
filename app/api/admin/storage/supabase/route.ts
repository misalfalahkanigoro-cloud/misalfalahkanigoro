import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdminRole } from '@/lib/admin-auth';

export const runtime = 'nodejs';

const LIST_LIMIT = 200;
const USAGE_LIMIT = 1000;

type StorageItem = {
    name: string;
    id?: string | null;
    updated_at?: string | null;
    created_at?: string | null;
    last_accessed_at?: string | null;
    metadata?: { size?: number | null } | null;
};

const normalizePrefix = (prefix: string) => prefix.replace(/^\/+/, '').replace(/\/+$/, '');

const joinPath = (prefix: string, name: string) => (prefix ? `${prefix}/${name}` : name);

async function listStorageItems(bucket: string, prefix: string, limit: number, offset: number) {
    const { data, error } = await supabaseAdmin()
        .storage
        .from(bucket)
        .list(prefix, {
            limit,
            offset,
            sortBy: { column: 'name', order: 'asc' },
        });

    if (error) {
        throw error;
    }

    const items = (data || []) as StorageItem[];
    return items.map((item) => {
        const isFolder = !item.id;
        const size = item.metadata?.size ?? 0;
        return {
            name: item.name,
            path: joinPath(prefix, item.name),
            isFolder,
            size,
            updatedAt: item.updated_at ?? null,
            createdAt: item.created_at ?? null,
            lastAccessedAt: item.last_accessed_at ?? null,
        };
    });
}

async function collectUsage(bucket: string) {
    let totalBytes = 0;
    let totalFiles = 0;
    let totalFolders = 0;

    const traverse = async (prefix: string) => {
        let offset = 0;
        while (true) {
            const { data, error } = await supabaseAdmin()
                .storage
                .from(bucket)
                .list(prefix, {
                    limit: USAGE_LIMIT,
                    offset,
                    sortBy: { column: 'name', order: 'asc' },
                });

            if (error) throw error;
            if (!data || data.length === 0) break;

            for (const item of data as StorageItem[]) {
                if (item.id) {
                    totalFiles += 1;
                    totalBytes += item.metadata?.size ?? 0;
                } else {
                    totalFolders += 1;
                    const nextPrefix = joinPath(prefix, item.name);
                    await traverse(nextPrefix);
                }
            }

            if (data.length < USAGE_LIMIT) break;
            offset += USAGE_LIMIT;
        }
    };

    await traverse('');

    return {
        totalBytes,
        totalFiles,
        totalFolders,
    };
}

async function collectFilePaths(bucket: string, prefix: string) {
    const files: string[] = [];

    const traverse = async (currentPrefix: string) => {
        let offset = 0;
        while (true) {
            const { data, error } = await supabaseAdmin()
                .storage
                .from(bucket)
                .list(currentPrefix, {
                    limit: USAGE_LIMIT,
                    offset,
                    sortBy: { column: 'name', order: 'asc' },
                });

            if (error) throw error;
            if (!data || data.length === 0) break;

            for (const item of data as StorageItem[]) {
                if (item.id) {
                    files.push(joinPath(currentPrefix, item.name));
                } else {
                    const nextPrefix = joinPath(currentPrefix, item.name);
                    await traverse(nextPrefix);
                }
            }

            if (data.length < USAGE_LIMIT) break;
            offset += USAGE_LIMIT;
        }
    };

    await traverse(prefix);
    return files;
}

export async function GET(request: NextRequest) {
    const session = requireAdminRole(request.cookies, ['superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const listBuckets = searchParams.get('listBuckets') === '1';

        if (listBuckets) {
            const { data, error } = await supabaseAdmin().storage.listBuckets();
            if (error) throw error;
            return NextResponse.json({ buckets: data || [] });
        }

        const bucket = searchParams.get('bucket') || '';
        if (!bucket) {
            return NextResponse.json({ error: 'Bucket wajib diisi' }, { status: 400 });
        }

        const prefix = normalizePrefix(searchParams.get('prefix') || '');
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '', 10) || LIST_LIMIT, 1), 500);
        const offset = Math.max(parseInt(searchParams.get('offset') || '', 10) || 0, 0);
        const includeUsage = searchParams.get('includeUsage') === '1';

        const items = await listStorageItems(bucket, prefix, limit, offset);
        const nextOffset = items.length === limit ? offset + items.length : null;

        const usage = includeUsage ? await collectUsage(bucket) : null;

        return NextResponse.json({
            bucket,
            prefix,
            items,
            nextOffset,
            usage,
        });
    } catch (error) {
        console.error('Supabase storage list error:', error);
        return NextResponse.json({ error: 'Gagal memuat storage Supabase' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const session = requireAdminRole(request.cookies, ['superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const bucket = body.bucket as string;
        const rawPath = (body.path as string) || '';
        const isFolder = Boolean(body.isFolder);

        if (!bucket || !rawPath) {
            return NextResponse.json({ error: 'Bucket dan path wajib diisi' }, { status: 400 });
        }

        const path = normalizePrefix(rawPath);

        if (!path) {
            return NextResponse.json({ error: 'Path tidak valid' }, { status: 400 });
        }

        if (isFolder) {
            const files = await collectFilePaths(bucket, path);
            if (files.length === 0) {
                return NextResponse.json({ success: true, deleted: 0 });
            }

            const chunkSize = 100;
            let deleted = 0;
            for (let i = 0; i < files.length; i += chunkSize) {
                const chunk = files.slice(i, i + chunkSize);
                const { error } = await supabaseAdmin().storage.from(bucket).remove(chunk);
                if (error) throw error;
                deleted += chunk.length;
            }

            return NextResponse.json({ success: true, deleted });
        }

        const { error } = await supabaseAdmin().storage.from(bucket).remove([path]);
        if (error) throw error;

        return NextResponse.json({ success: true, deleted: 1 });
    } catch (error) {
        console.error('Supabase storage delete error:', error);
        return NextResponse.json({ error: 'Gagal menghapus file Supabase' }, { status: 500 });
    }
}
