import { db } from '@/db/client'
import { and, desc, eq, inArray, sql } from 'drizzle-orm'
import { projects, tasks } from '@/db/schema'
import { Task } from '@repo/shared/types'
import { getAccessibleTeamIds } from '@/services/shared'
import { generateProjectAcronym, formatTaskKey } from '@/lib/slugs'

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

type CreateTaskInput = {
    id?: string
    title?: string
    status?: string
    description?: string
    order?: number
}

type UpdateTaskInput = {
    title?: string
    status?: string
    description?: string
    order?: number
}

export async function createTask(
    userId: string,
    teamId: string,
    projectId: string,
    data: CreateTaskInput,
): Promise<Task> {
    const accessibleTeamIds = getAccessibleTeamIds(userId)
    
    const [project] = await db
        .select({ id: projects.id, taskSequence: projects.taskSequence })
        .from(projects)
        .where(and(
            eq(projects.id, projectId),
            eq(projects.teamId, teamId),
            inArray(projects.teamId, accessibleTeamIds),
        ))
        .limit(1)
    
    if (!project)
        throw new Error('NotFound: Project not found')
    
    const title = (data.title || 'New Task').trim()
    if (!title)
        throw new Error('Task name is required')
    
    const status = data.status || 'backlog'
    const order = typeof data.order === 'number'
        ? data.order
        : await getNextTaskOrder(project.id, status)
    
    const localId = project.taskSequence
    
    const insertValues = {
        title,
        userId,
        projectId: project.id,
        localId,
        description: data.description || '',
        status,
        order,
        ...(data.id ? { id: data.id } : {}),
    }
    const [task] = await db
        .insert(tasks)
        .values(insertValues)
        .returning()
    
    // Increment taskSequence in projects
    await db
        .update(projects)
        .set({ taskSequence: project.taskSequence + 1 })
        .where(eq(projects.id, projectId))
    
    return task
}

export async function deleteTask(
    userId: string,
    teamId: string,
    projectId: string,
    taskId: string,
): Promise<void> {
    const accessibleTeamIds = getAccessibleTeamIds(userId)
    const accessibleProjectIds = db
        .select({ id: projects.id })
        .from(projects)
        .where(and(
            eq(projects.id, projectId),
            eq(projects.teamId, teamId),
            inArray(projects.teamId, accessibleTeamIds),
        ))
    
    const [task] = await db
        .select({ id: tasks.id })
        .from(tasks)
        .where(and(
            eq(tasks.id, taskId),
            inArray(tasks.projectId, accessibleProjectIds),
        ))
        .limit(1)
    
    if (!task)
        throw new Error('NotFound: Task not found')
    
    await db
        .delete(tasks)
        .where(eq(tasks.id, taskId))
}

export async function updateTask(
    userId: string,
    teamId: string,
    projectId: string,
    taskId: string,
    data: UpdateTaskInput,
): Promise<Task> {
    const accessibleTeamIds = getAccessibleTeamIds(userId)
    const accessibleProjectIds = db
        .select({ id: projects.id })
        .from(projects)
        .where(and(
            eq(projects.id, projectId),
            eq(projects.teamId, teamId),
            inArray(projects.teamId, accessibleTeamIds),
        ))
    
    const updateData: Partial<Task> = {}
    if (typeof data.title === 'string')
        updateData.title = data.title.trim()
    if (typeof data.description === 'string')
        updateData.description = data.description
    if (typeof data.status === 'string')
        updateData.status = data.status
    if (typeof data.order === 'number')
        updateData.order = data.order
    
    if (updateData.title === '')
        throw new Error('Task name is required')
    
    const [updated] = await db
        .update(tasks)
        .set(updateData)
        .where(and(
            eq(tasks.id, taskId),
            inArray(tasks.projectId, accessibleProjectIds),
        ))
        .returning()
    
    if (!updated)
        throw new Error('NotFound: Task not found')
    
    return updated
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

const getNextTaskOrder = async (projectId: string, status: string) => {
    const [row] = await db
        .select({ maxOrder: sql<number>`max(${tasks.order})` })
        .from(tasks)
        .where(and(
            eq(tasks.projectId, projectId),
            eq(tasks.status, status),
        ))
    
    return (row?.maxOrder ?? 0) + 1000
}

/**
 * Get task key (e.g., "CPW-01") for a task
 */
export async function getTaskKey(projectId: string, taskId: string): Promise<string | null> {
    const [project] = await db
        .select({ name: projects.name })
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1)
    
    const [task] = await db
        .select({ localId: tasks.localId })
        .from(tasks)
        .where(eq(tasks.id, taskId))
        .limit(1)
    
    if (!project || !task)
        return null
    
    const acronym = generateProjectAcronym(project.name)
    return formatTaskKey(acronym, task.localId)
}

/**
 * Get task by key (e.g., "CPW-01") within a project
 */
export async function getTaskByKey(
    userId: string,
    teamId: string,
    projectId: string,
    taskKey: string,
): Promise<Task | null> {
    const teamProjectIds = getTeamProjectIds(userId, teamId)
    
    const [project] = await db
        .select({ id: projects.id })
        .from(projects)
        .where(and(
            eq(projects.id, projectId),
            inArray(projects.id, teamProjectIds),
        ))
        .limit(1)
    
    if (!project)
        return null
    
    const localIdMatch = taskKey.match(/^[A-Z0-9]+-(\d+)$/)
    
    if (!localIdMatch)
        return null
    
    const localId = parseInt(localIdMatch[1], 10)
    
    const [task] = await db
        .select()
        .from(tasks)
        .where(and(
            eq(tasks.projectId, projectId),
            eq(tasks.localId, localId),
        ))
        .limit(1)
    
    return task || null
}
