'use server'
import * as client from '@/lib/db/client'
import { and, desc, eq, inArray, or } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/db/actions/shared'
import { projects, taskLanes, tasks, teamMembers, teams } from '@/lib/db/schema'
import type { TaskLane } from '@/types'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db: any = client.db!
const DEFAULT_LANES: Array<{ key: string; name: string; color: string }> = [
    { key: 'backlog', name: 'Backlog', color: 'bg-muted' },
    { key: 'todo', name: 'Todo', color: 'bg-blue-500/20' },
    { key: 'in-progress', name: 'In Progress', color: 'bg-primary/20' },
    { key: 'done', name: 'Done', color: 'bg-green-500/20' },
]

const getAccessibleTeamIds = (userId: string) => {
    const memberTeamIds = db
        .select({ teamId: teamMembers.teamId })
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

const getAccessibleProjectIds = (userId: string) => {
    const accessibleTeamIds = getAccessibleTeamIds(userId)
    return db
        .select({ id: projects.id })
        .from(projects)
        .where(inArray(projects.teamId, accessibleTeamIds))
}

const normalizeLaneKey = (value: string) =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
        .slice(0, 32) || 'lane'

export async function ensureProjectLanes(projectId: string): Promise<TaskLane[]> {
    const user = await getCurrentUser()
    const accessibleProjectIds = getAccessibleProjectIds(user.id)
    const [project] = await db
        .select({ id: projects.id })
        .from(projects)
        .where(and(
            eq(projects.id, projectId),
            inArray(projects.id, accessibleProjectIds),
        ))
        .limit(1)
    if (!project)
        throw new Error('Unauthorized')
    const existing = await db
        .select()
        .from(taskLanes)
        .where(eq(taskLanes.projectId, projectId))
        .orderBy(taskLanes.order)
    if (existing.length > 0)
        return existing
    const inserted = await db
        .insert(taskLanes)
        .values(DEFAULT_LANES.map((lane, index) => ({
            projectId,
            key: lane.key,
            name: lane.name,
            color: lane.color,
            order: (index + 1) * 1000,
            isDefault: index === 0,
        })))
        .returning()
    return inserted
}

export async function getProjectLanes(projectId: string): Promise<TaskLane[]> {
    await ensureProjectLanes(projectId)
    return db
        .select()
        .from(taskLanes)
        .where(eq(taskLanes.projectId, projectId))
        .orderBy(taskLanes.order)
}
export async function createTaskLane(
    projectId: string,
    name: string,
    color?: string | null,
): Promise<TaskLane> {
    const user = await getCurrentUser()
    const accessibleProjectIds = getAccessibleProjectIds(user.id)
    const [project] = await db
        .select({ id: projects.id })
        .from(projects)
        .where(and(
            eq(projects.id, projectId),
            inArray(projects.id, accessibleProjectIds),
        ))
        .limit(1)
    if (!project)
        throw new Error('Unauthorized')
    const existingKeys = await db
        .select({ key: taskLanes.key })
        .from(taskLanes)
        .where(eq(taskLanes.projectId, projectId))
    const keyBase = normalizeLaneKey(name)
    const existingKeySet = new Set(
        existingKeys.map((lane: { key: string }) => lane.key),
    )
    let nextKey = keyBase
    let counter = 1
    while (existingKeySet.has(nextKey)) {
        nextKey = `${keyBase}-${counter}`
        counter += 1
    }
    const [maxOrder] = await db
        .select({ order: taskLanes.order })
        .from(taskLanes)
        .where(eq(taskLanes.projectId, projectId))
        .orderBy(desc(taskLanes.order))
        .limit(1)
    const [lane] = await db
        .insert(taskLanes)
        .values({
            projectId,
            key: nextKey,
            name: name.trim() || 'New Lane',
            color: color ?? null,
            order: maxOrder ? maxOrder.order + 1000 : 1000,
            isDefault: false,
        })
        .returning()
    return lane
}

export async function updateTaskLane(laneId: string, data: {
    name?: string
    color?: string | null
    order?: number
    isDefault?: boolean
}): Promise<TaskLane> {
    const user = await getCurrentUser()
    const accessibleProjectIds = getAccessibleProjectIds(user.id)
    const [lane] = await db
        .select()
        .from(taskLanes)
        .where(eq(taskLanes.id, laneId))
        .limit(1)
    if (!lane)
        throw new Error('Unauthorized')
    const [updated] = await db
        .update(taskLanes)
        .set({
            ...data,
            name: data.name?.trim() || lane.name,
        })
        .where(and(
            eq(taskLanes.id, laneId),
            inArray(taskLanes.projectId, accessibleProjectIds),
        ))
        .returning()
    if (!updated)
        throw new Error('Unauthorized')
    return updated
}

export async function deleteTaskLane(laneId: string): Promise<void> {
    const user = await getCurrentUser()
    const accessibleProjectIds = getAccessibleProjectIds(user.id)
    const [lane] = await db
        .select()
        .from(taskLanes)
        .where(eq(taskLanes.id, laneId))
        .limit(1)
    if (!lane)
        return
    const lanesForProject = await db
        .select()
        .from(taskLanes)
        .where(eq(taskLanes.projectId, lane.projectId))
    if (lanesForProject.length <= 1)
        throw new Error('Cannot delete the last lane')
    const fallbackLane = lanesForProject.find(
        (item: TaskLane) => item.isDefault && item.id !== laneId,
    ) || lanesForProject.find(
        (item: TaskLane) => item.id !== laneId,
    )
    await db
        .update(tasks)
        .set({ status: fallbackLane.key })
        .where(and(
            eq(tasks.status, lane.key),
            eq(tasks.projectId, lane.projectId),
            inArray(tasks.projectId, accessibleProjectIds),
        ))
    await db
        .delete(taskLanes)
        .where(and(
            eq(taskLanes.id, laneId),
            inArray(taskLanes.projectId, accessibleProjectIds),
        ))
}
