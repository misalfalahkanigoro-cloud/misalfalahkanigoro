import { randomUUID } from 'crypto';
import {
    CreateBucketCommand,
    DeleteObjectsCommand,
    HeadBucketCommand,
    ListBucketsCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';
import prisma from '@/lib/prisma';

type MutationType = 'select' | 'insert' | 'update' | 'delete' | 'upsert';
type SingleMode = 'single' | 'maybeSingle' | null;
type SupabaseCountOption = 'exact' | null;

type QueryResponse<T = any> = {
    data: T | null;
    error: Error | null;
    count?: number | null;
};

type QueryFilter =
    | { type: 'eq'; column: string; value: unknown }
    | { type: 'neq'; column: string; value: unknown }
    | { type: 'in'; column: string; values: unknown[] }
    | { type: 'not'; column: string; operator: string; value: unknown };

type QueryOrder = {
    column: string;
    ascending: boolean;
};

const DEFAULT_LIST_LIMIT = 100;
const DEFAULT_R2_REGION = process.env.R2_REGION || 'auto';
const DEFAULT_STORAGE_PROVIDER = 'r2';

const quoteIdent = (value: string) => `"${value.replace(/"/g, '""')}"`;

const encodePathSegment = (value: string) => encodeURIComponent(value).replace(/%2F/g, '/');

const toJsonSafe = (value: unknown): unknown => {
    if (typeof value === 'bigint') {
        if (value <= BigInt(Number.MAX_SAFE_INTEGER) && value >= BigInt(Number.MIN_SAFE_INTEGER)) {
            return Number(value);
        }
        return value.toString();
    }

    if (Array.isArray(value)) {
        return value.map((item) => toJsonSafe(item));
    }

    if (value && typeof value === 'object') {
        const output: Record<string, unknown> = {};
        for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
            output[key] = toJsonSafe(nested);
        }
        return output;
    }

    return value;
};

const normalizePath = (value: string) => value.replace(/^\/+/, '').replace(/\/+$/, '');

const joinPath = (prefix: string, name: string) => (prefix ? `${prefix}/${name}` : name);

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

const getR2PublicUrl = (bucket: string, path: string) => {
    const normalizedKey = normalizePath(path);
    const normalizedPath = encodePathSegment(normalizedKey);
    const configuredBase = (process.env.R2_PUBLIC_BASE_URL || '').trim().replace(/\/+$/, '');

    if (configuredBase) {
        if (configuredBase.includes('{bucket}')) {
            return `${configuredBase.replace('{bucket}', bucket)}/${normalizedPath}`;
        }
        return `${configuredBase}/${bucket}/${normalizedPath}`;
    }

    return `/api/storage/public?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(normalizedKey)}`;
};

const asNonEmptyString = (value: unknown): string | undefined => {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
};

const safeDecodeURIComponent = (value: string) => {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
};

type ParsedStorageIdentity = {
    bucket?: string;
    path?: string;
};

const parseStorageFromPublicUrl = (urlValue: string): ParsedStorageIdentity | null => {
    const raw = asNonEmptyString(urlValue);
    if (!raw) return null;

    try {
        const parsed = new URL(raw, 'http://local');
        const segments = parsed.pathname
            .split('/')
            .filter(Boolean)
            .map((segment) => safeDecodeURIComponent(segment));

        if (parsed.pathname === '/api/storage/public') {
            const bucket = asNonEmptyString(parsed.searchParams.get('bucket') || '');
            const path = asNonEmptyString(parsed.searchParams.get('path') || '');
            if (bucket && path) {
                return {
                    bucket: resolveBucketName(bucket),
                    path: normalizePath(path),
                };
            }
        }

        const host = parsed.hostname.toLowerCase();
        if (host.endsWith('.r2.cloudflarestorage.com') && segments.length >= 2) {
            return {
                bucket: resolveBucketName(segments[0]),
                path: normalizePath(segments.slice(1).join('/')),
            };
        }

        if (host.endsWith('.r2.dev') && segments.length >= 1) {
            const hostParts = host.split('.');
            if (hostParts.length >= 4 && hostParts[0] !== 'www') {
                return {
                    bucket: resolveBucketName(hostParts[0]),
                    path: normalizePath(segments.join('/')),
                };
            }
        }
    } catch {
        return null;
    }

    return null;
};

