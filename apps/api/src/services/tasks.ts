import * as client from '@/db/client'
import { and, desc, eq, inArray, or } from 'drizzle-orm'
import { projects, tasks, teamMembers, teams } from '@/db/schema'
import { Task } from '@repo/shared/types'

// @todo this was mostly ai generated, might be incorrect

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db: any = client.db!

export async function createTask(userId: string, teamId: string, name: string): Promise<Task> {
    const trimmedName = name.trim()
    if (!trimmedName)
        throw new Error('Task name is required')
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
    let [project] = await db
        .select({ id: projects.id })
        .from(projects)
        .where(and(
            eq(projects.id, teamId),
            inArray(projects.teamId, accessibleTeamIds),
        ))
        .limit(1)
    if (!project) {
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
        throw new Error('Unauthorized')
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

export async function deleteTask(userId: string, projectId: string): Promise<void> {
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
    const accessibleProjectIds = db
        .select({ id: projects.id })
        .from(projects)
        .where(inArray(projects.teamId, accessibleTeamIds))
    const [task] = await db
        .select({ id: tasks.id })
        .from(tasks)
        .where(and(
            eq(tasks.id, projectId),
            inArray(tasks.projectId, accessibleProjectIds),
        ))
        .limit(1)
    if (!task)
        throw new Error('Unauthorized')
    await db
        .delete(tasks)
        .where(eq(tasks.id, projectId))
}

export async function renameTask(userId: string, projectId: string, name: string): Promise<void> {
    const trimmedName = name.trim()
    if (!trimmedName)
        throw new Error('Task name is required')
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
    const accessibleProjectIds = db
        .select({ id: projects.id })
        .from(projects)
        .where(inArray(projects.teamId, accessibleTeamIds))
    const updated = await db
        .update(tasks)
        .set({ title: trimmedName })
        .where(and(
            eq(tasks.id, projectId),
            inArray(tasks.projectId, accessibleProjectIds),
        ))
        .returning({ id: tasks.id })
    if (updated.length === 0)
        throw new Error('Unauthorized')
}

export async function getTasks(userId: string, teamId: string, projectId?: string | undefined): Promise<Task[]> {
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
    const accessibleProjectIds = db
        .select({ id: projects.id })
        .from(projects)
        .where(inArray(projects.teamId, accessibleTeamIds))
    const teamProjectIds = teamId
        ? db
            .select({ id: projects.id })
            .from(projects)
            .where(and(
                eq(projects.teamId, teamId),
                inArray(projects.teamId, accessibleTeamIds),
            ))
        : null
    console.log('wtf', {teamId, projectId, teamProjectIds, accessibleTeamIds})
    const query = projectId
        ? and(
            eq(tasks.projectId, projectId),
            inArray(tasks.projectId, teamProjectIds))
        : and(
            eq(tasks.teamId, teamId),
            inArray(tasks.teamId, accessibleTeamIds))
    return db.select()
        .from(tasks)
        .where(query)
        .orderBy(tasks.order, desc(tasks.createdAt))
}

export async function getTaskById(userId: string, teamId: string, projectId: string, taskId: string): Promise<Task> {
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
    const teamProjectIds = db
        .select({ id: projects.id })
        .from(projects)
        .where(and(
            eq(projects.teamId, teamId),
            inArray(projects.teamId, accessibleTeamIds),
        ))
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
