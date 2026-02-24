import { NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/db';
import type { SocialMediaLink } from '@/lib/types';

export async function GET() {
    try {
        const { data, error } = await dbAdmin()
            .from('social_media_links')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });

        if (error) {
            throw error;
        }

        const mapped: SocialMediaLink[] = (data || []).map((row: any) => ({
            id: row.id,
            platform: row.platform,
            url: row.url,
            displayOrder: row.display_order,
            isActive: row.is_active,
        }));

        return NextResponse.json(mapped);
    } catch (error) {
        console.error('Error fetching social media links:', error);
        return NextResponse.json({ error: 'Failed to fetch social links' }, { status: 500 });
    }
}

