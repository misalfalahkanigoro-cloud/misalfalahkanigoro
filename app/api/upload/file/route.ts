export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const bucket = formData.get('bucket') as string || 'downloads';
        const storageProvider = 'r2';

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const buffer = Buffer.from(await file.arrayBuffer());

        // Ensure bucket exists (idempotent)
        const { data: bucketInfo, error: bucketErr } = await dbAdmin().storage.getBucket(bucket);
        if (bucketErr || !bucketInfo) {
            const { error: createErr } = await dbAdmin().storage.createBucket(bucket, {
                public: true,
                fileSizeLimit: 50 * 1024 * 1024, // 50 MB
            });
            if (createErr) {
                console.error('Create bucket error:', createErr);
                return NextResponse.json({ error: 'Failed to create bucket' }, { status: 500 });
            }
        }

        // Upload to R2 storage adapter
        const { data, error } = await dbAdmin().storage
            .from(bucket)
            .upload(fileName, buffer, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type || 'application/octet-stream',
            });

        if (error) {
            console.error('Storage upload error:', error);
            return NextResponse.json(
                { error: error.message || 'Upload error' },
                { status: 500 }
            );
        }

        // Build public/proxy URL
        const { data: urlData } = dbAdmin().storage
            .from(bucket)
            .getPublicUrl(fileName);

        return NextResponse.json({
            success: true,
            url: urlData.publicUrl,
            storageProvider,
            storageBucket: bucket,
            storagePath: data.path,
            path: data.path,
        });
    } catch (error) {
        console.error('Error uploading to R2:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}
