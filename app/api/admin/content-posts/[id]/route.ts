import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Tables to check for content post by ID
const TABLES = ['news_posts', 'publications', 'achievements', 'galleries', 'downloads'];

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        let post = null;
        let foundTable = '';

        for (const tableName of TABLES) {
            const { data, error } = await supabaseAdmin()
                .from(tableName)
                .select('*')
                .eq('id', id)
                .maybeSingle();

            if (data) {
                post = data;
                foundTable = tableName;
                break;
            }
        }

        if (!post) {
            return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
        }

        const entityType = foundTable === 'news_posts' ? 'news' :
            foundTable === 'publications' ? 'publication' :
                foundTable === 'achievements' ? 'achievement' :
                    foundTable === 'galleries' ? 'gallery' : 'download';

        const { data: media, error: mediaError } = await supabaseAdmin()
            .from('media_items')
            .select('*')
            .eq('entity_id', id)
            .eq('entity_type', entityType)
            .order('display_order', { ascending: true });

        const mediaItems = media || [];
        const coverUrl = mediaItems.find((item: any) => item.is_main)?.media_url || mediaItems[0]?.media_url || null;

        return NextResponse.json({
            post: { ...post, type: entityType, coverUrl },
            media: mediaItems
        });
    } catch (error) {
        console.error('Admin content post detail error:', error);
        return NextResponse.json({ error: 'Failed to fetch content post' }, { status: 500 });
    }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        // Try deleting from each table until one succeeds (or just try all)
        // Since we don't know the table, we search first or just try deleting

        let deleted = false;
        for (const tableName of TABLES) {
            const { error, count } = await supabaseAdmin()
                .from(tableName)
                .delete({ count: 'exact' })
                .eq('id', id);

            if (!error && count && count > 0) {
                deleted = true;
                break;
            }
        }

        // Also cleanup media items
        await supabaseAdmin()
            .from('media_items')
            .delete()
            .eq('entity_id', id);

        return NextResponse.json({ success: deleted });
    } catch (error) {
        console.error('Admin delete content post error:', error);
        return NextResponse.json({ error: 'Failed to delete content post' }, { status: 500 });
    }
}
