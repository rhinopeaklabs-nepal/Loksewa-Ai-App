// PostgreSQL connection pool with helpers
import pg from "pg";
import { getConfig } from "./config.js";
import { logger } from "./logger.js";

const { Pool, types } = pg;

// Parse numeric as float (default is string)
types.setTypeParser(1700, (val) => (val === null ? null : parseFloat(val)));

// Parse bigint as number (safe for our IDs)
types.setTypeParser(20, (val) => (val === null ? null : parseInt(val, 10)));

let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  if (pool) return pool;

  const config = getConfig();
  pool = new Pool({
    host: config.POSTGRES_HOST,
    port: config.POSTGRES_PORT,
    user: config.POSTGRES_USER,
    password: config.POSTGRES_PASSWORD,
    database: config.POSTGRES_DB,
    max: 20,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl: config.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  });

  pool.on("error", (err) => {
    logger.error({ err }, "Unexpected error on idle client");
  });

  return pool;
}

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<pg.QueryResult<T>> {
  const start = Date.now();
  try {
    const result = await getPool().query<T>(text, params);
    const duration = Date.now() - start;
    if (duration > 500) {
      logger.warn({ text, duration, rows: result.rowCount }, "Slow query");
    }
    return result;
  } catch (err) {
    logger.error({ err, text, params }, "Query failed");
    throw err;
  }
}

export async function withTransaction<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    const result = await query("SELECT 1 as ok");
    return result.rows[0]?.ok === 1;
  } catch {
    return false;
  }
}
