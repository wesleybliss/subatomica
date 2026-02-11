
export type { TaskLane } from '@repo/db/types'

export type CreateLaneInput = {
    key: string
    name: string
    color?: string | null
    order?: number
    tempId: string
}
