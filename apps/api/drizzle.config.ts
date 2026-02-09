import 'dotenv/config'

import { defineConfig } from 'drizzle-kit'
import { Dialect } from 'drizzle-orm'

type DbCredentials = {
    url: string;
    authToken?: string;
}

// 'turso' | 'postgresql'
if (!process.env.DATABASE_DIALECT)
    throw new Error('client.ts: DATABASE_DIALECT env variable is not set')

if (!process.env.DATABASE_URL)
    throw new Error('client.ts: DATABASE_URL must be defined')

const dbCredentials: DbCredentials = {
    url: process.env.DATABASE_URL!,
}

if (process.env.DATABASE_DIALECT === 'turso')
    dbCredentials.authToken = process.env.TURSO_AUTH_TOKEN

console.log('drizzle config', process.env.DATABASE_DIALECT, process.env.DATABASE_URL)

export default defineConfig({
    out: './drizzle',
    schema: process.env.DATABASE_DIALECT === 'turso'
        ? './src/db/turso/schema.turso.ts'
        : './src/db/postgres/schema.postgres.ts',
    // @ts-expect-error Supports multiple dialects
    dialect: process.env.DATABASE_DIALECT! as Dialect,
    dbCredentials,
})
