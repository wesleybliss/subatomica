import { createClient } from '@libsql/client'
import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql'
import { Team } from '@/types'
import { teams } from '@/lib/db/schema'

if (!process.env.DATABASE_URL)
    throw new Error('DATABASE_URL is not set')

if (!process.env.TURSO_AUTH_TOKEN)
    throw new Error('TURSO_AUTH_TOKEN is not set. You can get one from https://turso.app/settings/api-tokens')

export const turso = process.env.DATABASE_DIALECT === 'turso' ? createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
}) : undefined

export const db: LibSQLDatabase<Record<string, never>> | undefined = process.env.DATABASE_DIALECT === 'turso'
    ? drizzle(turso!)
    : undefined

export default db

/*
async function createTeam(name: string, userId: string): Promise<Team> {
    
    const fn = db!.insert(teams)
    
    const [team] = await db!
        .insert(teams)
        .values({
            name,
            userId,
        })
        .returning()
    
    return team
    
}*/
