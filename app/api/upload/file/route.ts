export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const bucket = formData.get('bucket') as string || 'downloads';

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
        const { data: bucketInfo, error: bucketErr } = await supabaseAdmin().storage.getBucket(bucket);
        if (bucketErr || !bucketInfo) {
            const { error: createErr } = await supabaseAdmin().storage.createBucket(bucket, {
                public: true,
                fileSizeLimit: 50 * 1024 * 1024, // 50 MB
            });
            if (createErr) {
                console.error('Create bucket error:', createErr);
                return NextResponse.json({ error: 'Failed to create bucket' }, { status: 500 });
            }
        }

        // Upload to Supabase Storage
        const { data, error } = await supabaseAdmin().storage
            .from(bucket)
            .upload(fileName, buffer, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type || 'application/octet-stream',
            });

        if (error) {
            console.error('Supabase upload error:', error);
            return NextResponse.json(
                { error: error.message || 'Upload error' },
                { status: 500 }
            );
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin().storage
            .from(bucket)
            .getPublicUrl(fileName);

        return NextResponse.json({
            success: true,
            url: urlData.publicUrl,
            path: data.path,
        });
    } catch (error) {
        console.error('Error uploading to Supabase:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}
