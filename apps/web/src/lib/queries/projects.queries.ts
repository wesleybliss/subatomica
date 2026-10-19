import type { Project, TaskLane } from '@repo/shared/types'
import Logger from '@repo/shared/utils/logger'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { request } from '@/lib/api/client'
import { useLaneStore, useProjectStore } from '@/store'

const log = new Logger('web/lib/queries/projects.queries')

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
                
                useProjectStore.getState().setProjects(res || [])
                
                const taskLanes: TaskLane[] = []
                
                res?.forEach(it => {
                    if (it.taskLanes?.length)
                        taskLanes.push(...it.taskLanes)
                })
                useLaneStore.getState().setLanes(taskLanes)
                
                return res || []
            } catch (e) {
                log.e('useGetProjectsQuery', e)
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
                    
                    const next = useProjectStore.getState().projects || []
                    const idx = next.findIndex(it => it.id === res.id)
                    
                    if (idx >= 0)
                        next[idx] = res
                    else
                        next.push(res)
                    
                    useProjectStore.getState().setProjects(next)
                    
                    if (res.taskLanes?.length) {
                        const taskLanes = new Map<string, TaskLane[]>()
                        res.taskLanes.forEach((it: TaskLane) => taskLanes.set(it.id, [it]))
                        useLaneStore.getState().setLanes([
                            ...useLaneStore.getState().lanes,
                            ...Array.from(taskLanes.values()).flat(),
                        ])
                    }
                    
                }
                
                return res
            } catch (e) {
                log.e('useGetProjectQuery', e)
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
