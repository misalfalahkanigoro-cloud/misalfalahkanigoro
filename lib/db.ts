import {
    db as coreDb,
    dbAdmin as coreDbAdmin,
    dbClient as coreDbClient,
} from '@/lib/db-core';

export const dbClient = coreDbClient;
export const db = coreDb;
export const dbAdmin = coreDbAdmin;
