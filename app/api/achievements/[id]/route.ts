import { NextRequest, NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/db';
import { requireAdminRole } from '@/lib/admin-auth';

const mapAchievement = (row: any, media: any[] = []) => {
    const mappedMedia = media.map((m: any) => ({
        id: m.id,
        mediaUrl: m.media_url,
        mediaType: m.media_type,
        thumbnailUrl: m.thumbnail_url,
        caption: m.caption,
        isMain: m.is_main,
        displayOrder: m.display_order,
        createdAt: m.created_at,
        entityType: m.entity_type,
        entityId: m.entity_id,
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
};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const isAdminRequest = Boolean(requireAdminRole(request.cookies, ['admin', 'superadmin']));
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        let query = dbAdmin()
            .from('achievements')
            .select('*');

        if (isUUID) {
            query = query.eq('id', id);
        } else {
            query = query.eq('slug', id);
        }
        if (!isAdminRequest) {
            query = query.eq('is_published', true);
        }

        const { data, error } = await query.maybeSingle();

        if (error || !data) {
            return NextResponse.json({ error: 'Achievement not found' }, { status: 404 });
        }

        const { data: mediaData, error: mediaError } = await dbAdmin()
            .from('media_items')
            .select('*')
            .eq('entity_type', 'achievement')
            .eq('entity_id', data.id)
            .order('display_order', { ascending: true });

        if (mediaError) throw mediaError;

        return NextResponse.json(mapAchievement(data, mediaData || []));


    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
