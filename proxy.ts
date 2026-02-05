import { NextResponse, type NextRequest } from 'next/server';

type AdminSession = {
    id: string;
    username: string;
    role: 'admin' | 'superadmin' | string;
};

function decodeSession(raw: string | undefined): AdminSession | null {
    if (!raw) return null;
    try {
        const json = typeof atob === 'function'
            ? atob(raw)
            : Buffer.from(raw, 'base64').toString('utf-8');
        const parsed = JSON.parse(json) as AdminSession;
        if (!parsed?.role) return null;
        return parsed;
    } catch {
        return null;
    }
}

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname.startsWith('/api/admin')) {
        const session = decodeSession(request.cookies.get('admin_session')?.value);
        if (!session || !['admin', 'superadmin'].includes(session.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    if (pathname.startsWith('/admin')) {
        const session = decodeSession(request.cookies.get('admin_session')?.value);
        if (!session || !['admin', 'superadmin'].includes(session.role)) {
            const url = request.nextUrl.clone();
            url.pathname = '/login';
            return NextResponse.redirect(url);
        }

        if (pathname.startsWith('/admin/kontrolAkun') && session.role !== 'superadmin') {
            const url = request.nextUrl.clone();
            url.pathname = '/admin/dashboard';
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
