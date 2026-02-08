import { useMemo } from 'react'
import type { Task } from '@repo/shared/types'
import { request } from '@/lib/api/client'
import { useQuery } from '@tanstack/react-query'
import * as store from '@/store'

export const useGetTasksQuery = (teamId: string, projectId?: string) => {
    
    const tasksQueryKey = useMemo(() => (
        ['tasks', teamId, projectId] as const
    ), [teamId, projectId])
    
    const query = useQuery<Task[], Error>({
        queryKey: tasksQueryKey,
        queryFn: async () => {
            try {
                const url = projectId
                    ? `/teams/${teamId}/projects/${projectId}/tasks`
                    : `/teams/${teamId}/tasks`
                const res = await request<Task[]>(url)
                
                store.tasks.setValue(res || [])
                
                return res || []
            } catch (e) {
                console.error('useGetTasksQuery', e)
                return []
            }
        },
        enabled: !!teamId,
        // initialData: [],
    })
    
    return {
        ...query,
        tasksQueryKey,
    }
    
}

export const getTasks = async (teamId: string, projectId: string) => {
    
    return await request(`/api/t/${teamId}/p/${projectId}/tasks`)
    
}

export const getTaskById = async (teamId: string, projectId: string, taskId: string) => {
    const response = await fetch(`/teams/${teamId}/projects/${projectId}/tasks/${taskId}`, {
        credentials: 'include',
    })
    if (!response.ok)
        throw new Error('Failed to fetch task')
    return await response.json() as Task
}

// @deprecated
export const getTasksByTeam = async (
    teamId: string,
    projectId: string,
) => {
    
    const params = new URLSearchParams({ teamId })
    
    return await request(`/teams/${teamId}/projects/${projectId}/tasks?${params.toString()}`)
    
}

export const updateTask = (taskId: string, data: Partial<Task>): Promise<Task> => {
    
    return request(`/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    
}
