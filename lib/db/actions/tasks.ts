'use server'
import * as client from '@/lib/db/client'
import { or, and, desc, eq, like } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/db/actions/shared'
import { tasks } from '@/lib/db/turso/schema.turso'
import { Task } from '@/types'

const db: any = client.db!

export async function createTask(data: { title: string; content: string; projectId: string }): Promise<Task> {
    
    const user = await getCurrentUser()
    
    const [task] = await db
        .insert(tasks)
        .values({
            projectId: data.projectId,
            userId: user.id,
            title: data.title,
            content: data.content,
        })
        .returning()
    
    return task
    
}

export async function updateTask(taskId: string, data: { title?: string; content?: string }): Promise<Task> {
    
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

export async function deleteTask(taskId: string): Promise<void> {
    
    const user = await getCurrentUser()
    
    await db.delete(tasks)
        .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)))
    
}

export async function getTasks(projectId?: string): Promise<Task[]> {
    
    const user = await getCurrentUser()
    
    const query = projectId
        ? and(eq(tasks.userId, user.id), eq(tasks.projectId, projectId))
        : eq(tasks.userId, user.id)
    
    return db.select()
        .from(tasks)
        .where(query)
        .orderBy(desc(tasks.updatedAt))
    
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
