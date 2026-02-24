/** @type {import('next').NextConfig} */
const CACHE_PUBLIC_SHORT = 'public, max-age=30, s-maxage=60, stale-while-revalidate=300';
const CACHE_PUBLIC_CONTENT = 'public, max-age=60, s-maxage=300, stale-while-revalidate=1800';
const CACHE_PUBLIC_STATIC = 'public, max-age=300, s-maxage=1800, stale-while-revalidate=86400';
const CACHE_NO_STORE = 'no-store, no-cache, max-age=0, must-revalidate';

const withCacheControl = (source, value) => ({
  source,
  headers: [{ key: 'Cache-Control', value }],
});

const noStoreSources = [
  '/api/admin/:path*',
  '/api/auth/:path*',
  '/api/ppdb/status',
  '/api/ppdb/by-nisn',
  '/api/ppdb/list',
  '/api/ppdb/registration/:path*',
  '/api/ppdb/pdf',
  '/api/ppdb/pdf/:path*',
  '/api/push/subscribe',
];

const staticContentSources = [
  '/api/site-settings',
  '/api/school-settings',
  '/api/social-media-links',
  '/api/navigation-menu',
  '/api/footer-links',
  '/api/hero',
  '/api/hero-slides',
  '/api/highlights',
  '/api/teachers',
  '/api/extracurriculars',
  '/api/character-programs',
  '/api/site-banners',
  '/api/page-heroes',
  '/api/headmaster-greeting',
  '/api/vision-mission',
  '/api/history-page',
  '/api/pages/:path*',
];

const contentSources = [
  '/api/activities',
  '/api/news',
  '/api/news/:path*',
  '/api/publications',
  '/api/publications/:path*',
  '/api/achievements',
  '/api/achievements/:path*',
  '/api/galleries',
  '/api/galleries/:path*',
  '/api/downloads',
  '/api/downloads/:path*',
  '/api/media-items',
  '/api/pinned',
];

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      ...noStoreSources.map((source) => withCacheControl(source, CACHE_NO_STORE)),
      ...staticContentSources.map((source) => withCacheControl(source, CACHE_PUBLIC_STATIC)),
      ...contentSources.map((source) => withCacheControl(source, CACHE_PUBLIC_CONTENT)),
      withCacheControl('/api/ppdb/active-wave', CACHE_PUBLIC_SHORT),
    ];
  },
};

module.exports = nextConfig;
