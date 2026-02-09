import tursoDatabase from '@/db/turso/client.turso'
import postgresDatabase from '@/db/postgres/client.postgres'

if (!process.env.DATABASE_DIALECT)
    throw new Error('client.ts: DATABASE_DIALECT env variable is not set')

const database = process.env.DATABASE_DIALECT === 'turso'
    ? tursoDatabase
    : postgresDatabase

if (!database)
    throw new Error(`client.ts: Database client for ${process.env.DATABASE_DIALECT} ` +
        'is not initialized. Check your environment variables.')

// We cast to any because Drizzle's multi-dialect union types for the database object
// have conflicting method signatures (e.g., select, insert, update) that TypeScript
// cannot reconcile automatically, especially when combined with union types for schema columns.
// oxlint-disable-next-line typescript-eslint(no-explicit-any)
export const db = database as any

export default db
