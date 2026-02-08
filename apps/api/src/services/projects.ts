import * as client from '@/db/client'
import { and, eq, inArray, or } from 'drizzle-orm'
import { projects, taskLanes, teamMembers, teams } from '@/db/schema'
import { Project, TaskLane } from '@repo/shared/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db: any = client.db!

export const ensureProjectLanes = async (projectId: string) => {
    
    const defaultLanes = [
        { key: 'todo', name: 'To Do', order: 0 },
        { key: 'in-progress', name: 'In Progress', order: 1 },
        { key: 'done', name: 'Done', order: 2 },
    ]
    
    const existingLanes = await db
        .select()
        .from(taskLanes)
        .where(eq(taskLanes.projectId, projectId))
    
    if (existingLanes.length === 0)
        await db.insert(taskLanes).values(
            defaultLanes.map(lane => ({
                ...lane,
                projectId,
            })),
        )
    
}

export async function createProject(userId: string, teamId: string, name: string): Promise<Project> {
    const memberTeamIds = db
        .select({ teamId: teamMembers.teamId })
        .from(teamMembers)
        .where(eq(teamMembers.userId, userId))
    const [team] = await db.select({ id: teams.id })
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
    const [project] = await db
        .insert(projects)
        .values({
            name,
            ownerId: userId,
            teamId,
        })
        .returning()
    await ensureProjectLanes(project.id)
    return project
}

export async function deleteProject(userId: string, projectId: string): Promise<void> {
    const [project] = await db
        .select({ ownerId: projects.ownerId })
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1)
    if (!project || project.ownerId !== userId)
        throw new Error('Unauthorized')
    await db
        .delete(projects)
        .where(eq(projects.id, projectId))
}

export async function renameProject(userId: string, projectId: string, name: string): Promise<void> {
    const trimmedName = name.trim()
    if (!trimmedName)
        throw new Error('Project name is required')
    const memberTeamIds = db
        .select({ teamId: teamMembers.teamId })
        .from(teamMembers)
        .where(eq(teamMembers.userId, userId))
    const accessibleTeamIds = db
        .select({ id: teams.id })
        .from(teams)
        .where(or(
            eq(teams.ownerId, userId),
            inArray(teams.id, memberTeamIds),
        ))
    const updated = await db
        .update(projects)
        .set({ name: trimmedName })
        .where(and(
            eq(projects.id, projectId),
            inArray(projects.teamId, accessibleTeamIds),
        ))
        .returning({ id: projects.id })
    if (updated.length === 0)
        throw new Error('Unauthorized')
}

export async function getProjects(userId: string, teamId?: string): Promise<Project[]> {
    const memberTeamIds = db
        .select({ teamId: teamMembers.teamId })
        .from(teamMembers)
        .where(eq(teamMembers.userId, userId))
    const accessibleTeamIds = db
        .select({ id: teams.id })
        .from(teams)
        .where(or(
            eq(teams.ownerId, userId),
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

export async function getProjectById(
    userId: string,
    teamId: string,
    projectId: string,
): Promise<(Project & { taskLanes: TaskLane[] }) | undefined> {
    
    const memberTeamIds = db
        .select({ teamId: teamMembers.teamId })
        .from(teamMembers)
        .where(eq(teamMembers.userId, userId))
    
    const accessibleTeamIds = db
        .select({ id: teams.id })
        .from(teams)
        .where(or(
            eq(teams.ownerId, userId),
            inArray(teams.id, memberTeamIds),
        ))
    
    const [project] = await db
        .select()
        .from(projects)
        .where(and(
            eq(projects.teamId, teamId),
            eq(projects.id, projectId),
            inArray(projects.teamId, accessibleTeamIds),
        ))
        .limit(1)
    if (!project)
        return project
    const lanes = await db
        .select()
        .from(taskLanes)
        .where(eq(taskLanes.projectId, project.id))
        .orderBy(taskLanes.order)
    return {
        ...project,
        taskLanes: lanes,
    }
}
