import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'
import { Dialect } from 'drizzle-orm'

type DbCredentials = {
    url: string;
    authToken?: string;
}

// 'turso' | 'postgresql'
if (!import.meta.env.DATABASE_DIALECT)
    throw new Error('client.ts: DATABASE_DIALECT env variable is not set')

if (!import.meta.env.DATABASE_URL)
    throw new Error('client.ts: DATABASE_URL must be defined')

const dbCredentials: DbCredentials = {
    url: import.meta.env.DATABASE_URL!,
}

if (import.meta.env.DATABASE_DIALECT === 'turso')
    dbCredentials.authToken = import.meta.env.TURSO_AUTH_TOKEN

console.log('drizzle config', import.meta.env.DATABASE_DIALECT, import.meta.env.DATABASE_URL)

export default defineConfig({
    out: './drizzle',
    schema: import.meta.env.DATABASE_DIALECT === 'turso'
        ? './lib/db/turso/schema.turso.ts'
        : './lib/db/postgres/schema.postgres.ts',
    // @ts-expect-error Supports multiple dialects
    dialect: import.meta.env.DATABASE_DIALECT! as Dialect,
    dbCredentials,
})
