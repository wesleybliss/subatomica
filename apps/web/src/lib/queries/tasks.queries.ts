import { useMemo } from 'react'
import type { Task } from '@repo/shared/types'
import { request } from '@/lib/api/client'
import { useQuery } from '@tanstack/react-query'

export const useGetTasksQuery = (teamId: string, projectId?: string) => {
    
    const tasksQueryKey = useMemo(() => (
        ['tasks', teamId, projectId] as const
    ), [teamId, projectId])
    
    const query = useQuery({
        queryKey: tasksQueryKey,
        queryFn: async () => {
            try {
                const url = projectId
                    ? `/teams/${teamId}/projects/${projectId}/tasks`
                    : `/teams/${teamId}/tasks`
                console.log('useGetTasksQuery url', url)
                return await request(url) as Promise<Task[]>
            } catch (e) {
                console.error('useGetTasksQuery', e)
                return null
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

export const getTasksByTeamTODO = (
    teamId: string,
    projectId: string,
) => {
    
    const tasksQueryKey = useMemo(() => (
        ['tasks', { teamId }] as const
    ), [teamId])
    
    // const { data: tasks = initialTasks }
    const query = useQuery({
        queryKey: tasksQueryKey,
        queryFn: async () => {
            const params = new URLSearchParams({ teamId })
            const response = await request(`/teams/${teamId}/projects/${projectId}/tasks?${params.toString()}`)
            if (!response.ok)
                throw new Error('Failed to fetch tasks')
            return await response.json() as Promise<Task[]>
        },
        initialData: [],
    })
    
    return {
        ...query,
        tasksQueryKey,
    }
    
}

export const updateTask = (taskId: string, data: Partial<Task>) => {
    
    return request(`/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    
}
