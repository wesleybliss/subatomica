
export type { TaskLane } from '@repo/db/types'

export type KnownLaneType = 'Backlog' | 'To Do' | 'In Progress' | 'Done'

export type CreateLaneInput = {
    key: string
    name: string
    color?: string | null
    order?: number
    tempId: string
}
