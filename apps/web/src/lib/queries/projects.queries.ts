import type { Project } from '@repo/shared/types'
import { request } from '@/lib/api/client'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import * as store from '@/store'

export const useGetProjectsQuery = (teamId: string | undefined) => {
    
    const projectsQueryKey = useMemo(() => (
        ['projects'] as const
    ), [])
    
    // const { data: projects = initialTasks }
    const query = useQuery({
        queryKey: projectsQueryKey,
        queryFn: async () => {
            try {
                const res = (await request(`/teams/${teamId}/projects`) as Project[]) || []
                store.projects.setValue(res)
                return res
            } catch (e) {
                console.error('useGetProjectsQuery', e)
                return null
            }
        },
        enabled: !!teamId,
        // initialData: [],
    })
    
    return {
        ...query,
        projectsQueryKey,
    }
    
}

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
