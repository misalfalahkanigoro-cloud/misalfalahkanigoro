import prisma from '@/lib/prisma';
import { dbAdmin } from '@/lib/db';
import { logError } from '@/lib/logger';

const DEFAULT_QUOTA_GB = 3;
const BYTES_PER_GB = 1024 * 1024 * 1024;

/**
 * Mendapatkan limit storage dalam bytes dari .env
 */
export function getStorageQuotaLimit(): number {
    const quotaGb = Number(process.env.NEXT_PUBLIC_STORAGE_QUOTA_GB) || DEFAULT_QUOTA_GB;
    return quotaGb * BYTES_PER_GB;
}

/**
 * Mengambil penggunaan storage saat ini dari database
 */
export async function getStorageUsage(): Promise<number> {
    try {
        const settings = await (prisma.site_settings as any).findFirst();
        return Number(settings?.storage_used_bytes || 0);
    } catch (error) {
        logError('storage.getUsage', error);
        return 0;
    }
}

/**
 * Validasi apakah ukuran file baru akan melampaui kuota
 */
export async function checkStorageQuota(newFileSizeBytes: number): Promise<{ ok: boolean; error?: string }> {
    const limit = getStorageQuotaLimit();
    const currentUsage = await getStorageUsage();

    if (currentUsage + newFileSizeBytes > limit) {
        const limitGb = limit / BYTES_PER_GB;
        return {
            ok: false,
            error: `Kapasitas storage penuh. Batas maksimal ${limitGb} GB.`
        };
    }

    return { ok: true };
}

/**
 * Update catatan penggunaan storage di database (ditambah atau dikurangi)
 */
export async function updateStorageUsage(deltaBytes: number) {
    try {
        const settings = await prisma.site_settings.findFirst({ select: { id: true } });
        if (!settings) return;

        await (prisma.site_settings as any).update({
            where: { id: settings.id },
            data: {
                storage_used_bytes: {
                    increment: deltaBytes
                }
            }
        });
    } catch (error) {
        logError('storage.updateUsage', error);
    }
}

/**
 * Sinkronisasi ulang data di database dengan kenyataan di Cloudflare R2
 * Fungsi ini memakan waktu dan resource, dipanggil saat manual sync atau berkala.
 */
export async function syncStorageUsageWithR2(): Promise<number> {
    try {
        const bucketName =
            (process.env.R2_BUCKET_PUBLIKWEB || process.env.R2_DEFAULT_BUCKET || process.env.R2_BUCKET_MEDIA || 'publikweb').trim();
        let totalSize = 0;

        // Menggunakan helper traverse yang ada di API storage jika memungkinkan, 
        // atau implementasi manual di sini.
        const { data, error } = await dbAdmin().storage.from(bucketName).list('', { limit: 10000 });

        if (error) throw error;

        // Catatan: listing R2 via dbAdmin().storage.list mendukung folder rekursif lewat R2BucketClient.list
        // Kita hitung total size dari hasil list.
        if (data) {
            totalSize = data.reduce((acc: number, item: any) => acc + (item.metadata?.size || 0), 0);
        }

        const settings = await prisma.site_settings.findFirst({ select: { id: true } });
        if (settings) {
            await (prisma.site_settings as any).update({
                where: { id: settings.id },
                data: { storage_used_bytes: totalSize }
            });
        }

        return totalSize;
    } catch (error) {
        logError('storage.syncUsage', error);
        throw error;
    }
}
