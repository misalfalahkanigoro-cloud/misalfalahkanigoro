import { Client } from 'pg';

type FkEdge = {
    table: string;
    referencedTable: string;
};

type TableColumn = {
    name: string;
    dataType: string;
    udtName: string;
};

const quoteIdent = (value: string) => `"${value.replace(/"/g, '""')}"`;

const chunkArray = <T>(items: T[], size: number): T[][] => {
    if (size <= 0) return [items];
    const chunks: T[][] = [];
    for (let index = 0; index < items.length; index += size) {
        chunks.push(items.slice(index, index + size));
    }
    return chunks;
};

const topoSortTables = (tables: string[], edges: FkEdge[]) => {
    const inDegree = new Map<string, number>();
    const adjacency = new Map<string, Set<string>>();

    for (const table of tables) {
        inDegree.set(table, 0);
        adjacency.set(table, new Set<string>());
    }

    for (const edge of edges) {
        if (!inDegree.has(edge.table) || !inDegree.has(edge.referencedTable)) continue;
        if (edge.table === edge.referencedTable) continue;
        if (!adjacency.get(edge.referencedTable)?.has(edge.table)) {
            adjacency.get(edge.referencedTable)?.add(edge.table);
            inDegree.set(edge.table, (inDegree.get(edge.table) || 0) + 1);
        }
    }

    const queue = tables.filter((table: any) => (inDegree.get(table) || 0) === 0).sort();
    const result: string[] = [];

    while (queue.length) {
        const current = queue.shift() as string;
        result.push(current);
        const neighbors = Array.from(adjacency.get(current) || []).sort();
        for (const neighbor of neighbors) {
            const next = (inDegree.get(neighbor) || 0) - 1;
            inDegree.set(neighbor, next);
            if (next === 0) queue.push(neighbor);
        }
        queue.sort();
    }

    const unresolved = tables.filter((table: any) => !result.includes(table)).sort();
    return [...result, ...unresolved];
};

