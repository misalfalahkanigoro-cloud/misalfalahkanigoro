import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdminRole } from '@/lib/admin-auth';

export const runtime = 'nodejs';

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const session = requireAdminRole(request.cookies, ['superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const payload = await request.json();
        const updates: Record<string, any> = {};

        if (payload.username) updates.username = payload.username.trim();
        if (payload.fullName || payload.full_name) updates.full_name = (payload.fullName || payload.full_name).trim();
        if (payload.email !== undefined) updates.email = payload.email || null;
        if (payload.phone !== undefined) updates.phone = payload.phone || null;
        if (payload.role) updates.user_role = payload.role === 'superadmin' ? 'superadmin' : 'admin';

        if (payload.password) {
            updates.password_hash = await bcrypt.hash(payload.password, 10);
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'Tidak ada perubahan' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin()
            .from('admin_publicweb')
            .update(updates)
            .eq('id', id)
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
        console.error('Admin users update error:', error);
        return NextResponse.json({ error: 'Gagal memperbarui admin' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const session = requireAdminRole(request.cookies, ['superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        if (session.id === id) {
            return NextResponse.json({ error: 'Tidak bisa menghapus akun sendiri' }, { status: 400 });
        }

        const { data: target, error: targetError } = await supabaseAdmin()
            .from('admin_publicweb')
            .select('id, user_role')
            .eq('id', id)
            .maybeSingle();

        if (targetError) throw targetError;
        if (!target) {
            return NextResponse.json({ error: 'Akun tidak ditemukan' }, { status: 404 });
        }

        if (target.user_role === 'superadmin') {
            const { count, error: countError } = await supabaseAdmin()
                .from('admin_publicweb')
                .select('id', { count: 'exact', head: true })
                .eq('user_role', 'superadmin');

            if (countError) throw countError;
            if ((count || 0) <= 1) {
                return NextResponse.json({ error: 'Minimal harus ada satu superadmin' }, { status: 400 });
            }
        }

        const { error } = await supabaseAdmin().from('admin_publicweb').delete().eq('id', id);
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin users delete error:', error);
        return NextResponse.json({ error: 'Gagal menghapus admin' }, { status: 500 });
    }
}
