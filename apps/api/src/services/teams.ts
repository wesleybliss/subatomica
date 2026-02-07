import * as client from '@/db/client'
import { teamMembers, teams, users } from '@/db/schema'
import { eq, desc, and, or, inArray } from 'drizzle-orm'
import { Team } from '@repo/shared/types'
import { User } from 'better-auth'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db: any = client.db!

export async function createTeam(name: string, ownerId: string): Promise<Team> {
    
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

export async function getUserTeams(userId: string): Promise<Team[]> {
    console.log('wtf', 'getUserTeams', userId)
    const memberTeamIds = db
        .select({ teamId: teamMembers.teamId })
        .from(teamMembers)
        .where(eq(teamMembers.userId, userId))
    
    return db.select()
        .from(teams)
        .where(or(
            eq(teams.ownerId, userId),
            inArray(teams.id, memberTeamIds),
        ))
        .orderBy(teams.name)
}

export async function getTeamById(userId: string, teamId: string): Promise<Team> {
    
    const memberTeamIds = db
        .select({ teamId: teamMembers.teamId })
        .from(teamMembers)
        .where(eq(teamMembers.userId, userId))
    
    const [team] = await db.select()
        .from(teams)
        .where(and(
            eq(teams.id, teamId),
            or(
                eq(teams.ownerId, userId),
                inArray(teams.id, memberTeamIds),
            ),
        ))
        .limit(1)
    
    return team
    
}

export async function getTeamByLastUpdated(userId: string): Promise<Team> {
    
    const memberTeamIds = db
        .select({ teamId: teamMembers.teamId })
        .from(teamMembers)
        .where(eq(teamMembers.userId, userId))
    
    const [team] = await db.select()
        .from(teams)
        .where(or(
            eq(teams.ownerId, userId),
            inArray(teams.id, memberTeamIds),
        ))
        .orderBy(desc(teams.updatedAt))
        .limit(1)
    return team
}

export async function getTeamMembers(userId: string, teamId: string) {
    const memberTeamIds = db
        .select({ teamId: teamMembers.teamId })
        .from(teamMembers)
        .where(eq(teamMembers.userId, userId))
    const [team] = await db
        .select({ id: teams.id, ownerId: teams.ownerId })
        .from(teams)
        .where(and(
            eq(teams.id, teamId),
            or(
                eq(teams.ownerId, userId),
                inArray(teams.id, memberTeamIds),
            ),
        ))
        .limit(1)
    if (!team)
        throw new Error('Unauthorized')
    
    // Get members from teamMembers table
    const membersFromTable = await db
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
    
    // Check if owner is in the members list
    const ownerInMembers = membersFromTable.find((m: { id: string }) => m.id === team.ownerId)
    
    if (!ownerInMembers) {
        // Fetch owner details and add to list
        const [owner] = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                image: users.image,
            })
            .from(users)
            .where(eq(users.id, team.ownerId))
            .limit(1)
        
        if (owner) {
            membersFromTable.push({
                ...owner,
                role: 'owner',
            })
            
            // Also ensure owner is in teamMembers table for future consistency
            await db
                .insert(teamMembers)
                .values({
                    userId: team.ownerId,
                    teamId,
                    role: 'owner',
                })
                .onConflictDoNothing()
        }
    }
    
    // Sort by name
    membersFromTable.sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name))
    
    return membersFromTable
}

export async function ensureUserHasTeam(userId: string): Promise<Team> {
    const userTeams = await getUserTeams(userId)
    console.log('ensureUserHasTeam', userTeams)
    if (userTeams.length === 0)
        return createTeam('Personal', userId)
    return userTeams[0]
}

async function checkUserCanManageMembers(userId: string, teamId: string): Promise<void> {
    
    // First check if user is the team owner
    const [team] = await db
        .select({ ownerId: teams.ownerId })
        .from(teams)
        .where(eq(teams.id, teamId))
        .limit(1)
    
    if (team?.ownerId === userId) {
        return
    }
    
    // Otherwise check teamMembers table for admin role
    const [membership] = await db
        .select({ role: teamMembers.role })
        .from(teamMembers)
        .where(and(
            eq(teamMembers.teamId, teamId),
            eq(teamMembers.userId, userId),
        ))
        .limit(1)
    
    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
        throw new Error('Unauthorized: Only owners and admins can manage team members')
    }
}

export async function addTeamMember(teamId: string, email: string) {
    
    const [targetUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email?.toLowerCase()))
        .limit(1)
    
    if (!targetUser) {
        throw new Error(`User not found with email address "${email}"`)
    }
    
    const [existingMembership] = await db
        .select({ id: teamMembers.userId })
        .from(teamMembers)
        .where(and(
            eq(teamMembers.teamId, teamId),
            eq(teamMembers.userId, targetUser.id),
        ))
        .limit(1)
    
    if (existingMembership) {
        throw new Error('User is already a member of this team')
    }
    
    await db.insert(teamMembers).values({
        userId: targetUser.id,
        teamId,
        role: 'member',
    })
    
    return { success: true }
}

export async function removeTeamMember(teamId: string, userId: string) {
    await checkUserCanManageMembers(userId, teamId)
    
    const [targetMembership] = await db
        .select({ role: teamMembers.role })
        .from(teamMembers)
        .where(and(
            eq(teamMembers.teamId, teamId),
            eq(teamMembers.userId, userId),
        ))
        .limit(1)
    
    if (!targetMembership) {
        throw new Error('User is not a member of this team')
    }
    
    if (targetMembership.role === 'owner') {
        throw new Error('Cannot remove the team owner')
    }
    
    await db
        .delete(teamMembers)
        .where(and(
            eq(teamMembers.teamId, teamId),
            eq(teamMembers.userId, userId),
        ))
    
    return { success: true }
}

export async function canManageTeamMembers(userId: string, teamId: string): Promise<boolean> {
    try {
        await checkUserCanManageMembers(userId, teamId)
        return true
    } catch {
        return false
    }
}
