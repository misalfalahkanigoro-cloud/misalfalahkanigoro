// Deprecated compatibility layer.
// Use '@/lib/db' for all new code.
export {
    deleteFromSupabaseStorage,
    supabase,
    supabaseAdmin,
    supabaseClient,
    uploadToSupabaseStorage,
} from '@/lib/db-core';
