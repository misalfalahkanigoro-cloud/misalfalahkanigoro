import {
    deleteFromSupabaseStorage as legacyDeleteFromStorage,
    supabase as legacyDb,
    supabaseAdmin as legacyDbAdmin,
    supabaseClient as legacyDbClient,
    uploadToSupabaseStorage as legacyUploadToStorage,
} from '@/lib/db-core';

export const dbClient = legacyDbClient;
export const db = legacyDb;
export const dbAdmin = legacyDbAdmin;
export const uploadToStorage = legacyUploadToStorage;
export const deleteFromStorage = legacyDeleteFromStorage;
