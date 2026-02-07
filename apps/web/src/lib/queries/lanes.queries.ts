import type { TaskLane } from '@repo/shared/types'
import { request } from '@/lib/api/client'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import * as store from '@/store'

export const useGetProjectLanesQuery = (teamId: string, projectId: string) => {
    
    const lanesQueryKey = useMemo(() => (
        ['lanes', teamId, projectId] as const
    ), [teamId, projectId])
    
    const query = useQuery<TaskLane[], Error>({
        queryKey: lanesQueryKey,
        queryFn: async () => {
            try {
                const res = await request<TaskLane[]>(`/teams/${teamId}/projects/${projectId}/lanes`)
                
                store.lanes.setValue(res || [])
                
                return res || []
            } catch (e) {
                console.error('useGetProjectLanesQuery', e)
                return []
            }
        },
        enabled: !!teamId,
        // initialData: [],
    })
    
    return {
        ...query,
        lanesQueryKey,
    }
    
}
