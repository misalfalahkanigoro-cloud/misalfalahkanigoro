import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabaseAdmin()
            .from('downloads')
            .select('*, files:download_files(*)', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        const { data, count, error } = await query;

        if (error) throw error;

        const ids = (data || []).map((row: any) => row.id);
        let mediaByEntity: Record<string, any[]> = {};
        if (ids.length) {
            const { data: mediaData, error: mediaErr } = await supabaseAdmin()
                .from('media_items')
                .select('*')
                .eq('entity_type', 'download')
                .in('entity_id', ids)
                .order('display_order', { ascending: true });
            if (mediaErr) throw mediaErr;
            mediaByEntity = (mediaData || []).reduce((acc: any, m: any) => {
                (acc[m.entity_id] = acc[m.entity_id] || []).push(m);
                return acc;
            }, {});
        }

        const items = (data || []).map((row: any) => {
            const media = mediaByEntity[row.id] || [];
            const cover = media.find((m: any) => m.is_main) || media[0];
            return {
                id: row.id,
                title: row.title,
                slug: row.slug,
                description: row.description,
                fileUrl: row.file_url, // legacy single file
                fileSizeKb: row.file_size_kb,
                fileType: row.file_type,
            downloadCount: row.download_count,
            isPublished: row.is_published,
            isPinned: row.is_pinned,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
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
                files: (row.files || []).map((f: any) => ({
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
        });

        return NextResponse.json({
            items,
            total: count || 0,
            page,
            pageSize
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const dbPayload = {
            title: body.title,
            slug: body.slug,
            description: body.description,
            file_url: body.fileUrl,
            file_size_kb: body.fileSizeKb,
            file_type: body.fileType,
            download_count: 0,
            is_published: body.isPublished,
            is_pinned: body.isPinned ?? false
        };

        const { data, error } = await supabaseAdmin()
            .from('downloads')
            .insert(dbPayload)
            .select()
            .single();

        if (error) throw error;

        if (body.coverUrl && data?.id) {
            await supabaseAdmin()
                .from('media_items')
                .insert({
                    entity_id: data.id,
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
