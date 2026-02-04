'use server'
import * as client from '@/lib/db/client'
import { teamMembers, teams } from '@/lib/db/schema'
import { eq, desc, and, or, inArray } from 'drizzle-orm'
import { Team } from '@/types'
import { getCurrentUser } from '@/lib/db/actions/shared'
import { User } from 'better-auth'

const db: any = client.db!

export async function createTeam(name: string, userId: string, tempUser?: User): Promise<Team> {
    const user = tempUser || await getCurrentUser()

    if (userId !== user.id)
        throw new Error('Unauthorized')

    console.log('wtf', createTeam, name, userId)
    const [team] = await db
        .insert(teams)
        .values({
            name,
            userId,
        })
        .returning()

    await db
        .insert(teamMembers)
        .values({
            userId,
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
            eq(teams.userId, user.id),
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
                eq(teams.userId, user.id),
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
            eq(teams.userId, user.id),
            inArray(teams.id, memberTeamIds),
        ))
        .orderBy(desc(teams.updatedAt))
        .limit(1)

    return team
}

export async function ensureUserHasTeam(userId: string, tempUser?: User): Promise<Team> {
    
    const userTeams = await getUserTeams(userId, tempUser)
    console.log('ensureUserHasTeam', userTeams)
    if (userTeams.length === 0)
        return createTeam('Personal', userId, tempUser)
    
    return userTeams[0]
    
}
