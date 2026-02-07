import { useMemo } from 'react'
import type { Task } from '@repo/shared/types'
import { request } from '@/lib/api/client'
import { useQuery } from '@tanstack/react-query'

export const useGetTasksQuery = (
    teamId: string,
    projectId: string,
    initialTasks: Task[],
) => {
    
    const tasksQueryKey = useMemo(() => (
        ['tasks', { teamId, projectId }] as const
    ), [teamId, projectId])
    
    // const { data: tasks = initialTasks }
    const query = useQuery({
        queryKey: tasksQueryKey,
        queryFn: async () => {
            const params = new URLSearchParams({ teamId, projectId })
            const response = await request(`/api/tasks?${params.toString()}`)
            if (!response.ok)
                throw new Error('Failed to fetch tasks')
            return await response.json() as Promise<Task[]>
        },
        initialData: initialTasks,
    })
    
    return {
        ...query,
        tasksQueryKey,
    }
    
}

export const getTasks = async (teamId: string, projectId: string) => {
    
    return await request(`/api/t/${teamId}/p/${projectId}/tasks`)
    
}

export const getTaskById = async (taskId: string) => {
    const response = await fetch(`/api/tasks/${taskId}`, {
        credentials: 'include',
    })
    if (!response.ok)
        throw new Error('Failed to fetch task')
    return await response.json() as Task
}

export const getTasksByTeam = async (
    teamId: string,
) => {
    
    const params = new URLSearchParams({ teamId })
    
    return await request(`/api/tasks?${params.toString()}`)
    
}

export const getTasksByTeamTODO = (
    teamId: string,
) => {
    
    const tasksQueryKey = useMemo(() => (
        ['tasks', { teamId }] as const
    ), [teamId])
    
    // const { data: tasks = initialTasks }
    const query = useQuery({
        queryKey: tasksQueryKey,
        queryFn: async () => {
            const params = new URLSearchParams({ teamId })
            const response = await request(`/api/tasks?${params.toString()}`)
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