const normalizeStoragePayload = (table: string, payload: Record<string, unknown>) => {
    const next: Record<string, unknown> = { ...payload };

    if (table === 'media_items') {
        let bucket = asNonEmptyString(next.storage_bucket);
        let path = asNonEmptyString(next.storage_path);
        const url = asNonEmptyString(next.media_url);

        if ((!bucket || !path) && url) {
            const parsed = parseStorageFromPublicUrl(url);
            if (parsed) {
                bucket = bucket || parsed.bucket;
                path = path || parsed.path;
            }
        }

        if (path && !bucket) {
            bucket = resolveBucketName('media');
        }

        if (bucket) {
            const resolved = resolveBucketName(bucket);
            next.storage_bucket = resolved;
            bucket = resolved;
        }
        if (path) {
            const normalizedPath = normalizePath(path);
            next.storage_path = normalizedPath;
            path = normalizedPath;
        }

        if ((url || path || bucket) && !asNonEmptyString(next.storage_provider)) {
            next.storage_provider = DEFAULT_STORAGE_PROVIDER;
        }

        if (!url && bucket && path) {
            next.media_url = getR2PublicUrl(bucket, path);
        }

        const mediaType = asNonEmptyString(next.media_type);
        if (mediaType === 'image' && !asNonEmptyString(next.thumbnail_url) && asNonEmptyString(next.media_url)) {
            next.thumbnail_url = asNonEmptyString(next.media_url) as string;
        }

        return next;
    }

    if (table === 'download_files') {
        let bucket = asNonEmptyString(next.storage_bucket);
        let path = asNonEmptyString(next.storage_path);
        const url = asNonEmptyString(next.public_url);

        if ((!bucket || !path) && url) {
            const parsed = parseStorageFromPublicUrl(url);
            if (parsed) {
                bucket = bucket || parsed.bucket;
                path = path || parsed.path;
            }
        }

        if (path && !bucket) {
            bucket = resolveBucketName('downloads');
        }

        if (bucket) {
            const resolved = resolveBucketName(bucket);
            next.storage_bucket = resolved;
            bucket = resolved;
        }
        if (path) {
            const normalizedPath = normalizePath(path);
            next.storage_path = normalizedPath;
            path = normalizedPath;
        }

        if ((url || path || bucket) && !asNonEmptyString(next.storage_provider)) {
            next.storage_provider = DEFAULT_STORAGE_PROVIDER;
        }

        if (!url && bucket && path) {
            next.public_url = getR2PublicUrl(bucket, path);
        }

        if (!asNonEmptyString(next.file_name) && path) {
            next.file_name = path.split('/').pop() || path;
        }

        return next;
    }

    if (table === 'ppdb_files') {
        let bucket = asNonEmptyString(next.storage_bucket);
        let path = asNonEmptyString(next.storage_path);
        const url = asNonEmptyString(next.file_url);

        if ((!bucket || !path) && url) {
            const parsed = parseStorageFromPublicUrl(url);
            if (parsed) {
                bucket = bucket || parsed.bucket;
                path = path || parsed.path;
            }
        }

        if (path && !bucket) {
            bucket = resolveBucketName('media');
        }

        if (bucket) {
            const resolved = resolveBucketName(bucket);
            next.storage_bucket = resolved;
            bucket = resolved;
        }
        if (path) {
            const normalizedPath = normalizePath(path);
            next.storage_path = normalizedPath;
            path = normalizedPath;
        }

        if ((url || path || bucket) && !asNonEmptyString(next.storage_provider)) {
            next.storage_provider = DEFAULT_STORAGE_PROVIDER;
        }

        if (!url && bucket && path) {
            next.file_url = getR2PublicUrl(bucket, path);
        }

        return next;
    }

    if (table === 'downloads') {
        let bucket = asNonEmptyString(next.file_storage_bucket);
        let path = asNonEmptyString(next.file_storage_path);
        const url = asNonEmptyString(next.file_url);

        if ((!bucket || !path) && url) {
            const parsed = parseStorageFromPublicUrl(url);
            if (parsed) {
                bucket = bucket || parsed.bucket;
                path = path || parsed.path;
            }
        }

        if (path && !bucket) {
            bucket = resolveBucketName('downloads');
        }

        if (bucket) {
            const resolved = resolveBucketName(bucket);
            next.file_storage_bucket = resolved;
            bucket = resolved;
        }
        if (path) {
            const normalizedPath = normalizePath(path);
            next.file_storage_path = normalizedPath;
            path = normalizedPath;
        }

        if ((url || path || bucket) && !asNonEmptyString(next.file_storage_provider)) {
            next.file_storage_provider = DEFAULT_STORAGE_PROVIDER;
        }

        if (!url && bucket && path) {
            next.file_url = getR2PublicUrl(bucket, path);
        }

        return next;
    }

    return next;
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

const ensureR2Client = () => {
    if (!r2Client) {
        throw new Error('R2 storage belum dikonfigurasi. Isi R2_ACCESS_KEY_ID dan R2_SECRET_ACCESS_KEY di .env');
    }
    return r2Client;
};

const toBuffer = async (value: unknown): Promise<Buffer> => {
    if (Buffer.isBuffer(value)) return value;
    if (value instanceof Uint8Array) return Buffer.from(value);
    if (typeof value === 'string') return Buffer.from(value);
    if (value && typeof (value as any).arrayBuffer === 'function') {
        const arrayBuffer = await (value as any).arrayBuffer();
        return Buffer.from(arrayBuffer);
    }
    throw new Error('Format body upload tidak didukung');
};

class PrismaQueryBuilder implements PromiseLike<QueryResponse<any>> {
    private operation: MutationType = 'select';

    private selectedColumns = '*';

    private filters: QueryFilter[] = [];

    private orders: QueryOrder[] = [];

    private limitValue: number | null = null;

    private offsetValue: number | null = null;

    private countOption: SupabaseCountOption = null;

    private headOnly = false;

    private mutationReturning = false;

    private singleMode: SingleMode = null;

    private mutationPayload: Record<string, unknown> | Array<Record<string, unknown>> | null = null;

    private upsertConflict: string | null = null;

    constructor(private readonly table: string) {}

    select(columns = '*', options?: { count?: 'exact'; head?: boolean }) {
        if (this.operation === 'select') {
            this.selectedColumns = columns;
            this.countOption = options?.count || null;
            this.headOnly = Boolean(options?.head);
        } else {
            this.mutationReturning = true;
            if (options?.count === 'exact') {
                this.countOption = 'exact';
            }
        }
        return this;
    }

    insert(payload: Record<string, unknown> | Array<Record<string, unknown>>) {
        this.operation = 'insert';
        this.mutationPayload = payload;
        return this;
    }

    update(payload: Record<string, unknown>) {
        this.operation = 'update';
        this.mutationPayload = payload;
        return this;
    }

    upsert(payload: Record<string, unknown> | Array<Record<string, unknown>>, options?: { onConflict?: string }) {
        this.operation = 'upsert';
        this.mutationPayload = payload;
        this.upsertConflict = options?.onConflict || null;
        return this;
    }

    delete(options?: { count?: 'exact' }) {
        this.operation = 'delete';
        this.countOption = options?.count || null;
        this.mutationPayload = null;
        return this;
    }

    eq(column: string, value: unknown) {
        this.filters.push({ type: 'eq', column, value });
        return this;
    }

    neq(column: string, value: unknown) {
        this.filters.push({ type: 'neq', column, value });
        return this;
    }

    in(column: string, values: unknown[]) {
        this.filters.push({ type: 'in', column, values });
        return this;
    }

    not(column: string, operator: string, value: unknown) {
        this.filters.push({ type: 'not', column, operator, value });
        return this;
    }

    order(column: string, options?: { ascending?: boolean }) {
        this.orders.push({ column, ascending: options?.ascending !== false });
        return this;
    }

    limit(value: number) {
        this.limitValue = Math.max(0, value);
        return this;
    }

    range(from: number, to: number) {
        const safeFrom = Math.max(0, from);
        const safeTo = Math.max(safeFrom, to);
        this.offsetValue = safeFrom;
        this.limitValue = safeTo - safeFrom + 1;
        return this;
    }

    maybeSingle() {
        this.singleMode = 'maybeSingle';
        return this;
    }

    single() {
        this.singleMode = 'single';
        return this;
    }

    async then<TResult1 = QueryResponse<any>, TResult2 = never>(
        onfulfilled?: ((value: QueryResponse<any>) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
    ): Promise<TResult1 | TResult2> {
        return this.execute().then(onfulfilled as any, onrejected as any);
    }

    private buildWhereClause(alias?: string) {
        const clauses: string[] = [];
        const params: unknown[] = [];

        const fieldRef = (column: string) => {
            if (!alias) return quoteIdent(column);
            return `${quoteIdent(alias)}.${quoteIdent(column)}`;
        };

        for (const filter of this.filters) {
            if (filter.type === 'eq') {
                if (filter.value === null) {
                    clauses.push(`${fieldRef(filter.column)} IS NULL`);
                } else {
                    params.push(filter.value);
                    clauses.push(`${fieldRef(filter.column)} = $${params.length}`);
                }
                continue;
            }

            if (filter.type === 'neq') {
                if (filter.value === null) {
                    clauses.push(`${fieldRef(filter.column)} IS NOT NULL`);
                } else {
                    params.push(filter.value);
                    clauses.push(`${fieldRef(filter.column)} <> $${params.length}`);
                }
                continue;
            }

            if (filter.type === 'in') {
                if (!filter.values || filter.values.length === 0) {
                    clauses.push('1 = 0');
                } else {
                    const placeholders = filter.values.map((value) => {
                        params.push(value);
                        return `$${params.length}`;
                    });
                    clauses.push(`${fieldRef(filter.column)} IN (${placeholders.join(', ')})`);
                }
                continue;
            }

            if (filter.type === 'not') {
                const operator = filter.operator.toLowerCase();
                if (operator === 'is') {
                    if (filter.value === null) {
                        clauses.push(`${fieldRef(filter.column)} IS NOT NULL`);
                    } else {
                        params.push(filter.value);
                        clauses.push(`${fieldRef(filter.column)} IS DISTINCT FROM $${params.length}`);
                    }
                }
            }
        }

        return {
            sql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
            params,
        };
    }

    private buildOrderLimitOffset(alias?: string) {
        const fieldRef = (column: string) => {
            if (!alias) return quoteIdent(column);
            return `${quoteIdent(alias)}.${quoteIdent(column)}`;
        };

        const segments: string[] = [];
        if (this.orders.length > 0) {
            const orderClause = this.orders
                .map((order) => `${fieldRef(order.column)} ${order.ascending ? 'ASC' : 'DESC'}`)
                .join(', ');
            segments.push(`ORDER BY ${orderClause}`);
        }
        if (this.limitValue !== null) {
            segments.push(`LIMIT ${Math.max(0, this.limitValue)}`);
        }
        if (this.offsetValue !== null) {
            segments.push(`OFFSET ${Math.max(0, this.offsetValue)}`);
        }
        return segments.join(' ');
    }

    private normalizeSingleResult(rows: any[], count: number | null): QueryResponse<any> {
        const converted = rows.map((row) => toJsonSafe(row));

        if (this.singleMode === 'single') {
            if (converted.length !== 1) {
                return {
                    data: null,
                    error: new Error(`Expected single row, got ${converted.length}`),
                    count,
                };
            }
            return { data: converted[0], error: null, count };
        }

        if (this.singleMode === 'maybeSingle') {
            if (converted.length > 1) {
                return {
                    data: null,
                    error: new Error(`Expected 0 or 1 row, got ${converted.length}`),
                    count,
                };
            }
            return { data: converted[0] || null, error: null, count };
        }

        return { data: converted, error: null, count };
    }

    private async executeSelect(): Promise<QueryResponse<any>> {
        const hasDownloadRelation = this.selectedColumns.includes('files:download_files(*)');
        const where = this.buildWhereClause(hasDownloadRelation ? 'd' : undefined);
        const orderLimitOffset = this.buildOrderLimitOffset(hasDownloadRelation ? 'd' : undefined);

        let count: number | null = null;
        if (this.countOption === 'exact') {
            const countSql = hasDownloadRelation
                ? `SELECT COUNT(*)::bigint AS count FROM ${quoteIdent(this.table)} ${quoteIdent('d')} ${where.sql}`
                : `SELECT COUNT(*)::bigint AS count FROM ${quoteIdent(this.table)} ${where.sql}`;
            const countRows = (await prisma.$queryRawUnsafe(countSql, ...where.params)) as Array<{ count: any }>;
            count = Number(countRows[0]?.count || 0);
        }

        if (this.headOnly) {
            return { data: null, error: null, count };
        }

        const parsedColumns = (() => {
            if (hasDownloadRelation) return '*';
            const raw = (this.selectedColumns || '*').trim();
            if (raw === '*' || raw.includes('(') || raw.includes(':')) return '*';
            const fields = raw
                .split(',')
                .map((field) => field.trim())
                .filter(Boolean);
            if (fields.length === 0) return '*';
            if (fields.some((field) => !/^[A-Za-z_][A-Za-z0-9_]*$/.test(field))) {
                return '*';
            }
            return fields.map((field) => quoteIdent(field)).join(', ');
        })();

        const sql = hasDownloadRelation
            ? `
                SELECT
                    d.*,
                    COALESCE(
                        (
                            SELECT json_agg(df ORDER BY df.display_order)
                            FROM ${quoteIdent('download_files')} df
                            WHERE df.download_id = d.id
                        ),
                        '[]'::json
                    ) AS files
                FROM ${quoteIdent(this.table)} d
                ${where.sql}
                ${orderLimitOffset}
            `
            : `
                SELECT ${parsedColumns}
                FROM ${quoteIdent(this.table)}
                ${where.sql}
                ${orderLimitOffset}
            `;

        const rows = (await prisma.$queryRawUnsafe(sql, ...where.params)) as any[];
        return this.normalizeSingleResult(rows, count);
    }

    private async executeInsert(): Promise<QueryResponse<any>> {
        const inputRows = Array.isArray(this.mutationPayload) ? this.mutationPayload : [this.mutationPayload || {}];
        const rows = inputRows.map((row) => normalizeStoragePayload(this.table, (row || {}) as Record<string, unknown>));
        if (rows.length === 0) return { data: [], error: null, count: null };

        const columns = Object.keys(rows[0]);
        if (columns.length === 0) {
            return { data: null, error: new Error('Insert payload kosong'), count: null };
        }

        const columnSql = columns.map((column) => quoteIdent(column)).join(', ');
        const values: unknown[] = [];
        let placeholder = 1;
        const valueGroups = rows
            .map((row) => {
                const entries = columns.map((column) => {
                    values.push((row as any)[column] ?? null);
                    const token = `$${placeholder}`;
                    placeholder += 1;
                    return token;
                });
                return `(${entries.join(', ')})`;
            })
            .join(', ');

        const returning = this.mutationReturning || this.singleMode !== null ? ' RETURNING *' : '';
        const sql = `INSERT INTO ${quoteIdent(this.table)} (${columnSql}) VALUES ${valueGroups}${returning}`;
        const result = returning
            ? ((await prisma.$queryRawUnsafe(sql, ...values)) as any[])
            : ((await prisma.$executeRawUnsafe(sql, ...values), []) as any[]);

        return this.normalizeSingleResult(result, null);
    }

    private async executeUpdate(): Promise<QueryResponse<any>> {
        const payload = normalizeStoragePayload(this.table, (this.mutationPayload || {}) as Record<string, unknown>);
        const columns = Object.keys(payload);
        if (columns.length === 0) {
            return { data: null, error: new Error('Update payload kosong'), count: null };
        }

        const where = this.buildWhereClause();
        const values: unknown[] = [];
        const setClause = columns
            .map((column) => {
                values.push(payload[column] ?? null);
                return `${quoteIdent(column)} = $${values.length}`;
            })
            .join(', ');

        const whereWithShift = (() => {
            if (!where.sql) return { sql: '', params: [] as unknown[] };
            const shiftedSql = where.sql.replace(/\$(\d+)/g, (_, idx) => `$${Number(idx) + values.length}`);
            return { sql: shiftedSql, params: where.params };
        })();

        const returning = this.mutationReturning || this.singleMode !== null ? ' RETURNING *' : '';
        const sql = `UPDATE ${quoteIdent(this.table)} SET ${setClause} ${whereWithShift.sql}${returning}`;
        const params = [...values, ...whereWithShift.params];

        const rows = returning
            ? ((await prisma.$queryRawUnsafe(sql, ...params)) as any[])
            : ((await prisma.$executeRawUnsafe(sql, ...params), []) as any[]);

        return this.normalizeSingleResult(rows, null);
    }

    private async executeUpsert(): Promise<QueryResponse<any>> {
        const inputRows = Array.isArray(this.mutationPayload) ? this.mutationPayload : [this.mutationPayload || {}];
        const rows = inputRows.map((row) => normalizeStoragePayload(this.table, (row || {}) as Record<string, unknown>));
        if (rows.length === 0) return { data: [], error: null, count: null };

        const columns = Object.keys(rows[0]);
        if (columns.length === 0) {
            return { data: null, error: new Error('Upsert payload kosong'), count: null };
        }

        const conflictColumns = (this.upsertConflict || (columns.includes('id') ? 'id' : columns[0]))
            .split(',')
            .map((column) => column.trim())
            .filter(Boolean);

        if (conflictColumns.length === 0) {
            return { data: null, error: new Error('Kolom onConflict tidak valid'), count: null };
        }

        const updatableColumns = columns.filter((column) => !conflictColumns.includes(column));
        const columnSql = columns.map((column) => quoteIdent(column)).join(', ');
        const values: unknown[] = [];
        let placeholder = 1;

        const valueGroups = rows
            .map((row) => {
                const entries = columns.map((column) => {
                    values.push((row as any)[column] ?? null);
                    const token = `$${placeholder}`;
                    placeholder += 1;
                    return token;
                });
                return `(${entries.join(', ')})`;
            })
            .join(', ');

        const conflictSql = conflictColumns.map((column) => quoteIdent(column)).join(', ');
        const updateSql =
            updatableColumns.length > 0
                ? updatableColumns
                      .map((column) => `${quoteIdent(column)} = EXCLUDED.${quoteIdent(column)}`)
                      .join(', ')
                : `${quoteIdent(conflictColumns[0])} = EXCLUDED.${quoteIdent(conflictColumns[0])}`;

        const returning = this.mutationReturning || this.singleMode !== null ? ' RETURNING *' : '';
        const sql = `
            INSERT INTO ${quoteIdent(this.table)} (${columnSql})
            VALUES ${valueGroups}
            ON CONFLICT (${conflictSql})
            DO UPDATE SET ${updateSql}
            ${returning}
        `;

        const result = returning
            ? ((await prisma.$queryRawUnsafe(sql, ...values)) as any[])
            : ((await prisma.$executeRawUnsafe(sql, ...values), []) as any[]);

        return this.normalizeSingleResult(result, null);
    }

    private async executeDelete(): Promise<QueryResponse<any>> {
        const where = this.buildWhereClause();
        const sql = `DELETE FROM ${quoteIdent(this.table)} ${where.sql} RETURNING *`;
        const rows = (await prisma.$queryRawUnsafe(sql, ...where.params)) as any[];
        const count = this.countOption === 'exact' ? rows.length : null;
        return this.normalizeSingleResult(rows, count);
    }

    async execute(): Promise<QueryResponse<any>> {
        try {
            switch (this.operation) {
                case 'insert':
                    return await this.executeInsert();
                case 'update':
                    return await this.executeUpdate();
                case 'upsert':
                    return await this.executeUpsert();
                case 'delete':
                    return await this.executeDelete();
                case 'select':
                default:
                    return await this.executeSelect();
            }
        } catch (error) {
            const normalizedError = error instanceof Error ? error : new Error(String(error));
            return {
                data: null,
                error: normalizedError,
                count: null,
            };
        }
    }
}

class R2BucketClient {
    constructor(private readonly bucket: string) {}

    async upload(
        path: string,
        body: unknown,
        options?: { upsert?: boolean; contentType?: string; cacheControl?: string }
    ) {
        try {
            const client = ensureR2Client();
            const normalizedPath = normalizePath(path);
            const buffer = await toBuffer(body);

            await client.send(
                new PutObjectCommand({
                    Bucket: this.bucket,
                    Key: normalizedPath,
                    Body: buffer,
                    ContentType: options?.contentType || undefined,
                    CacheControl: options?.cacheControl,
                    ...(options?.upsert === false ? { IfNoneMatch: '*' } : {}),
                })
            );

            return {
                data: { path: normalizedPath },
                error: null,
            };
        } catch (error) {
            return {
                data: null,
                error: error instanceof Error ? error : new Error(String(error)),
            };
        }
    }

    getPublicUrl(path: string) {
        return {
            data: {
                publicUrl: getR2PublicUrl(this.bucket, path),
            },
        };
    }

    async remove(paths: string[]) {
        try {
            const client = ensureR2Client();
            const normalized = paths.map((item) => normalizePath(item)).filter(Boolean);
            if (normalized.length === 0) {
                return { data: [], error: null };
            }

            await client.send(
                new DeleteObjectsCommand({
                    Bucket: this.bucket,
                    Delete: {
                        Objects: normalized.map((key) => ({ Key: key })),
                        Quiet: true,
                    },
                })
            );

            return {
                data: normalized,
                error: null,
            };
        } catch (error) {
            return {
                data: null,
                error: error instanceof Error ? error : new Error(String(error)),
            };
        }
    }

    async list(
        prefix = '',
        options?: { limit?: number; offset?: number; sortBy?: { column?: string; order?: 'asc' | 'desc' } }
    ) {
        try {
            const client = ensureR2Client();
            const normalizedPrefix = normalizePath(prefix);
            const s3Prefix = normalizedPrefix ? `${normalizedPrefix}/` : '';
            const files: Array<{
                name: string;
                id: string;
                updated_at: string | null;
                created_at: string | null;
                last_accessed_at: string | null;
                metadata: { size: number };
            }> = [];
            const folders: Array<{
                name: string;
                id: null;
                updated_at: null;
                created_at: null;
                last_accessed_at: null;
                metadata: { size: null };
            }> = [];

            let continuationToken: string | undefined;
            do {
                const response = await client.send(
                    new ListObjectsV2Command({
                        Bucket: this.bucket,
                        Prefix: s3Prefix || undefined,
                        Delimiter: '/',
                        ContinuationToken: continuationToken,
                        MaxKeys: 1000,
                    })
                );

                for (const commonPrefix of response.CommonPrefixes || []) {
                    const rawPrefix = commonPrefix.Prefix || '';
                    const folderName = rawPrefix
                        .replace(s3Prefix, '')
                        .replace(/\/+$/, '');
                    if (!folderName) continue;
                    folders.push({
                        name: folderName,
                        id: null,
                        updated_at: null,
                        created_at: null,
                        last_accessed_at: null,
                        metadata: { size: null },
                    });
                }

                for (const item of response.Contents || []) {
                    const key = item.Key || '';
                    if (!key || key === s3Prefix) continue;

                    const fileName = key.replace(s3Prefix, '');
                    if (!fileName || fileName.includes('/')) continue;

                    const dateIso = item.LastModified ? item.LastModified.toISOString() : null;
                    files.push({
                        name: fileName,
                        id: key,
                        updated_at: dateIso,
                        created_at: dateIso,
                        last_accessed_at: null,
                        metadata: { size: Number(item.Size || 0) },
                    });
                }

                continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
            } while (continuationToken);

            const merged = [...folders, ...files].sort((a, b) => a.name.localeCompare(b.name, 'en'));
            const offset = Math.max(0, options?.offset || 0);
            const limit = Math.max(1, options?.limit || DEFAULT_LIST_LIMIT);
            const sliced = merged.slice(offset, offset + limit);

            return {
                data: sliced,
                error: null,
            };
        } catch (error) {
            return {
                data: null,
                error: error instanceof Error ? error : new Error(String(error)),
            };
        }
    }
}

class R2StorageClient {
    from(bucket: string) {
        return new R2BucketClient(resolveBucketName(bucket));
    }

    async listBuckets() {
        try {
            const client = ensureR2Client();
            const response = await client.send(new ListBucketsCommand({}));
            const buckets = (response.Buckets || []).map((bucket) => ({
                id: bucket.Name || '',
                name: bucket.Name || '',
                created_at: bucket.CreationDate ? bucket.CreationDate.toISOString() : null,
            }));
            return { data: buckets, error: null };
        } catch (error) {
            return {
                data: null,
                error: error instanceof Error ? error : new Error(String(error)),
            };
        }
    }

    async getBucket(bucket: string) {
        try {
            const client = ensureR2Client();
            const resolvedBucket = resolveBucketName(bucket);
            await client.send(new HeadBucketCommand({ Bucket: resolvedBucket }));
            return {
                data: { id: resolvedBucket, name: resolvedBucket },
                error: null,
            };
        } catch (error) {
            return {
                data: null,
                error: error instanceof Error ? error : new Error(String(error)),
            };
        }
    }

    async createBucket(bucket: string, _options?: { public?: boolean; fileSizeLimit?: number }) {
        try {
            const client = ensureR2Client();
            const resolvedBucket = resolveBucketName(bucket);
            await client.send(new CreateBucketCommand({ Bucket: resolvedBucket }));
            return {
                data: { id: resolvedBucket, name: resolvedBucket },
                error: null,
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (message.includes('BucketAlreadyOwnedByYou') || message.includes('BucketAlreadyExists')) {
                return {
                    data: { id: resolveBucketName(bucket), name: resolveBucketName(bucket) },
                    error: null,
                };
            }
            return {
                data: null,
                error: error instanceof Error ? error : new Error(String(error)),
            };
        }
    }
}

class PrismaSupabaseAdapter {
    storage = new R2StorageClient();

    from(table: string) {
        return new PrismaQueryBuilder(table);
    }
}

const adapter = new PrismaSupabaseAdapter();

export const supabaseClient = adapter as any;
export const supabase = supabaseClient;

export const supabaseAdmin = () => adapter;

export async function uploadToSupabaseStorage(
    file: File,
    bucket = 'downloads'
): Promise<{ url: string; error: Error | null }> {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${randomUUID()}.${fileExt || 'bin'}`;
        const upload = await supabaseAdmin().storage.from(bucket).upload(fileName, file, {
            upsert: false,
            contentType: file.type || 'application/octet-stream',
        });

        if (upload.error) {
            return { url: '', error: upload.error };
        }

        const { data } = supabaseAdmin().storage.from(bucket).getPublicUrl(fileName);
        return { url: data.publicUrl, error: null };
    } catch (error) {
        return {
            url: '',
            error: error instanceof Error ? error : new Error(String(error)),
        };
    }
}

export async function deleteFromSupabaseStorage(
    filePath: string,
    bucket = 'downloads'
): Promise<{ success: boolean; error: Error | null }> {
    const response = await supabaseAdmin().storage.from(bucket).remove([filePath]);
    if (response.error) {
        return { success: false, error: response.error };
    }
    return { success: true, error: null };
}
