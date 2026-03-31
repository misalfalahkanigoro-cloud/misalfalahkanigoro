import { NextRequest, NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/db';
import { requireAdminRole } from '@/lib/admin-auth';
import { sanitizePlainText, sanitizeRichText, sanitizeUrl } from '@/lib/rich-text';

export async function GET(request: NextRequest) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { data, error } = await dbAdmin()
            .from('headmaster_greeting')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            throw error;
        }

        return NextResponse.json(data || null);
    } catch (error) {
        console.error('Admin headmaster greeting error:', error);
        return NextResponse.json({ error: 'Failed to fetch headmaster greeting' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const payload = await request.json();

        const { data: existing, error: existingError } = await dbAdmin()
            .from('headmaster_greeting')
            .select('id')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (existingError) {
            throw existingError;
        }

        const updatePayload = {
            title: sanitizePlainText(payload.title, 160) ?? '',
            subtitle: sanitizePlainText(payload.subtitle, 220) ?? null,
            content_json: payload.content_json ?? payload.contentJson ?? null,
            content_html: sanitizeRichText(payload.content_html ?? payload.contentHtml),
            content_text: sanitizePlainText(payload.content_text ?? payload.contentText, 5000),
            headmaster_name: sanitizePlainText(payload.headmaster_name ?? payload.headmasterName, 120) ?? '',
            headmaster_title: sanitizePlainText(payload.headmaster_title ?? payload.headmasterTitle, 160) ?? null,
            photo_url: sanitizeUrl(payload.photo_url ?? payload.photoUrl),
            is_active: payload.is_active ?? payload.isActive ?? true,
        };

        if (existing?.id) {
            const { data, error } = await dbAdmin()
                .from('headmaster_greeting')
                .update(updatePayload)
                .eq('id', existing.id)
                .select('*')
                .single();

            if (error) {
                throw error;
            }

            return NextResponse.json(data);
        }

        const { data, error } = await dbAdmin()
            .from('headmaster_greeting')
            .insert(updatePayload)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Admin headmaster greeting update error:', error);
        return NextResponse.json({ error: 'Failed to update headmaster greeting' }, { status: 500 });
    }
}
