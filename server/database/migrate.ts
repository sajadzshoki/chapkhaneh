import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

/**
 * Applies pending Drizzle migrations. Run with `npm run db:migrate`.
 *
 * Uses a dedicated single connection (`max: 1`) as recommended for migrations,
 * and exits non-zero on failure so CI/deploy scripts stop.
 */
async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('[migrate] DATABASE_URL is not set. Copy .env.example to .env first.')
    process.exit(1)
  }

  const sql = postgres(url, { max: 1, onnotice: () => {} })
  const db = drizzle(sql)

  try {
    console.info('[migrate] applying migrations…')
    await migrate(db, { migrationsFolder: './server/database/migrations' })

    // Guard against a silently-empty run: if the journal says everything is
    // applied but no tables exist, the migration state is inconsistent (for
    // example the public schema was dropped without the drizzle schema).
    const [tableCount] = await sql<{ count: number }[]>`
      SELECT count(*)::int AS count
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `
    const count = tableCount?.count ?? 0
    if (count === 0) {
      throw new Error(
        'migrations reported success but no tables exist — the migration journal is '
        + 'out of sync. Run `npm run db:reset` and migrate again.',
      )
    }

    console.info(`[migrate] done. ${count} tables present.`)
  }
  catch (error) {
    console.error('[migrate] failed:', error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
  finally {
    await sql.end()
  }
}

void main()
