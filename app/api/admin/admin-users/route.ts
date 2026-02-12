import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdminRole } from '@/lib/admin-auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const session = requireAdminRole(request.cookies, ['superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { data, error } = await supabaseAdmin()
            .from('admin_publicweb')
            .select('id, username, user_role, full_name, email, phone, created_at, updated_at')
            .order('created_at', { ascending: true });

        if (error) throw error;

        const users = (data || []).map((item: any) => ({
            id: item.id,
            username: item.username,
            role: item.user_role,
            fullName: item.full_name,
            email: item.email,
            phone: item.phone,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
        }));

        return NextResponse.json(users);
    } catch (error) {
        console.error('Admin users list error:', error);
        return NextResponse.json({ error: 'Gagal memuat data admin' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = requireAdminRole(request.cookies, ['superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const payload = await request.json();
        const username = (payload.username || '').trim();
        const password = (payload.password || '').trim();
        const fullName = (payload.fullName || payload.full_name || '').trim();
        const email = payload.email || null;
        const phone = payload.phone || null;
        const role = payload.role === 'superadmin' ? 'superadmin' : 'admin';

        if (!username || !password || !fullName) {
            return NextResponse.json({ error: 'Username, password, dan nama wajib diisi' }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const { data, error } = await supabaseAdmin()
            .from('admin_publicweb')
            .insert({
                username,
                password_hash: passwordHash,
                user_role: role,
                full_name: fullName,
                email,
                phone,
            })
            .select('id, username, user_role, full_name, email, phone, created_at, updated_at')
            .single();

        if (error) throw error;

        return NextResponse.json({
            id: data.id,
            username: data.username,
            role: data.user_role,
            fullName: data.full_name,
            email: data.email,
            phone: data.phone,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        });
    } catch (error) {
        console.error('Admin users create error:', error);
        return NextResponse.json({ error: 'Gagal menambahkan admin' }, { status: 500 });
    }
}
