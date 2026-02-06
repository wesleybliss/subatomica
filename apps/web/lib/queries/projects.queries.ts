import type { Project } from '@repo/shared/types'
import { request } from '@/lib/api/client'

export const getProjects = async (teamId: string): Promise<Project[]> => {
    const params = new URLSearchParams({ teamId })
    return await request(`/api/projects?${params.toString()}`) as Project[]
}

export const getProjectById = async (projectId: string): Promise<Project | null> => {
    const response = await fetch(`/api/projects/${projectId}`, {
        credentials: 'include',
    })

    if (response.status === 404)
        return null

    if (!response.ok)
        throw new Error('Failed to fetch project')

    return await response.json() as Project
}