async function getTables(client: Client) {
    const result = await client.query<{ table_name: string }>(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
        ORDER BY table_name
    `);

    return result.rows
        .map((row: any) => row.table_name)
        .filter((table: any) => table !== '_prisma_migrations');
}

async function getForeignKeys(client: Client) {
    const result = await client.query<{
        table_name: string;
        referenced_table: string;
    }>(`
        SELECT
            tc.table_name AS table_name,
            ccu.table_name AS referenced_table
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu
            ON tc.constraint_name = ccu.constraint_name
           AND tc.table_schema = ccu.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
    `);

    return result.rows.map((row: any) => ({
        table: row.table_name,
        referencedTable: row.referenced_table,
    }));
}

async function getTableColumns(client: Client, table: string) {
    const result = await client.query<{
        column_name: string;
        data_type: string;
        udt_name: string;
    }>(
        `
            SELECT column_name, data_type, udt_name
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = $1
            ORDER BY ordinal_position
        `,
        [table]
    );

    return result.rows.map((row: any) => ({
        name: row.column_name,
        dataType: row.data_type,
        udtName: row.udt_name,
    }));
}

const normalizeJsonValue = (value: string) => {
    let current: unknown = value;
    for (let attempt = 0; attempt < 3; attempt += 1) {
        if (typeof current !== 'string') return current;
        try {
            current = JSON.parse(current);
        } catch {
            return null;
        }
    }
    return current;
};

const normalizeColumnValue = (value: unknown, column: TableColumn) => {
    if (value === undefined) return null;

    const type = `${column.dataType}`.toLowerCase();
    const udt = `${column.udtName}`.toLowerCase();
    const isJson = type.includes('json') || udt.includes('json');

    if (!isJson) return value;
    if (value === null) return null;

    if (typeof value === 'string') {
        const parsed = normalizeJsonValue(value);
        return JSON.stringify(parsed);
    }

    return JSON.stringify(value);
};

async function insertRows(
    targetClient: Client,
    table: string,
    columns: TableColumn[],
    rows: Record<string, unknown>[]
) {
    if (!rows.length) return;

    const columnList = columns.map((column) => quoteIdent(column.name)).join(', ');
    const rowChunks = chunkArray(rows, 250);

    for (const chunk of rowChunks) {
        const values: unknown[] = [];
        let placeholderIndex = 1;

        const placeholders = chunk
            .map((row: any) => {
                const rowPlaceholders = columns.map((column) => {
                    values.push(normalizeColumnValue(row[column.name], column));
                    const token = `$${placeholderIndex}`;
                    placeholderIndex += 1;
                    return token;
                });
                return `(${rowPlaceholders.join(', ')})`;
            })
            .join(', ');

        const sql = `INSERT INTO ${quoteIdent(table)} (${columnList}) VALUES ${placeholders}`;
        await targetClient.query(sql, values);
    }
}

async function insertNavigationMenuRows(
    targetClient: Client,
    columns: TableColumn[],
    rows: Record<string, unknown>[]
) {
    if (!rows.length) return;

    const pending = [...rows];
    const inserted = new Set<string>();
    let lastPendingCount = pending.length + 1;

    while (pending.length > 0 && pending.length < lastPendingCount) {
        lastPendingCount = pending.length;
        const ready = pending.filter((row) => {
            const parentId = row.parent_id;
            if (parentId === null || parentId === undefined) return true;
            return inserted.has(String(parentId));
        });

        if (ready.length === 0) break;

        await insertRows(targetClient, 'navigation_menu', columns, ready);
        for (const row of ready) inserted.add(String(row.id));

        for (const row of ready) {
            const index = pending.findIndex((candidate) => candidate.id === row.id);
            if (index >= 0) pending.splice(index, 1);
        }
    }

    if (pending.length > 0) {
        throw new Error(
            `Gagal menyisipkan semua navigation_menu karena referensi parent tidak valid (${pending.length} baris tersisa).`
        );
    }
}

async function resetSequences(targetClient: Client) {
    const serialColumns = await targetClient.query<{
        table_name: string;
        column_name: string;
        seq_name: string | null;
    }>(`
        SELECT
            c.table_name,
            c.column_name,
            pg_get_serial_sequence(format('%I.%I', c.table_schema, c.table_name), c.column_name) AS seq_name
        FROM information_schema.columns c
        WHERE c.table_schema = 'public'
          AND c.column_default LIKE 'nextval(%'
    `);

    for (const row of serialColumns.rows) {
        if (!row.seq_name) continue;
        const tableName = quoteIdent(row.table_name);
        const columnName = quoteIdent(row.column_name);
        const sql = `
            SELECT setval(
                $1,
                COALESCE((SELECT MAX(${columnName}) FROM ${tableName}), 1),
                true
            )
        `;
        await targetClient.query(sql, [row.seq_name]);
    }
}

async function main() {
    const sourceUrl = process.env.SOURCE_DATABASE_URL || process.env.SUPABASE_SOURCE_DATABASE_URL;
    const targetUrl = process.env.DATABASE_URL;

    if (!sourceUrl) {
        throw new Error('SOURCE_DATABASE_URL belum diisi di .env');
    }

    if (!targetUrl) {
        throw new Error('DATABASE_URL (Neon) belum diisi di .env');
    }

    const sourceClient = new Client({ connectionString: sourceUrl });
    const targetClient = new Client({ connectionString: targetUrl });

    await sourceClient.connect();
    await targetClient.connect();

    try {
        const [sourceTables, targetTables] = await Promise.all([
            getTables(sourceClient),
            getTables(targetClient),
        ]);

        const transferableTables = sourceTables.filter((table: any) => targetTables.includes(table));
        const foreignKeys = await getForeignKeys(sourceClient);
        const orderedTables = topoSortTables(transferableTables, foreignKeys);

        console.log(`Menyalin ${orderedTables.length} tabel dari source database ke Neon...`);

        if (orderedTables.length > 0) {
            const truncateList = orderedTables.map((table) => quoteIdent(table)).join(', ');
            await targetClient.query(`TRUNCATE TABLE ${truncateList} RESTART IDENTITY CASCADE`);
        }

        for (const table of orderedTables) {
            const columns = await getTableColumns(sourceClient, table);
            if (columns.length === 0) continue;

            const selectSql = `SELECT * FROM ${quoteIdent(table)}`;
            const sourceRowsResult = await sourceClient.query<Record<string, unknown>>(selectSql);
            const rows = sourceRowsResult.rows;

            if (rows.length === 0) {
                console.log(`- ${table}: 0 baris`);
                continue;
            }

            if (table === 'navigation_menu') {
                await insertNavigationMenuRows(targetClient, columns, rows);
            } else {
                await insertRows(targetClient, table, columns, rows);
            }

            console.log(`- ${table}: ${rows.length} baris`);
        }

        await resetSequences(targetClient);
        console.log('Seed selesai: data source database berhasil disalin ke Neon.');
    } finally {
        await sourceClient.end();
        await targetClient.end();
    }
}

main()
    .catch((error) => {
        console.error('Seed gagal:', error);
        process.exit(1);
    });

