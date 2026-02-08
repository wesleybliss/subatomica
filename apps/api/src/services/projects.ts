import * as client from '@/db/client'
import { and, eq, inArray } from 'drizzle-orm'
import { projects, taskLanes, teamMembers, teams } from '@/db/schema'
import { Project, TaskLane } from '@repo/shared/types'
import { getAccessibleTeamIds } from '@/services/shared'

const db = client.db

const getTeamRole = async (userId: string, teamId: string) => {
    const [team] = await db
        .select({ ownerId: teams.ownerId })
        .from(teams)
        .where(eq(teams.id, teamId))
        .limit(1)
    
    if (!team)
        return null
    
    if (team.ownerId === userId)
        return 'owner'
    
    const [membership] = await db
        .select({ role: teamMembers.role })
        .from(teamMembers)
        .where(and(
            eq(teamMembers.teamId, teamId),
            eq(teamMembers.userId, userId),
        ))
        .limit(1)
    
    return membership?.role ?? null
}

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
    
    if (existingLanes.length === 0) {
        await db.insert(taskLanes).values(
            defaultLanes.map(lane => ({
                ...lane,
                projectId,
            })),
        )
    }
}

export async function createProject(userId: string, teamId: string, name: string): Promise<Project> {
    const accessibleTeamIds = getAccessibleTeamIds(userId)
    
    const [team] = await db.select({ id: teams.id })
        .from(teams)
        .where(and(
            eq(teams.id, teamId),
            inArray(teams.id, accessibleTeamIds),
        ))
        .limit(1)
    
    if (!team)
        throw new Error('NotFound: Team not found')
    
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
        .select({ teamId: projects.teamId })
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1)
    
    if (!project)
        throw new Error('NotFound: Project not found')
    
    const role = await getTeamRole(userId, project.teamId)
    if (!role)
        throw new Error('NotFound: Project not found')
    if (role !== 'owner')
        throw new Error('Forbidden: Only owners can delete projects')
    
    await db
        .delete(projects)
        .where(eq(projects.id, projectId))
}

export async function renameProject(userId: string, projectId: string, name: string): Promise<Project> {
    const trimmedName = name.trim()
    if (!trimmedName)
        throw new Error('Project name is required')
    
    const [project] = await db
        .select({ teamId: projects.teamId })
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1)
    
    if (!project)
        throw new Error('NotFound: Project not found')
    
    const role = await getTeamRole(userId, project.teamId)
    if (!role)
        throw new Error('NotFound: Project not found')
    if (role !== 'owner' && role !== 'admin')
        throw new Error('Forbidden: Only owners or admins can rename projects')
    
    const [updated] = await db
        .update(projects)
        .set({ name: trimmedName })
        .where(eq(projects.id, projectId))
        .returning()
    
    if (!updated)
        throw new Error('NotFound: Project not found')
    
    return updated
}

export async function getProjects(userId: string, teamId?: string): Promise<Project[]> {
    const accessibleTeamIds = getAccessibleTeamIds(userId)
    
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
    const accessibleTeamIds = getAccessibleTeamIds(userId)
    
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
        return undefined
    
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
