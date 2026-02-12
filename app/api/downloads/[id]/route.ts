import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        let query = supabaseAdmin()
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

        const { data: mediaData, error: mediaErr } = await supabaseAdmin()
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
            file_url: body.fileUrl,
            file_size_kb: body.fileSizeKb,
            file_type: body.fileType,
            is_published: body.isPublished,
            is_pinned: body.isPinned ?? false,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabaseAdmin()
            .from('downloads')
            .update(dbPayload)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Upsert cover media
        if (body.coverUrl) {
            await supabaseAdmin()
                .from('media_items')
                .delete()
                .eq('entity_id', id)
                .eq('entity_type', 'download');

            await supabaseAdmin()
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
        const { data: files } = await supabaseAdmin()
            .from('download_files')
            .select('id, storage_path')
            .eq('download_id', id);

        if (files && files.length) {
            for (const f of files) {
                if (f.storage_path) {
                    await supabaseAdmin().storage.from('downloads').remove([f.storage_path]);
                }
            }
            await supabaseAdmin().from('download_files').delete().eq('download_id', id);
        }

        // Remove cover/media records (and Cloudinary asset if stored)
        const { data: mediaItems } = await supabaseAdmin()
            .from('media_items')
            .select('id, storage_path')
            .eq('entity_id', id)
            .eq('entity_type', 'download');

        if (mediaItems && mediaItems.length) {
            await supabaseAdmin()
                .from('media_items')
                .delete()
                .eq('entity_id', id)
                .eq('entity_type', 'download');

            // Optional: if storage_path holds Cloudinary public_id, delete from Cloudinary
            // Skipped here to avoid hard failure when creds missing; implement if needed.
        }

        const { error } = await supabaseAdmin()
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
