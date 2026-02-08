import { db } from '@/db/client'
import { and, desc, eq, inArray, or } from 'drizzle-orm'
import { projects, teamMembers, teams, tasks } from '@/db/schema'
import { Task } from '@repo/shared/types'

/**
 * Gets IDs of teams accessible to the user
 */
function getAccessibleTeamIds(userId: string) {
    const memberTeamIds = db
        .select({ id: teamMembers.teamId })
        .from(teamMembers)
        .where(eq(teamMembers.userId, userId))
    
    return db
        .select({ id: teams.id })
        .from(teams)
        .where(or(
            eq(teams.ownerId, userId),
            inArray(teams.id, memberTeamIds),
        ))
}

/**
 * Gets IDs of projects in a team that are accessible to the user
 */
function getTeamProjectIds(userId: string, teamId: string) {
    const accessibleTeamIds = getAccessibleTeamIds(userId)
    
    return db
        .select({ id: projects.id })
        .from(projects)
        .where(and(
            eq(projects.teamId, teamId),
            inArray(projects.teamId, accessibleTeamIds),
        ))
}

export async function createTask(userId: string, teamId: string, name: string): Promise<Task> {
    const trimmedName = name.trim()
    if (!trimmedName)
        throw new Error('Task name is required')
    
    const accessibleTeamIds = getAccessibleTeamIds(userId)
    
    // Check if teamId is actually a projectId
    let [project] = await db
        .select({ id: projects.id })
        .from(projects)
        .where(and(
            eq(projects.id, teamId),
            inArray(projects.teamId, accessibleTeamIds),
        ))
        .limit(1)
    
    if (!project) {
        // Otherwise treat teamId as a teamId and find its first project
        [project] = await db
            .select({ id: projects.id })
            .from(projects)
            .where(and(
                eq(projects.teamId, teamId),
                inArray(projects.teamId, accessibleTeamIds),
            ))
            .orderBy(projects.name)
            .limit(1)
    }
    
    if (!project)
        throw new Error('Unauthorized or Project not found')
    
    const [task] = await db
        .insert(tasks)
        .values({
            title: trimmedName,
            userId,
            projectId: project.id,
            description: '',
        })
        .returning()
    
    return task
}

export async function deleteTask(userId: string, taskId: string): Promise<void> {
    const accessibleTeamIds = getAccessibleTeamIds(userId)
    const accessibleProjectIds = db
        .select({ id: projects.id })
        .from(projects)
        .where(inArray(projects.teamId, accessibleTeamIds))
    
    const [task] = await db
        .select({ id: tasks.id })
        .from(tasks)
        .where(and(
            eq(tasks.id, taskId),
            inArray(tasks.projectId, accessibleProjectIds),
        ))
        .limit(1)
    
    if (!task)
        throw new Error('Unauthorized or Task not found')
    
    await db
        .delete(tasks)
        .where(eq(tasks.id, taskId))
}

export async function renameTask(userId: string, taskId: string, name: string): Promise<void> {
    const trimmedName = name.trim()
    if (!trimmedName)
        throw new Error('Task name is required')
    
    const accessibleTeamIds = getAccessibleTeamIds(userId)
    const accessibleProjectIds = db
        .select({ id: projects.id })
        .from(projects)
        .where(inArray(projects.teamId, accessibleTeamIds))
    
    const updated = await db
        .update(tasks)
        .set({ title: trimmedName })
        .where(and(
            eq(tasks.id, taskId),
            inArray(tasks.projectId, accessibleProjectIds),
        ))
        .returning({ id: tasks.id })
    
    if (updated.length === 0)
        throw new Error('Unauthorized or Task not found')
}

export async function getTasks(userId: string, teamId: string, projectId?: string): Promise<Task[]> {
    const teamProjectIds = getTeamProjectIds(userId, teamId)
    
    const query = projectId
        ? and(
            eq(tasks.projectId, projectId),
            inArray(tasks.projectId, teamProjectIds),
        )
        : inArray(tasks.projectId, teamProjectIds)
    
    return db.select()
        .from(tasks)
        .where(query)
        .orderBy(tasks.order, desc(tasks.createdAt))
}

export async function getTaskById(userId: string, teamId: string, projectId: string, taskId: string): Promise<Task> {
    const teamProjectIds = getTeamProjectIds(userId, teamId)
    
    const [task] = await db
        .select()
        .from(tasks)
        .where(and(
            eq(tasks.id, taskId),
            eq(tasks.projectId, projectId),
            inArray(tasks.projectId, teamProjectIds),
        ))
        .limit(1)
    
    return task
}
