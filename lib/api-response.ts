import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logError } from '@/lib/logger';

export function successResponse<T>(data: T, status = 200) {
    return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status = 400, details?: any) {
    return NextResponse.json(
        {
            error: message,
            ...(details ? { details } : {}),
        },
        { status }
    );
}

export async function validateBody<T>(
    request: Request,
    schema: z.ZodType<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
    try {
        const body = await request.json();
        const parsed = schema.safeParse(body);
        if (!parsed.success) {
            return {
                data: null,
                error: errorResponse('Validasi input gagal', 400, parsed.error.flatten().fieldErrors),
            };
        }
        return { data: parsed.data, error: null };
    } catch (err) {
        logError('validateBody', err);
        return { data: null, error: errorResponse('Format JSON tidak valid', 400) };
    }
}
