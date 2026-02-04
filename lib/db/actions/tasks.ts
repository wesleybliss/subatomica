'use server'
import * as client from '@/lib/db/client'
import { or, and, desc, eq, like, inArray } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/db/actions/shared'
import { projects, tasks, teamMembers, teams } from '@/lib/db/schema'
import { Task } from '@/types'

const db: any = client.db!

const getAccessibleTeamIds = (userId: string) => {
    const memberTeamIds = db
        .select({ teamId: teamMembers.teamId })
        .from(teamMembers)
        .where(eq(teamMembers.userId, userId))

    return db
        .select({ id: teams.id })
        .from(teams)
        .where(or(
            eq(teams.userId, userId),
            inArray(teams.id, memberTeamIds),
        ))
}

const getAccessibleProjectIds = (userId: string) => {
    const accessibleTeamIds = getAccessibleTeamIds(userId)

    return db
        .select({ id: projects.id })
        .from(projects)
        .where(inArray(projects.teamId, accessibleTeamIds))
}

export async function createTask(data: { 
    title: string
    content?: string
    projectId: string
    status?: string
    priority?: string
    dueDate?: string
    assigneeId?: string
}): Promise<Task> {
    
    const user = await getCurrentUser()

    const accessibleTeamIds = getAccessibleTeamIds(user.id)
    const [project] = await db
        .select({ id: projects.id })
        .from(projects)
        .where(and(
            eq(projects.id, data.projectId),
            inArray(projects.teamId, accessibleTeamIds),
        ))
        .limit(1)

    if (!project)
        throw new Error('Unauthorized')
    
    // Get max order for the status to append to end
    const maxOrderTask = await db
        .select()
        .from(tasks)
        .where(and(
            eq(tasks.projectId, data.projectId),
            eq(tasks.status, data.status || 'backlog')
        ))
        .orderBy(desc(tasks.order))
        .limit(1)
    
    const order = maxOrderTask.length > 0 ? maxOrderTask[0].order + 1000 : 1000
    
    const [task] = await db
        .insert(tasks)
        .values({
            projectId: data.projectId,
            userId: user.id,
            title: data.title,
            content: data.content || '',
            status: data.status || 'backlog',
            priority: data.priority,
            dueDate: data.dueDate,
            assigneeId: data.assigneeId,
            order,
        })
        .returning()
    
    return task
    
}

export async function updateTask(taskId: string, data: { 
    title?: string
    content?: string
    status?: string
    priority?: string
    dueDate?: string
    assigneeId?: string
    order?: number
}): Promise<Task> {
    
    const user = await getCurrentUser()
    const accessibleProjectIds = getAccessibleProjectIds(user.id)
    
    const [task] = await db
        .update(tasks)
        .set({
            ...data,
            updatedAt: new Date().toISOString(),
        })
        .where(and(
            eq(tasks.id, taskId),
            inArray(tasks.projectId, accessibleProjectIds),
        ))
        .returning()
    
    return task
    
}

export async function updateTaskOrder(
    taskId: string,
    newStatus: string,
    newOrder: number
): Promise<Task> {
    
    const user = await getCurrentUser()
    const accessibleProjectIds = getAccessibleProjectIds(user.id)
    
    const [task] = await db
        .update(tasks)
        .set({
            status: newStatus,
            order: newOrder,
            updatedAt: new Date().toISOString(),
        })
        .where(and(
            eq(tasks.id, taskId),
            inArray(tasks.projectId, accessibleProjectIds),
        ))
        .returning()
    
    return task
    
}

export async function deleteTask(taskId: string): Promise<void> {
    
    const user = await getCurrentUser()
    const accessibleProjectIds = getAccessibleProjectIds(user.id)
    
    await db.delete(tasks)
        .where(and(
            eq(tasks.id, taskId),
            inArray(tasks.projectId, accessibleProjectIds),
        ))
    
}

export async function getTasks(projectId?: string, teamId?: string): Promise<Task[]> {
    
    const user = await getCurrentUser()
    const accessibleTeamIds = getAccessibleTeamIds(user.id)
    const accessibleProjectIds = getAccessibleProjectIds(user.id)
    const teamProjectIds = teamId
        ? db
            .select({ id: projects.id })
            .from(projects)
            .where(and(
                eq(projects.teamId, teamId),
                inArray(projects.teamId, accessibleTeamIds),
            ))
        : null
    
    const query = projectId
        ? and(
            eq(tasks.projectId, projectId),
            inArray(tasks.projectId, accessibleProjectIds),
        )
        : teamProjectIds
            ? inArray(tasks.projectId, teamProjectIds)
            : inArray(tasks.projectId, accessibleProjectIds)
    
    return db.select()
        .from(tasks)
        .where(query)
        .orderBy(tasks.order, desc(tasks.createdAt))
    
}

export async function getTasksByTeam(teamId: string): Promise<Task[]> {
    
    const user = await getCurrentUser()
    const accessibleTeamIds = getAccessibleTeamIds(user.id)
    
    // Join with projects to get tasks for a team
    const result = await db
        .select({ task: tasks })
        .from(tasks)
        .innerJoin(projects, eq(tasks.projectId, projects.id))
        .where(and(
            eq(projects.teamId, teamId),
            inArray(projects.teamId, accessibleTeamIds),
        ))
        .orderBy(tasks.order, desc(tasks.createdAt))
    
    return result.map((r: any) => r.task)
    
}

export async function getTask(taskId: string): Promise<Task> {
    
    const user = await getCurrentUser()
    const accessibleProjectIds = getAccessibleProjectIds(user.id)
    
    const [task] = await db
        .select()
        .from(tasks)
        .where(and(
            eq(tasks.id, taskId),
            inArray(tasks.projectId, accessibleProjectIds),
        ))
    
    return task
    
}

export async function searchTasks(query: string): Promise<Task[]> {
    
    const user = await getCurrentUser()
    const accessibleProjectIds = getAccessibleProjectIds(user.id)
    
    return db
        .select()
        .from(tasks)
        .where(and(
            inArray(tasks.projectId, accessibleProjectIds),
            or(
                like(tasks.title, `%${query}%`),
                like(tasks.content, `%${query}%`),
            ),
        ))
        .orderBy(desc(tasks.updatedAt))
        .limit(20)
    
}
