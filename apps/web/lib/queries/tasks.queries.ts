import type { Task } from '@repo/shared/types'
import { request } from '@/lib/api/client'

export const getTasks = async (teamId: string, projectId: string): Promise<Task[]> => {
    const params = new URLSearchParams({ teamId, projectId })
    return await request(`/api/tasks?${params.toString()}`) as Task[]
}
