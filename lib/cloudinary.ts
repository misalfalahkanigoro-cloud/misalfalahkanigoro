import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

// Upload image/video to Cloudinary
export async function uploadToCloudinary(
    file: string, // base64 or URL
    options: {
        folder?: string;
        resourceType?: 'image' | 'video' | 'auto';
    } = {}
): Promise<{ url: string; publicId: string; error: Error | null }> {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder: options.folder || 'mis-al-falah',
            resource_type: options.resourceType || 'auto',
        });

        return {
            url: result.secure_url,
            publicId: result.public_id,
            error: null,
        };
    } catch (error) {
        return {
            url: '',
            publicId: '',
            error: error as Error,
        };
    }
}

// Delete from Cloudinary
export async function deleteFromCloudinary(
    publicId: string,
    resourceType: 'image' | 'video' = 'image'
): Promise<{ success: boolean; error: Error | null }> {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        return { success: true, error: null };
    } catch (error) {
        return { success: false, error: error as Error };
    }
}

// Get optimized image URL
export function getOptimizedImageUrl(
    publicId: string,
    options: {
        width?: number;
        height?: number;
        quality?: number;
        format?: string;
    } = {}
): string {
    return cloudinary.url(publicId, {
        transformation: [
            {
                width: options.width,
                height: options.height,
                crop: 'fill',
                quality: options.quality || 'auto',
                format: options.format || 'auto',
            },
        ],
    });
}
