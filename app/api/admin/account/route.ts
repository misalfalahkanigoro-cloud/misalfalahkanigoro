import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { requireAdminRole } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { data, error } = await supabaseAdmin()
            .from('admin_publicweb')
            .select('id, username, user_role, full_name, email, phone, created_at, updated_at')
            .eq('id', session.id)
            .maybeSingle();

        if (error) throw error;
        if (!data) {
            return NextResponse.json({ error: 'Akun tidak ditemukan' }, { status: 404 });
        }

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
        console.error('Admin account GET error:', error);
        return NextResponse.json({ error: 'Gagal memuat akun admin' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const payload = await request.json();
        const updates: Record<string, any> = {};

        if (payload.fullName !== undefined || payload.full_name !== undefined) {
            const fullName = (payload.fullName || payload.full_name || '').trim();
            if (!fullName) {
                return NextResponse.json({ error: 'Nama wajib diisi' }, { status: 400 });
            }
            updates.full_name = fullName;
        }

        if (payload.email !== undefined) {
            updates.email = payload.email ? String(payload.email).trim() : null;
        }

        if (payload.phone !== undefined) {
            updates.phone = payload.phone ? String(payload.phone).trim() : null;
        }

        if (payload.password !== undefined && payload.password !== null && payload.password !== '') {
            const password = String(payload.password);
            if (password.length < 6) {
                return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 });
            }
            updates.password_hash = await bcrypt.hash(password, 10);
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'Tidak ada perubahan' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin()
            .from('admin_publicweb')
            .update(updates)
            .eq('id', session.id)
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
        console.error('Admin account PUT error:', error);
        return NextResponse.json({ error: 'Gagal memperbarui akun admin' }, { status: 500 });
    }
}
