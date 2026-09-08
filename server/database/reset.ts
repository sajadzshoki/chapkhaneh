import postgres from 'postgres'

/**
 * Drops the public schema and recreates it empty.
 *
 * Development convenience for starting over: run `npm run db:reset`, then
 * `npm run db:migrate && npm run db:seed`. Refuses to run against anything
 * that looks like a production database.
 */
async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('[reset] DATABASE_URL is not set.')
    process.exit(1)
  }

  if (process.env.NODE_ENV === 'production') {
    console.error('[reset] refusing to run with NODE_ENV=production.')
    process.exit(1)
  }

  const sql = postgres(url, { max: 1, onnotice: () => {} })
  try {
    console.info('[reset] dropping public schema…')
    // The `drizzle` schema holds the applied-migration journal. Dropping only
    // `public` would leave that journal behind, and the next `db:migrate` would
    // consider every migration already applied and create no tables.
    await sql.unsafe(`
      DROP SCHEMA IF EXISTS public CASCADE;
      DROP SCHEMA IF EXISTS drizzle CASCADE;
      CREATE SCHEMA public;
    `)
    console.info('[reset] done. Run `npm run db:migrate && npm run db:seed` next.')
  }
  catch (error) {
    console.error('[reset] failed:', error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
  finally {
    await sql.end()
  }
}

void main()
