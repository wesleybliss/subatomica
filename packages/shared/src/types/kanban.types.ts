import { TaskStatus } from '@/types/tasks.types'

export type CreateProjectResult = {
    error: string | null
}

export type DropIndicatorData = {
    status: TaskStatus
    taskId?: string
}
