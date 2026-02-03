'use server'
import { eq } from 'drizzle-orm'
import * as client from '@/lib/db/client'
import * as schema from '@/lib/db/schema'
import { Team } from '@/types'
import { SQLiteTableWithColumns } from 'drizzle-orm/sqlite-core'

const db = client.db!
const teams = schema.teams as SQLiteTableWithColumns<any>

export async function createTeam(name: string, userId: string): Promise<Team> {
    
    const [team] = await db
        .insert(teams)
        .values({
            name,
            userId,
        })
        .returning()
    
    return team
    
}

export async function getUserTeams(userId: string): Promise<Team[]> {
    
    return db.select()
        .from(teams)
        .where(eq(teams.userId, userId))
        .orderBy(teams.name)
    
}

export async function ensureUserHasTeam(userId: string): Promise<Team> {
    
    const userTeams = await getUserTeams(userId)
    
    if (userTeams.length === 0)
        return createTeam('Personal', userId)
    
    return userTeams[0]
    
}
