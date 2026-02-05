import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || undefined;
        const category = searchParams.get('category') || undefined;
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10)));

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let listQuery = supabaseAdmin()
            .from('content_posts')
            .select('*', { count: 'exact' })
            .eq('isPublished', true)
            .order('is_pinned', { ascending: false })
            .order('publishedAt', { ascending: false })
            .order('createdAt', { ascending: false })
            .range(from, to);

        if (type) {
            listQuery = listQuery.eq('type', type);
        }

        if (category) {
            listQuery = listQuery.eq('category', category);
        }

        const { data: items, count, error: listError } = await listQuery;
        if (listError) {
            throw listError;
        }

        let categoryQuery = supabaseAdmin()
            .from('content_posts')
            .select('category')
            .eq('isPublished', true);

        if (type) {
            categoryQuery = categoryQuery.eq('type', type);
        }

        const { data: categoriesData, error: categoriesError } = await categoryQuery;
        if (categoriesError) {
            throw categoriesError;
        }

        const categoryCountsMap = (categoriesData || []).reduce<Record<string, number>>((acc, row) => {
            const key = row.category || 'Lainnya';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        const categoriesRaw = Object.keys(categoryCountsMap).sort();

        return NextResponse.json({
            items: items || [],
            total: count || 0,
            page,
            pageSize,
            categories: categoriesRaw,
            categoryCounts: categoriesRaw.map((cat) => ({
                category: cat,
                count: categoryCountsMap[cat],
            })),
        });
    } catch (error) {
        console.error('Error fetching content posts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch content posts' },
            { status: 500 }
        );
    }
}
