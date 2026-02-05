import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
        }

        const { data: user, error } = await supabaseAdmin()
            .from('admin_publicweb')
            .select('id, username, password_hash, user_role, full_name, email, phone')
            .eq('username', username)
            .maybeSingle();

        if (error || !user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        if (!['admin', 'superadmin'].includes(user.user_role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const response = NextResponse.json({
            user: {
                id: user.id,
                username: user.username,
                role: user.user_role,
                fullName: user.full_name,
                email: user.email,
                phone: user.phone,
            },
        });

        const sessionPayload = Buffer.from(
            JSON.stringify({
                id: user.id,
                username: user.username,
                role: user.user_role,
            })
        ).toString('base64');

        response.cookies.set('admin_session', sessionPayload, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 12,
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
