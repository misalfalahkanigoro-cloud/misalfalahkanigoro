import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

export const runtime = 'nodejs';

const DEFAULT_R2_REGION = process.env.R2_REGION || 'auto';

const resolveBucketName = (bucket: string) => {
    const normalized = (bucket || process.env.R2_DEFAULT_BUCKET || 'media').trim();
    if (normalized === 'downloads') {
        return process.env.R2_BUCKET_DOWNLOADS || 'downloads';
    }
    if (normalized === 'media') {
        return process.env.R2_BUCKET_MEDIA || 'media';
    }
    return normalized;
};

const getR2Client = () => {
    const endpoint = process.env.R2_S3_ENDPOINT;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (!endpoint || !accessKeyId || !secretAccessKey) {
        return null;
    }

    return new S3Client({
        endpoint,
        region: DEFAULT_R2_REGION,
        forcePathStyle: true,
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
    });
};

const r2Client = getR2Client();

const toWebStream = async (body: unknown): Promise<ReadableStream<Uint8Array> | null> => {
    if (!body) return null;

    const candidate = body as {
        transformToWebStream?: () => Promise<ReadableStream<Uint8Array>> | ReadableStream<Uint8Array>;
    };

    if (candidate.transformToWebStream) {
        const stream = await candidate.transformToWebStream();
        return stream;
    }

    if (body instanceof Readable && typeof Readable.toWeb === 'function') {
        return Readable.toWeb(body) as ReadableStream<Uint8Array>;
    }

    return null;
};

export async function GET(request: NextRequest) {
    if (!r2Client) {
        return NextResponse.json({ error: 'R2 storage belum dikonfigurasi' }, { status: 500 });
    }

    const searchParams = request.nextUrl.searchParams;
    const bucket = resolveBucketName(searchParams.get('bucket') || 'media');
    const path = (searchParams.get('path') || '').replace(/^\/+/, '');

    if (!path) {
        return NextResponse.json({ error: 'Path file wajib diisi' }, { status: 400 });
    }

    try {
        const object = await r2Client.send(
            new GetObjectCommand({
                Bucket: bucket,
                Key: path,
            })
        );

        const stream = await toWebStream(object.Body);
        if (!stream) {
            return NextResponse.json({ error: 'Body objek tidak valid' }, { status: 500 });
        }

        const headers = new Headers();
        headers.set('Content-Type', object.ContentType || 'application/octet-stream');
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        if (object.ContentLength) {
            headers.set('Content-Length', object.ContentLength.toString());
        }
        if (object.ETag) {
            headers.set('ETag', object.ETag);
        }
        if (object.LastModified) {
            headers.set('Last-Modified', object.LastModified.toUTCString());
        }

        return new NextResponse(stream, { status: 200, headers });
    } catch (error: any) {
        if (error?.name === 'NoSuchKey' || error?.name === 'NotFound' || error?.$metadata?.httpStatusCode === 404) {
            return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 404 });
        }

        console.error('Failed to read object from R2', error);
        return NextResponse.json({ error: 'Gagal membaca file dari R2' }, { status: 500 });
    }
}
