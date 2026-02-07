import type { TaskLane } from '@repo/shared/types'
import { request } from '@/lib/api/client'

export const getProjectLanes = async (projectId: string): Promise<TaskLane[]> => {
    const params = new URLSearchParams({ projectId })
    return await request(`/api/lanes?${params.toString()}`) as TaskLane[]
}
