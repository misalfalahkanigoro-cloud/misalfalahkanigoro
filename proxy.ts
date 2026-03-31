import { NextResponse, type NextRequest } from 'next/server';

type AdminSession = {
    id: string;
    username: string;
    role: 'admin' | 'superadmin' | string;
    exp?: number;
};

const SESSION_SECRET =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    'dev-insecure-secret-change-me';

const base64UrlDecode = (value: string) => {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const pad = normalized.length % 4 === 0 ? 0 : 4 - (normalized.length % 4);
    const padded = normalized + '='.repeat(pad);
    return typeof atob === 'function'
        ? atob(padded)
        : Buffer.from(padded, 'base64').toString('utf-8');
};

const hexToBytes = (hex: string) => {
    if (!/^[a-f0-9]+$/i.test(hex) || hex.length % 2 !== 0) return null;
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    return bytes;
};

async function verifySignedSession(raw: string): Promise<AdminSession | null> {
    const [payloadB64, signatureHex] = raw.split('.');
    if (!payloadB64 || !signatureHex) return null;

    try {
        const signature = hexToBytes(signatureHex);
        if (!signature) return null;
        const cryptoApi = globalThis.crypto;
        if (!cryptoApi?.subtle) return null;

        const key = await cryptoApi.subtle.importKey(
            'raw',
            new TextEncoder().encode(SESSION_SECRET),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );

        const valid = await cryptoApi.subtle.verify(
            'HMAC',
            key,
            signature,
            new TextEncoder().encode(payloadB64)
        );
        if (!valid) return null;

        const json = base64UrlDecode(payloadB64);
        const parsed = JSON.parse(json) as AdminSession;
        if (!parsed?.id || !parsed?.username || !parsed?.role) return null;
        if (parsed.exp && parsed.exp < Math.floor(Date.now() / 1000)) return null;
        return parsed;
    } catch {
        return null;
    }
}

function decodeLegacySession(raw: string): AdminSession | null {
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

async function decodeSession(raw: string | undefined): Promise<AdminSession | null> {
    if (!raw) return null;
    if (raw.includes('.')) {
        const verified = await verifySignedSession(raw);
        if (verified) return verified;
    }
    return decodeLegacySession(raw);
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname.startsWith('/api/admin')) {
        const session = await decodeSession(request.cookies.get('admin_session')?.value);
        if (!session || !['admin', 'superadmin'].includes(session.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    if (pathname.startsWith('/admin')) {
        const session = await decodeSession(request.cookies.get('admin_session')?.value);
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

