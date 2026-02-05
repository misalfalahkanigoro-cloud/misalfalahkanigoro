import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    '';

// Client for browser/client-side usage
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
export const supabase = supabaseClient;

// Server client with service role (for server-side operations)
export const supabaseAdmin = () => {
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
};

// Upload file to Supabase Storage (for non-media files like PDFs, DOCXs)
export async function uploadToSupabaseStorage(
    file: File,
    bucket: string = 'downloads'
): Promise<{ url: string; error: Error | null }> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabaseAdmin().storage
        .from(bucket)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (error) {
        return { url: '', error: error as Error };
    }

    const { data: urlData } = supabaseAdmin().storage
        .from(bucket)
        .getPublicUrl(filePath);

    return { url: urlData.publicUrl, error: null };
}

// Delete file from Supabase Storage
export async function deleteFromSupabaseStorage(
    filePath: string,
    bucket: string = 'downloads'
): Promise<{ success: boolean; error: Error | null }> {
    const { error } = await supabaseAdmin().storage.from(bucket).remove([filePath]);

    if (error) {
        return { success: false, error: error as Error };
    }

    return { success: true, error: null };
}
