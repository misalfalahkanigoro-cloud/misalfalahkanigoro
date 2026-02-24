import { NextRequest, NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folder = (formData.get('folder') as string) || 'general';
        const entityType = formData.get('entityType') as string | null;
        const entityId = formData.get('entityId') as string | null;
        const caption = (formData.get('caption') as string) || file?.name || '';
        const isMain = formData.get('isMain') === 'true';

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const normalizedFolder = folder.trim().replace(/^\/+|\/+$/g, '') || 'general';
        const buffer = await file.arrayBuffer();
        const fileExt = file.name.split('.').pop();
        const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileName = `${normalizedFolder}/${Date.now()}-${crypto.randomUUID()}-${originalName || `upload.${fileExt || 'bin'}`}`;
        const contentType = file.type || 'application/octet-stream';
        const bucketName = 'media';
        const storageProvider = 'r2';
        const mediaType = file.type?.startsWith('image/') ? 'image' : 'file';

        const { error: uploadError } = await dbAdmin()
            .storage
            .from(bucketName)
            .upload(fileName, buffer, {
                contentType,
                upsert: false,
            });

        if (uploadError) {
            console.error('Storage Upload Error:', uploadError);
            throw uploadError;
        }

        const { data: { publicUrl } } = dbAdmin()
            .storage
            .from(bucketName)
            .getPublicUrl(fileName);

        let mediaItem: any = null;
        if (entityType && entityId) {
            const { data: inserted, error: dbError } = await dbAdmin()
                .from('media_items')
                .insert({
                    entity_type: entityType,
                    entity_id: entityId,
                    storage_provider: storageProvider,
                    storage_bucket: bucketName,
                    storage_path: fileName,
                    media_url: publicUrl,
                    media_type: mediaType,
                    caption,
                    thumbnail_url: mediaType === 'image' ? publicUrl : null,
                    is_main: isMain,
                    display_order: 0,
                })
                .select()
                .single();

            if (dbError) {
                console.error('DB Insert Error:', dbError);
                throw dbError;
            }
            mediaItem = inserted;
        }

        return NextResponse.json({
            id: mediaItem?.id ?? null,
            url: publicUrl,
            mediaUrl: publicUrl,
            mediaType,
            caption,
            storageProvider,
            storageBucket: bucketName,
            storagePath: fileName,
        });

    } catch (error) {
        console.error('Upload API Error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
