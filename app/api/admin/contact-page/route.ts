import { NextRequest, NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/db';
import { requireAdminRole } from '@/lib/admin-auth';
import { sanitizeEmbedHtml, sanitizePlainText } from '@/lib/rich-text';

export async function GET(request: NextRequest) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { data: page, error } = await dbAdmin()
            .from('contact_page')
            .select('*')
            .eq('id', 'main')
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!page) {
            return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
        }

        return NextResponse.json(page);
    } catch (error: any) {
        console.error('Admin contact page error:', error);
        return NextResponse.json(
            { error: error?.message || error?.details || 'Failed to fetch contact page' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    const session = requireAdminRole(request.cookies, ['admin', 'superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const payload = await request.json();
        const pageId = 'main';

        const pagePayload = {
            id: pageId,
            address: sanitizePlainText(payload.address, 500) ?? '',
            phone: sanitizePlainText(payload.phone, 40) ?? null,
            email: sanitizePlainText(payload.email, 160) ?? '',
            whatsappList: Array.isArray(payload.whatsappList) ? payload.whatsappList : [],
            adminWhatsappId: sanitizePlainText(payload.adminWhatsappId, 120) ?? null,
            mapEmbedHtml: sanitizeEmbedHtml(payload.mapEmbedHtml) ?? '',
        };

        const { error: pageError } = await dbAdmin()
            .from('contact_page')
            .upsert(pagePayload, { onConflict: 'id' });

        if (pageError) {
            throw pageError;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Admin contact page update error:', error);
        return NextResponse.json(
            { error: error?.message || error?.details || 'Failed to update contact page' },
            { status: 500 }
        );
    }
}
