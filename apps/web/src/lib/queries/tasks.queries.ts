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

export const updateTask = (taskId: string, data: Partial<Task>): Promise<Task> => {
    
    return request(`/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    
}
