import type { Project } from '@repo/shared/types'
import { request } from '@/lib/api/client'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import * as store from '@/store'

export const useGetProjectsQuery = (teamId: string) => {
    
    const projectsQueryKey = useMemo(() => (
        ['projects', teamId] as const
    ), [teamId])
    
    // const { data: projects = initialTasks }
    const query = useQuery<Project[], Error>({
        queryKey: projectsQueryKey,
        queryFn: async () => {
            try {
                const res = await request<Project[]>(`/teams/${teamId}/projects`)
                store.projects.setValue(res || [])
                return res || []
            } catch (e) {
                console.error('useGetProjectsQuery', e)
                return []
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

export const useGetProjectQuery = (teamId: string, projectId: string) => {
    
    const projectQueryKey = useMemo(() => (
        ['project', teamId, projectId] as const
    ), [teamId, projectId])
    
    const query = useQuery({
        queryKey: projectQueryKey,
        queryFn: async () => {
            try {
                const res = (await request(`/teams/${teamId}/projects/${projectId}`) as Project) || null
                
                if (res?.id) {
                    const next = store.projects.getValue() || []
                    const idx = next.findIndex(it => it.id === res.id)
                    if (idx >= 0)
                        next[idx] = res
                    else
                        next.push(res)
                    store.projects.setValue(next)
                }
                
                return res
            } catch (e) {
                console.error('useGetProjectQuery', e)
                return null
            }
        },
        enabled: !!teamId && !!projectId,
        // initialData: [],
    })
    
    return {
        ...query,
        projectQueryKey,
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
