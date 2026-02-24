import { NextRequest, NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const placement = searchParams.get('placement') || undefined;

        let query = dbAdmin()
            .from('site_banners')
            .select('*')
            .eq('isactive', true)
            .order('displayorder', { ascending: true });

        if (placement) {
            query = query.in('placement', [placement, 'all']);
        }

        const { data, error } = await query;
        if (error) {
            throw error;
        }

        const mapped = (data || []).map((row: any) => ({
            id: row.id,
            title: row.title,
            description: row.description,
            buttonText: row.buttontext,
            buttonLink: row.buttonlink,
            backgroundColor: row.backgroundcolor,
            textColor: row.textcolor,
            placement: row.placement,
            displayOrder: row.displayorder,
            isActive: row.isactive,
        }));

        return NextResponse.json(mapped);
    } catch (error) {
        console.error('Error fetching site banners:', error);
        return NextResponse.json({ error: 'Failed to fetch site banners' }, { status: 500 });
    }
}

