import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http'
import { NeonQueryFunction } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL)
    throw new Error('DATABASE_URL is not set')

export const db: (NeonHttpDatabase<Record<string, never>> & { $client: NeonQueryFunction<false, false> }) | undefined = process.env.DATABASE_DIALECT === 'postgres'
    ? drizzle(process.env.DATABASE_URL)
    : undefined

export default db
