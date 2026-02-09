import type { Project, TaskLane } from '@repo/shared/types'
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
                const res = await request<Project[]>(`/projects?teamId=${teamId}`)
                
                store.projects.setValue(res || [])
                
                const taskLanes: TaskLane[] = []
                
                res?.forEach(it => {
                    if (it.taskLanes?.length)
                        taskLanes.push(...it.taskLanes)
                })
                store.lanes.setValue(taskLanes)
                
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
                const res = (await request(`/projects/${projectId}?teamId=${teamId}`) as Project) || null
                
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
