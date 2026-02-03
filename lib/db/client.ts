import tursoDatabase from '@/lib/db/turso/client.turso'
import postgresDatabase from '@/lib/db/postgres/client.postgres'

if (!process.env.DATABASE_DIALECT)
    throw new Error('client.ts: DATABASE_DIALECT env variable is not set')

export const db = process.env.DATABASE_DIALECT === 'turso'
    ? tursoDatabase
    : postgresDatabase

export default db
