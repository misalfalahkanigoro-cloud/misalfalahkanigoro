import { NextRequest, NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/db';
import { requireAdminRole } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const isAdminRequest = Boolean(requireAdminRole(request.cookies, ['admin', 'superadmin']));
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10)));
        const level = searchParams.get('level');

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = dbAdmin()
            .from('achievements')
            .select('*', { count: 'exact' })
            .order('is_pinned', { ascending: false })
            .order('achieved_at', { ascending: false })
            .range(from, to);

        if (level) {
            query = query.eq('event_level', level);
        }
        if (!isAdminRequest) {
            query = query.eq('is_published', true);
        }

        const { data, count, error } = await query;

        if (error) throw error;

        const ids = (data || []).map((row: any) => row.id);
        let mediaByEntity: Record<string, any[]> = {};

        if (ids.length) {
            const { data: mediaData, error: mediaError } = await dbAdmin()
                .from('media_items')
                .select('*')
                .eq('entity_type', 'achievement')
                .in('entity_id', ids)
                .order('display_order', { ascending: true });

            if (mediaError) throw mediaError;

            mediaByEntity = (mediaData || []).reduce((acc: any, m: any) => {
                (acc[m.entity_id] = acc[m.entity_id] || []).push(m);
                return acc;
            }, {});
        }

        const items = (data || []).map((row: any) => {
            const mediaItems = mediaByEntity[row.id] || [];
            const mappedMedia = mediaItems.map((m: any) => ({
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
            }));

            return {
                id: row.id,
                title: row.title,
                slug: row.slug,
                eventName: row.event_name,
                eventLevel: row.event_level,
                rank: row.rank,
                description: row.description,
                achievedAt: row.achieved_at,
                isPublished: row.is_published,
                isPinned: row.is_pinned,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                media: mappedMedia,
                coverUrl: mappedMedia.find((m: any) => m.isMain)?.mediaUrl || mappedMedia[0]?.mediaUrl || null
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
