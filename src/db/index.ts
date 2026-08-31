import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Use a global singleton to avoid creating multiple pools in dev (HMR).
const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

// Create a lazy Pool proxy that defers the DATABASE_URL check and the
// actual pg.Pool construction to the first query at runtime.
// This allows the module to be safely imported during `next build`
// without a DATABASE_URL being present in the environment.
function createLazyPool(): Pool {
  let _pool: Pool | null = null;

  return new Proxy({} as Pool, {
    get(_target, prop) {
      if (!_pool) {
        if (globalForDb.__arenaNextJsPostgresqlPool) {
          _pool = globalForDb.__arenaNextJsPostgresqlPool;
        } else {
          const databaseUrl = process.env.DATABASE_URL;
          if (!databaseUrl) {
            throw new Error("DATABASE_URL is required");
          }
          _pool = new Pool({ connectionString: databaseUrl });
          if (process.env.NODE_ENV !== "production") {
            globalForDb.__arenaNextJsPostgresqlPool = _pool;
          }
        }
      }
      const value = (_pool as unknown as Record<string | symbol, unknown>)[prop];
      return typeof value === "function" ? value.bind(_pool) : value;
    },
  });
}

export const pool = createLazyPool();
export const db = drizzle(pool);
