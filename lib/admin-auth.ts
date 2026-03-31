import { createHmac, timingSafeEqual } from 'crypto';

export type AdminSession = {
    id: string;
    username: string;
    role: string;
    iat?: number;
    exp?: number;
};

const SESSION_SECRET =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    '';

const SESSION_TTL_SECONDS = Number(process.env.ADMIN_SESSION_TTL_SECONDS || 60 * 60 * 12);

const base64UrlEncode = (value: string) =>
    Buffer.from(value, 'utf-8')
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');

const base64UrlDecode = (value: string) => {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const pad = normalized.length % 4 === 0 ? 0 : 4 - (normalized.length % 4);
    const padded = normalized + '='.repeat(pad);
    return Buffer.from(padded, 'base64').toString('utf-8');
};

const signPayload = (payloadB64: string) =>
    createHmac('sha256', SESSION_SECRET).update(payloadB64).digest('hex');

export function createAdminSessionToken(
    session: Pick<AdminSession, 'id' | 'username' | 'role'>,
    ttlSeconds = SESSION_TTL_SECONDS
) {
    if (!SESSION_SECRET) {
        throw new Error('ADMIN_SESSION_SECRET is required to create admin sessions');
    }

    const now = Math.floor(Date.now() / 1000);
    const payload: AdminSession = {
        id: session.id,
        username: session.username,
        role: session.role,
        iat: now,
        exp: now + Math.max(60, ttlSeconds),
    };
    const payloadB64 = base64UrlEncode(JSON.stringify(payload));
    const signature = signPayload(payloadB64);
    return `${payloadB64}.${signature}`;
}

const parseSignedSession = (raw: string): AdminSession | null => {
    if (!SESSION_SECRET) return null;

    const [payloadB64, signature] = raw.split('.');
    if (!payloadB64 || !signature) return null;

    const expectedSig = signPayload(payloadB64);
    const left = Buffer.from(signature, 'utf-8');
    const right = Buffer.from(expectedSig, 'utf-8');
    if (left.length !== right.length || !timingSafeEqual(left, right)) {
        return null;
    }

    try {
        const decoded = base64UrlDecode(payloadB64);
        const parsed = JSON.parse(decoded) as AdminSession;
        if (!parsed?.id || !parsed?.username || !parsed?.role) return null;
        if (parsed.exp && parsed.exp < Math.floor(Date.now() / 1000)) return null;
        return parsed;
    } catch {
        return null;
    }
}

export function parseAdminSession(raw?: string | null): AdminSession | null {
    if (!raw || !raw.includes('.')) return null;
    return parseSignedSession(raw);
}

type CookieGetter = {
    get: (name: string) => { value: string } | undefined;
};

export function getAdminSessionFromCookies(cookies: CookieGetter): AdminSession | null {
    const raw = cookies.get('admin_session')?.value;
    return parseAdminSession(raw);
}

export function requireAdminRole(
    cookies: CookieGetter,
    roles: string[] = ['admin', 'superadmin']
): AdminSession | null {
    const session = getAdminSessionFromCookies(cookies);
    if (!session) return null;
    if (!roles.includes(session.role)) return null;
    return session;
}
