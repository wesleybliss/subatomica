import { useQuery } from '@tanstack/react-query'
import type { Task } from '@/types'
import { useMemo } from 'react'

const useTasksQuery = (
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
            const response = await fetch(`/api/tasks?${params.toString()}`)
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

export default useTasksQuery
