import tursoDatabase from '@/lib/db/turso/client.turso'
import postgresDatabase from '@/lib/db/postgres/client.postgres'
import { NeonHttpDatabase } from 'drizzle-orm/neon-http'
import { LibSQLDatabase } from 'drizzle-orm/libsql'

if (!process.env.DATABASE_DIALECT)
    throw new Error('client.ts: DATABASE_DIALECT env variable is not set')

type SupportedDatabase = LibSQLDatabase<Record<string, never>>
    | NeonHttpDatabase<Record<string, never>>

export const db: SupportedDatabase = process.env.DATABASE_DIALECT === 'turso'
    ? tursoDatabase!
    : postgresDatabase!

export default db
