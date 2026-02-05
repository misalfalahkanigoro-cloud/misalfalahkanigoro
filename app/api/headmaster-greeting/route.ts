import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { HeadmasterGreeting } from '@/lib/types';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin()
            .from('headmaster_greeting')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!data) {
            return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
        }

        const mapped: HeadmasterGreeting = {
            id: data.id,
            title: data.title,
            subtitle: data.subtitle,
            contentJson: data.content_json,
            contentHtml: data.content_html,
            contentText: data.content_text,
            headmasterName: data.headmaster_name,
            headmasterTitle: data.headmaster_title,
            photoUrl: data.photo_url,
            isActive: data.is_active,
        };

        return NextResponse.json(mapped);
    } catch (error) {
        console.error('Error fetching headmaster greeting:', error);
        return NextResponse.json({ error: 'Failed to fetch headmaster greeting' }, { status: 500 });
    }
}
