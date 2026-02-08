import tursoDatabase from '@/db/turso/client.turso'
import postgresDatabase from '@/db/postgres/client.postgres'

if (!process.env.DATABASE_DIALECT)
    throw new Error('client.ts: DATABASE_DIALECT env variable is not set')

type SupportedDatabase = typeof tursoDatabase | typeof postgresDatabase

export const db: SupportedDatabase = process.env.DATABASE_DIALECT === 'turso'
    ? tursoDatabase!
    : postgresDatabase!

export default db
