import { drizzle } from 'drizzle-orm/neon-http'

if (!process.env.DATABASE_URL)
    throw new Error('DATABASE_URL is not set')

export const db = process.env.DATABASE_DIALECT === 'postgres'
    ? drizzle(process.env.DATABASE_URL)
    : undefined

export default db
