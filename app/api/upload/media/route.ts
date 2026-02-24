import { NextRequest, NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folder = formData.get('folder') as string || 'mis-al-falah';

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        const normalizedFolder = folder.trim().replace(/^\/+|\/+$/g, '') || 'mis-al-falah';
        const fileExt = file.name.split('.').pop() || 'bin';
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `${normalizedFolder}/${Date.now()}-${randomUUID()}-${safeName || `upload.${fileExt}`}`;
        const contentType = file.type || 'application/octet-stream';
        const bucketName = 'media';
        const storageProvider = 'r2';

        const { error: uploadError } = await dbAdmin()
            .storage
            .from(bucketName)
            .upload(path, file, {
                contentType,
                upsert: false,
            });

        if (uploadError) {
            return NextResponse.json(
                { error: uploadError.message },
                { status: 500 }
            );
        }

        const { data } = dbAdmin()
            .storage
            .from(bucketName)
            .getPublicUrl(path);

        return NextResponse.json({
            success: true,
            url: data.publicUrl,
            publicId: path,
            storageProvider,
            storageBucket: bucketName,
            storagePath: path,
        });
    } catch (error) {
        console.error('Error uploading to R2:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}
