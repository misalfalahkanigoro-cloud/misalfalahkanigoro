type LogLevel = 'info' | 'warn' | 'error';

const normalizeError = (error: unknown) => {
    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack,
        };
    }
    return {
        name: 'UnknownError',
        message: typeof error === 'string' ? error : JSON.stringify(error),
    };
};

const emitLog = (level: LogLevel, context: string, payload: Record<string, unknown>) => {
    const body = {
        ts: new Date().toISOString(),
        level,
        context,
        ...payload,
    };
    const text = JSON.stringify(body);
    if (level === 'error') {
        console.error(text);
        return;
    }
    if (level === 'warn') {
        console.warn(text);
        return;
    }
    console.log(text);
};

export const logInfo = (context: string, meta: Record<string, unknown> = {}) => {
    emitLog('info', context, meta);
};

export const logWarn = (context: string, meta: Record<string, unknown> = {}) => {
    emitLog('warn', context, meta);
};

export const logError = (
    context: string,
    error: unknown,
    meta: Record<string, unknown> = {}
) => {
    emitLog('error', context, {
        ...meta,
        error: normalizeError(error),
    });
};

export const toSafeErrorMessage = (
    error: unknown,
    fallback = 'Terjadi kesalahan. Silakan coba lagi.'
) => {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return fallback;
};

