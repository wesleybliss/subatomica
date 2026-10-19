import type { Task } from '@repo/shared/types'
import Logger from '@repo/shared/utils/logger'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { request } from '@/lib/api/client'
import * as store from '@/store'

const log = new Logger('web/lib/queries/tasks.queries')

export const useGetTasksQuery = (teamId: string | undefined, projectId?: string) => {
    
    const tasksQueryKey = useMemo(() => (
        ['tasks', teamId, projectId] as const
    ), [teamId, projectId])
    
    const query = useQuery<Task[], Error>({
        queryKey: tasksQueryKey,
        queryFn: async () => {
            try {
                const url = projectId
                    ? `/tasks?teamId=${teamId}&projectId=${projectId}`
                    : `/tasks?teamId=${teamId}`
                const res = await request<Task[]>(url)
                store.useTaskStore.getState().setTasks(res || [])
                
                return res || []
            } catch (e) {
                log.e('useGetTasksQuery', e)
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
