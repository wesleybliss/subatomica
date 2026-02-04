'use server'
import * as client from '@/lib/db/client'
import { or, and, desc, eq, like } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/db/actions/shared'
import { tasks } from '@/lib/db/turso/schema.turso'
import { Task } from '@/types'

const db: any = client.db!

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
    
    const [task] = await db
        .update(tasks)
        .set({
            ...data,
            updatedAt: new Date().toISOString(),
        })
        .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)))
        .returning()
    
    return task
    
}

export async function updateTaskOrder(
    taskId: string,
    newStatus: string,
    newOrder: number
): Promise<Task> {
    
    const user = await getCurrentUser()
    
    const [task] = await db
        .update(tasks)
        .set({
            status: newStatus,
            order: newOrder,
            updatedAt: new Date().toISOString(),
        })
        .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)))
        .returning()
    
    return task
    
}

export async function deleteTask(taskId: string): Promise<void> {
    
    const user = await getCurrentUser()
    
    await db.delete(tasks)
        .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)))
    
}

export async function getTasks(projectId?: string, teamId?: string): Promise<Task[]> {
    
    const user = await getCurrentUser()
    
    const query = projectId
        ? and(eq(tasks.userId, user.id), eq(tasks.projectId, projectId))
        : eq(tasks.userId, user.id)
    
    return db.select()
        .from(tasks)
        .where(query)
        .orderBy(tasks.order, desc(tasks.createdAt))
    
}

export async function getTasksByTeam(teamId: string): Promise<Task[]> {
    
    const user = await getCurrentUser()
    
    // Join with projects to get tasks for a team
    const { projects } = await import('../schema')
    
    const result = await db
        .select({ task: tasks })
        .from(tasks)
        .innerJoin(projects, eq(tasks.projectId, projects.id))
        .where(and(
            eq(tasks.userId, user.id),
            eq(projects.teamId, teamId)
        ))
        .orderBy(tasks.order, desc(tasks.createdAt))
    
    return result.map((r: any) => r.task)
    
}

export async function getTask(taskId: string): Promise<Task> {
    
    const user = await getCurrentUser()
    
    const [task] = await db
        .select()
        .from(tasks)
        .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)))
    
    return task
    
}

export async function searchTasks(query: string): Promise<Task[]> {
    
    const user = await getCurrentUser()
    
    return db
        .select()
        .from(tasks)
        .where(and(
            eq(tasks.userId, user.id),
            or(
                like(tasks.title, `%${query}%`),
                like(tasks.content, `%${query}%`),
            ),
        ))
        .orderBy(desc(tasks.updatedAt))
        .limit(20)
    
}
