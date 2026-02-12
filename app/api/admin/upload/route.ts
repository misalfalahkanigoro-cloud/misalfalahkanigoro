import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { v2 as cloudinary } from 'cloudinary';

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

        // Configure Cloudinary once
        if (!cloudinary.config().cloud_name) {
            cloudinary.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET,
                secure: true,
            });
        }

        const isImage = file.type?.startsWith('image/');

        if (isImage) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const uploadResult = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder,
                        resource_type: 'image',
                        overwrite: false,
                    },
                    (err, result) => {
                        if (err || !result) return reject(err || new Error('Cloudinary upload failed'));
                        resolve({ secure_url: result.secure_url, public_id: result.public_id });
                    }
                );
                stream.end(buffer);
            });

            let mediaItem: any = null;
            if (entityType && entityId) {
                const { data: inserted, error: dbError } = await supabaseAdmin()
                    .from('media_items')
                    .insert({
                        entity_type: entityType,
                        entity_id: entityId,
                        media_url: uploadResult.secure_url,
                        media_type: 'image',
                        caption,
                        thumbnail_url: uploadResult.secure_url,
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
                id: mediaItem?.id,
                url: uploadResult.secure_url,
                mediaUrl: uploadResult.secure_url,
                mediaType: 'image',
                caption,
                storagePath: uploadResult.public_id,
            });
        }

        // Non-image fallback to Supabase Storage (documents, etc.)
        const buffer = await file.arrayBuffer();
        const fileExt = file.name.split('.').pop();
        const fileName = `${folder}/${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
        const contentType = file.type || 'application/octet-stream';
        const bucketName = 'media';

        const { error: uploadError } = await supabaseAdmin()
            .storage
            .from(bucketName)
            .upload(fileName, buffer, {
                contentType,
                upsert: false
            });

        if (uploadError) {
            console.error('Storage Upload Error:', uploadError);
            throw uploadError;
        }

        const { data: { publicUrl } } = supabaseAdmin()
            .storage
            .from(bucketName)
            .getPublicUrl(fileName);

        const fallbackMediaType = file.type?.startsWith('video/') ? 'video' : 'image';
        return NextResponse.json({
            id: null,
            url: publicUrl,
            mediaUrl: publicUrl,
            mediaType: fallbackMediaType,
            caption,
            storagePath: fileName,
        });

    } catch (error) {
        console.error('Upload API Error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
