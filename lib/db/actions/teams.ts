'use server'
import * as client from '@/lib/db/client'
import { teamMembers, teams, users } from '@/lib/db/schema'
import { eq, desc, and, or, inArray } from 'drizzle-orm'
import { Team } from '@/types'
import { getCurrentUser } from '@/lib/db/actions/shared'
import { User } from 'better-auth'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db: any = client.db!

export async function createTeam(name: string, ownerId: string, tempUser?: User): Promise<Team> {
    const user = tempUser || await getCurrentUser()
    
    if (ownerId !== user.id)
        throw new Error('Unauthorized')
    
    const [team] = await db
        .insert(teams)
        .values({
            name,
            ownerId,
        })
        .returning()
    
    await db
        .insert(teamMembers)
        .values({
            userId: ownerId,
            teamId: team.id,
            role: 'owner',
        })
    
    return team
    
}

export async function getUserTeams(userId: string, tempUser?: User): Promise<Team[]> {
    const user = tempUser || await getCurrentUser()
    
    if (userId !== user.id)
        throw new Error('Unauthorized')
    
    const memberTeamIds = db
        .select({ teamId: teamMembers.teamId })
        .from(teamMembers)
        .where(eq(teamMembers.userId, user.id))
    
    return db.select()
        .from(teams)
        .where(or(
            eq(teams.ownerId, user.id),
            inArray(teams.id, memberTeamIds),
        ))
        .orderBy(teams.name)
}

export async function getTeamById(teamId: string): Promise<Team> {
    const user = await getCurrentUser()
    
    const memberTeamIds = db
        .select({ teamId: teamMembers.teamId })
        .from(teamMembers)
        .where(eq(teamMembers.userId, user.id))
    
    const [team] = await db.select()
        .from(teams)
        .where(and(
            eq(teams.id, teamId),
            or(
                eq(teams.ownerId, user.id),
                inArray(teams.id, memberTeamIds),
            ),
        ))
        .limit(1)
    
    return team
}

export async function getTeamByLastUpdated(): Promise<Team> {
    const user = await getCurrentUser()
    
    const memberTeamIds = db
        .select({ teamId: teamMembers.teamId })
        .from(teamMembers)
        .where(eq(teamMembers.userId, user.id))
    
    const [team] = await db.select()
        .from(teams)
        .where(or(
            eq(teams.ownerId, user.id),
            inArray(teams.id, memberTeamIds),
        ))
        .orderBy(desc(teams.updatedAt))
        .limit(1)
    return team
}

export async function getTeamMembers(teamId: string) {
    const user = await getCurrentUser()
    const memberTeamIds = db
        .select({ teamId: teamMembers.teamId })
        .from(teamMembers)
        .where(eq(teamMembers.userId, user.id))
    const [team] = await db
        .select({ id: teams.id })
        .from(teams)
        .where(and(
            eq(teams.id, teamId),
            or(
                eq(teams.ownerId, user.id),
                inArray(teams.id, memberTeamIds),
            ),
        ))
        .limit(1)
    if (!team)
        throw new Error('Unauthorized')
    const result = await db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            image: users.image,
            role: teamMembers.role,
        })
        .from(teamMembers)
        .innerJoin(users, eq(teamMembers.userId, users.id))
        .where(eq(teamMembers.teamId, teamId))
        .orderBy(users.name)
    return result
}

export async function ensureUserHasTeam(userId: string, tempUser?: User): Promise<Team> {
    const userTeams = await getUserTeams(userId, tempUser)
    console.log('ensureUserHasTeam', userTeams)
    if (userTeams.length === 0)
        return createTeam('Personal', userId, tempUser)
    return userTeams[0]
}
