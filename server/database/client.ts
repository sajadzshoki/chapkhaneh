import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

type Database = ReturnType<typeof drizzle<typeof schema>>

let cached: Database | null = null

/**
 * Lazily-created Drizzle client.
 *
 * Returns `null` when `DATABASE_URL` is not configured, which lets phase 1 run
 * (and build) with no database attached — callers fall back gracefully.
 */
export function useDatabase(): Database | null {
  if (cached) return cached

  const url = useRuntimeConfig().databaseUrl
  if (!url) return null

  cached = drizzle(postgres(url, { max: 5 }), { schema })
  return cached
}

export { schema }
