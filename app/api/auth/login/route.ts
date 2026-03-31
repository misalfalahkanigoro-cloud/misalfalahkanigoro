import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { dbAdmin } from '@/lib/db';
import { createAdminSessionToken } from '@/lib/admin-auth';
import { errorResponse, successResponse, validateBody } from '@/lib/api-response';

const LoginSchema = z.object({
    username: z.string().min(1, 'Username tidak boleh kosong').max(64),
    password: z.string().min(1, 'Password tidak boleh kosong').max(200),
});

export async function POST(request: NextRequest) {
    const { data, error } = await validateBody(request, LoginSchema);
    if (error) return error;

    try {
        const { username, password } = data;

        const { data: user, error: dbError } = await dbAdmin()
            .from('admin_publicweb')
            .select('id, username, password_hash, user_role, full_name, email, phone')
            .eq('username', username)
            .maybeSingle();

        if (dbError || !user) {
            return errorResponse('Kredensial tidak valid', 401);
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return errorResponse('Kredensial tidak valid', 401);
        }

        if (!['admin', 'superadmin'].includes(user.user_role)) {
            return errorResponse('Tidak memiliki akses admin', 403);
        }

        const payload = {
            user: {
                id: user.id,
                username: user.username,
                role: user.user_role,
                fullName: user.full_name,
                email: user.email,
                phone: user.phone,
            },
        };

        const response = successResponse(payload);

        const sessionPayload = createAdminSessionToken({
            id: user.id,
            username: user.username,
            role: user.user_role,
        });

        response.cookies.set('admin_session', sessionPayload, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 12, // 12 jam
        });

        return response;
    } catch (err) {
        console.error('Login error:', err);
        return errorResponse('Terjadi kesalahan pada server', 500);
    }
}

