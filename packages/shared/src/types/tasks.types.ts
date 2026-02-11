
export type TaskStatus = string

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export type { Task } from '@repo/db/types'

export type CreateTaskInput = {
    status: TaskStatus
    tempId: string
}

export type UpdateTaskOrderInput = {
    taskId: string
    status: TaskStatus
    order: number
}
