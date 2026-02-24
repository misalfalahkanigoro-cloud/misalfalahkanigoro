import { NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/db';

export async function GET() {
    try {
        const client = dbAdmin();

        const [news, teachers, ppdb, downloads] = await Promise.all([
            client.from('news_posts').select('*', { count: 'exact', head: true }),
            client.from('teachers').select('*', { count: 'exact', head: true }),
            client.from('ppdb_registrations').select('*', { count: 'exact', head: true }),
            client.from('download_files').select('*', { count: 'exact', head: true }),
        ]);

        if (news.error || teachers.error || ppdb.error || downloads.error) {
            throw news.error || teachers.error || ppdb.error || downloads.error;
        }

        return NextResponse.json({
            news: news.count || 0,
            teachers: teachers.count || 0,
            ppdb: ppdb.count || 0,
            downloads: downloads.count || 0,
            students: 0,
        });
    } catch (error) {
        console.error('Overview error:', error);
        return NextResponse.json({ error: 'Failed to load overview' }, { status: 500 });
    }
}

