import sanitizeHtmlLib from 'sanitize-html';

const MAX_RICH_TEXT_LENGTH = Number(process.env.MAX_RICH_TEXT_LENGTH || 200_000);

const ALLOWED_IFRAME_HOSTS = [
    'www.youtube.com',
    'youtube.com',
    'www.youtube-nocookie.com',
    'youtube-nocookie.com',
    'www.google.com',
    'google.com',
    'maps.google.com',
];

const trimUnsafeChars = (value: string) =>
    value
        .replace(/\u0000/g, '')
        .replace(/\u2028|\u2029/g, ' ')
        .trim();

const normalizeUrl = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const lower = trimmed.toLowerCase();

    if (lower.startsWith('javascript:') || lower.startsWith('data:text/html') || lower.startsWith('vbscript:')) {
        return null;
    }

    if (
        trimmed.startsWith('/') ||
        trimmed.startsWith('./') ||
        trimmed.startsWith('../') ||
        trimmed.startsWith('#') ||
        trimmed.startsWith('?')
    ) {
        return trimmed;
    }

    if (lower.startsWith('mailto:') || lower.startsWith('tel:')) {
        return trimmed;
    }

    try {
        const parsed = new URL(trimmed);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
            return parsed.toString();
        }
        return null;
    } catch {
        return null;
    }
};

export const sanitizeRichText = (value: unknown): string | null => {
    if (value === null || value === undefined) return null;
    const raw = String(value);
    if (!raw.trim()) return null;
    const limited = raw.slice(0, MAX_RICH_TEXT_LENGTH);

    const cleaned = sanitizeHtmlLib(limited, {
        allowedTags: [
            'a', 'blockquote', 'br', 'code', 'em', 'figcaption', 'figure',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'iframe', 'img', 'li',
            'ol', 'p', 'pre', 's', 'span', 'strong', 'sub', 'sup', 'u', 'ul',
            'video', 'source'
        ],
        allowedAttributes: {
            a: ['href', 'target', 'rel'],
            img: ['src', 'alt', 'width', 'height', 'loading'],
            iframe: ['src', 'width', 'height', 'title', 'loading', 'allow', 'allowfullscreen', 'referrerpolicy'],
            video: ['src', 'controls', 'muted', 'playsinline', 'poster', 'preload'],
            source: ['src', 'type'],
            '*': ['class', 'title', 'aria-label']
        },
        allowedIframeHostnames: ALLOWED_IFRAME_HOSTS,
        transformTags: {
            'a': sanitizeHtmlLib.simpleTransform('a', { rel: 'noopener noreferrer' })
        }
    });

    return trimUnsafeChars(cleaned) || null;
};

export const sanitizeEmbedHtml = (value: unknown): string | null => {
    const sanitized = sanitizeRichText(value);
    if (!sanitized || !/<iframe[\s>]/i.test(sanitized)) {
        return null;
    }

    const onlyIframe = sanitized
        .replace(/<(?!\/?iframe[\s>])[^>]+>/gi, '')
        .replace(/<\/(?!iframe)[^>]+>/gi, '')
        .trim();

    return /<iframe[\s\S]*?<\/iframe>/i.test(onlyIframe) ? onlyIframe : null;
};

export const sanitizeUrl = (value: unknown): string | null => {
    if (value === null || value === undefined) return null;
    return normalizeUrl(String(value));
};

export const sanitizePlainText = (value: unknown, maxLength = 5000): string | null => {
    if (value === null || value === undefined) return null;
    const raw = String(value)
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, maxLength);
    return raw || null;
};
