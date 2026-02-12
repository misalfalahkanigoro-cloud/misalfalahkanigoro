import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin()
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

export async function PUT(request: Request) {
    try {
        const payload = await request.json();

        const { data: existing, error: existingError } = await supabaseAdmin()
            .from('headmaster_greeting')
            .select('id')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (existingError) {
            throw existingError;
        }

        const updatePayload = {
            title: payload.title ?? '',
            subtitle: payload.subtitle ?? null,
            content_json: payload.content_json ?? payload.contentJson ?? null,
            content_html: payload.content_html ?? payload.contentHtml ?? null,
            content_text: payload.content_text ?? payload.contentText ?? null,
            headmaster_name: payload.headmaster_name ?? payload.headmasterName ?? '',
            headmaster_title: payload.headmaster_title ?? payload.headmasterTitle ?? null,
            photo_url: payload.photo_url ?? payload.photoUrl ?? null,
            is_active: payload.is_active ?? payload.isActive ?? true,
        };

        if (existing?.id) {
            const { data, error } = await supabaseAdmin()
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

        const { data, error } = await supabaseAdmin()
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
