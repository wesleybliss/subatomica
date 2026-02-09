import { TaskLane } from '@repo/shared/types'
import { generateSlug } from '@repo/shared/utils/slugs'
import { and, eq, inArray, ne, sql } from 'drizzle-orm'

import * as client from '@/db/client'
import { projects, taskLanes } from '@/db/schema'
import { getAccessibleTeamIds } from '@/services/shared'

const db = client.db

type CreateTaskLaneInput = {
    key?: string
    name?: string
    color?: string | null
    order?: number
    isDefault?: boolean
}

type UpdateTaskLaneInput = {
    key?: string
    name?: string
    color?: string | null
    order?: number
    isDefault?: boolean
}

const getAccessibleProject = async (userId: string, teamId: string, projectId: string) => {
    const accessibleTeamIds = getAccessibleTeamIds(userId)
    const [project] = await db
        .select({ id: projects.id })
        .from(projects)
        .where(and(
            eq(projects.id, projectId),
            eq(projects.teamId, teamId),
            inArray(projects.teamId, accessibleTeamIds),
        ))
        .limit(1)
    return project
}

const getTeamProjectIds = (userId: string, teamId: string) => {
    const accessibleTeamIds = getAccessibleTeamIds(userId)
    return db
        .select({ id: projects.id })
        .from(projects)
        .where(and(
            eq(projects.teamId, teamId),
            inArray(projects.teamId, accessibleTeamIds),
        ))
}

export async function getTaskLanes(userId: string, teamId: string, projectId: string): Promise<TaskLane[]> {
    const project = await getAccessibleProject(userId, teamId, projectId)
    if (!project)
        throw new Error('NotFound: Project not found')
    return db
        .select()
        .from(taskLanes)
        .where(eq(taskLanes.projectId, project.id))
        .orderBy(taskLanes.order)
}

export async function createTaskLane(
    userId: string,
    teamId: string,
    projectId: string,
    data: CreateTaskLaneInput,
): Promise<TaskLane> {
    const project = await getAccessibleProject(userId, teamId, projectId)
    if (!project)
        throw new Error('NotFound: Project not found')
    const name = (data.name || 'New Lane').trim()
    if (!name)
        throw new Error('Task lane name is required')
    const keySource = typeof data.key === 'string' && data.key.trim()
        ? data.key.trim()
        : name
    const key = generateSlug(keySource)
    if (!key)
        throw new Error('Task lane key is required')
    const [existing] = await db
        .select({ id: taskLanes.id })
        .from(taskLanes)
        .where(and(
            eq(taskLanes.projectId, project.id),
            eq(taskLanes.key, key),
        ))
        .limit(1)
    if (existing)
        throw new Error('Conflict: Task lane key already exists')
    const order = typeof data.order === 'number'
        ? data.order
        : await getNextLaneOrder(project.id)
    const isDefault = data.isDefault ?? false
    if (isDefault) {
        await db
            .update(taskLanes)
            .set({ isDefault: false })
            .where(eq(taskLanes.projectId, project.id))
    }
    const [lane] = await db
        .insert(taskLanes)
        .values({
            projectId: project.id,
            key,
            name,
            color: data.color ?? null,
            order,
            isDefault,
        })
        .returning()
    return lane
}

export async function updateTaskLane(
    userId: string,
    teamId: string,
    projectId: string,
    laneId: string,
    data: UpdateTaskLaneInput,
): Promise<TaskLane> {
    const teamProjectIds = getTeamProjectIds(userId, teamId)
    const updateData: Partial<TaskLane> = {}
    if (typeof data.name === 'string') {
        const trimmedName = data.name.trim()
        if (!trimmedName)
            throw new Error('Task lane name is required')
        updateData.name = trimmedName
    }
    if (typeof data.key === 'string') {
        const trimmedKey = data.key.trim()
        if (!trimmedKey)
            throw new Error('Task lane key is required')
        updateData.key = generateSlug(trimmedKey)
        if (!updateData.key)
            throw new Error('Task lane key is required')
        const [existing] = await db
            .select({ id: taskLanes.id })
            .from(taskLanes)
            .where(and(
                eq(taskLanes.projectId, projectId),
                eq(taskLanes.key, updateData.key),
                ne(taskLanes.id, laneId),
            ))
            .limit(1)
        if (existing)
            throw new Error('Conflict: Task lane key already exists')
    }
    if (data.color !== undefined)
        updateData.color = data.color ?? null
    if (typeof data.order === 'number')
        updateData.order = data.order
    if (typeof data.isDefault === 'boolean')
        updateData.isDefault = data.isDefault
    if (updateData.isDefault) {
        await db
            .update(taskLanes)
            .set({ isDefault: false })
            .where(eq(taskLanes.projectId, projectId))
    }
    const [updated] = await db
        .update(taskLanes)
        .set(updateData)
        .where(and(
            eq(taskLanes.id, laneId),
            eq(taskLanes.projectId, projectId),
            inArray(taskLanes.projectId, teamProjectIds),
        ))
        .returning()
    if (!updated)
        throw new Error('NotFound: Task lane not found')
    return updated
}

export async function deleteTaskLane(
    userId: string,
    teamId: string,
    projectId: string,
    laneId: string,
): Promise<void> {
    const teamProjectIds = getTeamProjectIds(userId, teamId)
    const [lane] = await db
        .select({ id: taskLanes.id })
        .from(taskLanes)
        .where(and(
            eq(taskLanes.id, laneId),
            eq(taskLanes.projectId, projectId),
            inArray(taskLanes.projectId, teamProjectIds),
        ))
        .limit(1)
    if (!lane)
        throw new Error('NotFound: Task lane not found')
    await db
        .delete(taskLanes)
        .where(eq(taskLanes.id, laneId))
}

const getNextLaneOrder = async (projectId: string) => {
    const [row] = await db
        .select({ maxOrder: sql<number>`max(${taskLanes.order})` })
        .from(taskLanes)
        .where(eq(taskLanes.projectId, projectId))
    return (row?.maxOrder ?? 0) + 1000
}
