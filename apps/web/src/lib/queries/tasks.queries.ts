import type { Task } from '@repo/shared/types'
import Logger from '@repo/shared/utils/logger'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { request } from '@/lib/api/client'

const log = new Logger('web/lib/queries/tasks.queries')

export const tasksQueryKey = (
    teamId: string | undefined,
    projectId?: string,
) => ['tasks', teamId, projectId] as const

export const useTasksQuery = (teamId: string | undefined, projectId?: string) => {
    
    const queryKey = useMemo(
        () => tasksQueryKey(teamId, projectId),
        [teamId, projectId],
    )
    
    const query = useQuery<Task[], Error>({
        queryKey,
        queryFn: async () => {
            try {
                const url = projectId
                    ? `/tasks?teamId=${teamId}&projectId=${projectId}`
                    : `/tasks?teamId=${teamId}`
                const res = await request<Task[]>(url)
                return res || []
            } catch (e) {
                log.e('useTasksQuery', e)
                return []
            }
        },
        enabled: !!teamId,
    })
    
    return {
        ...query,
        tasksQueryKey: queryKey,
    }
    
}

/** @deprecated Prefer useTasksQuery */
export const useGetTasksQuery = useTasksQuery

export const useTasks = (teamId: string | undefined, projectId?: string) => {
    const { data: tasks = [] } = useTasksQuery(teamId, projectId)
    return tasks
}
