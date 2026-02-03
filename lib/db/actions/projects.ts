'use server'
import { and, eq } from 'drizzle-orm'
import { db } from '../client'
import { getCurrentUser } from '@/lib/db/actions/shared'
import { projects } from '../schema'
import { Project } from '@/types'

export async function createProject(name: string, teamId: string): Promise<Project> {
    
    const user = await getCurrentUser()
    
    const [project] = await db
        .insert(projects)
        .values({
            name,
            userId: user.id,
            teamId,
        })
        .returning()
    
    return project
    
}

export async function getProjects(teamId?: string): Promise<Project[]> {
    
    const user = await getCurrentUser()
    
    const query = teamId
        ? and(eq(projects.userId, user.id), eq(projects.teamId, teamId))
        : eq(projects.userId, user.id)
    
    return db.select()
        .from(projects)
        .where(query)
        .orderBy(projects.name)
    
}
