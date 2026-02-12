import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { requireAdminRole } from '@/lib/admin-auth';

export const runtime = 'nodejs';

const MAX_RESULTS = 50;

const ensureCloudinaryConfig = () => {
    if (cloudinary.config().cloud_name) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error('Cloudinary credentials are missing');
    }

    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
    });
};

export async function GET(request: NextRequest) {
    const session = requireAdminRole(request.cookies, ['superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        ensureCloudinaryConfig();

        const { searchParams } = new URL(request.url);
        const kind = searchParams.get('kind') || 'resources';

        if (kind === 'usage') {
            const usage = await cloudinary.api.usage();
            return NextResponse.json({ usage });
        }

        if (kind === 'folders') {
            const prefix = searchParams.get('prefix') || '';
            const result = prefix
                ? await cloudinary.api.sub_folders(prefix)
                : await cloudinary.api.root_folders();
            return NextResponse.json({ folders: result?.folders || [] });
        }

        const prefix = searchParams.get('prefix') || undefined;
        const resourceType = (searchParams.get('resourceType') || 'image') as 'image' | 'video' | 'raw';
        const nextCursor = searchParams.get('nextCursor') || undefined;
        const maxResults = Math.min(
            Math.max(parseInt(searchParams.get('maxResults') || '', 10) || MAX_RESULTS, 1),
            200
        );

        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix,
            resource_type: resourceType,
            max_results: maxResults,
            next_cursor: nextCursor,
        });

        return NextResponse.json({
            resources: result.resources || [],
            nextCursor: result.next_cursor || null,
        });
    } catch (error) {
        console.error('Cloudinary storage error:', error);
        return NextResponse.json({ error: 'Gagal memuat Cloudinary' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const session = requireAdminRole(request.cookies, ['superadmin']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        ensureCloudinaryConfig();
        const body = await request.json();
        const publicId = body.publicId as string;
        const resourceType = (body.resourceType || 'image') as 'image' | 'video' | 'raw';

        if (!publicId) {
            return NextResponse.json({ error: 'publicId wajib diisi' }, { status: 400 });
        }

        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
            invalidate: true,
        });

        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        return NextResponse.json({ error: 'Gagal menghapus file Cloudinary' }, { status: 500 });
    }
}
