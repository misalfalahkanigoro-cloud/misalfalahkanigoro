import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category') || undefined;
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '12', 10)));

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabaseAdmin()
            .from('achievements')
            .select('*', { count: 'exact' })
            .eq('isPublished', true)
            .order('is_pinned', { ascending: false })
            .order('achievedAt', { ascending: false })
            .order('createdAt', { ascending: false })
            .range(from, to);

        if (category) {
            query = query.eq('category', category);
        }

        const { data, count, error } = await query;
        if (error) throw error;

        // Fetch categories for filter
        const { data: catData, error: catError } = await supabaseAdmin()
            .from('achievements')
            .select('category')
            .eq('isPublished', true);

        if (catError) throw catError;

        const categoryCountsMap = (catData || []).reduce<Record<string, number>>((acc, row) => {
            const key = row.category || 'Umum';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        const categoriesRaw = Object.keys(categoryCountsMap).sort();

        return NextResponse.json({
            items: data || [],
            total: count || 0,
            page,
            pageSize,
            categories: categoriesRaw,
            categoryCounts: categoriesRaw.map(c => ({ category: c, count: categoryCountsMap[c] }))
        });
    } catch (error) {
        console.error('Public achievements GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 });
    }
}
