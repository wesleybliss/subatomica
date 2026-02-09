import * as client from '@/db/client'
import { teamMembers, teams, users } from '@/db/schema'
import { and, eq, inArray, sql } from 'drizzle-orm'
import { Team } from '@repo/shared/types'
import { getAccessibleTeamIds } from '@/services/shared'
import { generateSlug } from '@repo/shared/utils/slugs'

const db = client.db

const ensureOwnerMembership = async (teamId: string) => {
    const [team] = await db
        .select({ ownerId: teams.ownerId })
        .from(teams)
        .where(eq(teams.id, teamId))
        .limit(1)
    
    if (!team)
        return null
    
    await db
        .insert(teamMembers)
        .values({
            userId: team.ownerId,
            teamId,
            role: 'owner',
        })
        .onConflictDoNothing()
    
    return team.ownerId
}

const getTeamRole = async (userId: string, teamId: string) => {
    const [team] = await db
        .select({ ownerId: teams.ownerId })
        .from(teams)
        .where(eq(teams.id, teamId))
        .limit(1)
    
    if (!team)
        return null
    
    if (team.ownerId === userId)
        return 'owner'
    
    const [membership] = await db
        .select({ role: teamMembers.role })
        .from(teamMembers)
        .where(and(
            eq(teamMembers.teamId, teamId),
            eq(teamMembers.userId, userId),
        ))
        .limit(1)
    
    return membership?.role ?? null
}

export async function createTeam(name: string, ownerId: string): Promise<Team> {
    const slug = generateSlug(name)
    
    const [team] = await db
        .insert(teams)
        .values({
            name,
            slug,
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
    const accessibleTeamIds = getAccessibleTeamIds(userId)
    
    return db.select()
        .from(teams)
        .where(inArray(teams.id, accessibleTeamIds))
        .orderBy(teams.name)
}

export async function getTeamById(userId: string, teamId: string): Promise<Team> {
    const accessibleTeamIds = getAccessibleTeamIds(userId)
    
    const [team] = await db.select()
        .from(teams)
        .where(and(
            eq(teams.id, teamId),
            inArray(teams.id, accessibleTeamIds),
        ))
        .limit(1)
    
    return team
}

export async function getTeamBySlug(userId: string, slug: string): Promise<Team> {
    const accessibleTeamIds = getAccessibleTeamIds(userId)
    
    const [team] = await db.select()
        .from(teams)
        .where(and(
            eq(teams.slug, slug),
            inArray(teams.id, accessibleTeamIds),
        ))
        .limit(1)
    
    return team
}

export async function getTeamMembers(userId: string, teamId: string) {
    const accessibleTeamIds = getAccessibleTeamIds(userId)
    
    const [team] = await db
        .select({ id: teams.id, ownerId: teams.ownerId })
        .from(teams)
        .where(and(
            eq(teams.id, teamId),
            inArray(teams.id, accessibleTeamIds),
        ))
        .limit(1)
    
    if (!team)
        throw new Error('Unauthorized or Team not found')
    
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
    if (userTeams.length === 0)
        return createTeam('Personal', userId)
    return userTeams[0]
}

export async function renameTeam(userId: string, teamId: string, newName: string): Promise<Team> {
    const accessibleTeamIds = getAccessibleTeamIds(userId)
    
    const [team] = await db.select()
        .from(teams)
        .where(and(
            eq(teams.id, teamId),
            inArray(teams.id, accessibleTeamIds),
        ))
        .limit(1)
    
    if (!team)
        throw new Error('NotFound: Team not found')
    
    const newSlug = generateSlug(newName)
    
    const [updated] = await db
        .update(teams)
        .set({
            name: newName,
            slug: newSlug,
        })
        .where(eq(teams.id, teamId))
        .returning()
    
    return updated
}

async function checkUserCanManageMembers(userId: string, teamId: string): Promise<void> {
    const role = await getTeamRole(userId, teamId)
    if (!role || (role !== 'owner' && role !== 'admin'))
        throw new Error('Forbidden: Only owners and admins can manage team members')
}

export async function addTeamMember(teamId: string, requesterId: string, email: string) {
    const role = await getTeamRole(requesterId, teamId)
    if (!role)
        throw new Error('NotFound: Team not found')
    if (role !== 'owner' && role !== 'admin')
        throw new Error('Forbidden: Only owners and admins can add team members')
    
    const [targetUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email?.toLowerCase()))
        .limit(1)
    
    if (!targetUser) {
        throw new Error('NotFound: User not found')
    }
    
    const [existingMembership] = await db
        .select({ userId: teamMembers.userId })
        .from(teamMembers)
        .where(and(
            eq(teamMembers.teamId, teamId),
            eq(teamMembers.userId, targetUser.id),
        ))
        .limit(1)
    
    if (existingMembership) {
        throw new Error('Conflict: User is already a member of this team')
    }
    
    await db.insert(teamMembers).values({
        userId: targetUser.id,
        teamId,
        role: 'member',
    })
    
    return { success: true }
}

export async function removeTeamMember(teamId: string, requesterId: string, targetUserId: string) {
    const ownerId = await ensureOwnerMembership(teamId)
    if (!ownerId)
        throw new Error('NotFound: Team not found')
    
    const requesterRole = await getTeamRole(requesterId, teamId)
    const [targetMembership] = await db
        .select({ role: teamMembers.role })
        .from(teamMembers)
        .where(and(
            eq(teamMembers.teamId, teamId),
            eq(teamMembers.userId, targetUserId),
        ))
        .limit(1)
    
    const targetRole = targetUserId === ownerId
        ? 'owner'
        : targetMembership?.role
    
    if (!targetRole)
        throw new Error('NotFound: Team member not found')
    
    if (!requesterRole)
        throw new Error('Forbidden: Only team members can remove themselves')
    
    if (requesterId !== targetUserId) {
        if (requesterRole !== 'owner' && requesterRole !== 'admin')
            throw new Error('Forbidden: Only owners and admins can remove members')
        if ((targetRole === 'owner' || targetRole === 'admin') && requesterRole !== 'owner')
            throw new Error('Forbidden: Only owners can remove admins or owners')
    }
    
    if (targetRole === 'owner') {
        const [ownerCount] = await db
            .select({ count: sql<number>`count(*)` })
            .from(teamMembers)
            .where(and(
                eq(teamMembers.teamId, teamId),
                eq(teamMembers.role, 'owner'),
            ))
        
        if ((ownerCount?.count ?? 0) <= 1)
            throw new Error('Forbidden: Cannot remove the last owner')
        
        if (targetUserId === ownerId) {
            const [nextOwner] = await db
                .select({ userId: teamMembers.userId })
                .from(teamMembers)
                .where(and(
                    eq(teamMembers.teamId, teamId),
                    eq(teamMembers.role, 'owner'),
                    sql`${teamMembers.userId} <> ${targetUserId}`,
                ))
                .limit(1)
            
            if (!nextOwner)
                throw new Error('Forbidden: Cannot remove the last owner')
            
            await db
                .update(teams)
                .set({ ownerId: nextOwner.userId })
                .where(eq(teams.id, teamId))
        }
    }
    
    await db
        .delete(teamMembers)
        .where(and(
            eq(teamMembers.teamId, teamId),
            eq(teamMembers.userId, targetUserId),
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
