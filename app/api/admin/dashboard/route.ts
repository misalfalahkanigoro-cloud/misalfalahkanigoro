import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';

type DashboardActivity = {
    id: string;
    category: 'ppdb' | 'content';
    title: string;
    subtitle: string;
    happenedAt: string;
    href: string;
};

type ContentRow = {
    id: string;
    title: string;
    slug: string;
    created_at: string;
    is_published: boolean;
};

export const runtime = 'nodejs';

function trackQueryError(error: unknown, label: string, collector: string[]) {
    if (error) {
        console.error(`Dashboard ${label} error:`, error);
        collector.push(label);
    }
}

function sortByDateDesc<T extends { happenedAt: string }>(items: T[]): T[] {
    return [...items].sort(
        (a, b) => new Date(b.happenedAt).getTime() - new Date(a.happenedAt).getTime()
    );
}

export async function GET(request: NextRequest) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const db = supabaseAdmin();
        const [
            newsCountRes,
            publicationCountRes,
            achievementCountRes,
            galleryCountRes,
            newsPublishedRes,
            publicationPublishedRes,
            achievementPublishedRes,
            galleryPublishedRes,
            ppdbTotalRes,
            ppdbAcceptedRes,
            ppdbVerificationRes,
            subscribersCountRes,
            adminUsersCountRes,
            activeWaveRes,
            latestNewsRes,
            latestPublicationsRes,
            latestAchievementsRes,
            latestGalleriesRes,
            latestPpdbRes,
            topNewsRes,
        ] = await Promise.all([
            db.from('news_posts').select('*', { count: 'exact', head: true }),
            db.from('publications').select('*', { count: 'exact', head: true }),
            db.from('achievements').select('*', { count: 'exact', head: true }),
            db.from('galleries').select('*', { count: 'exact', head: true }),
            db
                .from('news_posts')
                .select('*', { count: 'exact', head: true })
                .eq('is_published', true),
            db
                .from('publications')
                .select('*', { count: 'exact', head: true })
                .eq('is_published', true),
            db
                .from('achievements')
                .select('*', { count: 'exact', head: true })
                .eq('is_published', true),
            db
                .from('galleries')
                .select('*', { count: 'exact', head: true })
                .eq('is_published', true),
            db.from('ppdb_registrations').select('*', { count: 'exact', head: true }),
            db
                .from('ppdb_registrations')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'DITERIMA'),
            db
                .from('ppdb_registrations')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'VERIFIKASI'),
            db.from('push_subscriptions').select('*', { count: 'exact', head: true }),
            db.from('admin_publicweb').select('*', { count: 'exact', head: true }),
            db
                .from('ppdb_waves')
                .select('id, name, start_date, end_date, quota')
                .eq('is_active', true)
                .limit(1)
                .maybeSingle(),
            db
                .from('news_posts')
                .select('id, title, slug, created_at, is_published')
                .order('created_at', { ascending: false })
                .limit(3),
            db
                .from('publications')
                .select('id, title, slug, created_at, is_published')
                .order('created_at', { ascending: false })
                .limit(3),
            db
                .from('achievements')
                .select('id, title, slug, created_at, is_published')
                .order('created_at', { ascending: false })
                .limit(3),
            db
                .from('galleries')
                .select('id, title, slug, created_at, is_published')
                .order('created_at', { ascending: false })
                .limit(3),
            db
                .from('ppdb_registrations')
                .select('id, namaLengkap, status, tanggalDaftar')
                .order('tanggalDaftar', { ascending: false })
                .limit(4),
            db
                .from('news_posts')
                .select('id, title, slug, view_count, published_at')
                .order('view_count', { ascending: false })
                .limit(5),
        ]);

        const queryErrors: string[] = [];
        trackQueryError(newsCountRes.error, 'news count', queryErrors);
        trackQueryError(publicationCountRes.error, 'publication count', queryErrors);
        trackQueryError(achievementCountRes.error, 'achievement count', queryErrors);
        trackQueryError(galleryCountRes.error, 'gallery count', queryErrors);
        trackQueryError(newsPublishedRes.error, 'news published count', queryErrors);
        trackQueryError(publicationPublishedRes.error, 'publication published count', queryErrors);
        trackQueryError(achievementPublishedRes.error, 'achievement published count', queryErrors);
        trackQueryError(galleryPublishedRes.error, 'gallery published count', queryErrors);
        trackQueryError(ppdbTotalRes.error, 'ppdb total count', queryErrors);
        trackQueryError(ppdbAcceptedRes.error, 'ppdb accepted count', queryErrors);
        trackQueryError(ppdbVerificationRes.error, 'ppdb verification count', queryErrors);
        trackQueryError(subscribersCountRes.error, 'subscribers count', queryErrors);
        trackQueryError(adminUsersCountRes.error, 'admin users count', queryErrors);
        trackQueryError(activeWaveRes.error, 'active wave', queryErrors);
        trackQueryError(latestNewsRes.error, 'latest news', queryErrors);
        trackQueryError(latestPublicationsRes.error, 'latest publications', queryErrors);
        trackQueryError(latestAchievementsRes.error, 'latest achievements', queryErrors);
        trackQueryError(latestGalleriesRes.error, 'latest galleries', queryErrors);
        trackQueryError(latestPpdbRes.error, 'latest ppdb', queryErrors);
        trackQueryError(topNewsRes.error, 'top news', queryErrors);

        const newsCount = newsCountRes.count ?? 0;
        const publicationCount = publicationCountRes.count ?? 0;
        const achievementCount = achievementCountRes.count ?? 0;
        const galleryCount = galleryCountRes.count ?? 0;
        const ppdbTotal = ppdbTotalRes.count ?? 0;
        const ppdbAccepted = ppdbAcceptedRes.count ?? 0;
        const ppdbVerification = ppdbVerificationRes.count ?? 0;
        const subscribersCount = subscribersCountRes.count ?? 0;
        const adminUsersCount = adminUsersCountRes.count ?? 0;

        const totalContent = newsCount + publicationCount + achievementCount + galleryCount;
        const publishedContent =
            (newsPublishedRes.count ?? 0) +
            (publicationPublishedRes.count ?? 0) +
            (achievementPublishedRes.count ?? 0) +
            (galleryPublishedRes.count ?? 0);

        const contentActivities: DashboardActivity[] = [
            ...((latestNewsRes.data || []).map((item: ContentRow) => ({
                id: `news-${item.id}`,
                category: 'content' as const,
                title: `Berita: ${item.title}`,
                subtitle: item.is_published ? 'Dipublikasikan' : 'Masih draft',
                happenedAt: item.created_at,
                href: `/admin/berita/${item.id}`,
            })) || []),
            ...((latestPublicationsRes.data || []).map((item: ContentRow) => ({
                id: `publication-${item.id}`,
                category: 'content' as const,
                title: `Publikasi: ${item.title}`,
                subtitle: item.is_published ? 'Dipublikasikan' : 'Masih draft',
                happenedAt: item.created_at,
                href: `/admin/publikasi/${item.id}`,
            })) || []),
            ...((latestAchievementsRes.data || []).map((item: ContentRow) => ({
                id: `achievement-${item.id}`,
                category: 'content' as const,
                title: `Prestasi: ${item.title}`,
                subtitle: item.is_published ? 'Dipublikasikan' : 'Masih draft',
                happenedAt: item.created_at,
                href: `/admin/prestasi/${item.id}`,
            })) || []),
            ...((latestGalleriesRes.data || []).map((item: ContentRow) => ({
                id: `gallery-${item.id}`,
                category: 'content' as const,
                title: `Galeri: ${item.title}`,
                subtitle: item.is_published ? 'Dipublikasikan' : 'Masih draft',
                happenedAt: item.created_at,
                href: `/admin/galeri/${item.id}`,
            })) || []),
        ];

        const ppdbActivities: DashboardActivity[] =
            (latestPpdbRes.data || []).map((item: any) => ({
                id: `ppdb-${item.id}`,
                category: 'ppdb' as const,
                title: `PPDB: ${item.namaLengkap}`,
                subtitle: `Status ${item.status}`,
                happenedAt: item.tanggalDaftar,
                href: '/admin/ppdb',
            })) || [];

        const latestActivities = sortByDateDesc([...contentActivities, ...ppdbActivities]).slice(0, 8);

        const topNews = (topNewsRes.data || []).map((item: any) => ({
            id: item.id,
            title: item.title,
            slug: item.slug,
            viewCount: item.view_count ?? 0,
            publishedAt: item.published_at,
            href: `/admin/berita/${item.id}`,
        }));

        return NextResponse.json({
            generatedAt: new Date().toISOString(),
            summary: {
                newsCount,
                publicationCount,
                achievementCount,
                galleryCount,
                totalContent,
                publishedContent,
                draftContent: Math.max(0, totalContent - publishedContent),
                ppdbTotal,
                ppdbAccepted,
                ppdbVerification,
                subscribersCount,
                adminUsersCount,
                activeWave: activeWaveRes.data
                    ? {
                        id: activeWaveRes.data.id,
                        name: activeWaveRes.data.name,
                        startDate: activeWaveRes.data.start_date,
                        endDate: activeWaveRes.data.end_date,
                        quota: activeWaveRes.data.quota,
                    }
                    : null,
            },
            latestActivities,
            topNews,
            system: {
                apiStatus: queryErrors.length > 0 ? 'degraded' : 'online',
                pushConfigured: Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
                supabaseConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
            },
            warnings: queryErrors,
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        return NextResponse.json({ error: 'Gagal memuat dashboard admin' }, { status: 500 });
    }
}
