import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

type Database = ReturnType<typeof drizzle<typeof schema>>

let cached: Database | null = null
let cachedUrl: string | null = null

function resolveUrl(): string {
  // `useRuntimeConfig()` is unavailable in standalone scripts (seed/migrate),
  // so fall back to the raw environment variable there.
  let url = process.env.DATABASE_URL ?? ''
  try {
    url = useRuntimeConfig().databaseUrl || url
  }
  catch {
    // Not in a Nitro context — the env value above is correct.
  }
  return url
}

/**
 * Lazily-created Drizzle client, cached per connection string.
 *
 * Throws when `DATABASE_URL` is missing: from phase 3 the database is the
 * source of truth, so silently degrading to mock data would hide a real
 * misconfiguration. Callers that must tolerate an outage use `tryDatabase()`.
 */
export function useDatabase(): Database {
  const url = resolveUrl()

  if (!url) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Database is not configured',
    })
  }

  if (cached && cachedUrl === url) return cached

  cached = drizzle(postgres(url, { max: 5 }), { schema })
  cachedUrl = url
  return cached
}

/** Returns `null` instead of throwing when the database is not configured. */
export function tryDatabase(): Database | null {
  return resolveUrl() ? useDatabase() : null
}

export { schema }
export type { Database }
