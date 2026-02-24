import { NextRequest, NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        let query = dbAdmin()
            .from('downloads')
            .select('*, files:download_files(*)');

        if (isUUID) {
            query = query.eq('id', id);
        } else {
            query = query.eq('slug', id);
        }

        const { data, error } = await query.maybeSingle();

        if (error || !data) {
            return NextResponse.json({ error: 'Download not found' }, { status: 404 });
        }

        const { data: mediaData, error: mediaErr } = await dbAdmin()
            .from('media_items')
            .select('*')
            .eq('entity_type', 'download')
            .eq('entity_id', data.id)
            .order('display_order', { ascending: true });

        if (mediaErr) throw mediaErr;

        const media = mediaData || [];
        const cover = media.find((m: any) => m.is_main) || media[0];

        const item = {
            id: data.id,
            title: data.title,
            slug: data.slug,
            description: data.description,
            fileUrl: data.file_url,
            fileStorageProvider: data.file_storage_provider,
            fileStorageBucket: data.file_storage_bucket,
            fileStoragePath: data.file_storage_path,
            fileSizeKb: data.file_size_kb,
            fileType: data.file_type,
            downloadCount: data.download_count,
            isPublished: data.is_published,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            coverUrl: cover ? cover.media_url : null,
            media: media.map((m: any) => ({
                id: m.id,
                mediaUrl: m.media_url,
                mediaType: m.media_type,
                storageProvider: m.storage_provider,
                storageBucket: m.storage_bucket,
                storagePath: m.storage_path,
                thumbnailUrl: m.thumbnail_url,
                caption: m.caption,
                isMain: m.is_main,
                displayOrder: m.display_order,
                createdAt: m.created_at,
                entityType: m.entity_type,
                entityId: m.entity_id
            })),
            files: (data.files || []).map((f: any) => ({
                id: f.id,
                downloadId: f.download_id,
                fileName: f.file_name,
                fileType: f.file_type,
                fileSizeKb: f.file_size_kb,
                storageProvider: f.storage_provider,
                storageBucket: f.storage_bucket,
                storagePath: f.storage_path,
                publicUrl: f.public_url,
                displayOrder: f.display_order,
                createdAt: f.created_at
            }))
        };

        return NextResponse.json(item);

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await request.json();
        const { id } = await params;

        const dbPayload = {
            title: body.title,
            slug: body.slug,
            description: body.description,
            file_storage_provider: body.fileStorageProvider,
            file_storage_bucket: body.fileStorageBucket,
            file_storage_path: body.fileStoragePath,
            file_url: body.fileUrl,
            file_size_kb: body.fileSizeKb,
            file_type: body.fileType,
            is_published: body.isPublished,
            is_pinned: body.isPinned ?? false,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await dbAdmin()
            .from('downloads')
            .update(dbPayload)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Upsert cover media
        if (body.coverUrl) {
            await dbAdmin()
                .from('media_items')
                .delete()
                .eq('entity_id', id)
                .eq('entity_type', 'download');

            await dbAdmin()
                .from('media_items')
                .insert({
                    entity_id: id,
                    entity_type: 'download',
                    media_type: 'image',
                    media_url: body.coverUrl,
                    is_main: true,
                    display_order: 0
                });
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Remove attachment files and storage objects
        const { data: files } = await dbAdmin()
            .from('download_files')
            .select('id, storage_path, storage_bucket')
            .eq('download_id', id);

        if (files && files.length) {
            for (const f of files) {
                if (f.storage_path) {
                    await dbAdmin().storage.from(f.storage_bucket || 'downloads').remove([f.storage_path]);
                }
            }
            await dbAdmin().from('download_files').delete().eq('download_id', id);
        }

        // Remove legacy single-file object (if still used by this download row)
        const { data: downloadRow } = await dbAdmin()
            .from('downloads')
            .select('id, file_storage_path, file_storage_bucket')
            .eq('id', id)
            .maybeSingle();

        if (downloadRow?.file_storage_path) {
            await dbAdmin()
                .storage
                .from(downloadRow.file_storage_bucket || 'downloads')
                .remove([downloadRow.file_storage_path]);
        }

        // Remove cover/media records and storage objects
        const { data: mediaItems } = await dbAdmin()
            .from('media_items')
            .select('id, storage_path, storage_bucket')
            .eq('entity_id', id)
            .eq('entity_type', 'download');

        if (mediaItems && mediaItems.length) {
            for (const mediaItem of mediaItems) {
                if (mediaItem.storage_path) {
                    await dbAdmin()
                        .storage
                        .from(mediaItem.storage_bucket || 'media')
                        .remove([mediaItem.storage_path]);
                }
            }

            await dbAdmin()
                .from('media_items')
                .delete()
                .eq('entity_id', id)
                .eq('entity_type', 'download');
        }

        const { error } = await dbAdmin()
            .from('downloads')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
