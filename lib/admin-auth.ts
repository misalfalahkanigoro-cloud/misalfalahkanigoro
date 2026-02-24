export type AdminSession = {
    id: string;
    username: string;
    role: string;
};

export function parseAdminSession(raw?: string | null): AdminSession | null {
    if (!raw) return null;
    try {
        const decoded = Buffer.from(raw, 'base64').toString('utf-8');
        const parsed = JSON.parse(decoded) as AdminSession;
        if (!parsed?.id || !parsed?.username || !parsed?.role) return null;
        return parsed;
    } catch {
        return null;
    }
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
