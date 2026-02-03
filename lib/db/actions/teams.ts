'use server'
import { eq } from 'drizzle-orm'
import { db as tursoDatabase } from '@/lib/db/turso/client.turso'
import { teams } from '@/lib/db/turso/schema.turso'
import { Team } from '@/types'

const db = tursoDatabase!

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
