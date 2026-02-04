'use server'
import * as client from '@/lib/db/client'
import { and, eq, inArray, or } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/db/actions/shared'
import { projects, teamMembers, teams } from '@/lib/db/schema'
import { ensureProjectLanes } from '@/lib/db/actions/lanes'
import { Project } from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db: any = client.db!

export async function createProject(name: string, teamId: string): Promise<Project> {
    const user = await getCurrentUser()
    const memberTeamIds = db
        .select({ teamId: teamMembers.teamId })
        .from(teamMembers)
        .where(eq(teamMembers.userId, user.id))
    const [team] = await db.select({ id: teams.id })
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
    const [project] = await db
        .insert(projects)
        .values({
            name,
            ownerId: user.id,
            teamId,
        })
        .returning()
    await ensureProjectLanes(project.id)
    return project
}

export async function deleteProject(projectId: string): Promise<void> {
    const user = await getCurrentUser()
    const [project] = await db
        .select({ ownerId: projects.ownerId })
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1)
    if (!project || project.ownerId !== user.id)
        throw new Error('Unauthorized')
    await db
        .delete(projects)
        .where(eq(projects.id, projectId))
}

export async function getProjects(teamId?: string): Promise<Project[]> {
    const user = await getCurrentUser()
    const memberTeamIds = db
        .select({ teamId: teamMembers.teamId })
        .from(teamMembers)
        .where(eq(teamMembers.userId, user.id))
    const accessibleTeamIds = db
        .select({ id: teams.id })
        .from(teams)
        .where(or(
            eq(teams.ownerId, user.id),
            inArray(teams.id, memberTeamIds),
        ))
    const query = teamId
        ? and(
            eq(projects.teamId, teamId),
            inArray(projects.teamId, accessibleTeamIds),
        )
        : inArray(projects.teamId, accessibleTeamIds)
    return db.select()
        .from(projects)
        .where(query)
        .orderBy(projects.name)
}

export async function getProjectById(projectId: string): Promise<Project> {
    const user = await getCurrentUser()
    const memberTeamIds = db
        .select({ teamId: teamMembers.teamId })
        .from(teamMembers)
        .where(eq(teamMembers.userId, user.id))
    const accessibleTeamIds = db
        .select({ id: teams.id })
        .from(teams)
        .where(or(
            eq(teams.ownerId, user.id),
            inArray(teams.id, memberTeamIds),
        ))
    const [project] = await db
        .select()
        .from(projects)
        .where(and(
            eq(projects.id, projectId),
            inArray(projects.teamId, accessibleTeamIds),
        ))
        .limit(1)
    return project
}
