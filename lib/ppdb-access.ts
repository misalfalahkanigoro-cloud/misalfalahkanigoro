import { createHmac, timingSafeEqual } from 'crypto';

type PpdbAccessPayload = {
    registrationId: string;
    iat: number;
    exp: number;
};

const ACCESS_SECRET =
    process.env.PPDB_ACCESS_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    (process.env.NODE_ENV === 'production' ? '' : 'local-ppdb-access-secret');

const ACCESS_TTL_SECONDS = Number(process.env.PPDB_ACCESS_TTL_SECONDS || 60 * 60 * 24 * 30);

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
    createHmac('sha256', ACCESS_SECRET).update(payloadB64).digest('hex');

export const createPpdbAccessToken = (registrationId: string, ttlSeconds = ACCESS_TTL_SECONDS) => {
    if (!ACCESS_SECRET) {
        throw new Error('PPDB_ACCESS_SECRET is required to create PPDB access tokens');
    }

    const now = Math.floor(Date.now() / 1000);
    const payload: PpdbAccessPayload = {
        registrationId,
        iat: now,
        exp: now + Math.max(300, ttlSeconds),
    };

    const payloadB64 = base64UrlEncode(JSON.stringify(payload));
    const signature = signPayload(payloadB64);
    return `${payloadB64}.${signature}`;
};

export const parsePpdbAccessToken = (raw?: string | null): PpdbAccessPayload | null => {
    if (!ACCESS_SECRET || !raw) return null;

    const [payloadB64, signature] = raw.split('.');
    if (!payloadB64 || !signature) return null;

    const expectedSig = signPayload(payloadB64);
    const left = Buffer.from(signature, 'utf-8');
    const right = Buffer.from(expectedSig, 'utf-8');

    if (left.length !== right.length || !timingSafeEqual(left, right)) {
        return null;
    }

    try {
        const parsed = JSON.parse(base64UrlDecode(payloadB64)) as PpdbAccessPayload;
        if (!parsed?.registrationId || !parsed?.exp || parsed.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }
        return parsed;
    } catch {
        return null;
    }
};
